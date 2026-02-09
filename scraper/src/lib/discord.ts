import { match } from "ts-pattern";
import type { SummaryOutput, Article } from "@elata/shared-types";
import { createLogger } from "./logger.js";

const log = createLogger("discord");
import { NEWS_TAGS } from "@elata/shared-types";
import {
  Client,
  GatewayIntentBits,
  type TextChannel,
  EmbedBuilder,
  Events,
} from "discord.js";
import { CONFIG } from "../config/config.js";
import { type Result, Ok, Err } from "./result.js";

// ── Discord client (side-effect; isolated here) ─────────────────────

export const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds],
});

discordClient.login(CONFIG.DISCORD.TOKEN);

discordClient.once(Events.ClientReady, (client) => {
  log.info("Discord client ready", { tag: client.user?.tag });
});

// ── Pure helpers ────────────────────────────────────────────────────

const EMBED_COLOR = "#7C3AED"; // Purple to match brand

/** Pick top N articles from a tag, sorted by relevanceScore desc */
const getTopArticlesForTag = (
  articles: readonly Article[],
  tag: string,
  limit: number,
): Article[] =>
  articles
    .filter((a) => a.tags?.includes(tag as (typeof NEWS_TAGS)[number]) ?? false)
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
    .slice(0, limit);

/** Format tag name for display */
const formatTagName = (tag: string): string =>
  tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Build Discord embed for an article */
const buildArticleEmbed = (article: Article, rank: number): EmbedBuilder =>
  new EmbedBuilder()
    .setTitle(`${rank}. ${article.title || "Untitled"}`)
    .setDescription(
      (article.summary ?? article.description ?? "No description").slice(0, 200),
    )
    .setURL(article.url || "")
    .addFields(
      { name: "Source", value: article.source || "Unknown", inline: true },
      { name: "Author", value: article.author || "Unknown", inline: true },
      {
        name: "Tags",
        value: (article.tags ?? []).slice(0, 5).map(formatTagName).join(", ") || "None",
        inline: true,
      },
    )
    .setColor(EMBED_COLOR);

// ── Tag families for Discord grouping ───────────────────────────────

const DISCORD_TAG_GROUPS: ReadonlyArray<{ label: string; tags: readonly string[] }> = [
  {
    label: "🔬 Neuroscience & Research",
    tags: ["eeg", "fmri", "neuroimaging", "synaptic-plasticity", "cognitive-neuroscience"],
  },
  {
    label: "🧠 Brain-Computer Interfaces",
    tags: ["bci-invasive", "bci-noninvasive", "neural-decoding", "neuroprosthetics", "motor-bci"],
  },
  {
    label: "💊 Mental Health & Therapeutics",
    tags: ["depression", "anxiety", "ptsd", "psychedelics-research", "neurostimulation"],
  },
  {
    label: "💻 Computational & AI",
    tags: ["neuromorphic-computing", "brain-inspired-ai", "spiking-neural-networks", "computational-modeling"],
  },
  {
    label: "🏢 Industry & Business",
    tags: ["neuralink", "kernel", "openwater", "industry-trends", "startup-funding"],
  },
  {
    label: "🔗 DeSci & Web3",
    tags: ["desci", "dao-governance", "decentralized-data", "blockchain-health", "token-incentives"],
  },
];

// ── Main function ───────────────────────────────────────────────────

/**
 * Post summary to Discord.
 * Posts top 10 articles per tag group (not per category).
 * Returns Result for functional error handling.
 */
export const postSummaryToDiscord = async (
  summary: SummaryOutput,
): Promise<Result<void, Error>> => {
  try {
    const channel = (await discordClient.channels.fetch(
      CONFIG.DISCORD.NEWS_FEED_CHANNEL_ID,
    )) as TextChannel;

    if (!channel) {
      return Err(new Error("Discord channel not found"));
    }

    const allArticles = summary.allArticles ?? [];

    if (allArticles.length === 0) {
      await channel.send("**No articles found today.** The scraper may need attention.");
      return Ok(undefined);
    }

    // Header
    const dateStr = new Date(summary.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    await channel.send(
      `# 🧠 Elata Neurotech Daily — ${dateStr}\n` +
        `**${allArticles.length} articles** indexed today.\n` +
        `🔗 Full feed: https://elata.bio/news`,
    );

    // Post top articles per group
    for (const group of DISCORD_TAG_GROUPS) {
      const topArticles = group.tags.flatMap((tag) =>
        getTopArticlesForTag(allArticles, tag, 3),
      );

      // Dedupe by URL
      const seen = new Set<string>();
      const uniqueArticles = topArticles.filter((a) => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      });

      const top10 = uniqueArticles
        .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
        .slice(0, CONFIG.DISCORD.ARTICLES_PER_CATEGORY);

      if (top10.length === 0) continue;

      await channel.send(`\n${group.label} (${top10.length} articles)`);

      for (let i = 0; i < top10.length; i++) {
        const embed = buildArticleEmbed(top10[i], i + 1);
        await channel.send({ embeds: [embed] });
        // Rate limit: 1 embed per second
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Footer with CTA
    await channel.send(
      `\n---\n` +
        `*Summary generated at ${new Date(summary.timestamp).toLocaleString()}*\n` +
        `💬 Discuss these articles in the community\n` +
        `🔗 https://elata.bio/news`,
    );

    return Ok(undefined);
  } catch (error) {
    log.error("Error posting summary", error);
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
};

/** Expose for testing */
export const _internal = {
  getTopArticlesForTag,
  formatTagName,
  buildArticleEmbed,
};

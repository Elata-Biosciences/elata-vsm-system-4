import type {
  SummaryOutputCategoriesKey,
  SummaryOutput,
} from "@elata/shared-types";
import {
  Client,
  GatewayIntentBits,
  type TextChannel,
  EmbedBuilder,
  Events,
} from "discord.js";
import { CONFIG } from "../config/config.js";

export const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds],
});

discordClient.login(CONFIG.DISCORD.TOKEN);

discordClient.once(Events.ClientReady, (client) => {
  console.log(`Ready! Logged in as ${client.user?.tag}`);
});

// TODO: Move to shared-types
const categoryMapping: { [key in SummaryOutputCategoriesKey]: string } = {
  research: "Research",
  industry: "Industry",
  biohacking: "Biohacking",
  computational: "Computational",
  hardware: "Hardware",
  desci: "Experimental",
  offTopic: "Off Topic",
};

// TODO: Move to shared-types
const categoryEmojis: { [key in SummaryOutputCategoriesKey]: string } = {
  research: "🔬",
  industry: "💼",
  biohacking: "🧬",
  computational: "🧮",
  hardware: "🔧",
  desci: "🔗",
  offTopic: "💡",
};

const EMBED_COLOR = "#0099ff";

/**
 * Sends the summary to the Discord channel
 * @param {TextChannel} channel - The Discord channel to send the summary to
 * @param {string} summaryString - The JSON summary string to send
 * @returns {Promise<void>}
 */
export const postSummaryToDiscord = async (
  summary: SummaryOutput
): Promise<void> => {
  try {
    const channel = (await discordClient.channels.fetch(
      CONFIG.DISCORD.NEWS_FEED_CHANNEL_ID
    )) as TextChannel;

    if (!channel) throw new Error("Discord channel not found");

    // Send header with more prominent formatting
    await channel.send("**📰 Daily News Summary**\n─────────────────");

    // Process each category
    for (const [categoryKey, articles] of Object.entries(summary).filter(
      ([key]) => key !== "timestamp"
    )) {
      if (!Array.isArray(articles) || articles.length === 0) continue;

      const categoryName = categoryMapping[categoryKey as SummaryOutputCategoriesKey] || categoryKey;
      const emoji = categoryEmojis[categoryKey as SummaryOutputCategoriesKey] || "📰";

      // Add extra newline before category and use separator
      await channel.send(
        `\n\n${emoji} **${categoryName}** (${articles.length} articles)\n─────────────────`
      );

      // Send each article with improved spacing
      for (const article of articles) {
        const embed = new EmbedBuilder()
          .setTitle(article.title || "Untitled")
          .setDescription(article.description || "No description available")
          .setURL(article.url || "")
          .addFields(
            {
              name: "Source",
              value: article.source || "Unknown",
              inline: true,
            },
            { name: "Author", value: article.author || "Unknown", inline: true }
          )
          .setColor(EMBED_COLOR);

        // Add extra newline between articles
        await channel.send({ embeds: [embed] });
        await channel.send("\n"); // Extra spacing between articles
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Send footer with separator
    await channel.send(
      `\n─────────────────\n*Summary generated at ${new Date(summary.timestamp).toLocaleString()}*`
    );
  } catch (error) {
    console.error("Error processing summary:", error);
    console.error("Summary string received:", JSON.stringify(summary, null, 2));
  }
};

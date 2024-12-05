import type {
  SummaryOutputCategoriesKey,
  SummaryOutput,
} from "@elata/shared-types";
import {
  Client,
  GatewayIntentBits,
  type TextChannel,
  EmbedBuilder,
} from "discord.js";

export const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// TODO: Move to shared-types
const categoryMapping: { [key in SummaryOutputCategoriesKey]: string } = {
  research: "Research",
  industry: "Industry",
  biohacking: "Biohacking",
  computational: "Computational",
  hardware: "Hardware",
  desci: "DeSci",
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
  channel: TextChannel,
  summary: SummaryOutput
): Promise<void> => {
  try {
    // Send header
    await channel.send("**Daily News Summary for Today**");

    // Process each category
    for (const [categoryKey, articles] of Object.entries(summary).filter(
      ([key]) => key !== "timestamp"
    )) {
      if (!Array.isArray(articles) || articles.length === 0) continue;

      const categoryName =
        categoryMapping[categoryKey as SummaryOutputCategoriesKey] ||
        categoryKey;
      const emoji =
        categoryEmojis[categoryKey as SummaryOutputCategoriesKey] || "📰";

      // Send category header
      await channel.send(
        `\n${emoji} **${categoryName}** (${articles.length} articles)`
      );

      // Send each article
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

        await channel.send({ embeds: [embed] });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Send footer
    await channel.send(
      `\n*Summary generated at ${new Date(summary.timestamp).toLocaleString()}*`
    );
  } catch (error) {
    console.error("Error processing summary:", error);
    console.error("Summary string received:", JSON.stringify(summary, null, 2));
  }
};

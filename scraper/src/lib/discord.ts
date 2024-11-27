import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from "discord.js";

interface Article {
  title: string;
  description: string;
  url: string;
  name: string;
  author: string;
}

interface Summary {
  date: string;
  summary: {
    research: Article[];
    industry: Article[];
    biohacking: Article[];
    computational: Article[];
    hardware: Article[];
    desci: Article[];
    offTopic: Article[];
  };
  timestamp: string;
}

export const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const categoryMapping: { [key: string]: string } = {
  research: "Research",
  industry: "Industry",
  biohacking: "Biohacking",
  computational: "Computational",
  hardware: "Hardware",
  desci: "DeSci",
  offTopic: "Off Topic"
};

const categoryEmojis: { [key: string]: string } = {
  research: "🔬",
  industry: "💼",
  biohacking: "🧬",
  computational: "🧮",
  hardware: "🔧",
  desci: "🔗",
  offTopic: "💡"
};

/**
 * Sends the summary to the Discord channel
 * @param {TextChannel} channel - The Discord channel to send the summary to
 * @param {string} summaryString - The JSON summary string to send
 * @returns {Promise<void>}
 */
export const postSummaryToDiscord = async (
  channel: TextChannel,
  summaryString: string
): Promise<void> => {
  try {
    const summary = JSON.parse(summaryString);
    console.log('Parsed summary keys:', Object.keys(summary));
    
    // Check if we have a direct categories object or a wrapped object
    const categories = summary.summary || summary;
    const timestamp = summary.timestamp || new Date().toISOString();
    
    // Send header
    await channel.send(`**Daily News Summary for Today**`);

    // Process each category
    for (const [categoryKey, articles] of Object.entries(categories)) {
      if (!Array.isArray(articles) || articles.length === 0) continue;

      const categoryName = categoryMapping[categoryKey] || categoryKey;
      const emoji = categoryEmojis[categoryKey] || "📰";
      
      // Send category header
      await channel.send(`\n${emoji} **${categoryName}** (${articles.length} articles)`);
      
      // Send each article
      for (const article of articles) {
        const embed = new EmbedBuilder()
          .setTitle(article.title || 'Untitled')
          .setDescription(article.description || 'No description available')
          .setURL(article.url || '')
          .addFields(
            { name: 'Source', value: article.name || 'Unknown', inline: true },
            { name: 'Author', value: article.author || 'Unknown', inline: true }
          )
          .setColor('#0099ff');
        
        await channel.send({ embeds: [embed] });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Send footer
    await channel.send(`\n*Summary generated at ${new Date(timestamp).toLocaleString()}*`);
    
  } catch (error) {
    console.error("Error processing summary:", error);
    console.error("Summary string received:", summaryString);
  }
};

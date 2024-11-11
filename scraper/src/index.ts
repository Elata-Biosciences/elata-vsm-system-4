import { Events, TextChannel } from "discord.js";
import { config } from "./config/config.js";
import { MAIN_PROMPT } from "./config/prompt.js";
import { wait, writeSummaryToFile } from "./lib/utils.js";
import { scrapeWebsites } from "./lib/scraping.js";
import { openAIClient } from "./lib/openai.js";
import { QUERIES } from "./config/queries.js";
import { getStoriesFromQueries, convertStoriesToCSV } from "./lib/newsApi.js";
import { discordClient, postSummaryToDiscord } from "./lib/discord.js";
import { Story } from "./types/newsapi.types.js";

/**
 * Gets a summary of the stories from the AI
 * @param {Array} stories - Array of stories to summarize
 * @returns {Promise<string>}
 */
const getAISummaryOfStoriesAndScrapingResults = async (
  stories: Story[],
  scrapingResults: { sourceUrl: string; sourceName: string; analysis: string }[]
): Promise<string> => {
  try {
    const combinedPrompt = `
    ${MAIN_PROMPT}

    ${convertStoriesToCSV(stories)}
    
    ${scrapingResults.map((result) => result.analysis).join("\n")}
    `;

    const summary = await openAIClient.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: "system", content: combinedPrompt }],
    });

    console.log("Final summary ");
    console.log(summary.choices[0].message.content);

    return summary.choices[0].message.content ?? "";
  } catch (error) {
    console.error("Error loading AI summary of stories: ", error);
    return "";
  }
};

/**
 * Handles main logic when the Discord client is ready
 * @returns {Promise<void>}
 */
const onClientReady = async () => {
  try {
    console.log(`Ready! Logged in as ${discordClient.user?.tag}`);
    const channel = await discordClient.channels.fetch(
      config.discord.newsFeedChannelId
    );

    const stories = await getStoriesFromQueries(QUERIES);

    const scrapingResults = await scrapeWebsites();

    const summary = await getAISummaryOfStoriesAndScrapingResults(
      stories,
      scrapingResults
    );

    writeSummaryToFile(summary);
    await postSummaryToDiscord(channel as TextChannel, summary);

    // Give 5 minute grace period for messages to send before terminating process
    await wait(5 * 60 * 1000);
    process.exit(0);
  } catch (error) {
    console.error("Error in onClientReady: ", error);
  }
};

/**
 * Main function that calls root logic. First, the script logs in to Discord,
 * then waits for the client to be ready, then calls the onClientReady function
 * to load all stories and send the AI summary to the Discord channel.
 * @returns {void}
 */
const main = () => {
  try {
    discordClient.once(Events.ClientReady, onClientReady);
    discordClient.login(config.discord.token);
  } catch (error) {
    console.error("Error logging in to Discord: ", error);
  }
};

main();

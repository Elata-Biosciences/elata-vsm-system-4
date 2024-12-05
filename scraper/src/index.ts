import { Events, type TextChannel } from "discord.js";
import { config } from "./config/config.js";
import { MAIN_PROMPT } from "./config/prompt.js";
import {
  convertScrappingSummariesToCSV,
  convertStoriesToCSV,
  getDedupedArticles,
  isValidUrl,
  wait,
  writeSummaryToFile,
} from "./lib/utils.js";
import { scrapeWebsites } from "./lib/scraping.js";
import { openAIClient } from "./lib/openai.js";
import { QUERIES } from "./config/queries.js";
import { getStoriesFromQueries } from "./lib/newsApi.js";
import { discordClient, postSummaryToDiscord } from "./lib/discord.js";
import type { Story } from "./types/newsapi.types.js";
import type {
  ScrapingOutput,
  SummaryOutput,
  SummaryList,
  Article,
} from "@elata/shared-types";
import { SummaryListSchema } from "@elata/shared-types";
import { zodResponseFormat } from "openai/helpers/zod.js";

/**
 * Gets a summary of the stories from the AI
 * @param {Array} stories - Array of stories to summarize
 * @returns {Promise<string>}
 */
const getAISummaryOfStoriesAndScrapingResults = async (
  stories: Story[],
  scrapingResults: ScrapingOutput[]
): Promise<SummaryOutput> => {
  try {
    const combinedPrompt = `
    ${MAIN_PROMPT}

    ${convertStoriesToCSV(stories)}
    `;

    const summaryResponse = await openAIClient.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: combinedPrompt }],
      response_format: zodResponseFormat(SummaryListSchema, "SummaryList"),
    });

    const content = summaryResponse.choices[0].message.content;
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
    const summaryList: SummaryList = SummaryListSchema.parse(parsedContent);

    const summaryOutput: SummaryOutput = {
      research: [],
      industry: [],
      biohacking: [],
      computational: [],
      hardware: [],
      desci: [],
      offTopic: [],
      timestamp: new Date().toISOString(),
    };

    summaryList.articles.map((article) => {
      (
        summaryOutput[article.category as keyof SummaryOutput] as Article[]
      ).push(article);
    });

    // Add scraping results to summary output
    scrapingResults.map((result) => {
      result.articles.map((article) => {
        (
          summaryOutput[article.category as keyof SummaryOutput] as Article[]
        ).push(article);
      });
    });

    // Same as above but with for of loop
    // Make this loop through with function instead of
    for (const key in summaryOutput) {
      if (key === "timestamp") continue;
      // For each array of articles, make sure each array is deduped, then sorted by relevance score
      (summaryOutput[key as keyof SummaryOutput] as Article[]) =
        getDedupedArticles(
          summaryOutput[key as keyof SummaryOutput] as Article[]
        )
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .filter((article) => isValidUrl(article.url));
    }

    return summaryOutput;
  } catch (error) {
    console.error("Error loading AI summary of stories: ", error);
    return {
      research: [],
      industry: [],
      biohacking: [],
      computational: [],
      hardware: [],
      desci: [],
      offTopic: [],
      timestamp: new Date().toISOString(),
    };
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

    await writeSummaryToFile(summary);
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

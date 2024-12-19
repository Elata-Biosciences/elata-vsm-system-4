import { CONFIG } from "./config/config.js";
import { MAIN_PROMPT } from "./config/prompt.js";
import {
  convertStoriesToCSV,
  getDedupedArticles,
  wait,
  writeSummaryToFile,
  canIncludeUrlInSummary,
} from "./lib/utils.js";
import { scrapeWebsites } from "./lib/scraping.js";
import { openAIClient } from "./lib/openai.js";
import { QUERIES } from "./config/queries.js";
import { getStoriesFromQueries } from "./lib/newsApi.js";
import { postSummaryToDiscord } from "./lib/discord.js";
import type { Story } from "./types/newsapi.types.js";
import type {
  ScrapingOutput,
  SummaryOutput,
  SummaryList,
  Article,
} from "@elata/shared-types";
import { SummaryListSchema } from "@elata/shared-types";
import { zodResponseFormat } from "openai/helpers/zod.js";
import { loadGPTEnrichedTwitterData } from "./lib/twitter.js";
import { loadRedditPosts } from "./config/redditSources.js";

/**
 * Gets a summary of the stories from the AI
 * @param {Array} stories - Array of stories to summarize
 * @returns {Promise<string>}
 */
const loadGPTSummaryFromCombinedData = async (
  stories: Story[],
  scrapingResults: ScrapingOutput[],
  twitter: Article[],
  reddit: ScrapingOutput[],
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

    twitter.map((article) => {
      (
        summaryOutput[article.category as keyof SummaryOutput] as Article[]
      ).push(article);
    });

    reddit.map((result) => {
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
          .filter((article) => canIncludeUrlInSummary(article.url))
          .slice(0, CONFIG.SUMMARIZATION.ARTICLES_PER_CATEGORY);
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
 * Loads the stories and scraping results from the API and the scraping results from the scraping process
 * @returns {Promise<{ stories: Story[], scrapingResults: ScrapingOutput[] }>}
 */
const loadCombinedData = async () => {
  const twitter = await loadGPTEnrichedTwitterData();
  const reddit = await loadRedditPosts();
  const stories = await getStoriesFromQueries(QUERIES);
  const scraped = await scrapeWebsites();

  return { stories, scraped, twitter, reddit };
};

/**
 * Main function that calls root logic.
 * @returns {void}
 */
const main = async () => {
  try {
    console.log("Loading combined data...");
    const { stories, scraped, twitter, reddit } = await loadCombinedData();

    console.log("Loading GPT summary of combined data...");
    const summary = await loadGPTSummaryFromCombinedData(
      stories,
      scraped,
      twitter,
      reddit
    );

    console.log("Writing summary to file...");
    await writeSummaryToFile(summary);

    console.log("Posting summary to Discord...");
    await postSummaryToDiscord(summary);

    // Give 5 minute grace period for messages to send before terminating process
    await wait(CONFIG.SCRAPPING.SHUTOFF_TIMEOUT_LENGTH_MILLISECONDS);

    console.log("Process finished");
    process.exit(0);
  } catch (error) {
    console.error("Error in onClientReady: ", error);
  }
};

main();

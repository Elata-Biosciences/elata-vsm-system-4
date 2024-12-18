import { type TweetV2, TwitterApi } from "twitter-api-v2";
import { CONFIG } from "../config/config.js";
import { wait } from "./utils.js";
import {
  type ScrapingOutput,
  ScrapingOutputSchema,
  type Article,
} from "@elata/shared-types";
import { openAIClient } from "./openai.js";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import {
  ELATA_MISSION_ROLE_PROMPT,
  ELATA_TWITTER_SUMMARY_PROMPT,
} from "../config/prompt.js";
import {
  getYesterdayDate,
  readTwitterData,
  writeTwitterData,
} from "./utils.js";

// Instantiate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi(CONFIG.TWITTER.TOKEN).readOnly;

const TWITTER_QUERIES = ["DeSci"];

const TWITTER_QUERY_MAX_RESULTS = 3;

/**
 * Get posts by query
 * @param query - The query to search for
 * @returns The posts
 */
const getPostsByQuery = async (query: string) =>
  (
    await twitterClient.v2.search(query, {
      max_results: TWITTER_QUERY_MAX_RESULTS,
      sort_order: "recency",
    })
  ).data.data;

/**
 * Load Twitter data
 * @returns The posts
 */
const loadTwitterData = async (): Promise<TweetV2[]> => {
  const results: TweetV2[] = [];

  for (const query of TWITTER_QUERIES) {
    try {
      results.push(...(await getPostsByQuery(query)));

      // Wait for 2 seconds between queries to avoid rate limiting
      await wait(CONFIG.SCRAPPING.DELAY_BETWEEN_SOURCES);
    } catch (error) {
      console.error("Error loading Twitter data: ", error);
    }
  }

  return results;
};

/**
 * Convert tweets to CSV
 * @param tweets - The tweets
 * @returns The CSV
 */
const convertTweetsToCSV = (tweets: TweetV2[]): string => {
  const csvTitle = "id,text,created_at,author_id,source";

  const csvRows = tweets.map((tweet) => {
    return `${tweet.id},${tweet.text},${tweet.created_at},${tweet.author_id},${tweet.source}`;
  });

  return `${csvTitle}\n${csvRows.join("\n")}`;
};

/**
 * Load GPT enriched Twitter data
 * @returns The articles
 */
export const loadGPTEnrichedTwitterData = async (): Promise<Article[]> => {
  const yesterday = getYesterdayDate();

  // Check if we already have data for yesterday
  const existingData = readTwitterData(yesterday);
  if (existingData) {
    console.log("Found existing Twitter data for", yesterday);
    return existingData;
  }

  const posts = await loadTwitterData();

  if (posts.length === 0) return [];

  const userPrompt = `
  ${ELATA_TWITTER_SUMMARY_PROMPT}

  ${convertTweetsToCSV(posts)}
  `;

  const response = await openAIClient.chat.completions.create({
    model: CONFIG.SCRAPPING.MODEL,
    messages: [
      {
        role: "system",
        content: ELATA_MISSION_ROLE_PROMPT,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    response_format: zodResponseFormat(ScrapingOutputSchema, "ScrapingOutput"),
  });

  const content = response.choices[0].message.content;
  const parsedContent =
    typeof content === "string" ? JSON.parse(content) : content;
  const scrapingOutput: ScrapingOutput =
    ScrapingOutputSchema.parse(parsedContent);

  // Save the processed data
  writeTwitterData(scrapingOutput.articles, yesterday);

  return scrapingOutput.articles;
};

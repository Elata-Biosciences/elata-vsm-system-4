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

const TWITTER_QUERIES = [
  "DeSci",
  "Decentralized Science",
  "#DeSci",
] as const;

const TWITTER_PROFILES = [
  "bio_hacker_dao",
  "athena_DAO_",
  "VitalikButerin",
  "balajis",
  "wkylegDotEth",
  "psy_dao",
  "PoSciDonDAO",
  "bioprotocol",
  "GenomesDAO",
  "Elata_Bio",
  "valley_dao",
  "HairDAO_",
  "namkhaiferr",
  "AxonDAO",
  "Molecule_dao",
  "Cerebrum_DAO",
  "AMelhede",
  "desci_hub",
  "DeSciWorld",
  "SpectruthAI",
  "HealthSci_AI"
] as const;

/**
 * Maximum number of results to return for each query
 *
 * We want to keep this number low to avoid limit on posts per month, especially
 * considering that we only want posts from within the last day.
 *
 * The minimum number of results we can get is 10, so we set it to 10.
 */
const TWITTER_QUERY_MAX_RESULTS = 10;

/**
 * Get posts by query
 * @param query - The query to search for
 * @returns The posts
 */
const getPostsByQuery = async (query: string): Promise<TweetV2[]> =>
  (
    await twitterClient.v2.search(query, {
      max_results: TWITTER_QUERY_MAX_RESULTS,
      sort_order: "recency",
    })
  ).data.data;

/**
 * Get recent posts posted by `user
 * @param user - The user to search for
 * @returns The posts
 */
const getPostsByUser = async (username: string): Promise<TweetV2[]> => {
  try {
    // First, look up the user ID from username
    const user = await twitterClient.v2.userByUsername(username);
    if (!user.data) {
      console.log(`User ${username} not found`);
      return [];
    }

    // Then get their timeline using the ID
    const timeline = await twitterClient.v2.userTimeline(user.data.id, {
      max_results: TWITTER_QUERY_MAX_RESULTS,
    });

    return timeline.data.data || [];
  } catch (error) {
    console.error(`Error getting posts for user ${username}:`, error);
    return [];
  }
};

/**
 * Load Twitter data
 * @returns The posts
 */
const loadTwitterData = async (): Promise<TweetV2[]> => {
  const results: TweetV2[] = [];

  for (const query of TWITTER_QUERIES) {
    try {
      console.log(`Loading posts for query ${query}`);
      const posts = await getPostsByQuery(query);
      console.log(posts);

      if (!posts || posts.length === 0) continue;
      console.log(`Found ${posts.length} posts for query ${query}`);

      results.push(...posts);
    } catch (error) {
      console.error(`Error loading Twitter data for query ${query}:`, error);
    } finally {
      // Wait between queries to avoid rate limiting
      await wait(CONFIG.TWITTER.DELAY_BETWEEN_REQUESTS);
    }
  }

  for (const user of TWITTER_PROFILES) {
    try {
      console.log(`Loading posts for user ${user}`);
      const posts = await getPostsByUser(user);
      console.log(posts);

      if (!posts || posts.length === 0) continue;
      console.log(`Found ${posts.length} posts for user ${user}`);

      results.push(...posts);
    } catch (error) {
      console.error(`Error loading Twitter data for user ${user}:`, error);
    } finally {
      // Wait between queries to avoid rate limiting
      await wait(CONFIG.TWITTER.DELAY_BETWEEN_REQUESTS);
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
  if (!CONFIG.TWITTER.ENABLED) {
    console.log("Twitter ingestion disabled via config.");
    return [];
  }

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

  console.log(userPrompt);

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

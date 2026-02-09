import NewsAPI from "newsapi";
import { createLogger } from "./logger.js";

const log = createLogger("newsApi");
import {
  getYesterdayDate,
  getDayBeforeYesterdayDate,
  doesDataDumpFileExist,
  readDataDumpFromFile,
  writeDataDumpToFile,
} from "./utils.js";
import type { Story } from "../types/newsapi.types.js";
import type { NewsAPIResponse } from "../types/newsapi.types.js";
import { CONFIG } from "../config/config.js";

export const newsApiClient = new NewsAPI(CONFIG.NEWS_API.KEY);

/**
 * Fetches news stories from NewsAPI
 * @param {string} q - The query to search for
 * @returns {Promise<Object>}
 */
export const getStories = async (q: string): Promise<NewsAPIResponse> => {
  return newsApiClient.v2.everything({
    q,
    from: getDayBeforeYesterdayDate(),
    to: getYesterdayDate(),
    language: "en",
  });
};

/**
 * Fetches news stories from NewsAPI for a list of queries
 * @param {Array} queries - Array of queries to search for
 * @returns {Promise<Array>}
 */
export const getStoriesFromQueries = async (
  queries: string[]
): Promise<Story[]> => {
  // First check if the data dump file exists
  if (doesDataDumpFileExist()) {
    log.info("Data dump file exists, loading from file");
    return readDataDumpFromFile();
  }

  // Respect TEST_QUERIES_LIMIT in test mode
  const effectiveQueries = CONFIG.TEST_MODE
    ? queries.slice(0, CONFIG.TEST_QUERIES_LIMIT)
    : queries;

  if (CONFIG.TEST_MODE) {
    log.info("TEST_MODE: limiting queries", { effective: effectiveQueries.length, total: queries.length });
  }

  // If it doesn't exist, we need to fetch the data from the API
  const stories = [];

  for (const query of effectiveQueries) {
    try {
      const { articles } = await getStories(query);
      stories.push(...articles);
    } catch (error) {
      log.error("Error fetching stories for query", error instanceof Error ? error : new Error(String(error)), { query });
    }
  }
  log.info("Found stories", { count: stories.length });

  writeDataDumpToFile(stories);
  return stories;
};

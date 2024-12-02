import NewsAPI from "newsapi";
import {
  getYesterdayDate,
  getDayBeforeYesterdayDate,
  doesDataDumpFileExist,
  readDataDumpFromFile,
  writeDataDumpToFile,
} from "./utils.js";
import type { Story } from "../types/newsapi.types.js";
import type { NewsAPIResponse } from "../types/newsapi.types.js";
import { config } from "../config/config.js";

export const newsApiClient = new NewsAPI(config.newsApi.key);

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
    console.log("Data dump file exists, loading from file...");
    return readDataDumpFromFile();
  }

  // If it doesn't exist, we need to fetch the data from the API
  const stories = [];

  for (const query of queries) {
    try {
      const { articles } = await getStories(query);
      stories.push(...articles);
    } catch (error) {
      console.error(`Error fetching stories for query ${query}: ${error}`);
    }
  }
  console.log(`Found ${stories.length} stories`);

  writeDataDumpToFile(stories);
  return stories;
};

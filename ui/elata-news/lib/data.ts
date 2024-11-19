import { NewsData } from "./types";

const DATA_URL = "http://localhost:2345/data";

/**
 * Loads the current news data from the server
 * @returns {Promise<NewsData>}
 */
export async function loadCurrentData(): Promise<NewsData> {
  const response = await fetch(DATA_URL);
  const json = await response.json();
  return json as NewsData;
}

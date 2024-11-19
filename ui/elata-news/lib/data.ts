import { NewsData } from "./types";

const DATA_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2345/data";

/**
 * Loads the current news data from the server
 * @returns {Promise<NewsData>}
 */
export async function loadCurrentData(): Promise<NewsData> {
  try {
    const response = await fetch(DATA_URL);
    const json = await response.json();
    return json as NewsData;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Return empty data structure
    return {
      date: new Date().toISOString(),
      summary: {
        research: [],
        industry: [],
        biohacking: [],
        computational: [],
        hardware: [],
        desci: [],
        offTopic: []
      },
      timestamp: new Date().toISOString()
    };
  }
}

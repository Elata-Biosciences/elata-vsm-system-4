import { NewsData } from "./types";

const DATA_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2345/data";

/**
 * Loads the current news data from the server
 * @returns {Promise<NewsData>}
 */
export async function loadCurrentData(): Promise<NewsData> {
  try {
    const response = await fetch(DATA_URL, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    return json as NewsData;
  } catch (error) {
    console.error('Failed to fetch data:', {
      error,
      url: DATA_URL,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

import fs from "node:fs";
import path from "node:path";
import type { ScrapingOutput, SummaryOutput } from "@elata/shared-types";
import type { Story } from "../types/newsapi.types.js";

/**
 * The filename of the current file
 * @type {string}
 */
const __filename = process.argv[1];

/**
 * The directory of the current file
 * @type {string}
 */
const __dirname = path.dirname(__filename);

/**
 * Delay execution for `ms` milliseconds
 * @param {number} ms - Number of milliseconds to delay
 * @returns {Promise<void>}
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns yesterday's date in format YYYY-MM-DD
 * @returns {string}
 */
export function getYesterdayDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

/**
 * Returns day before yesterday's date in format YYYY-MM-DD
 * @returns {string}
 */
export function getDayBeforeYesterdayDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  return date.toISOString().split("T")[0];
}

/**
 * Returns the filename for a data dump with optional prefix
 * @param {string} prefix - Optional prefix for the filename (e.g., 'news', 'scrape')
 * @returns {string}
 */
export const getFileNameForDataDump = (prefix = "data"): string => {
  return `${prefix}_dump_${getYesterdayDate()}.json`;
};

/**
 * Returns the filepath for a data dump
 * @param {string} prefix - Optional prefix for the filename
 * @returns {string}
 */
export const getFilePathForDataDump = (prefix = "data"): string => {
  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, getFileNameForDataDump(prefix));
};

/**
 * Writes any data dump to a file
 * @param {Array} data - Array of objects to write to the file
 * @param {string} prefix - Optional prefix for the filename
 * @returns {void}
 */
export const writeDataDumpToFile = (data: any, prefix = "data"): void => {
  const filePath = getFilePathForDataDump(prefix);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Wrote ${prefix} dump to ${filePath}`);
};

/**
 * Reads a data dump from a file
 * @param {string} prefix - Optional prefix for the filename
 * @returns {Array}
 */
export const readDataDumpFromFile = (prefix = "data"): any => {
  return JSON.parse(fs.readFileSync(getFilePathForDataDump(prefix), "utf8"));
};

/**
 * Checks if a data dump file exists
 * @param {string} prefix - Optional prefix for the filename
 * @returns {boolean}
 */
export const doesDataDumpFileExist = (prefix = "data"): boolean => {
  return fs.existsSync(getFilePathForDataDump(prefix));
};


/**
 * Writes a summary to a JSON file
 * @param {string | object} summaryData - The summary to write to the file (can be string or object)
 * @returns {void}
 */
export const writeSummaryToFile = async (
  summaryData: SummaryOutput
): Promise<void> => {
  try {
    // Write to scraper's data directory only
    const scraperDataDir = path.join(__dirname, "..", "data");
    if (!fs.existsSync(scraperDataDir)) {
      fs.mkdirSync(scraperDataDir, { recursive: true });
    }

    // Write dated file
    const datedFilePath = path.join(
      scraperDataDir,
      `summary_${getYesterdayDate()}.json`
    );
    fs.writeFileSync(datedFilePath, JSON.stringify(summaryData, null, 2));
    console.log(`Wrote summary to ${datedFilePath}`);

    // Write current.json
    const currentFilePath = path.join(scraperDataDir, "current.json");
    fs.writeFileSync(currentFilePath, JSON.stringify(summaryData, null, 2));
    console.log(`Wrote current summary to ${currentFilePath}`);
  } catch (error) {
    console.error("Error writing summary files:", error);
    console.error("Current directory:", __dirname);
    throw error;
  }
};

/**
 * Reads a summary from a JSON file for the specified date
 * @param {string} date - Date in YYYY-MM-DD format (defaults to yesterday)
 * @returns {Object|null} - Returns null if no summary exists for that date
 */
export const readSummary = (
  date: string = getYesterdayDate()
): { date: string; summary: string; timestamp: string } | null => {
  const filePath = path.join(__dirname, "..", "data", `summary_${date}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

/**
 * Checks if a summary exists for the specified date
 * @param {string} date - Date in YYYY-MM-DD format (defaults to yesterday)
 * @returns {boolean}
 */
export const hasSummary = (date: string = getYesterdayDate()): boolean => {
  const filePath = path.join(__dirname, "..", "data", `summary_${date}.json`);
  return fs.existsSync(filePath);
};

/**
 * Returns the filepath for the scraped data of a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {string}
 */
export const getScrapedDataFilePath = (date: string): string => {
  const dataDir = path.join(__dirname, "..", "data", "scraped");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, `scraped_${date}.json`);
};

/**
 * Writes scraped data to a file for the specified date
 * @param {Array} data - Array of scraped data
 * @param {string} date - Date in YYYY-MM-DD format (defaults to yesterday)
 * @returns {void}
 */
export const writeScrapedData = (
  data: ScrapingOutput[],
  date: string = getYesterdayDate()
): void => {
  const filePath = getScrapedDataFilePath(date);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Wrote scraped data to ${filePath}`);
};

/**
 * Reads scraped data for the specified date if it exists
 * @param {string} date - Date in YYYY-MM-DD format (defaults to yesterday)
 * @returns {Array|null} - Returns null if no data exists for that date
 */
export const readScrapedData = (
  date: string = getYesterdayDate()
): ScrapingOutput[] | null => {
  const filePath = getScrapedDataFilePath(date);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

/**
 * Checks if scraped data exists for the specified date
 * @param {string} date - Date in YYYY-MM-DD format (defaults to yesterday)
 * @returns {boolean}
 */
export const hasScrapedData = (date: string = getYesterdayDate()): boolean => {
  return fs.existsSync(getScrapedDataFilePath(date));
};

export const CSV_HEADER = "title,description,url,source,author,publishedAt";

export const convertStoriesToCSV = (stories: Story[]): string => {
  return stories
    .map(
      (story) =>
        `${story.title},${story.description},${story.url},${story.source.name},${story.author},${story.publishedAt}`
    )
    .join("\n");
};

export const convertScrappingSummariesToCSV = (
  summaries: ScrapingOutput[]
): string => {
  let output = "";

  summaries.map((summary) => {
    summary.articles.map((article) => {
      output += `${article.title},${article.description},${article.url},${article.source},${article.author},${article.publishedAt}`;
    });
  });

  return output;
};

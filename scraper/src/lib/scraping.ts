import puppeteer, {
  type Browser,
  type PuppeteerLaunchOptions,
} from "puppeteer";
import { processPageWithGPT } from "./gptProcessor.js";
import os from "node:os";
import { SCRAPING_SOURCES } from "../config/scrapingSources.js";
import {
  getYesterdayDate,
  readScrapedData,
  wait,
  writeScrapedData,
} from "./utils.js";
import type { ScrapingOutput } from "@elata/shared-types";

const DELAY_BETWEEN_SOURCES = 2000;
const SOURCE_TIMEOUT = 60_000; // 1 minute timeout per source
const IDLE_TIMEOUT = 30_000; // 30 seconds timeout for idle browser

/**
 * Scrapes the websites for news articles and returns a CSV of the most relevant articles.
 * @returns {Promise<ScrapingOutput[]>} - The processed content
 */
export async function scrapeWebsites(): Promise<ScrapingOutput[]> {
  const yesterday = getYesterdayDate();

  // Check if we already have data for yesterday
  const existingData = readScrapedData(yesterday);
  if (existingData) {
    console.log("Found existing scraped data for", yesterday);
    return existingData;
  }

  console.log("Launching browser...");

  const options: PuppeteerLaunchOptions = {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process",
    ],
  };

  if (os.platform() === "linux") {
    options.executablePath = "/usr/bin/google-chrome";
  }

  const results: ScrapingOutput[] = [];

  for (const source of SCRAPING_SOURCES) {
    let browser: Browser | null = null;
    try {
      console.log(`Scraping ${source.name} (${source.url})`);

      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(`Timeout after ${SOURCE_TIMEOUT}ms for ${source.name}`)
          );
        }, SOURCE_TIMEOUT);
      });

      // Create the actual scraping promise
      const scrapingPromise = (async () => {
        browser = await puppeteer.launch(options);
        const page = await browser.newPage();

        await page.goto(source.url, {
          waitUntil: "networkidle0",
          timeout: IDLE_TIMEOUT,
        });

        const content = await page.evaluate(() => {
          // Remove scripts and styles to clean up the content
          const scripts = Array.from(document.getElementsByTagName("script"));
          const styles = Array.from(document.getElementsByTagName("style"));
          for (const s of scripts) {
            s.remove();
          }
          for (const s of styles) {
            s.remove();
          }

          // Return the full HTML content
          return document.documentElement.outerHTML;
        });

        const processedData = await processPageWithGPT(
          content,
          source.url,
          source.name
        );

        console.log(JSON.stringify(processedData, null, 2));

        await page.close();
        await browser.close();
        browser = null;

        return processedData;
      })();

      // Race between timeout and scraping
      const processedData = await Promise.race([
        scrapingPromise,
        timeoutPromise,
      ]);
      results.push(processedData as ScrapingOutput);
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      results.push({
        sourceUrl: source.url,
        sourceName: source.name,
        articles: [],
        timestamp: new Date().toISOString(),
        error: `Failed to scrape: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      if (browser) {
        try {
          await (browser as Browser)?.close();
        } catch (err) {
          console.error(`Error closing browser for ${source.name}:`, err);
        }
      }
    } finally {
      if (browser) {
        try {
          await (browser as Browser)?.close();
        } catch (err) {
          console.error(`Error closing browser for ${source.name}:`, err);
        }
      }
      await wait(DELAY_BETWEEN_SOURCES);
    }
  }

  writeScrapedData(results, yesterday);
  return results;
}

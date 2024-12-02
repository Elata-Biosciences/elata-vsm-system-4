import puppeteer, {
  type Browser,
  type Page,
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

  // Configure browser options based on OS
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

  // Only set executablePath on Linux (production server)
  if (os.platform() === "linux") {
    options.executablePath = "/usr/bin/google-chrome";
  }

  const results: ScrapingOutput[] = [];
  const activeBrowsers: Browser[] = [];

  try {
    for (const source of SCRAPING_SOURCES) {
      let browser: Browser | undefined;
      let page: Page | undefined;
      try {
        console.log(`Scraping ${source.name} (${source.url})`);
        browser = await puppeteer.launch(options);
        activeBrowsers.push(browser);
        page = await browser.newPage();

        await page.goto(source.url, {
          waitUntil: "networkidle0",
          timeout: 60000, // Increased timeout to 60 seconds
        });

        // Get the entire rendered page content
        const content = await page.evaluate(() => {
          // Remove script and style elements to clean up the content
          const scripts = document.getElementsByTagName("script");
          const styles = document.getElementsByTagName("style");

          for (const element of scripts) {
            element.remove();
          }
          for (const element of styles) {
            element.remove();
          }

          // Get the cleaned body content
          return document.body.innerText;
        });

        const processedData = await processPageWithGPT(
          content,
          source.url,
          source.name
        );
        results.push(processedData);

        await wait(DELAY_BETWEEN_SOURCES); // 2 second delay between sources so memory is not overloaded
      } catch (error) {
        console.error(`Error scraping page for ${source.name}:`, error);
      } finally {
        if (page) await page.close();
        if (browser)
          await browser
            ?.close()
            .catch((err) =>
              console.error(`Error closing browser for ${source.name}:`, err)
            );
      }
    }
  } catch (error) {
    console.error("Scraping error:", error);
  }

  // After scraping, store the results
  writeScrapedData(results, yesterday);

  process.on("SIGINT", async () => {
    for (const browser of activeBrowsers) {
      if (browser?.connected) {
        await browser?.close()?.catch(console.error);
      }
    }
    process.exit();
  });

  return results;
}

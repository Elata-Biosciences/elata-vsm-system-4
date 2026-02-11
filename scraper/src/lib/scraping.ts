import puppeteer, {
  type Browser,
  type PuppeteerLaunchOptions,
} from "puppeteer";
import { createLogger } from "./logger.js";

const log = createLogger("scraping");
import { match, P } from "ts-pattern";
import os from "node:os";
import { processPageWithGPT } from "./gptProcessor.js";
import { SCRAPING_SOURCES } from "../config/scrapingSources.js";
import {
  getYesterdayDate,
  readScrapedData,
  wait,
  writeScrapedData,
} from "./utils.js";
import type { ScrapingOutput } from "@elata/shared-types";
import { CONFIG } from "../config/config.js";
import { type Result, Ok, Err, isOk, isErr } from "./result.js";
import { withRetry } from "./retry.js";
import { createCheckpointManager, type CheckpointManager } from "./checkpoint.js";

// ── Types ───────────────────────────────────────────────────────────

interface ScrapingConfig {
  readonly sources: typeof SCRAPING_SOURCES;
  readonly sourceTimeoutMs: number;
  readonly idleTimeoutMs: number;
  readonly delayBetweenSourcesMs: number;
  readonly testMode: boolean;
  readonly testSourcesLimit: number;
  readonly verbose: boolean;
}

interface ScrapeSourceResult {
  readonly source: string;
  readonly result: Result<ScrapingOutput, Error>;
}

// ── Pure helpers ────────────────────────────────────────────────────

/** Build puppeteer launch options */
const buildLaunchOptions = (): PuppeteerLaunchOptions => {
  const base: PuppeteerLaunchOptions = {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process",
    ],
  };

  return match(os.platform())
    .with("linux", () => ({ ...base, executablePath: "/usr/bin/google-chrome" }))
    .otherwise(() => base);
};

/** Extract page content (strips scripts/styles) */
const extractPageContent = async (browser: Browser, url: string, timeoutMs: number): Promise<string> => {
  const page = await browser.newPage();

  // Use domcontentloaded instead of networkidle0 — many sites never reach
  // zero open connections due to analytics, websockets, polling, etc.
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: timeoutMs,
  });

  // Give a short window for JS-rendered content to populate
  await new Promise((r) => setTimeout(r, 3000));

  const content = await page.evaluate(() => {
    for (const el of document.querySelectorAll("script, style")) {
      el.remove();
    }
    return document.documentElement.outerHTML;
  });

  await page.close();
  return content;
};

/** Build config from environment */
const buildConfig = (): ScrapingConfig => ({
  sources: SCRAPING_SOURCES,
  sourceTimeoutMs: CONFIG.SCRAPPING.SOURCE_TIMEOUT_SECONDS,
  idleTimeoutMs: CONFIG.SCRAPPING.IDLE_TIMEOUT_SECONDS,
  delayBetweenSourcesMs: CONFIG.SCRAPPING.DELAY_BETWEEN_SOURCES,
  testMode: CONFIG.TEST_MODE,
  testSourcesLimit: CONFIG.TEST_SOURCES_LIMIT,
  verbose: CONFIG.VERBOSE,
});

/** Convert a successful source scrape to ScrapingOutput */
const errorOutput = (
  source: { name: string; url: string },
  error: Error,
): ScrapingOutput => ({
  sourceUrl: source.url,
  sourceName: source.name,
  articles: [],
  timestamp: new Date().toISOString(),
  error: `Failed to scrape: ${error.message}`,
});

// ── Scrape a single source ──────────────────────────────────────────

const scrapeSource = async (
  source: { name: string; url: string },
  config: ScrapingConfig,
): Promise<Result<ScrapingOutput, Error>> => {
  let browser: Browser | null = null;

  try {
    const result = await withRetry(
      async (attempt) => {
        if (config.verbose) {
          log.debug("Scrape attempt", { attempt, source: source.name });
        }

        browser = await puppeteer.launch(buildLaunchOptions());

        // Race: page extraction vs timeout
        const content = await Promise.race([
          extractPageContent(browser, source.url, config.idleTimeoutMs),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Timeout after ${config.sourceTimeoutMs}ms for ${source.name}`)),
              config.sourceTimeoutMs,
            ),
          ),
        ]);

        const processed = await processPageWithGPT(content, source.url, source.name);

        await browser.close();
        browser = null;

        return processed;
      },
      { maxAttempts: 2, baseDelayMs: 5000, maxDelayMs: 30000 },
    );

    return result;
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)));
  } finally {
    if (browser) {
      try {
        await (browser as Browser).close();
      } catch {
        // Browser already closed — ignore
      }
    }
  }
};

// ── Main entry point ────────────────────────────────────────────────

/**
 * Scrape all configured sources.
 *
 * Features:
 * - Result types for every source (no single failure crashes the pipeline)
 * - Retry with backoff per source
 * - Checkpoint save after each source completes
 * - Test mode to limit sources
 * - Verbose logging
 */
export async function scrapeWebsites(): Promise<ScrapingOutput[]> {
  const yesterday = getYesterdayDate();
  const config = buildConfig();

  // Check cached data
  const cached = readScrapedData(yesterday);
  if (cached) {
    log.info("Found existing data", { date: yesterday });
    return cached;
  }

  // Determine sources to scrape
  const sources = config.testMode
    ? config.sources.slice(0, config.testSourcesLimit)
    : config.sources;

  log.info("Starting scrape", { sourceCount: sources.length, testMode: config.testMode });

  // Initialize checkpoint
  let checkpoint: CheckpointManager | undefined;
  try {
    checkpoint = createCheckpointManager(CONFIG.PATHS.CHECKPOINT_DIR);
  } catch {
    log.warn("Checkpoint manager unavailable — continuing without");
  }

  const results: ScrapingOutput[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const source of sources) {
    log.info("Scraping source", { name: source.name, url: source.url });

    const sourceResult = await scrapeSource(source, config);

    const output: ScrapingOutput = match(sourceResult)
      .with({ ok: true }, (r) => {
        successCount++;
        if (config.verbose) {
          log.info("Source scraped successfully", { name: source.name, articles: r.data.articles.length });
        }
        return r.data;
      })
      .with({ ok: false }, (r) => {
        failCount++;
        log.error("Source scrape failed", r.error, { name: source.name });
        return errorOutput(source, r.error);
      })
      .exhaustive();

    results.push(output);

    // Save checkpoint after each source
    if (checkpoint) {
      try {
        checkpoint.save(yesterday, "scrape", results);
      } catch {
        // Non-fatal
      }
    }

    await wait(config.delayBetweenSourcesMs);
  }

  log.info("Scrape complete", { success: successCount, failed: failCount, total: sources.length });

  // Write final results
  writeScrapedData(results, yesterday);

  return results;
}

/** Expose for testing */
export const _internal = {
  buildLaunchOptions,
  buildConfig,
  errorOutput,
  scrapeSource,
};

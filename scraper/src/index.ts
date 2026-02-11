import { CONFIG } from "./config/config.js";
import { MAIN_PROMPT } from "./config/prompt.js";
import {
  convertStoriesToCSV,
  getDedupedArticles,
  wait,
  writeSummaryToFile,
  canIncludeUrlInSummary,
} from "./lib/utils.js";
import { scrapeWebsites } from "./lib/scraping.js";
import { openAIClient } from "./lib/openai.js";
import { QUERIES } from "./config/queries.js";
import { getStoriesFromQueries } from "./lib/newsApi.js";
import { postSummaryToDiscord } from "./lib/discord.js";
import { generatePodcastEpisode } from "./lib/podcastGenerator.js";
import { isOk } from "./lib/result.js";
import type { Story } from "./types/newsapi.types.js";
import type {
  ScrapingOutput,
  SummaryOutput,
  SummaryList,
  Article,
} from "@elata/shared-types";
import { SummaryListSchema } from "@elata/shared-types";
import { zodResponseFormat } from "openai/helpers/zod.js";
import { loadGPTEnrichedTwitterData } from "./lib/twitter.js";

// ── Batch processing helpers ────────────────────────────────────────

const BATCH_SIZE = 50;

/** Split an array into chunks of `size` */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Enrich a single batch of stories through GPT.
 * The prompt instructs the model to return ALL articles, not filter them.
 */
const enrichBatch = async (
  stories: Story[],
  batchIndex: number,
  totalBatches: number,
): Promise<Article[]> => {
  const csv = convertStoriesToCSV(stories);
  const prompt = `${MAIN_PROMPT}\n\nBatch ${batchIndex + 1} of ${totalBatches} (${stories.length} articles):\n\n${csv}`;

  try {
    const response = await openAIClient.chat.completions.create({
      model: CONFIG.SUMMARIZATION.MODEL,
      messages: [{ role: "system", content: prompt }],
      response_format: zodResponseFormat(SummaryListSchema, "SummaryList"),
    });

    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    const summaryList: SummaryList = SummaryListSchema.parse(parsed);

    console.log(
      `  Batch ${batchIndex + 1}/${totalBatches}: ${stories.length} stories → ${summaryList.articles.length} articles`,
    );
    return summaryList.articles;
  } catch (error) {
    console.error(`  Batch ${batchIndex + 1}/${totalBatches} failed:`, error);
    return [];
  }
};

// ── Main pipeline ───────────────────────────────────────────────────

/**
 * Process all stories through GPT in batches, then combine with
 * scraping and twitter data into a SummaryOutput.
 */
const loadGPTSummaryFromCombinedData = async (
  stories: Story[],
  scrapingResults: ScrapingOutput[],
  twitter: Article[],
): Promise<SummaryOutput> => {
  try {
    // Split stories into batches of BATCH_SIZE
    const batches = chunk(stories, BATCH_SIZE);
    console.log(
      `Processing ${stories.length} stories in ${batches.length} batches of ~${BATCH_SIZE} using ${CONFIG.SUMMARIZATION.MODEL}`,
    );

    // Process each batch through GPT
    const batchResults: Article[][] = [];
    for (let i = 0; i < batches.length; i++) {
      const articles = await enrichBatch(batches[i], i, batches.length);
      batchResults.push(articles);
    }

    // Combine all batch results
    const allArticles: Article[] = batchResults.flat();

    // Add scraping results
    for (const result of scrapingResults) {
      for (const article of result.articles) {
        allArticles.push(article);
      }
    }

    // Add twitter articles
    for (const article of twitter) {
      allArticles.push(article);
    }

    // Dedup, filter, and sort
    const processedArticles = getDedupedArticles(allArticles)
      .filter((article) => canIncludeUrlInSummary(article.url))
      .sort(
        (a, b) =>
          (b.rankingScore ?? b.relevanceScore) -
          (a.rankingScore ?? a.relevanceScore),
      );

    // Apply max articles limit if configured
    const finalArticles =
      CONFIG.MAX_ARTICLES > 0
        ? processedArticles.slice(0, CONFIG.MAX_ARTICLES)
        : processedArticles;

    // Build metadata
    const tagCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    let earliest = "";
    let latest = "";

    for (const article of finalArticles) {
      for (const tag of article.tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
      sourceCounts[article.source] = (sourceCounts[article.source] ?? 0) + 1;
      const date = article.publishedAt ?? article.scrapedAt;
      if (!earliest || date < earliest) earliest = date;
      if (!latest || date > latest) latest = date;
    }

    const summaryOutput: SummaryOutput = {
      allArticles: finalArticles,
      timestamp: new Date().toISOString(),
      metadata: {
        totalArticles: finalArticles.length,
        dateRange: {
          from: earliest || new Date().toISOString(),
          to: latest || new Date().toISOString(),
        },
        tagCounts,
        sourceCounts,
      },
    };

    console.log(
      `Summary produced ${finalArticles.length} articles from ${Object.keys(sourceCounts).length} sources`,
    );
    return summaryOutput;
  } catch (error) {
    console.error("Error loading AI summary of stories: ", error);
    return {
      allArticles: [],
      timestamp: new Date().toISOString(),
      metadata: {
        totalArticles: 0,
        dateRange: {
          from: new Date().toISOString(),
          to: new Date().toISOString(),
        },
        tagCounts: {},
        sourceCounts: {},
      },
    };
  }
};

/**
 * Loads the stories and scraping results from the API and the scraping process
 */
const loadCombinedData = async () => {
  const twitter = await loadGPTEnrichedTwitterData();
  const stories = await getStoriesFromQueries(QUERIES);
  const scraped = await scrapeWebsites();

  return { stories, scraped, twitter };
};

/**
 * Main function that calls root logic.
 */
const main = async () => {
  try {
    console.log("Loading combined data...");
    const { stories, scraped, twitter } = await loadCombinedData();

    console.log("Loading GPT summary of combined data...");
    const summary = await loadGPTSummaryFromCombinedData(
      stories,
      scraped,
      twitter,
    );

    console.log("Writing summary to file...");
    await writeSummaryToFile(summary);

    console.log("Posting summary to Discord...");
    await postSummaryToDiscord(summary);

    // Generate podcast episode (non-fatal if it fails)
    if (!CONFIG.SKIP_PODCAST) {
      console.log("Generating podcast episode...");
      try {
        if (summary.allArticles.length >= 2) {
          const podcastResult = await generatePodcastEpisode(
            summary.allArticles,
            {
              outputDir: `${CONFIG.PATHS.DATA_DIR}/podcast`,
            },
          );

          if (isOk(podcastResult)) {
            console.log(
              `Podcast generated: ${podcastResult.data.title} (${podcastResult.data.charCount} chars)`,
            );
          } else {
            console.error(
              "Podcast generation failed:",
              podcastResult.error.message,
            );
          }
        } else {
          console.log("Skipping podcast: not enough articles with summaries");
        }
      } catch (podcastError) {
        console.error("Podcast generation error (non-fatal):", podcastError);
      }
    } else {
      console.log("Skipping podcast (SKIP_PODCAST=true)");
    }

    // Give grace period for messages to send before terminating process
    await wait(CONFIG.SCRAPPING.SHUTOFF_TIMEOUT_LENGTH_MILLISECONDS);

    console.log("Process finished");
    process.exit(0);
  } catch (error) {
    console.error("Error in main: ", error);
    process.exit(1);
  }
};

main();

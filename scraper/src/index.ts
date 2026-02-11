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

/**
 * Gets a summary of the stories from the AI.
 * Returns the new flat SummaryOutput format with allArticles.
 */
const loadGPTSummaryFromCombinedData = async (
  stories: Story[],
  scrapingResults: ScrapingOutput[],
  twitter: Article[],
): Promise<SummaryOutput> => {
  try {
    const combinedPrompt = `
    ${MAIN_PROMPT}

    ${convertStoriesToCSV(stories)}
    `;

    console.log(`Using summarization model: ${CONFIG.SUMMARIZATION.MODEL}`);
    const summaryResponse = await openAIClient.chat.completions.create({
      model: CONFIG.SUMMARIZATION.MODEL,
      messages: [{ role: "system", content: combinedPrompt }],
      response_format: zodResponseFormat(SummaryListSchema, "SummaryList"),
    });

    const content = summaryResponse.choices[0].message.content;
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
    const summaryList: SummaryList = SummaryListSchema.parse(parsedContent);

    // Collect all articles from all sources
    const allArticles: Article[] = [
      ...summaryList.articles,
    ];

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
      .sort((a, b) => (b.rankingScore ?? b.relevanceScore) - (a.rankingScore ?? a.relevanceScore));

    // Apply max articles limit if configured
    const finalArticles = CONFIG.MAX_ARTICLES > 0
      ? processedArticles.slice(0, CONFIG.MAX_ARTICLES)
      : processedArticles;

    // Build metadata
    const tagCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    let earliest = "";
    let latest = "";

    for (const article of finalArticles) {
      // Count tags
      for (const tag of article.tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
      // Count sources
      sourceCounts[article.source] = (sourceCounts[article.source] ?? 0) + 1;
      // Track date range
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

    console.log(`Summary produced ${finalArticles.length} articles from ${Object.keys(sourceCounts).length} sources`);
    return summaryOutput;
  } catch (error) {
    console.error("Error loading AI summary of stories: ", error);
    return {
      allArticles: [],
      timestamp: new Date().toISOString(),
      metadata: {
        totalArticles: 0,
        dateRange: { from: new Date().toISOString(), to: new Date().toISOString() },
        tagCounts: {},
        sourceCounts: {},
      },
    };
  }
};

/**
 * Loads the stories and scraping results from the API and the scraping results from the scraping process
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
          const podcastResult = await generatePodcastEpisode(summary.allArticles, {
            outputDir: `${CONFIG.PATHS.DATA_DIR}/podcast`,
          });

          if (isOk(podcastResult)) {
            console.log(`Podcast generated: ${podcastResult.data.title} (${podcastResult.data.charCount} chars)`);
          } else {
            console.error("Podcast generation failed:", podcastResult.error.message);
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

import { CONFIG } from "./config/config.js";
import { MAIN_PROMPT } from "./config/prompt.js";
import { createLogger } from "./lib/logger.js";

const log = createLogger("pipeline");
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
import { createCheckpointManager } from "./lib/checkpoint.js";
import type { Story } from "./types/newsapi.types.js";
import type {
  ScrapingOutput,
  SummaryOutput,
  SummaryList,
  Article,
  LegacySummaryOutput,
  LegacySummaryOutputCategoriesKey,
} from "@elata/shared-types";
import { SummaryListSchema } from "@elata/shared-types";
import { zodResponseFormat } from "openai/helpers/zod.js";
import { loadGPTEnrichedTwitterData } from "./lib/twitter.js";

import { enrichTopArticles } from "./lib/contentScraper.js";
import { moderateArticles } from "./lib/moderation.js";
import { generateArticleEmbeddings } from "./lib/embeddings.js";
import { generateArticleAudio } from "./lib/audioGenerator.js";
import { generatePodcastEpisode } from "./lib/podcastGenerator.js";

// ── Phase type ──────────────────────────────────────────────────────

type Phase = "scrape" | "gpt" | "enrich" | "moderate" | "embed" | "audio" | "podcast" | "all";

const shouldRun = (target: Phase): boolean =>
  CONFIG.PHASE === "all" || CONFIG.PHASE === target;

// ── Checkpoint ──────────────────────────────────────────────────────

let checkpoint: ReturnType<typeof createCheckpointManager> | null = null;
try {
  checkpoint = createCheckpointManager(CONFIG.PATHS.CHECKPOINT_DIR);
} catch {
  log.warn("Checkpoint manager unavailable — continuing without");
}

const dateKey = new Date().toISOString().slice(0, 10);

// ── Legacy category keys ────────────────────────────────────────────

const LEGACY_CATEGORY_KEYS: LegacySummaryOutputCategoriesKey[] = [
  "research", "industry", "biohacking", "computational",
  "hardware", "desci", "offTopic",
];

// ── Convert legacy category-keyed format → new flat format ──────────

const legacyToNewFormat = (legacy: LegacySummaryOutput): SummaryOutput => {
  const allArticles: Article[] = [];

  for (const cat of LEGACY_CATEGORY_KEYS) {
    const catArticles = legacy[cat] ?? [];
    for (const raw of catArticles) {
      allArticles.push({
        id: `${raw.url}-${raw.title}`.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 64),
        title: raw.title,
        url: raw.url,
        source: raw.source,
        description: raw.description,
        tags: [],
        relevanceScore: raw.relevanceScore,
        scrapedAt: legacy.timestamp,
        author: raw.author,
        publishedAt: raw.publishedAt,
        language: "en",
        moderationPassed: true,
      });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const deduped = allArticles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  const tagCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  for (const a of deduped) {
    for (const tag of a.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
    sourceCounts[a.source] = (sourceCounts[a.source] ?? 0) + 1;
  }

  return {
    allArticles: deduped,
    timestamp: legacy.timestamp,
    metadata: {
      totalArticles: deduped.length,
      dateRange: {
        from: legacy.timestamp.slice(0, 10),
        to: legacy.timestamp.slice(0, 10),
      },
      tagCounts,
      sourceCounts,
    },
  };
};

// ── GPT Summary (still uses legacy structure internally) ────────────

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

    const summaryResponse = await openAIClient.chat.completions.create({
      model: CONFIG.SUMMARIZATION.MODEL,
      messages: [{ role: "system", content: combinedPrompt }],
      response_format: zodResponseFormat(SummaryListSchema, "SummaryList"),
    });

    const content = summaryResponse.choices[0].message.content;
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
    const summaryList: SummaryList = SummaryListSchema.parse(parsedContent);

    // Collect all articles from GPT, scraping, twitter
    const allRaw: Article[] = [...summaryList.articles];

    for (const result of scrapingResults) {
      allRaw.push(...result.articles);
    }
    allRaw.push(...twitter);

    // Dedup, sort, filter
    let deduped = getDedupedArticles(allRaw)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .filter((article) => canIncludeUrlInSummary(article.url));

    // Cap total articles
    const maxArticles = CONFIG.MAX_ARTICLES > 0
      ? CONFIG.MAX_ARTICLES
      : CONFIG.SUMMARIZATION.ARTICLES_PER_CATEGORY * 7;

    deduped = deduped.slice(0, maxArticles);

    // Build new format
    const tagCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    for (const a of deduped) {
      for (const tag of a.tags ?? []) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
      sourceCounts[a.source] = (sourceCounts[a.source] ?? 0) + 1;
    }

    return {
      allArticles: deduped,
      timestamp: new Date().toISOString(),
      metadata: {
        totalArticles: deduped.length,
        dateRange: {
          from: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
          to: new Date().toISOString().slice(0, 10),
        },
        tagCounts,
        sourceCounts,
      },
    };
  } catch (error) {
    log.error("Error in GPT summary", error);
    return {
      allArticles: [],
      timestamp: new Date().toISOString(),
      metadata: {
        totalArticles: 0,
        dateRange: { from: "", to: "" },
        tagCounts: {},
        sourceCounts: {},
      },
    };
  }
};

// ── Data loading ────────────────────────────────────────────────────

const loadCombinedData = async () => {
  log.info("Loading combined data...");
  const endLoad = log.time("loadCombinedData");

  const twitter = await loadGPTEnrichedTwitterData();
  log.info("Twitter data loaded", { articles: twitter.length });

  const stories = await getStoriesFromQueries(QUERIES);
  log.info("NewsAPI data loaded", { stories: stories.length });

  const scraped = await scrapeWebsites();
  log.info("Scraped data loaded", { sources: scraped.length });

  endLoad();
  return { stories, scraped, twitter };
};

// ── Main pipeline ───────────────────────────────────────────────────

const main = async () => {
  const pipelineStart = Date.now();

  log.info("═══════════════════════════════════════════════════════");
  log.info("Elata Neurotech Scraper", {
    phase: CONFIG.PHASE,
    testMode: CONFIG.TEST_MODE,
    dryRun: CONFIG.DRY_RUN,
    verbose: CONFIG.VERBOSE,
    maxArticles: CONFIG.MAX_ARTICLES || "unlimited",
    resume: CONFIG.RESUME,
    skipDiscord: CONFIG.SKIP_DISCORD,
  });
  log.info("═══════════════════════════════════════════════════════");

  try {
    // ── Phase: Scrape ─────────────────────────────────────────────
    let stories: Story[] = [];
    let scraped: ScrapingOutput[] = [];
    let twitter: Article[] = [];

    if (shouldRun("scrape")) {
      // Check for checkpoint resume
      if (CONFIG.RESUME && checkpoint) {
        const existing = checkpoint.load(dateKey, "scrape");
        if (existing) {
          log.info("Resuming from scrape checkpoint");
          const data = existing as { stories: Story[]; scraped: ScrapingOutput[]; twitter: Article[] };
          stories = data.stories;
          scraped = data.scraped;
          twitter = data.twitter;
        }
      }

      if (scraped.length === 0) {
        const data = await loadCombinedData();
        stories = data.stories;
        scraped = data.scraped;
        twitter = data.twitter;

        // Save checkpoint
        checkpoint?.save(dateKey, "scrape", { stories, scraped, twitter });
      }
    }

    // ── Phase: GPT ────────────────────────────────────────────────
    let summary: SummaryOutput | null = null;

    if (shouldRun("gpt")) {
      log.info("Running GPT summary...");
      const endGpt = log.time("gptSummary");
      summary = await loadGPTSummaryFromCombinedData(stories, scraped, twitter);
      endGpt();
      checkpoint?.save(dateKey, "gpt", summary);
    }

    if (!summary) {
      // Load from checkpoint if we skipped GPT phase
      if (checkpoint) {
        summary = checkpoint.load(dateKey, "gpt") as SummaryOutput | null;
      }
      if (!summary) {
        log.error("No summary data available. Exiting.");
        process.exit(1);
      }
    }

    // ── Phase: Enrich ─────────────────────────────────────────────
    if (shouldRun("enrich") && !CONFIG.SKIP_ENRICH) {
      log.info("Running content enrichment...");
      const endEnrich = log.time("enrich");
      try {
        const enrichLimit = CONFIG.TEST_MODE ? Math.min(5, summary.allArticles.length) : 20;
        summary.allArticles = await enrichTopArticles(summary.allArticles, enrichLimit);
        checkpoint?.save(dateKey, "enrich", summary);
        log.info("Enrichment complete", { enriched: summary.allArticles.filter(a => a.summary).length });
      } catch (err) {
        log.error("Enrichment failed (continuing)", err);
      }
      endEnrich();
    } else if (shouldRun("enrich")) {
      log.info("Skipping enrich (SKIP_ENRICH)");
    }

    // ── Phase: Moderate ───────────────────────────────────────────
    if (shouldRun("moderate") && !CONFIG.SKIP_MODERATE) {
      log.info("Running content moderation...");
      const endModerate = log.time("moderate");
      try {
        summary.allArticles = await moderateArticles(summary.allArticles);
        checkpoint?.save(dateKey, "moderate", summary);
        const flagged = summary.allArticles.filter(a => !a.moderationPassed).length;
        log.info("Moderation complete", { total: summary.allArticles.length, flagged });
      } catch (err) {
        log.error("Moderation failed (continuing)", err);
      }
      endModerate();
    } else if (shouldRun("moderate")) {
      log.info("Skipping moderate (SKIP_MODERATE)");
    }

    // ── Phase: Embed ──────────────────────────────────────────────
    if (shouldRun("embed") && !CONFIG.SKIP_EMBED) {
      log.info("Running embedding generation...");
      const endEmbed = log.time("embed");
      try {
        summary.allArticles = await generateArticleEmbeddings(summary.allArticles);
        checkpoint?.save(dateKey, "embed", summary);
        const embedded = summary.allArticles.filter(a => a.embedding?.length).length;
        log.info("Embeddings complete", { embedded });
      } catch (err) {
        log.error("Embedding generation failed (continuing)", err);
      }
      endEmbed();
    } else if (shouldRun("embed")) {
      log.info("Skipping embed (SKIP_EMBED)");
    }

    // ── Phase: Audio (article TTS) ────────────────────────────────
    if (shouldRun("audio") && !CONFIG.SKIP_AUDIO) {
      log.info("Running article audio generation...");
      const endAudio = log.time("audio");
      try {
        const audioLimit = CONFIG.TEST_MODE ? 3 : 10;
        summary.allArticles = await generateArticleAudio(summary.allArticles, audioLimit);
        const withAudio = summary.allArticles.filter(a => a.audioUrl).length;
        log.info("Audio generation complete", { withAudio });
      } catch (err) {
        log.error("Audio generation failed (continuing)", err);
      }
      endAudio();
    } else if (shouldRun("audio")) {
      log.info("Skipping audio (SKIP_AUDIO)");
    }

    // ── Phase: Podcast ────────────────────────────────────────────
    if (shouldRun("podcast") && !CONFIG.SKIP_PODCAST) {
      log.info("Running podcast generation...");
      const endPodcast = log.time("podcast");
      try {
        const podcastResult = await generatePodcastEpisode(summary.allArticles);
        if (podcastResult.ok) {
          log.info("Podcast generated", {
            title: podcastResult.data.title,
            duration: podcastResult.data.duration,
          });
        } else {
          log.warn("Podcast generation returned error", { error: podcastResult.error.message });
        }
      } catch (err) {
        log.error("Podcast generation failed (continuing)", err);
      }
      endPodcast();
    } else if (shouldRun("podcast")) {
      log.info("Skipping podcast (SKIP_PODCAST)");
    }

    // ── Write output ──────────────────────────────────────────────
    log.info("Writing summary to file...");
    await writeSummaryToFile(summary);

    // ── Discord ───────────────────────────────────────────────────
    if (!CONFIG.SKIP_DISCORD && !CONFIG.DRY_RUN) {
      log.info("Posting summary to Discord...");
      await postSummaryToDiscord(summary);
      await wait(CONFIG.SCRAPPING.SHUTOFF_TIMEOUT_LENGTH_MILLISECONDS);
    } else {
      log.info("Skipping Discord (SKIP_DISCORD or DRY_RUN)");
    }

    const elapsed = ((Date.now() - pipelineStart) / 1000).toFixed(1);
    log.info("═══════════════════════════════════════════════════════");
    log.info("Pipeline complete", { elapsedSeconds: elapsed });
    log.info("═══════════════════════════════════════════════════════");

    process.exit(0);
  } catch (error) {
    log.error("Fatal error", error);
    process.exit(1);
  }
};

main();

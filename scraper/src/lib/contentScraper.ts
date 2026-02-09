import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { createLogger } from "./logger.js";

const log = createLogger("content");
import { match } from "ts-pattern";
import { type Result, Ok, Err, isOk } from "./result.js";
import { withRetry } from "./retry.js";
import { createCircuitBreaker, type CircuitBreaker } from "./circuitBreaker.js";
import { openAIClient } from "./openai.js";
import type { Article } from "@elata/shared-types";
import { CONFIG } from "../config/config.js";

// ── Types ───────────────────────────────────────────────────────────

interface ExtractedContent {
  readonly title: string;
  readonly content: string;
  readonly textContent: string;
  readonly excerpt: string;
  readonly byline: string | null;
  readonly wordCount: number;
}

interface EnrichedArticle extends Article {
  readonly content: string;
  readonly summary: string;
  readonly wordCount: number;
  readonly readingTimeMinutes: number;
}

// ── Constants ───────────────────────────────────────────────────────

const SUMMARY_SYSTEM_PROMPT = `You are a neuroscience research analyst. Summarize the following article in 2-3 concise paragraphs. Focus on:
1. The key finding or announcement
2. Why it matters for neuroscience/neurotech
3. Implications for the field

Be factual, cite specifics, and avoid filler. Write for an audience of researchers and engineers.`;

const WORDS_PER_MINUTE = 200;

// ── Circuit breakers ────────────────────────────────────────────────

const fetchCircuitBreaker: CircuitBreaker = createCircuitBreaker({
  failureThreshold: 5,
  resetTimeoutMs: 60_000,
});

const summaryCircuitBreaker: CircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  resetTimeoutMs: 120_000,
});

// ── Pure helpers ────────────────────────────────────────────────────

const calculateReadingTime = (wordCount: number): number =>
  Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

const cleanText = (text: string): string =>
  text.replace(/\s+/g, " ").trim();

// ── Content extraction ──────────────────────────────────────────────

/**
 * Fetch and extract readable content from a URL using Readability.
 */
const extractContent = async (url: string): Promise<Result<ExtractedContent, Error>> => {
  const fetchResult = await fetchCircuitBreaker.execute(async () => {
    const retryResult = await withRetry(
      async () => {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "ElataBot/1.0 (+https://elata.bio)",
            Accept: "text/html,application/xhtml+xml",
          },
          signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${url}`);
        }

        return response.text();
      },
      { maxAttempts: 2, baseDelayMs: 1000, maxDelayMs: 5000 },
    );

    if (!isOk(retryResult)) throw retryResult.error;
    return retryResult.data;
  });

  if (!isOk(fetchResult)) {
    return Err(fetchResult.error);
  }

  try {
    const dom = new JSDOM(fetchResult.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      return Err(new Error(`Readability could not parse ${url}`));
    }

    const textContent = cleanText(article.textContent);
    const wordCount = textContent.split(/\s+/).length;

    return Ok({
      title: article.title || "",
      content: article.content || "",
      textContent,
      excerpt: article.excerpt || textContent.slice(0, 300),
      byline: article.byline ?? null,
      wordCount,
    });
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
};

// ── AI Summarization ────────────────────────────────────────────────

/**
 * Generate an AI summary for article text content.
 */
const generateSummary = async (
  textContent: string,
  title: string,
): Promise<Result<string, Error>> => {
  // Truncate to avoid token limits
  const truncated = textContent.slice(0, 8000);

  const result = await summaryCircuitBreaker.execute(async () => {
    const retryResult = await withRetry(
      async () => {
        const response = await openAIClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SUMMARY_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Article: "${title}"\n\n${truncated}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.3,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("Empty summary response");
        return content.trim();
      },
      { maxAttempts: 2, baseDelayMs: 2000, maxDelayMs: 10000 },
    );

    if (!isOk(retryResult)) throw retryResult.error;
    return retryResult.data;
  });

  return result;
};

// ── Main enrichment pipeline ────────────────────────────────────────

/**
 * Enrich a single article with full content extraction and AI summary.
 * Returns the original article with added fields if successful,
 * or the original article unchanged on failure.
 */
export const enrichArticle = async (article: Article): Promise<Article> => {
  if (CONFIG.VERBOSE) {
    log.debug("Processing article", { title: article.title });
  }

  // Extract content
  const contentResult = await extractContent(article.url);

  return match(contentResult)
    .with({ ok: false }, () => {
      if (CONFIG.VERBOSE) {
        log.warn("Content extraction failed", { title: article.title });
      }
      return article;
    })
    .with({ ok: true }, async (cr) => {
      const extracted = cr.data;
      const wordCount = extracted.wordCount;
      const readingTimeMinutes = calculateReadingTime(wordCount);

      // Generate summary
      const summaryResult = await generateSummary(extracted.textContent, article.title);

      const summary = match(summaryResult)
        .with({ ok: true }, (sr) => sr.data)
        .with({ ok: false }, () => {
          if (CONFIG.VERBOSE) {
            log.warn("Summary generation failed", { title: article.title });
          }
          return extracted.excerpt;
        })
        .exhaustive();

      return {
        ...article,
        content: extracted.textContent.slice(0, 50_000), // Cap storage
        summary,
        wordCount,
        readingTimeMinutes,
        author: article.author || extracted.byline || undefined,
      } satisfies Article;
    })
    .exhaustive();
};

/**
 * Enrich top N articles from a list.
 * Processes sequentially to respect rate limits.
 */
export const enrichTopArticles = async (
  articles: Article[],
  limit: number = 20,
): Promise<Article[]> => {
  const sorted = [...articles].sort(
    (a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0),
  );

  const topArticles = sorted.slice(0, limit);
  const restArticles = sorted.slice(limit);

  log.info("Enriching top articles", { top: topArticles.length, total: articles.length });

  const enriched: Article[] = [];

  for (const article of topArticles) {
    const result = await enrichArticle(article);
    enriched.push(result);

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const enrichedCount = enriched.filter((a) => a.summary && a.summary !== a.description).length;
  log.info("Enrichment complete", { enriched: enrichedCount, total: topArticles.length });

  return [...enriched, ...restArticles];
};

/** Expose for testing */
export const _internal = {
  calculateReadingTime,
  cleanText,
  extractContent,
  generateSummary,
  SUMMARY_SYSTEM_PROMPT,
};

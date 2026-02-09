import { match } from "ts-pattern";
import { openAIClient } from "./openai.js";
import { type Result, Ok, Err, isOk } from "./result.js";
import { withRetry } from "./retry.js";
import type { Article } from "@elata/shared-types";
import { CONFIG } from "../config/config.js";
import { createLogger } from "./logger.js";

const log = createLogger("moderation");

// ── Types ───────────────────────────────────────────────────────────

interface ModerationResult {
  readonly flagged: boolean;
  readonly categories: string[];
}

// ── Pure helpers ────────────────────────────────────────────────────

/** Build moderation input text from article fields */
const buildModerationInput = (article: Article): string =>
  [article.title, article.description, article.summary ?? ""]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 8000); // API max

// ── Moderation API call ─────────────────────────────────────────────

/**
 * Moderate a single article using OpenAI's free omni-moderation API.
 * Returns which categories were flagged, if any.
 */
const moderateText = async (text: string): Promise<Result<ModerationResult, Error>> => {
  const result = await withRetry(
    async () => {
      const response = await openAIClient.moderations.create({
        model: "omni-moderation-latest",
        input: text,
      });

      const modResult = response.results[0];
      if (!modResult) throw new Error("Empty moderation response");

      const flaggedCategories = Object.entries(modResult.categories)
        .filter(([, flagged]) => flagged)
        .map(([category]) => category);

      return {
        flagged: modResult.flagged,
        categories: flaggedCategories,
      };
    },
    { maxAttempts: 2, baseDelayMs: 1000, maxDelayMs: 5000 },
  );

  return result;
};

// ── Batch moderation ────────────────────────────────────────────────

/**
 * Moderate a batch of articles.
 * Marks each article with `moderationPassed` and `moderationFlags`.
 * Articles that fail moderation are retained but marked.
 */
export const moderateArticles = async (articles: Article[]): Promise<Article[]> => {
  if (CONFIG.DRY_RUN) {
    log.info("DRY RUN: Would moderate articles", { count: articles.length });
    return articles.map((a) => ({ ...a, moderationPassed: true }));
  }

  log.info("Moderating articles", { count: articles.length });

  let flaggedCount = 0;
  const results: Article[] = [];

  for (const article of articles) {
    const text = buildModerationInput(article);
    const modResult = await moderateText(text);

    const moderated = match(modResult)
      .with({ ok: true }, (r) => {
        if (r.data.flagged) {
          flaggedCount++;
          if (CONFIG.VERBOSE) {
            log.warn("Article flagged", { title: article.title, categories: r.data.categories.join(", ") });
          }
        }
        return {
          ...article,
          moderationPassed: !r.data.flagged,
          moderationFlags: r.data.flagged ? r.data.categories : undefined,
        };
      })
      .with({ ok: false }, (r) => {
        // On error, pass the article through (fail open)
        log.warn("Moderation error for article", { title: article.title, error: r.error.message });
        return { ...article, moderationPassed: true };
      })
      .exhaustive();

    results.push(moderated);

    // Rate limit: ~100 req/min for moderation
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  log.info("Moderation complete", { flagged: flaggedCount, total: articles.length });

  return results;
};

/** Expose for testing */
export const _internal = {
  buildModerationInput,
  moderateText,
};

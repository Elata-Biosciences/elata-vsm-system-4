import { match } from "ts-pattern";
import { openAIClient } from "./openai.js";
import { createLogger } from "./logger.js";

const log = createLogger("gpt");
import { ELATA_SCRAPPING_TASK_PROMPT } from "../config/prompt.js";
import type { ScrapingOutput } from "@elata/shared-types";
import { ScrapingOutputSchema } from "@elata/shared-types";
import { zodResponseFormat } from "openai/helpers/zod.js";
import { CONFIG } from "../config/config.js";
import { type Result, Ok, Err, isOk } from "./result.js";
import { withRetry } from "./retry.js";
import { createCircuitBreaker, type CircuitBreaker } from "./circuitBreaker.js";
import { validateGptArticleResponse } from "./gptValidator.js";

// ── Circuit breaker for OpenAI calls ────────────────────────────────

const gptCircuitBreaker: CircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  resetTimeoutMs: 120_000, // 2 minutes
  halfOpenMaxAttempts: 1,
});

// ── Pure helpers ────────────────────────────────────────────────────

/** Build user prompt for GPT */
const buildUserPrompt = (
  content: string,
  sourceUrl: string,
  sourceName: string,
): string =>
  `Content from ${sourceName} (${sourceUrl}):\n\n${content}`;

/** Truncate content to avoid token limit issues */
const truncateContent = (content: string, maxChars: number = 100_000): string =>
  content.length > maxChars ? content.slice(0, maxChars) + "\n[...truncated]" : content;

/** Build empty output for error cases */
const emptyOutput = (
  sourceUrl: string,
  sourceName: string,
  error: string,
): ScrapingOutput => ({
  sourceUrl,
  sourceName,
  articles: [],
  timestamp: new Date().toISOString(),
  error,
});

// ── Response parsing ────────────────────────────────────────────────

type RawGptResponse = string | null | undefined;

const parseGptResponse = (
  raw: RawGptResponse,
  sourceUrl: string,
  sourceName: string,
): Result<ScrapingOutput, Error> => {
  return match(raw)
    .with(null, () => Err(new Error("GPT returned null content")))
    .with(undefined, () => Err(new Error("GPT returned undefined content")))
    .otherwise((content) => {
      try {
        const parsed = typeof content === "string" ? JSON.parse(content) : content;

        // Try strict Zod parse first
        const zodResult = ScrapingOutputSchema.safeParse(parsed);
        if (zodResult.success) {
          return Ok(zodResult.data);
        }

        // Fallback: try to salvage articles from the response
        if (parsed && typeof parsed === "object" && "articles" in parsed) {
          const articlesResult = validateGptArticleResponse(
            JSON.stringify(parsed.articles),
          );
          if (isOk(articlesResult) && articlesResult.data.length > 0) {
            return Ok({
              sourceUrl: parsed.sourceUrl ?? sourceUrl,
              sourceName: parsed.sourceName ?? sourceName,
              articles: articlesResult.data,
              timestamp: parsed.timestamp ?? new Date().toISOString(),
            });
          }
        }

        return Err(
          new Error(
            `Zod validation failed: ${zodResult.error.issues.map((i) => i.message).join(", ")}`,
          ),
        );
      } catch (error) {
        return Err(
          error instanceof Error
            ? error
            : new Error(`JSON parse error: ${String(error)}`),
        );
      }
    });
};

// ── Main processor ──────────────────────────────────────────────────

/**
 * Process page content with GPT to extract neurotech articles.
 *
 * Uses: Result types, retry with backoff, circuit breaker, GPT validation.
 * Never throws — always returns a ScrapingOutput (possibly with empty articles).
 */
export const processPageWithGPT = async (
  content: string,
  sourceUrl: string,
  sourceName: string,
): Promise<ScrapingOutput> => {
  const truncated = truncateContent(content);
  const userPrompt = buildUserPrompt(truncated, sourceUrl, sourceName);

  if (CONFIG.VERBOSE) {
    log.debug("Processing source", { sourceName, sourceUrl });
  }

  // Check circuit breaker before expensive API call
  if (gptCircuitBreaker.getState() === "open") {
    log.warn("Circuit breaker OPEN — skipping source", { sourceName });
    return emptyOutput(sourceUrl, sourceName, "Circuit breaker open; GPT unavailable");
  }

  // Execute with circuit breaker + retry
  const result = await gptCircuitBreaker.execute(async () => {
    const retryResult = await withRetry(
      async (attempt) => {
        if (CONFIG.VERBOSE) {
          log.debug("Retry attempt", { attempt, sourceName });
        }

        const response = await openAIClient.chat.completions.create({
          model: CONFIG.SCRAPPING.MODEL,
          messages: [
            { role: "system", content: ELATA_SCRAPPING_TASK_PROMPT },
            { role: "user", content: userPrompt },
          ],
          response_format: zodResponseFormat(ScrapingOutputSchema, "ScrapingOutput"),
        });

        const raw = response.choices[0]?.message?.content;
        const parsed = parseGptResponse(raw, sourceUrl, sourceName);

        if (!isOk(parsed)) {
          throw parsed.error;
        }

        return parsed.data;
      },
      { maxAttempts: 3, baseDelayMs: 2000, maxDelayMs: 15000 },
    );

    if (!isOk(retryResult)) {
      throw retryResult.error;
    }

    return retryResult.data;
  });

  // Pattern match on circuit breaker result
  return match(result)
    .with({ ok: true }, (r) => {
      if (CONFIG.VERBOSE) {
        log.info("Successfully extracted articles", { count: r.data.articles.length, sourceName });
      }
      return r.data;
    })
    .with({ ok: false }, (r) => {
      log.error("GPT processing failed", r.error, { sourceName });
      return emptyOutput(sourceUrl, sourceName, r.error.message);
    })
    .exhaustive();
};

/** Expose for testing */
export const _internal = {
  buildUserPrompt,
  truncateContent,
  emptyOutput,
  parseGptResponse,
  gptCircuitBreaker,
};

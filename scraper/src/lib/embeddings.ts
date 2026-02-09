import { match } from "ts-pattern";
import { openAIClient } from "./openai.js";
import { type Result, Ok, Err, isOk } from "./result.js";
import { withRetry } from "./retry.js";
import { createCircuitBreaker, type CircuitBreaker } from "./circuitBreaker.js";
import type { Article } from "@elata/shared-types";
import { CONFIG } from "../config/config.js";
import { createLogger } from "./logger.js";

const log = createLogger("embeddings");

// ── Constants ───────────────────────────────────────────────────────

const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_BATCH_SIZE = 100; // OpenAI supports up to 2048, but be conservative
const MAX_INPUT_TOKENS = 8000; // Approximate char limit per input

// ── Circuit breaker ─────────────────────────────────────────────────

const embeddingCircuitBreaker: CircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  resetTimeoutMs: 120_000,
});

// ── Pure helpers ────────────────────────────────────────────────────

/** Build embedding input from article fields */
const buildEmbeddingInput = (article: Article): string => {
  const parts = [
    article.title,
    article.description,
    article.summary ?? "",
    (article.tags ?? []).join(", "),
    (article.entities ?? []).join(", "),
  ];
  return parts.filter(Boolean).join(" ").slice(0, MAX_INPUT_TOKENS);
};

/** Chunk array into batches of given size */
const chunk = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

// ── Embedding generation ────────────────────────────────────────────

/**
 * Generate embeddings for a batch of texts.
 * Returns array of float arrays in same order as input.
 */
const generateBatchEmbeddings = async (
  texts: string[],
): Promise<Result<number[][], Error>> => {
  const result = await embeddingCircuitBreaker.execute(async () => {
    const retryResult = await withRetry(
      async () => {
        const response = await openAIClient.embeddings.create({
          model: EMBEDDING_MODEL,
          input: texts,
        });

        // Sort by index to maintain order
        const sorted = response.data.sort((a, b) => a.index - b.index);
        return sorted.map((d) => d.embedding);
      },
      { maxAttempts: 2, baseDelayMs: 2000, maxDelayMs: 10000 },
    );

    if (!isOk(retryResult)) throw retryResult.error;
    return retryResult.data;
  });

  return result;
};

// ── Main entry point ────────────────────────────────────────────────

/**
 * Generate embeddings for all articles that don't have one yet.
 * Uses batched API calls for efficiency.
 *
 * Cost: ~$0.02 per 1M tokens with text-embedding-3-small
 * (~$0.002 for 100 articles)
 */
export const generateArticleEmbeddings = async (
  articles: Article[],
): Promise<Article[]> => {
  // Split into articles needing embeddings and those that already have them
  const needsEmbedding = articles.filter((a) => !a.embedding || a.embedding.length === 0);
  const hasEmbedding = articles.filter((a) => a.embedding && a.embedding.length > 0);

  if (needsEmbedding.length === 0) {
    log.info("All articles already have embeddings");
    return articles;
  }

  if (CONFIG.DRY_RUN) {
    log.info("DRY RUN: Would generate embeddings", { count: needsEmbedding.length });
    return articles;
  }

  log.info("Generating embeddings", { toGenerate: needsEmbedding.length, alreadyDone: hasEmbedding.length });

  // Build inputs
  const inputs = needsEmbedding.map(buildEmbeddingInput);
  const batches = chunk(inputs, MAX_BATCH_SIZE);
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    log.info("Processing embedding batch", { batch: i + 1, totalBatches: batches.length, batchSize: batch.length });

    const result = await generateBatchEmbeddings(batch);

    match(result)
      .with({ ok: true }, (r) => {
        allEmbeddings.push(...r.data);
      })
      .with({ ok: false }, (r) => {
        log.error("Embedding batch failed", r.error, { batch: i + 1 });
        // Push empty embeddings for failed batch
        allEmbeddings.push(...batch.map(() => []));
      })
      .exhaustive();

    // Small delay between batches
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Apply embeddings to articles
  let embeddingIdx = 0;
  const result = articles.map((article) => {
    if (article.embedding && article.embedding.length > 0) {
      return article;
    }

    const embedding = allEmbeddings[embeddingIdx] ?? [];
    embeddingIdx++;
    return { ...article, embedding };
  });

  const successCount = allEmbeddings.filter((e) => e.length > 0).length;
  log.info("Embedding generation complete", { success: successCount, total: needsEmbedding.length });

  return result;
};

/** Expose for testing */
export const _internal = {
  buildEmbeddingInput,
  chunk,
  generateBatchEmbeddings,
  EMBEDDING_MODEL,
};

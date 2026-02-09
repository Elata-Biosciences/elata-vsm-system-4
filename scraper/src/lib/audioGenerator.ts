import fs from "node:fs";
import path from "node:path";
import { match } from "ts-pattern";
import { createLogger } from "./logger.js";

const log = createLogger("audio");
import { openAIClient } from "./openai.js";
import { type Result, Ok, Err, isOk } from "./result.js";
import { withRetry } from "./retry.js";
import { createCircuitBreaker, type CircuitBreaker } from "./circuitBreaker.js";
import type { Article } from "@elata/shared-types";
import { CONFIG } from "../config/config.js";

// ── Types ───────────────────────────────────────────────────────────

interface AudioResult {
  readonly filePath: string;
  readonly url: string;
  readonly durationEstimate: number; // seconds
}

type TtsVoice = "alloy" | "echo" | "fable" | "nova" | "onyx" | "shimmer";

// ── Circuit breaker for TTS API ─────────────────────────────────────

const ttsCircuitBreaker: CircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  resetTimeoutMs: 300_000, // 5 minutes
});

// ── Pure helpers ────────────────────────────────────────────────────

const AUDIO_DIR = path.join(CONFIG.PATHS.DATA_DIR, "audio");

/** Ensure audio directory exists */
const ensureAudioDir = (): void => {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
};

/** Build a short summary text suitable for TTS (under 4096 chars) */
const buildTtsText = (article: Article): string => {
  const summary = article.summary ?? article.description;
  const prefix = `${article.title}. `;
  const maxLen = 4000 - prefix.length;
  return prefix + (summary.length > maxLen ? summary.slice(0, maxLen) + "..." : summary);
};

/** Estimate audio duration in seconds (rough: ~150 words/min for TTS) */
const estimateDuration = (text: string): number => {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil((wordCount / 150) * 60);
};

/** Generate file name for an article audio */
const getAudioFileName = (articleId: string): string =>
  `article_${articleId}.mp3`;

// ── TTS Generation ──────────────────────────────────────────────────

/**
 * Generate TTS audio for a single article.
 * Cost: ~$0.015 per 1K characters with tts-1.
 */
const generateAudio = async (
  text: string,
  outputPath: string,
  voice: TtsVoice = "nova",
): Promise<Result<AudioResult, Error>> => {
  const result = await ttsCircuitBreaker.execute(async () => {
    const retryResult = await withRetry(
      async () => {
        const response = await openAIClient.audio.speech.create({
          model: "tts-1",
          voice,
          input: text,
          response_format: "mp3",
        });

        // Stream to file
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(outputPath, buffer);

        return {
          filePath: outputPath,
          url: `/audio/${path.basename(outputPath)}`,
          durationEstimate: estimateDuration(text),
        };
      },
      { maxAttempts: 2, baseDelayMs: 3000, maxDelayMs: 15000 },
    );

    if (!isOk(retryResult)) throw retryResult.error;
    return retryResult.data;
  });

  return result;
};

// ── Main entry point ────────────────────────────────────────────────

/**
 * Generate audio summaries for the top N articles.
 * Only generates for articles with a summary (i.e., already enriched).
 */
export const generateArticleAudio = async (
  articles: Article[],
  limit: number = 5,
): Promise<Article[]> => {
  ensureAudioDir();

  // Pick top articles with summaries that don't already have audio
  const candidates = articles
    .filter((a) => a.summary && !a.audioUrl)
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
    .slice(0, limit);

  if (candidates.length === 0) {
    log.info("No candidates for audio generation");
    return articles;
  }

  log.info("Generating audio for articles", { count: candidates.length });

  const audioMap = new Map<string, string>();

  for (const article of candidates) {
    const text = buildTtsText(article);
    const fileName = getAudioFileName(article.id);
    const outputPath = path.join(AUDIO_DIR, fileName);

    // Skip if file already exists
    if (fs.existsSync(outputPath)) {
      audioMap.set(article.id, `/audio/${fileName}`);
      continue;
    }

    if (CONFIG.DRY_RUN) {
      log.info("DRY RUN: Would generate audio", { title: article.title });
      continue;
    }

    const result = await generateAudio(text, outputPath);

    match(result)
      .with({ ok: true }, (r) => {
        audioMap.set(article.id, r.data.url);
        log.info("Audio generated", { title: article.title, durationSeconds: r.data.durationEstimate });
      })
      .with({ ok: false }, (r) => {
        log.error("Audio generation failed", r.error, { title: article.title });
      })
      .exhaustive();

    // Rate limit: 1 request per 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Apply audio URLs to articles
  return articles.map((article) => {
    const audioUrl = audioMap.get(article.id);
    return audioUrl ? { ...article, audioUrl } : article;
  });
};

/** Expose for testing */
export const _internal = {
  buildTtsText,
  estimateDuration,
  getAudioFileName,
  generateAudio,
};

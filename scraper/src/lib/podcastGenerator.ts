/**
 * Podcast generation module for "Elata Neurotech Brief."
 *
 * Generates a daily podcast featuring two personas:
 * - Nova: Sharp science communicator and host
 * - Dr. Renn: Seasoned neuroscientist providing rigorous analysis
 *
 * Architecture:
 * 1. GPT generates conversational script from top articles
 * 2. ElevenLabs voices the two personas with distinct voice IDs
 * 3. Audio segments are concatenated into final MP3 (via ffmpeg if available)
 * 4. Metadata (title, description, duration) is saved for RSS feed
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { match } from "ts-pattern";
import { type Result, Ok, Err, isOk } from "./result.js";
import { withRetry } from "./retry.js";
import { openAIClient } from "./openai.js";
import type { Article } from "@elata/shared-types";
import { CONFIG } from "../config/config.js";
import { createLogger } from "./logger.js";
import { PODCAST_SCRIPT_PROMPT } from "../config/prompt.js";

const log = createLogger("podcast");

// ── Types ───────────────────────────────────────────────────────────

export interface PodcastSegment {
  readonly speaker: "nova" | "dr-renn";
  readonly text: string;
}

export interface PodcastScript {
  readonly title: string;
  readonly description: string;
  readonly segments: PodcastSegment[];
  readonly articleIds: string[];
}

export interface PodcastEpisode {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly audioUrl: string;
  readonly segmentFiles: string[];
  readonly duration: number; // seconds
  readonly date: string;
  readonly articleIds: string[];
  readonly charCount: number;
}

export interface PodcastOptions {
  /** Maximum number of TTS segments to generate (default: all) */
  maxSegments?: number;
  /** Output directory for audio files */
  outputDir?: string;
  /** Skip TTS, only generate script */
  scriptOnly?: boolean;
}

// ── ElevenLabs config ───────────────────────────────────────────────

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

// ── Script generation ───────────────────────────────────────────────

/**
 * Generate a podcast script from top articles using GPT.
 * Uses CONFIG.PODCAST.MODEL (defaults to gpt-4.1) for high-quality creative output.
 */
export const generateScript = async (
  articles: Article[],
): Promise<Result<PodcastScript, Error>> => {
  const maxArticles = CONFIG.PODCAST.MAX_ARTICLES;
  const topArticles = articles
    .filter((a) => a.summary)
    .sort((a, b) => (b.rankingScore ?? b.relevanceScore ?? 0) - (a.rankingScore ?? a.relevanceScore ?? 0))
    .slice(0, maxArticles);

  if (topArticles.length < 2) {
    return Err(new Error(`Not enough articles with summaries for podcast (found ${topArticles.length}, need at least 2)`));
  }

  const articleSummaries = topArticles
    .map(
      (a, i) =>
        `Story ${i + 1}: "${a.title}" (${a.source})
Summary: ${a.summary}
Tags: ${a.tags?.join(", ") ?? "none"}
Published: ${a.publishedAt ?? "unknown"}`,
    )
    .join("\n\n---\n\n");

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const model = CONFIG.PODCAST.MODEL;
  log.info("Generating podcast script", { model, articleCount: topArticles.length });

  const result = await withRetry(
    async () => {
      const response = await openAIClient.chat.completions.create({
        model,
        messages: [
          { role: "system", content: PODCAST_SCRIPT_PROMPT },
          {
            role: "user",
            content: `Generate today's Elata Neurotech Brief for ${dateStr}.\n\nHere are ${topArticles.length} stories to cover:\n\n${articleSummaries}`,
          },
        ],
        temperature: 0.75,
        max_tokens: 6000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty script response from GPT");

      // Clean potential markdown fences from GPT response
      const cleaned = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const segments: PodcastSegment[] = JSON.parse(cleaned);
      if (!Array.isArray(segments) || segments.length === 0) {
        throw new Error("Invalid script format: expected non-empty array of segments");
      }

      // Validate segment structure
      for (const seg of segments) {
        if (!seg.speaker || !seg.text) {
          throw new Error("Invalid segment: missing speaker or text");
        }
        if (seg.speaker !== "nova" && seg.speaker !== "dr-renn") {
          throw new Error(`Invalid speaker: "${seg.speaker}" (expected "nova" or "dr-renn")`);
        }
      }

      return {
        title: `Elata Neurotech Brief — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        description: `Today's top neurotech stories: ${topArticles.slice(0, 5).map((a) => a.title).join("; ")}`,
        segments,
        articleIds: topArticles.map((a) => a.id),
      };
    },
    { maxAttempts: 3, baseDelayMs: 3000, maxDelayMs: 15000 },
  );

  return result;
};

/**
 * Generate audio for a single segment using ElevenLabs.
 * Returns audio buffer.
 */
const generateSegmentAudio = async (
  segment: PodcastSegment,
): Promise<Result<Buffer, Error>> => {
  const apiKey = CONFIG.ELEVENLABS.API_KEY;
  if (!apiKey) {
    return Err(new Error("ELEVENLABS_API_KEY not configured"));
  }

  const voiceId = segment.speaker === "nova"
    ? CONFIG.ELEVENLABS.VOICE_NOVA
    : CONFIG.ELEVENLABS.VOICE_RENN;

  const ttsModel = CONFIG.ELEVENLABS.MODEL;

  const result = await withRetry(
    async () => {
      const response = await fetch(
        `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: segment.text,
            model_id: ttsModel,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        },
      );

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`ElevenLabs API error: ${response.status} — ${body}`);
      }

      return Buffer.from(await response.arrayBuffer());
    },
    { maxAttempts: 2, baseDelayMs: 2000, maxDelayMs: 10000 },
  );

  return result;
};

/**
 * Check if ffmpeg is available on the system.
 */
const isFfmpegAvailable = (): boolean => {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

/**
 * Concatenate MP3 segments using ffmpeg.
 */
const concatenateAudio = (
  segmentFiles: string[],
  outputPath: string,
): Result<string, Error> => {
  if (!isFfmpegAvailable()) {
    return Err(
      new Error("ffmpeg not found — install ffmpeg to concatenate audio segments"),
    );
  }

  try {
    // Create a file list for ffmpeg concat
    const listPath = outputPath.replace(".mp3", "-list.txt");
    const listContent = segmentFiles.map((f) => `file '${f}'`).join("\n");
    fs.writeFileSync(listPath, listContent);

    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`,
      { stdio: "pipe" },
    );

    // Clean up list file
    fs.unlinkSync(listPath);

    return Ok(outputPath);
  } catch (err) {
    return Err(
      new Error(
        `ffmpeg concatenation failed: ${err instanceof Error ? err.message : String(err)}`,
      ),
    );
  }
};

/**
 * Generate full podcast episode.
 * This is the main entry point for podcast generation.
 */
export const generatePodcastEpisode = async (
  articles: Article[],
  options: PodcastOptions = {},
): Promise<Result<PodcastEpisode, Error>> => {
  const {
    maxSegments,
    outputDir = path.join(CONFIG.PATHS.DATA_DIR, "podcast"),
    scriptOnly = false,
  } = options;

  if (CONFIG.DRY_RUN) {
    log.info("DRY RUN: Would generate podcast episode");
    return Err(new Error("Dry run — skipping podcast generation"));
  }

  // Ensure output directories exist
  const segmentDir = path.join(outputDir, "segments");
  fs.mkdirSync(segmentDir, { recursive: true });

  // Step 1: Generate script
  log.info("Generating podcast script...");
  const scriptResult = await generateScript(articles);

  if (!isOk(scriptResult)) {
    return Err(scriptResult.error);
  }

  const script = scriptResult.data;
  const totalChars = script.segments.reduce(
    (acc, s) => acc + s.text.length,
    0,
  );
  log.info("Script generated", {
    segments: script.segments.length,
    characters: totalChars,
    model: CONFIG.PODCAST.MODEL,
    estimatedCost: `~$${((totalChars / 1000) * 0.3).toFixed(2)} ElevenLabs`,
  });

  // Save script JSON
  const episodeId = `ep-${new Date().toISOString().slice(0, 10)}`;
  const scriptPath = path.join(outputDir, `${episodeId}-script.json`);
  fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));
  log.info("Script saved", { path: scriptPath });

  if (scriptOnly) {
    return Ok({
      id: episodeId,
      title: script.title,
      description: script.description,
      audioUrl: "",
      segmentFiles: [],
      duration: 0,
      date: new Date().toISOString(),
      articleIds: script.articleIds,
      charCount: totalChars,
    });
  }

  // Step 2: Generate audio for each segment
  const segmentsToProcess = maxSegments
    ? script.segments.slice(0, maxSegments)
    : script.segments;

  log.info("Generating audio segments", {
    total: segmentsToProcess.length,
    maxSegments: maxSegments ?? "all",
    ttsModel: CONFIG.ELEVENLABS.MODEL,
  });

  const segmentFiles: string[] = [];

  for (let i = 0; i < segmentsToProcess.length; i++) {
    const segment = segmentsToProcess[i];
    log.info(
      `  Segment ${i + 1}/${segmentsToProcess.length}: ${segment.speaker} (${segment.text.length} chars)`,
    );

    const audioResult = await generateSegmentAudio(segment);
    match(audioResult)
      .with({ ok: true }, (r) => {
        const segmentPath = path.join(
          segmentDir,
          `${episodeId}-${String(i).padStart(3, "0")}-${segment.speaker}.mp3`,
        );
        fs.writeFileSync(segmentPath, r.data);
        segmentFiles.push(segmentPath);
        log.info(
          `  → Saved: ${path.basename(segmentPath)} (${r.data.length} bytes)`,
        );
      })
      .with({ ok: false }, (r) => {
        log.warn(`  → Failed: ${r.error.message}`);
      })
      .exhaustive();

    // Rate limit between segments
    if (i < segmentsToProcess.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (segmentFiles.length === 0) {
    return Err(new Error("No audio segments generated"));
  }

  // Step 3: Concatenate with ffmpeg
  let finalAudioPath = segmentFiles[0]; // Fallback: use first segment
  const concatenatedPath = path.join(outputDir, `${episodeId}.mp3`);

  if (segmentFiles.length > 1) {
    const concatResult = concatenateAudio(segmentFiles, concatenatedPath);
    match(concatResult)
      .with({ ok: true }, (r) => {
        finalAudioPath = r.data;
        log.info("Audio concatenated", { path: finalAudioPath });
      })
      .with({ ok: false }, (r) => {
        log.warn(`Concatenation failed: ${r.error.message}`);
        log.warn("Individual segment files are still available");
      })
      .exhaustive();
  }

  // Step 4: Compute duration and save metadata
  const estimatedDuration = script.segments.reduce(
    (acc, s) => acc + Math.ceil(s.text.split(/\s+/).length / 150) * 60,
    0,
  );

  const episode: PodcastEpisode = {
    id: episodeId,
    title: script.title,
    description: script.description,
    audioUrl: finalAudioPath,
    segmentFiles,
    duration: estimatedDuration,
    date: new Date().toISOString(),
    articleIds: script.articleIds,
    charCount: totalChars,
  };

  // Save episode metadata
  const metadataPath = path.join(outputDir, `${episodeId}.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(episode, null, 2));
  log.info("Episode metadata saved", { path: metadataPath });

  log.info("Podcast generation complete", {
    episodeId,
    segments: segmentFiles.length,
    duration: `~${Math.ceil(estimatedDuration / 60)} minutes`,
    charCount: totalChars,
    outputDir,
  });

  return Ok(episode);
};

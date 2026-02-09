/**
 * ElevenLabs podcast generation module.
 *
 * Generates "Elata Neurotech Brief" — a daily podcast featuring two personas:
 * - Nova: Enthusiastic curator who highlights breakthroughs
 * - Dr. Renn: Skeptical scientist who questions methodology and implications
 *
 * Architecture:
 * 1. GPT generates conversational script from top 5 articles
 * 2. ElevenLabs voices the two personas with distinct voice IDs
 * 3. Audio segments are concatenated into final MP3 (via ffmpeg if available)
 * 4. Metadata (title, description, duration) is saved for RSS feed
 *
 * Cost estimate: ~$22/month on ElevenLabs Creator plan (100K chars/month)
 * A 10-minute episode ≈ 8,000 characters → ~12 episodes/month comfortably
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

// These voice IDs would be configured in env
const VOICE_IDS = {
  nova: process.env.ELEVENLABS_VOICE_NOVA || "EXAVITQu4vr4xnSDxMaL", // Default: Rachel
  "dr-renn": process.env.ELEVENLABS_VOICE_RENN || "VR6AewLTigWG4xSOukaG", // Default: Arnold
};

// ── Script generation ───────────────────────────────────────────────

const SCRIPT_SYSTEM_PROMPT = `You are writing a script for "Elata Neurotech Brief," a daily podcast about neuroscience and brain technology.

There are two hosts:

- **Nova**: A sharp science communicator who genuinely loves neurotech. She leads discussions, highlights breakthroughs, and makes complex research accessible. She is NOT just a cheerleader — she sometimes pushes back on hype, asks hard follow-up questions, and acknowledges when a study has weak points. She occasionally references specific papers or researchers she admires. She has a dry sense of humor.

- **Dr. Renn**: A seasoned neuroscientist and engineer with 20+ years in the field. He has deep expertise and provides rigorous analysis, but he is NOT a one-note skeptic. He gets genuinely excited when warranted — especially about elegant experimental designs, surprising results, or clever engineering solutions. When he critiques, he gives SPECIFIC, SUBSTANTIVE reasons (sample size, confounding variables, regulatory timelines, replication status, funding model concerns) rather than generic caution. He sometimes draws on historical analogies from the field and proposes what experiment or evidence WOULD convince him.

Format your response as a JSON array of segments:
[
  { "speaker": "nova", "text": "..." },
  { "speaker": "dr-renn", "text": "..." },
  ...
]

CRITICAL RULES:
- Start with Nova introducing the episode with a brief teaser of the most interesting story
- Alternate between speakers naturally, but allow occasional back-and-forth exchanges
- Each segment should be 2-4 sentences (keep it tight for audio)
- Cover the top 5 stories, spending ~2 minutes on each
- End with Nova summarizing key takeaways and a call to action for the Elata community
- Total script: ~8000 characters (about 10 minutes of audio)
- Be factual, cite specific findings, don't make up data
- NEVER repeat the same sentiment across stories. Each response must offer a fresh, specific angle
- Dr. Renn MUST express genuine enthusiasm at least once per episode when a breakthrough genuinely warrants it
- Dr. Renn should NEVER use generic phrases like "we must be cautious," "we should remain vigilant," "we need to be careful," or "I urge caution." Instead, he should state the SPECIFIC concern (e.g., "That's an n=12 study with no control group" or "The FDA timeline for this class of device is typically 7-10 years")
- Nova should occasionally challenge Dr. Renn or play devil's advocate
- Vary the emotional register across stories: some can be lighthearted, others serious, others awe-inspired`;

/**
 * Generate a podcast script from top articles using GPT.
 */
export const generateScript = async (
  articles: Article[],
): Promise<Result<PodcastScript, Error>> => {
  const top5 = articles
    .filter((a) => a.summary)
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
    .slice(0, 5);

  if (top5.length < 2) {
    return Err(new Error("Not enough articles with summaries for podcast"));
  }

  const articleSummaries = top5
    .map(
      (a, i) =>
        `Story ${i + 1}: "${a.title}" (${a.source})\n${a.summary}\nTags: ${a.tags.join(", ")}`,
    )
    .join("\n\n");

  const result = await withRetry(
    async () => {
      const response = await openAIClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SCRIPT_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate today's Elata Neurotech Brief for ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.\n\nArticles:\n${articleSummaries}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty script response");

      // Clean potential markdown fences from GPT response
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const segments: PodcastSegment[] = JSON.parse(cleaned);
      if (!Array.isArray(segments) || segments.length === 0) {
        throw new Error("Invalid script format");
      }

      return {
        title: `Elata Neurotech Brief — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        description: `Today's top neurotech stories: ${top5.map((a) => a.title).join("; ")}`,
        segments,
        articleIds: top5.map((a) => a.id),
      };
    },
    { maxAttempts: 2, baseDelayMs: 3000, maxDelayMs: 15000 },
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
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Err(new Error("ELEVENLABS_API_KEY not configured"));
  }

  const voiceId = VOICE_IDS[segment.speaker];

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
            model_id: "eleven_monolingual_v1",
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
const concatenateAudio = (segmentFiles: string[], outputPath: string): Result<string, Error> => {
  if (!isFfmpegAvailable()) {
    return Err(new Error("ffmpeg not found — install ffmpeg to concatenate audio segments"));
  }

  try {
    // Create a file list for ffmpeg concat
    const listPath = outputPath.replace(".mp3", "-list.txt");
    const listContent = segmentFiles.map((f) => `file '${f}'`).join("\n");
    fs.writeFileSync(listPath, listContent);

    execSync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`, {
      stdio: "pipe",
    });

    // Clean up list file
    fs.unlinkSync(listPath);

    return Ok(outputPath);
  } catch (err) {
    return Err(new Error(`ffmpeg concatenation failed: ${err instanceof Error ? err.message : String(err)}`));
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
  const totalChars = script.segments.reduce((acc, s) => acc + s.text.length, 0);
  log.info("Script generated", {
    segments: script.segments.length,
    characters: totalChars,
    estimatedCost: `~$${(totalChars / 1000 * 0.30).toFixed(2)} ElevenLabs`,
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
  });

  const segmentFiles: string[] = [];

  for (let i = 0; i < segmentsToProcess.length; i++) {
    const segment = segmentsToProcess[i];
    log.info(`  Segment ${i + 1}/${segmentsToProcess.length}: ${segment.speaker} (${segment.text.length} chars)`);

    const audioResult = await generateSegmentAudio(segment);
    match(audioResult)
      .with({ ok: true }, (r) => {
        const segmentPath = path.join(segmentDir, `${episodeId}-${String(i).padStart(3, "0")}-${segment.speaker}.mp3`);
        fs.writeFileSync(segmentPath, r.data);
        segmentFiles.push(segmentPath);
        log.info(`  → Saved: ${path.basename(segmentPath)} (${r.data.length} bytes)`);
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

  log.info("═══ Podcast generation complete ═══", {
    episodeId,
    segments: segmentFiles.length,
    duration: `~${Math.ceil(estimatedDuration / 60)} minutes`,
    charCount: totalChars,
    outputDir,
  });

  return Ok(episode);
};

/** Expose for testing */
export const _internal = {
  generateScript,
  generateSegmentAudio,
  concatenateAudio,
  isFfmpegAvailable,
  SCRIPT_SYSTEM_PROMPT,
  VOICE_IDS,
};

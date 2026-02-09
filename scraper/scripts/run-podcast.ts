#!/usr/bin/env tsx
/**
 * Standalone podcast generation runner.
 *
 * Usage:
 *   npx tsx scripts/run-podcast.ts --script-only       # GPT script only (~$0.01)
 *   npx tsx scripts/run-podcast.ts --max-segments 3    # 3 segments (~$0.50 ElevenLabs)
 *   npx tsx scripts/run-podcast.ts --full              # Full episode (~$2 ElevenLabs)
 *   npx tsx scripts/run-podcast.ts --articles-file data/checkpoint/2025-01-01_gpt.json
 *
 * Environment:
 *   OPENAI_KEY          — Required for script generation
 *   ELEVENLABS_API_KEY  — Required for audio generation (not needed with --script-only)
 */

import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs";
import path from "node:path";
import { generatePodcastEpisode, generateScript } from "../src/lib/podcastGenerator.js";
import { isOk } from "../src/lib/result.js";
import type { Article, SummaryOutput } from "@elata/shared-types";

// ── Parse CLI args ──────────────────────────────────────────────────

const args = process.argv.slice(2);
const getFlag = (name: string): boolean => args.includes(`--${name}`);
const getFlagValue = (name: string): string | undefined => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
};

const scriptOnly = getFlag("script-only");
const full = getFlag("full");
const maxSegmentsStr = getFlagValue("max-segments");
const articlesFile = getFlagValue("articles-file");
const outputDir = getFlagValue("output-dir") || "./data/podcast";

const maxSegments = full ? undefined : (maxSegmentsStr ? Number.parseInt(maxSegmentsStr, 10) : 3);

// ── Load articles ───────────────────────────────────────────────────

function loadArticles(): Article[] {
  // Try explicit file first
  if (articlesFile) {
    if (!fs.existsSync(articlesFile)) {
      console.error(`File not found: ${articlesFile}`);
      process.exit(1);
    }
    const raw = JSON.parse(fs.readFileSync(articlesFile, "utf-8"));
    if (raw.allArticles) return raw.allArticles as Article[];
    if (Array.isArray(raw)) return raw as Article[];
    console.error("Cannot parse articles from file — expected { allArticles: [...] } or array");
    process.exit(1);
  }

  // Try loading from most recent checkpoint
  const checkpointDir = process.env.CHECKPOINT_DIR || "./data/checkpoints";
  if (fs.existsSync(checkpointDir)) {
    const files = fs.readdirSync(checkpointDir)
      .filter((f) => f.endsWith("_gpt.json"))
      .sort()
      .reverse();

    if (files.length > 0) {
      const latest = path.join(checkpointDir, files[0]);
      console.log(`Loading articles from checkpoint: ${latest}`);
      const raw = JSON.parse(fs.readFileSync(latest, "utf-8"));
      if (raw.allArticles) return raw.allArticles as Article[];
    }
  }

  // Try loading from current.json
  const currentPath = process.env.ELATA_DATA_DIR
    ? path.join(process.env.ELATA_DATA_DIR, "current.json")
    : "./data/current.json";

  if (fs.existsSync(currentPath)) {
    console.log(`Loading articles from: ${currentPath}`);
    const raw = JSON.parse(fs.readFileSync(currentPath, "utf-8")) as SummaryOutput;
    if (raw.allArticles) return raw.allArticles;
  }

  console.error("No article data found. Use --articles-file <path> or run the scraper first.");
  process.exit(1);
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Elata Podcast Generator");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Mode: ${scriptOnly ? "Script only (GPT)" : full ? "Full episode" : `${maxSegments} segments`}`);
  console.log(`  Output: ${outputDir}`);
  console.log("");

  // Check API keys
  if (!process.env.OPENAI_KEY) {
    console.error("OPENAI_KEY is required. Set it in .env or environment.");
    process.exit(1);
  }

  if (!scriptOnly && !process.env.ELEVENLABS_API_KEY) {
    console.error("ELEVENLABS_API_KEY is required for audio generation.");
    console.error("Use --script-only to generate the script without audio.");
    process.exit(1);
  }

  const articles = loadArticles();
  console.log(`Loaded ${articles.length} articles`);

  const articlesWithSummaries = articles.filter((a) => a.summary);
  console.log(`Articles with summaries: ${articlesWithSummaries.length}`);

  if (articlesWithSummaries.length < 2) {
    console.error("Need at least 2 articles with summaries to generate a podcast.");
    console.error("Run the enrichment phase first: SCRAPER_PHASE=enrich npm run dev");
    process.exit(1);
  }

  const startTime = Date.now();

  if (scriptOnly) {
    // Script-only mode
    const result = await generateScript(articles);
    if (!isOk(result)) {
      console.error("Script generation failed:", result.error.message);
      process.exit(1);
    }

    const script = result.data;
    const charCount = script.segments.reduce((acc, s) => acc + s.text.length, 0);

    // Save script
    fs.mkdirSync(outputDir, { recursive: true });
    const scriptPath = path.join(outputDir, "script-test.json");
    fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));

    console.log("");
    console.log("═══ Script Generated ═══");
    console.log(`  Title: ${script.title}`);
    console.log(`  Segments: ${script.segments.length}`);
    console.log(`  Characters: ${charCount}`);
    console.log(`  Est. duration: ~${Math.ceil(charCount / 800)} minutes`);
    console.log(`  GPT cost: ~$0.01`);
    console.log(`  ElevenLabs cost (if generated): ~$${(charCount / 1000 * 0.30).toFixed(2)}`);
    console.log(`  Output: ${scriptPath}`);
    console.log("");
    console.log("── Script Preview ──");
    for (const seg of script.segments.slice(0, 4)) {
      console.log(`  [${seg.speaker.toUpperCase()}]: ${seg.text.slice(0, 120)}...`);
    }
    if (script.segments.length > 4) {
      console.log(`  ... and ${script.segments.length - 4} more segments`);
    }
  } else {
    // Full or limited audio generation
    const result = await generatePodcastEpisode(articles, {
      maxSegments,
      outputDir,
      scriptOnly: false,
    });

    if (!isOk(result)) {
      console.error("Podcast generation failed:", result.error.message);
      process.exit(1);
    }

    const episode = result.data;
    console.log("");
    console.log("═══ Episode Generated ═══");
    console.log(`  ID: ${episode.id}`);
    console.log(`  Title: ${episode.title}`);
    console.log(`  Segments: ${episode.segmentFiles.length}`);
    console.log(`  Characters: ${episode.charCount}`);
    console.log(`  Est. duration: ~${Math.ceil(episode.duration / 60)} minutes`);
    console.log(`  Audio: ${episode.audioUrl}`);
    console.log(`  Segment files:`);
    for (const f of episode.segmentFiles) {
      console.log(`    ${f}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("");
  console.log(`Done in ${elapsed}s`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

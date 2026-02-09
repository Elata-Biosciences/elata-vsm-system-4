#!/usr/bin/env tsx
/**
 * Generate podcast audio from the test script using OpenAI TTS.
 * Uses different voices for Nova and Dr. Renn.
 *
 * Usage:
 *   npx tsx scripts/test-podcast-audio.ts
 *   npx tsx scripts/test-podcast-audio.ts --max-segments 3
 *   npx tsx scripts/test-podcast-audio.ts --full
 */

import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const OPENAI_KEY = process.env.OPENAI_KEY;
if (!OPENAI_KEY) {
  console.error("OPENAI_KEY is required. Set it in .env");
  process.exit(1);
}

// OpenAI TTS voices — pick contrasting ones for the two personas
const VOICES = {
  nova: "nova",       // Warm, friendly female voice
  "dr-renn": "onyx",  // Deep, authoritative male voice
};

interface Segment {
  speaker: "nova" | "dr-renn";
  text: string;
}

interface PodcastScript {
  title: string;
  description: string;
  segments: Segment[];
  articleIds: string[];
}

// ── Parse CLI args ──────────────────────────────────────────────────

const args = process.argv.slice(2);
const full = args.includes("--full");
const maxSegmentsArg = args.find((a) => a.startsWith("--max-segments"));
const maxSegmentsVal = maxSegmentsArg
  ? Number.parseInt(args[args.indexOf(maxSegmentsArg) + 1] || "6", 10)
  : full ? undefined : 6;

// ── TTS Generation ──────────────────────────────────────────────────

async function generateTTS(text: string, voice: string): Promise<Buffer> {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI TTS error: ${response.status} — ${body}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Elata Podcast Audio Generation (OpenAI TTS)");
  console.log("═══════════════════════════════════════════════════════\n");

  const dataDir = process.env.ELATA_DATA_DIR || "./data";
  const scriptPath = path.join(dataDir, "podcast", "test-script.json");

  if (!fs.existsSync(scriptPath)) {
    console.error(`No script found at ${scriptPath}`);
    console.error("Run test-podcast-from-data.ts first to generate the script.");
    process.exit(1);
  }

  const script: PodcastScript = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));
  console.log(`Script: ${script.title}`);
  console.log(`Total segments: ${script.segments.length}`);

  const segments = maxSegmentsVal
    ? script.segments.slice(0, maxSegmentsVal)
    : script.segments;

  const totalChars = segments.reduce((acc, s) => acc + s.text.length, 0);
  const estCost = (totalChars / 1000) * 0.015;

  console.log(`Generating: ${segments.length} segments`);
  console.log(`Characters: ${totalChars}`);
  console.log(`Est. cost: ~$${estCost.toFixed(3)}`);
  console.log("");

  // Ensure output directory
  const segmentDir = path.join(dataDir, "podcast", "segments");
  fs.mkdirSync(segmentDir, { recursive: true });

  const segmentFiles: string[] = [];
  const startTime = Date.now();

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const voice = VOICES[seg.speaker];
    const label = seg.speaker === "nova" ? "🎙️ Nova" : "🔬 Dr. Renn";

    console.log(`  [${i + 1}/${segments.length}] ${label} (${seg.text.length} chars, voice: ${voice})...`);

    try {
      const audio = await generateTTS(seg.text, voice);
      const filename = `segment-${String(i).padStart(3, "0")}-${seg.speaker}.mp3`;
      const filepath = path.join(segmentDir, filename);
      fs.writeFileSync(filepath, audio);
      segmentFiles.push(filepath);
      console.log(`    → ${filename} (${(audio.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`    ✗ Failed: ${err instanceof Error ? err.message : err}`);
    }

    // Small delay between requests
    if (i < segments.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log("");

  if (segmentFiles.length === 0) {
    console.error("No segments were generated.");
    process.exit(1);
  }

  // Try to concatenate with ffmpeg
  const outputPath = path.join(dataDir, "podcast", "episode-test.mp3");
  let finalPath = segmentFiles[0];

  try {
    execSync("ffmpeg -version", { stdio: "ignore" });

    // Create concat list
    const listPath = path.join(dataDir, "podcast", "concat-list.txt");
    const listContent = segmentFiles.map((f) => `file '${path.resolve(f)}'`).join("\n");
    fs.writeFileSync(listPath, listContent);

    console.log("Concatenating with ffmpeg...");
    execSync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`, {
      stdio: "pipe",
    });
    fs.unlinkSync(listPath);
    finalPath = outputPath;

    const stats = fs.statSync(outputPath);
    console.log(`→ ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)\n`);
  } catch {
    console.log("ffmpeg not available — individual segment files saved.\n");
    console.log("Install ffmpeg to auto-concatenate: brew install ffmpeg\n");
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const actualCost = (totalChars / 1000) * 0.015;

  console.log("═══ Audio Generation Complete ═══\n");
  console.log(`  Segments generated: ${segmentFiles.length}/${segments.length}`);
  console.log(`  Total characters: ${totalChars}`);
  console.log(`  Actual cost: ~$${actualCost.toFixed(3)}`);
  console.log(`  Time: ${elapsed}s`);
  console.log(`  Output: ${finalPath}`);
  console.log("\n  Segment files:");
  for (const f of segmentFiles) {
    console.log(`    ${path.basename(f)}`);
  }
  console.log("\n  Play with: open " + finalPath);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

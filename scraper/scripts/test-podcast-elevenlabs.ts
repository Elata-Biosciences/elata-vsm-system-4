#!/usr/bin/env tsx
/**
 * Generate podcast audio from the test script using ElevenLabs TTS.
 * Uses different voices for Nova and Dr. Renn.
 *
 * Usage:
 *   npx tsx scripts/test-podcast-elevenlabs.ts
 *   npx tsx scripts/test-podcast-elevenlabs.ts --max-segments 4
 *   npx tsx scripts/test-podcast-elevenlabs.ts --full
 */

import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_KEY) {
  console.error("ELEVENLABS_API_KEY is required. Set it in .env");
  process.exit(1);
}

// ElevenLabs voice IDs
// Rachel = warm, articulate female (Nova)
// Arnold = deep, authoritative male (Dr. Renn)
const VOICES: Record<string, string> = {
  nova: process.env.ELEVENLABS_VOICE_NOVA || "EXAVITQu4vr4xnSDxMaL",      // Rachel
  "dr-renn": process.env.ELEVENLABS_VOICE_RENN || "VR6AewLTigWG4xSOukaG",  // Arnold
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
const maxIdx = args.indexOf("--max-segments");
const maxSegmentsVal = full ? undefined : (maxIdx !== -1 ? Number.parseInt(args[maxIdx + 1] || "6", 10) : 6);

// ── ElevenLabs TTS ──────────────────────────────────────────────────

async function generateTTS(text: string, voiceId: string): Promise<Buffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} — ${body}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Elata Podcast Audio — ElevenLabs TTS");
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
  const estCost = (totalChars / 1000) * 0.30;

  console.log(`Generating: ${segments.length} segments`);
  console.log(`Characters: ${totalChars}`);
  console.log(`Est. cost: ~$${estCost.toFixed(2)} (ElevenLabs Creator plan)`);
  console.log("");

  const segmentDir = path.join(dataDir, "podcast", "segments-11labs");
  fs.mkdirSync(segmentDir, { recursive: true });

  const segmentFiles: string[] = [];
  const startTime = Date.now();

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const voiceId = VOICES[seg.speaker];
    const label = seg.speaker === "nova" ? "🎙️ Nova" : "🔬 Dr. Renn";

    console.log(`  [${i + 1}/${segments.length}] ${label} (${seg.text.length} chars)...`);

    try {
      const audio = await generateTTS(seg.text, voiceId);
      const filename = `segment-${String(i).padStart(3, "0")}-${seg.speaker}.mp3`;
      const filepath = path.join(segmentDir, filename);
      fs.writeFileSync(filepath, audio);
      segmentFiles.push(filepath);
      console.log(`    → ${filename} (${(audio.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`    ✗ Failed: ${err instanceof Error ? err.message : err}`);
    }

    // Rate limit between requests
    if (i < segments.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log("");

  if (segmentFiles.length === 0) {
    console.error("No segments were generated.");
    process.exit(1);
  }

  // Try to concatenate with ffmpeg
  const outputPath = path.join(dataDir, "podcast", "episode-elevenlabs.mp3");
  let finalPath = segmentFiles[0];

  try {
    execSync("ffmpeg -version", { stdio: "ignore" });

    const listPath = path.join(dataDir, "podcast", "concat-list-11.txt");
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
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("═══ ElevenLabs Audio Complete ═══\n");
  console.log(`  Segments: ${segmentFiles.length}/${segments.length}`);
  console.log(`  Characters: ${totalChars}`);
  console.log(`  Cost: ~$${estCost.toFixed(2)}`);
  console.log(`  Time: ${elapsed}s`);
  console.log(`  Output: ${finalPath}`);
  console.log("\n  Play with: afplay " + finalPath);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

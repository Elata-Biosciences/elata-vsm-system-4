#!/usr/bin/env tsx
/**
 * Quick test: generate podcast script from existing scraped data.
 * Converts legacy format articles and uses descriptions as summaries.
 *
 * Usage:
 *   npx tsx scripts/test-podcast-from-data.ts
 */

import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs";
import path from "node:path";

// We can't easily import from the TS source since it uses .js extensions
// for ESM. Instead, we'll call the OpenAI API directly here for the script.

const OPENAI_KEY = process.env.OPENAI_KEY;
if (!OPENAI_KEY) {
  console.error("OPENAI_KEY is required. Set it in .env");
  process.exit(1);
}

// ── Load and convert data ───────────────────────────────────────────

interface LegacyArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  author?: string;
  publishedAt?: string;
  category?: string;
  relevanceScore: number;
}

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  description: string;
  summary: string;
  tags: string[];
  relevanceScore: number;
  scrapedAt: string;
  author?: string;
  publishedAt?: string;
}

function loadArticlesFromLegacy(filePath: string): Article[] {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const articles: Article[] = [];

  const categories = ["research", "industry", "biohacking", "computational", "hardware", "desci", "offTopic"];

  for (const cat of categories) {
    if (!Array.isArray(raw[cat])) continue;
    for (const item of raw[cat] as LegacyArticle[]) {
      articles.push({
        id: `${item.url}-${item.title}`.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 64),
        title: item.title,
        url: item.url,
        source: item.source,
        description: item.description,
        // Use description as summary for podcast generation
        summary: item.description,
        tags: [],
        relevanceScore: item.relevanceScore,
        scrapedAt: raw.timestamp || new Date().toISOString(),
        author: item.author,
        publishedAt: item.publishedAt,
      });
    }
  }

  // Sort by relevance and deduplicate
  const seen = new Set<string>();
  return articles
    .filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ── GPT Script Generation ───────────────────────────────────────────

const SCRIPT_PROMPT = `You are writing a script for "Elata Neurotech Brief," a daily podcast about neuroscience and brain technology.

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
- Dr. Renn should NEVER use generic phrases like "we must be cautious," "we should remain vigilant," "we need to be careful," or "I urge caution." Instead, he should state the SPECIFIC concern
- Nova should occasionally challenge Dr. Renn or play devil's advocate
- Vary the emotional register across stories: some can be lighthearted, others serious, others awe-inspired`;

async function generateScript(articles: Article[]) {
  const top5 = articles.slice(0, 5);

  const articleSummaries = top5
    .map(
      (a, i) =>
        `Story ${i + 1}: "${a.title}" (${a.source})\n${a.summary}`,
    )
    .join("\n\n");

  console.log("\n=== Sending to GPT-4o-mini ===");
  console.log(`Articles: ${top5.length}`);
  console.log(`Top stories:`);
  for (const a of top5) {
    console.log(`  - ${a.title} (${a.source})`);
  }
  console.log("");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SCRIPT_PROMPT },
        {
          role: "user",
          content: `Generate today's Elata Neurotech Brief for ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.\n\nArticles:\n${articleSummaries}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error: ${response.status} — ${body}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from GPT");

  // Clean markdown fences
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Elata Podcast Test — From Existing Scraped Data");
  console.log("═══════════════════════════════════════════════════════\n");

  // Find most recent data file
  const dataDir = process.env.ELATA_DATA_DIR || "./data";
  const currentPath = path.join(dataDir, "current.json");

  if (!fs.existsSync(currentPath)) {
    console.error(`No data found at ${currentPath}`);
    process.exit(1);
  }

  console.log(`Loading data from: ${currentPath}`);
  const articles = loadArticlesFromLegacy(currentPath);
  console.log(`Loaded ${articles.length} articles\n`);

  // Filter to neurotech-relevant articles (skip off-topic ML/SVG papers)
  const neuroArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes("brain") ||
      a.title.toLowerCase().includes("neural") ||
      a.title.toLowerCase().includes("neuro") ||
      a.title.toLowerCase().includes("bci") ||
      a.title.toLowerCase().includes("eeg") ||
      a.title.toLowerCase().includes("spinal") ||
      a.title.toLowerCase().includes("cognitive") ||
      a.title.toLowerCase().includes("psychedelic") ||
      a.title.toLowerCase().includes("depression") ||
      a.title.toLowerCase().includes("stem cell") ||
      a.description.toLowerCase().includes("brain") ||
      a.description.toLowerCase().includes("neural") ||
      a.description.toLowerCase().includes("neuro"),
  );

  console.log(`Neurotech-relevant articles: ${neuroArticles.length}`);
  const top = neuroArticles.length >= 5 ? neuroArticles : articles;

  const startTime = Date.now();

  try {
    const segments = await generateScript(top);

    // Calculate stats
    const totalChars = segments.reduce((acc: number, s: { text: string }) => acc + s.text.length, 0);
    const novaSegments = segments.filter((s: { speaker: string }) => s.speaker === "nova").length;
    const rennSegments = segments.filter((s: { speaker: string }) => s.speaker === "dr-renn").length;

    // Save script
    const outputDir = path.join(dataDir, "podcast");
    fs.mkdirSync(outputDir, { recursive: true });
    const scriptPath = path.join(outputDir, "test-script.json");

    const script = {
      title: `Elata Neurotech Brief — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      description: `Top neurotech stories: ${top.slice(0, 5).map((a) => a.title).join("; ")}`,
      segments,
      articleIds: top.slice(0, 5).map((a) => a.id),
    };

    fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));

    console.log("\n═══ Script Generated Successfully! ═══\n");
    console.log(`  Title: ${script.title}`);
    console.log(`  Segments: ${segments.length} (Nova: ${novaSegments}, Dr. Renn: ${rennSegments})`);
    console.log(`  Characters: ${totalChars}`);
    console.log(`  Est. duration: ~${Math.ceil(totalChars / 800)} minutes`);
    console.log(`  GPT cost: ~$0.01`);
    console.log(`  ElevenLabs cost (if generated): ~$${(totalChars / 1000 * 0.30).toFixed(2)}`);
    console.log(`  Output: ${scriptPath}`);

    console.log("\n── Script Preview ──\n");
    for (const seg of segments.slice(0, 6)) {
      const speaker = seg.speaker === "nova" ? "🎙️ NOVA" : "🔬 DR. RENN";
      console.log(`${speaker}:`);
      console.log(`  ${seg.text}\n`);
    }
    if (segments.length > 6) {
      console.log(`  ... and ${segments.length - 6} more segments\n`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Done in ${elapsed}s`);

  } catch (err) {
    console.error("\nFailed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();

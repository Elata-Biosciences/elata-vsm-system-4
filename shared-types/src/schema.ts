import { z } from "zod";

// ── Tag System (replaces categories) ────────────────────────────────

/**
 * 100 neurotech-focused tags for article classification.
 * Must stay in sync with main-website/src/lib/news-tags.ts
 */
export const NEWS_TAGS = [
  // Neuroscience & Research (15)
  "eeg", "fmri", "meg", "pet-imaging", "dti", "fnirs", "neuroimaging",
  "synaptic-plasticity", "neurotransmitters", "neural-circuits",
  "cognitive-neuroscience", "behavioral-neuroscience", "brain-plasticity",
  "translational-neuroscience", "molecular-psychiatry",
  // Hardware & Devices (16)
  "bci", "neural-interfaces", "neuralink", "synchron", "kernel-neuro",
  "openbci", "emotiv", "muse", "tdcs", "tms", "vagus-nerve-stimulation",
  "closed-loop-systems", "invasive-bci", "non-invasive-bci", "eeg-headsets",
  "neural-prosthetics",
  // Computational & AI (12)
  "precision-psychiatry", "computational-psychiatry", "digital-phenotyping",
  "machine-learning", "federated-learning", "ai-diagnostics", "deep-learning",
  "brain-connectivity", "neural-decoding", "signal-processing",
  "computational-neuroscience", "diffusion-models",
  // Neuro-Pharmacology (8)
  "neuropharmacology", "nmda-modulators", "gaba-modulators", "serotonin-system",
  "psychiatric-genomics", "clinical-trials", "drug-discovery", "cns-therapeutics",
  // Biohacking & Experimental (12)
  "nootropics", "peptides", "psychedelics", "biohacking", "neurofeedback",
  "meditation", "red-light-therapy", "cold-exposure", "circadian-rhythm",
  "supplements", "microdosing", "longevity",
  // Biomarkers & Mechanisms (10)
  "biomarkers", "hpa-axis", "neuroinflammation", "gut-brain-axis", "microbiome",
  "epigenetics", "neural-oscillations", "default-mode-network", "neuroendocrine",
  "fear-extinction",
  // DeSci & Web3 (7)
  "desci", "daos", "tokenomics", "blockchain-research",
  "on-chain-governance", "decentralized-irb", "quadratic-voting",
  // Industry & Business (6)
  "pharma", "biotech", "startups", "funding", "regulatory", "fda",
] as const;

export type NewsTag = (typeof NEWS_TAGS)[number];

export const NewsTagSchema = z.enum(NEWS_TAGS);

// ── Enhanced Article Schema ─────────────────────────────────────────

export const ArticleSchema = z.object({
  // Identity
  id: z.string(),
  title: z.string(),
  url: z.string(),
  source: z.string(),

  // Content (for RAG / training)
  description: z.string(),
  summary: z.string().optional(),
  content: z.string().optional(),
  wordCount: z.number().optional(),
  readingTimeMinutes: z.number().optional(),
  language: z.string().default("en"),

  // Classification (TAGS ONLY, no categories)
  tags: z.array(NewsTagSchema).default([]),
  relevanceScore: z.number(),
  rankingScore: z.number().optional(),

  // Attribution
  author: z.string().optional(),
  publishedAt: z.string().optional(),
  scrapedAt: z.string(),

  // Media
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  ogImageUrl: z.string().url().optional(),

  // Metadata for RAG
  sourceType: z.enum(["newsapi", "scrape", "twitter", "reddit", "community"]).optional(),
  entities: z.array(z.string()).optional(),
  embedding: z.array(z.number()).optional(),

  // Moderation
  moderationPassed: z.boolean().default(true),
  moderationFlags: z.array(z.string()).optional(),
});

// ── Summary Output Schema (new flat format) ─────────────────────────

export const SummaryMetadataSchema = z.object({
  totalArticles: z.number(),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }),
  tagCounts: z.record(z.string(), z.number()),
  sourceCounts: z.record(z.string(), z.number()),
});

export const SummaryOutputSchema = z.object({
  allArticles: z.array(ArticleSchema),
  timestamp: z.string(),
  metadata: SummaryMetadataSchema,
});

// ── Legacy schemas (for backward compat during migration) ───────────

export const LegacyArticleSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
  source: z.string(),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
  category: z
    .enum(["research", "industry", "biohacking", "computational", "hardware", "desci", "offTopic"])
    .optional(),
  relevanceScore: z.number(),
});

export const LegacySummaryOutputSchema = z.object({
  research: z.array(LegacyArticleSchema),
  industry: z.array(LegacyArticleSchema),
  biohacking: z.array(LegacyArticleSchema),
  computational: z.array(LegacyArticleSchema),
  hardware: z.array(LegacyArticleSchema),
  desci: z.array(LegacyArticleSchema),
  offTopic: z.array(LegacyArticleSchema),
  timestamp: z.string(),
});

// ── Other scraper schemas ───────────────────────────────────────────

export const SummaryListSchema = z.object({
  articles: z.array(ArticleSchema),
});

export const ScrapingOutputSchema = z.object({
  sourceUrl: z.string(),
  sourceName: z.string(),
  articles: z.array(ArticleSchema),
  timestamp: z.string(),
  error: z.string().optional(),
});

// ── Types ───────────────────────────────────────────────────────────

export type Article = z.infer<typeof ArticleSchema>;
export type LegacyArticle = z.infer<typeof LegacyArticleSchema>;
export type ScrapingOutput = z.infer<typeof ScrapingOutputSchema>;
export type SummaryList = z.infer<typeof SummaryListSchema>;
export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;
export type SummaryMetadata = z.infer<typeof SummaryMetadataSchema>;
export type LegacySummaryOutput = z.infer<typeof LegacySummaryOutputSchema>;

/** @deprecated Use tags instead. This type exists only for migration purposes. */
export type LegacySummaryOutputCategories = Omit<LegacySummaryOutput, "timestamp">;
/** @deprecated Use tags instead. */
export type LegacySummaryOutputCategoriesKey = keyof LegacySummaryOutputCategories;

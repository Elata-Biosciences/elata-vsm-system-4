import express, {
  type Request,
  type Response,
  type ErrorRequestHandler,
  type NextFunction,
} from "express";
import { createLogger } from "./lib/logger.js";

const log = createLogger("server");
import asyncHandler from "express-async-handler";
import cors from "cors";
import {
  type DateString,
  loadCurrentSummary,
  loadSummaryByDate,
  validateDateString,
} from "./lib/utils.js";
import { CONFIG } from "./config/config.js";
import {
  buildArticleIndex,
  searchArticles,
  filterByTags,
  filterByDateRange,
  filterBySource,
  findSimilarArticles,
  type ArticleIndex,
} from "./lib/articleIndex.js";
import type { Article } from "@elata/shared-types";

const app = express();

// ── Middleware ───────────────────────────────────────────────────────

app.use(
  cors({
    origin: [`http://localhost:${CONFIG.NEXT.PORT}`, "*"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());

// ── Request timing middleware ────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    log.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      durationMs: duration,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
    });
  });
  next();
});

// ── In-memory article index ─────────────────────────────────────────

let articleIndex: ArticleIndex | null = null;
let indexLastBuilt = 0;
const INDEX_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get or rebuild the article index.
 * Caches the index for INDEX_TTL_MS to avoid rebuilding on every request.
 */
async function getArticleIndex(): Promise<ArticleIndex> {
  const now = Date.now();
  if (articleIndex && now - indexLastBuilt < INDEX_TTL_MS) {
    return articleIndex;
  }

  try {
    const summary = await loadCurrentSummary();
    // Handle both old category-keyed and new flat format
    let allArticles: Article[] = [];

    if ("allArticles" in summary && Array.isArray(summary.allArticles)) {
      allArticles = summary.allArticles;
    } else {
      // Legacy format — flatten categories
      const categoryKeys = [
        "research", "industry", "biohacking",
        "computational", "hardware", "desci", "offTopic",
      ] as const;
      for (const key of categoryKeys) {
        const categoryArticles = (summary as Record<string, unknown>)[key];
        if (Array.isArray(categoryArticles)) {
          allArticles.push(
            ...categoryArticles.map((a: Record<string, unknown>, i: number) => ({
              id: String(a.url ?? `${key}-${i}`),
              title: String(a.title ?? ""),
              url: String(a.url ?? ""),
              source: String(a.source ?? ""),
              description: String(a.description ?? ""),
              tags: [] as string[],
              relevanceScore: Number(a.relevanceScore ?? 0),
              scrapedAt: String((summary as Record<string, unknown>).timestamp ?? new Date().toISOString()),
              language: "en",
              moderationPassed: true,
              author: a.author ? String(a.author) : undefined,
              publishedAt: a.publishedAt ? String(a.publishedAt) : undefined,
            })) as Article[],
          );
        }
      }
    }

    articleIndex = buildArticleIndex(allArticles);
    indexLastBuilt = now;
    return articleIndex;
  } catch (error) {
    log.error("Failed to build article index", error);
    // Return empty index if we can't load data
    if (articleIndex) return articleIndex; // Use stale cache
    return buildArticleIndex([]);
  }
}

// ── Legacy route (backward compat) ──────────────────────────────────

app.get(
  "/data/:date?",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const date = req.params.date as DateString | undefined;

    if (date && !validateDateString(date)) {
      res.status(400).json({
        error: "Invalid date format",
        message: "Date must be in the format YYYY-MM-DD",
      });
      return;
    }

    try {
      const data = date
        ? await loadSummaryByDate(date)
        : await loadCurrentSummary();
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: "Failed to load data",
        message: (error as Error)?.message || "Error loading summary",
      });
    }
  })
);

// ── New API routes ──────────────────────────────────────────────────

/**
 * GET /articles
 * Search, filter, sort, and paginate articles.
 */
app.get(
  "/articles",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const index = await getArticleIndex();

    const q = String(req.query.q ?? "");
    const tags = String(req.query.tags ?? "").split(",").filter(Boolean);
    const dateFrom = req.query.dateFrom ? String(req.query.dateFrom) : undefined;
    const dateTo = req.query.dateTo ? String(req.query.dateTo) : undefined;
    const source = req.query.source ? String(req.query.source) : undefined;
    const sort = String(req.query.sort ?? "ranking");
    const order = String(req.query.order ?? "desc");
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    // Start with all articles or search results
    let results = q ? searchArticles(index, q) : [...index.all];

    // Apply filters
    if (tags.length > 0) {
      const tagSet = new Set(tags);
      results = results.filter((a) => a.tags.some((t) => tagSet.has(t)));
    }
    if (dateFrom || dateTo) {
      results = filterByDateRange(results, dateFrom, dateTo);
    }
    if (source) {
      const sourceArticles = new Set(filterBySource(index, source).map((a) => a.id));
      results = results.filter((a) => sourceArticles.has(a.id));
    }

    // Sort
    results.sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case "date":
          cmp = (a.publishedAt ?? a.scrapedAt).localeCompare(b.publishedAt ?? b.scrapedAt);
          break;
        case "relevance":
          cmp = a.relevanceScore - b.relevanceScore;
          break;
        case "ranking":
        default:
          cmp = (a.rankingScore ?? a.relevanceScore) - (b.rankingScore ?? b.relevanceScore);
          break;
      }
      return order === "asc" ? cmp : -cmp;
    });

    const total = results.length;
    const paginated = results.slice(offset, offset + limit);

    res.json({
      articles: paginated,
      total,
      offset,
      limit,
    });
  })
);

/**
 * GET /articles/:id
 * Get a single article by ID.
 */
app.get(
  "/articles/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const index = await getArticleIndex();
    const article = index.byId.get(req.params.id);

    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    // Find similar articles
    const similar = findSimilarArticles(index, req.params.id, 5);

    res.json({ article, similar });
  })
);

/**
 * GET /tags
 * Get tag counts across all articles.
 */
app.get(
  "/tags",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const index = await getArticleIndex();
    const tagCounts: Record<string, number> = {};

    for (const [tag, articles] of index.byTag.entries()) {
      tagCounts[tag] = articles.length;
    }

    res.json({ tags: tagCounts, total: index.all.length });
  })
);

/**
 * GET /dates
 * Get available dates with article counts.
 */
app.get(
  "/dates",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const index = await getArticleIndex();
    const dateCounts: Record<string, number> = {};

    for (const [date, articles] of index.byDate.entries()) {
      dateCounts[date] = articles.length;
    }

    res.json({ dates: dateCounts });
  })
);

/**
 * GET /podcast/episodes
 * Serves podcast episode metadata from disk.
 */
app.get(
  "/podcast/episodes",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const podcastDir = path.join(CONFIG.PATHS.DATA_DIR, "podcast");

    if (!fs.existsSync(podcastDir)) {
      res.json([]);
      return;
    }

    const files = fs.readdirSync(podcastDir)
      .filter((f: string) => f.endsWith(".json") && !f.includes("-script") && !f.includes("-list"))
      .sort()
      .reverse();

    const episodes = [];
    for (const file of files) {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(podcastDir, file), "utf-8"));
        if (raw.id && raw.title) {
          episodes.push({
            id: raw.id,
            title: raw.title,
            description: raw.description ?? "",
            audioUrl: raw.audioUrl ?? "",
            duration: raw.duration ?? 0,
            date: raw.date ?? "",
            fileSize: raw.charCount ?? 0,
            episodeNumber: episodes.length + 1,
          });
        }
      } catch {
        // Skip invalid files
      }
    }

    res.json(episodes);
  })
);

/**
 * GET /podcast/audio/:filename
 * Serves podcast MP3 files from the podcast directory.
 * Only allows .mp3 files; rejects path traversal attempts.
 */
app.get(
  "/podcast/audio/:filename",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const { filename } = req.params;

    // Security: only allow safe filenames (alphanumeric, dash, underscore, dot)
    if (!filename || !/^[\w.-]+\.mp3$/i.test(filename)) {
      res.status(400).json({ error: "Invalid filename" });
      return;
    }

    const filePath = path.join(CONFIG.PATHS.DATA_DIR, "podcast", filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const stat = fs.statSync(filePath);
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=86400, immutable",
      "Accept-Ranges": "bytes",
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  })
);

/**
 * Health check
 */
app.get("/health", (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    articlesIndexed: articleIndex?.all.length ?? 0,
  });
});

// ── Error handler ───────────────────────────────────────────────────

const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  log.error("Unhandled error", err);
  res.status(500).json({ error: "Internal Server Error", message: err?.message });
};

app.use(errorHandler);

// ── Start server ────────────────────────────────────────────────────

app.listen(CONFIG.SERVER.PORT, () => {
  log.info("Server started", { port: CONFIG.SERVER.PORT, url: `http://localhost:${CONFIG.SERVER.PORT}` });
  // Pre-build index on startup
  getArticleIndex().then((index) => {
    log.info("Article index built", { articlesIndexed: index.all.length });
  }).catch((err) => {
    log.warn("Failed to pre-build article index", { error: String(err) });
  });
});

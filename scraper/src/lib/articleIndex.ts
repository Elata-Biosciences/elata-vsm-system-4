import type { Article, NewsTag } from "@elata/shared-types";

/**
 * In-memory article index for fast search, filter, and sort.
 * Built from flat article array. Rebuilt when data changes.
 */
export interface ArticleIndex {
  /** All articles */
  all: Article[];
  /** Index by article ID */
  byId: Map<string, Article>;
  /** Index by tag (each tag maps to articles with that tag) */
  byTag: Map<string, Article[]>;
  /** Index by date (YYYY-MM-DD) */
  byDate: Map<string, Article[]>;
  /** Index by source name */
  bySource: Map<string, Article[]>;
}

/**
 * Build an in-memory index from a flat array of articles.
 * Pure function — no side effects.
 */
export const buildArticleIndex = (articles: Article[]): ArticleIndex => {
  const byId = new Map<string, Article>();
  const byTag = new Map<string, Article[]>();
  const byDate = new Map<string, Article[]>();
  const bySource = new Map<string, Article[]>();

  for (const article of articles) {
    // ID index
    byId.set(article.id, article);

    // Tag index
    for (const tag of article.tags) {
      const existing = byTag.get(tag) ?? [];
      existing.push(article);
      byTag.set(tag, existing);
    }

    // Date index
    const dateKey = (article.publishedAt ?? article.scrapedAt).slice(0, 10);
    const dateExisting = byDate.get(dateKey) ?? [];
    dateExisting.push(article);
    byDate.set(dateKey, dateExisting);

    // Source index
    const sourceExisting = bySource.get(article.source) ?? [];
    sourceExisting.push(article);
    bySource.set(article.source, sourceExisting);
  }

  return { all: articles, byId, byTag, byDate, bySource };
};

/**
 * Search articles by text query (title + description + summary).
 * Case-insensitive substring match. Returns empty for empty query = all.
 */
export const searchArticles = (
  index: ArticleIndex,
  query: string,
): Article[] => {
  const q = query.toLowerCase().trim();
  if (!q) return index.all;

  return index.all.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.summary?.toLowerCase().includes(q) ?? false),
  );
};

/**
 * Filter articles by tags (OR logic — article matches if it has ANY of the given tags).
 * Returns all articles if tags array is empty.
 */
export const filterByTags = (
  index: ArticleIndex,
  tags: string[],
): Article[] => {
  if (tags.length === 0) return index.all;

  const seen = new Set<string>();
  const results: Article[] = [];

  for (const tag of tags) {
    const articles = index.byTag.get(tag) ?? [];
    for (const article of articles) {
      if (!seen.has(article.id)) {
        seen.add(article.id);
        results.push(article);
      }
    }
  }

  return results;
};

/**
 * Filter articles by date range (inclusive).
 * Undefined from/to means no bound on that side.
 */
export const filterByDateRange = (
  articles: Article[],
  from: string | undefined,
  to: string | undefined,
): Article[] => {
  if (!from && !to) return articles;

  return articles.filter((article) => {
    const date = (article.publishedAt ?? article.scrapedAt).slice(0, 10);
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });
};

/**
 * Filter articles by source name (exact match).
 */
export const filterBySource = (
  index: ArticleIndex,
  source: string,
): Article[] => index.bySource.get(source) ?? [];

/**
 * Cosine similarity between two vectors.
 * Pure function.
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

/**
 * Find articles similar to a given article using embedding cosine similarity.
 * Returns articles sorted by similarity score (descending).
 */
export const findSimilarArticles = (
  index: ArticleIndex,
  articleId: string,
  limit: number = 5,
): Article[] => {
  const target = index.byId.get(articleId);
  if (!target?.embedding) return [];

  const scored = index.all
    .filter((a) => a.id !== articleId && a.embedding)
    .map((a) => ({
      article: a,
      similarity: cosineSimilarity(target.embedding!, a.embedding!),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored.map((s) => s.article);
};

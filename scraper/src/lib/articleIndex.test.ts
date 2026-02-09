import { describe, it, expect } from "vitest";
import {
  buildArticleIndex,
  searchArticles,
  filterByTags,
  filterByDateRange,
  filterBySource,
  type ArticleIndex,
} from "./articleIndex";
import type { Article } from "@elata/shared-types";

const makeArticle = (overrides: Partial<Article> = {}): Article => ({
  id: "test-" + Math.random().toString(36).slice(2, 8),
  title: "Test Article",
  url: "https://example.com/test",
  source: "Test Source",
  description: "Test description about neuroscience",
  tags: [],
  relevanceScore: 0.8,
  scrapedAt: "2026-02-09T00:00:00.000Z",
  language: "en",
  moderationPassed: true,
  ...overrides,
});

describe("buildArticleIndex", () => {
  it("builds an index from an array of articles", () => {
    const articles = [
      makeArticle({ id: "a1", tags: ["eeg"], source: "Nature" }),
      makeArticle({ id: "a2", tags: ["bci", "eeg"], source: "Science" }),
      makeArticle({ id: "a3", tags: ["depression"], source: "Nature" }),
    ];
    const index = buildArticleIndex(articles);
    expect(index.all.length).toBe(3);
    expect(index.byId.size).toBe(3);
    expect(index.byTag.get("eeg")?.length).toBe(2);
    expect(index.byTag.get("bci")?.length).toBe(1);
    expect(index.bySource.get("Nature")?.length).toBe(2);
  });

  it("builds empty index from empty array", () => {
    const index = buildArticleIndex([]);
    expect(index.all.length).toBe(0);
    expect(index.byId.size).toBe(0);
  });

  it("handles articles with no tags", () => {
    const articles = [makeArticle({ tags: [] })];
    const index = buildArticleIndex(articles);
    expect(index.all.length).toBe(1);
    expect(index.byTag.size).toBe(0);
  });
});

describe("searchArticles", () => {
  const articles = [
    makeArticle({ id: "a1", title: "EEG breakthrough in depression", description: "A study shows..." }),
    makeArticle({ id: "a2", title: "BCI technology advances", description: "New interfaces for..." }),
    makeArticle({ id: "a3", title: "Meditation and brain plasticity", description: "Research on neural..." }),
  ];
  const index = buildArticleIndex(articles);

  it("finds articles by title substring", () => {
    const results = searchArticles(index, "EEG");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("a1");
  });

  it("finds articles by description substring", () => {
    const results = searchArticles(index, "neural");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("a3");
  });

  it("search is case-insensitive", () => {
    const results = searchArticles(index, "bci");
    expect(results.length).toBe(1);
  });

  it("returns all articles for empty query", () => {
    const results = searchArticles(index, "");
    expect(results.length).toBe(3);
  });

  it("returns empty array for no matches", () => {
    const results = searchArticles(index, "quantum computing");
    expect(results.length).toBe(0);
  });
});

describe("filterByTags", () => {
  const articles = [
    makeArticle({ id: "a1", tags: ["eeg", "depression"] }),
    makeArticle({ id: "a2", tags: ["bci", "neural-interfaces"] }),
    makeArticle({ id: "a3", tags: ["eeg", "bci"] }),
  ];
  const index = buildArticleIndex(articles);

  it("filters by single tag", () => {
    const results = filterByTags(index, ["eeg"]);
    expect(results.length).toBe(2);
  });

  it("filters by multiple tags (OR logic)", () => {
    const results = filterByTags(index, ["depression", "neural-interfaces"]);
    expect(results.length).toBe(2);
  });

  it("returns all for empty tags", () => {
    const results = filterByTags(index, []);
    expect(results.length).toBe(3);
  });
});

describe("filterByDateRange", () => {
  const articles = [
    makeArticle({ id: "a1", publishedAt: "2026-02-01T00:00:00Z" }),
    makeArticle({ id: "a2", publishedAt: "2026-02-05T00:00:00Z" }),
    makeArticle({ id: "a3", publishedAt: "2026-02-09T00:00:00Z" }),
  ];

  it("filters by date range", () => {
    const results = filterByDateRange(articles, "2026-02-03", "2026-02-07");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("a2");
  });

  it("returns all for no date range", () => {
    const results = filterByDateRange(articles, undefined, undefined);
    expect(results.length).toBe(3);
  });

  it("filters with only from date", () => {
    const results = filterByDateRange(articles, "2026-02-05", undefined);
    expect(results.length).toBe(2);
  });
});

describe("filterBySource", () => {
  const articles = [
    makeArticle({ id: "a1", source: "Nature" }),
    makeArticle({ id: "a2", source: "Science" }),
    makeArticle({ id: "a3", source: "Nature" }),
  ];
  const index = buildArticleIndex(articles);

  it("filters by source name", () => {
    const results = filterBySource(index, "Nature");
    expect(results.length).toBe(2);
  });

  it("returns empty for unknown source", () => {
    const results = filterBySource(index, "Unknown Journal");
    expect(results.length).toBe(0);
  });
});

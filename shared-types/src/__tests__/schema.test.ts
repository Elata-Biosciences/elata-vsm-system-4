import { describe, expect, it } from 'vitest';
import {
  ArticleSchema,
  ScrapingOutputSchema,
  SummaryListSchema,
  SummaryOutputSchema,
} from '../schema';

describe('VSM schema validation', () => {
  describe('ArticleSchema', () => {
    const validArticle = {
      title: 'Breakthrough in Neural Interfaces',
      description: 'Researchers have developed a new brain-computer interface technology.',
      url: 'https://example.com/article',
      source: 'Tech Journal',
      relevanceScore: 0.95,
    };

    it('should validate valid articles', () => {
      const result = ArticleSchema.safeParse(validArticle);
      expect(result.success).toBe(true);
    });

    it('should validate articles with optional fields', () => {
      const articleWithOptionals = {
        ...validArticle,
        author: 'Dr. Jane Smith',
        publishedAt: '2024-01-15T10:30:00Z',
        category: 'research',
      };

      const result = ArticleSchema.safeParse(articleWithOptionals);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidArticle = { ...validArticle, title: '' };
      const result = ArticleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
    });

    it('should reject title over 500 characters', () => {
      const invalidArticle = {
        ...validArticle,
        title: 'A'.repeat(501),
      };
      const result = ArticleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
    });

    it('should reject empty description', () => {
      const invalidArticle = { ...validArticle, description: '' };
      const result = ArticleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
    });

    it('should reject description over 2000 characters', () => {
      const invalidArticle = {
        ...validArticle,
        description: 'A'.repeat(2001),
      };
      const result = ArticleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
    });

    it('should reject invalid URLs', () => {
      const invalidArticle = {
        ...validArticle,
        url: 'not-a-valid-url',
      };
      const result = ArticleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
    });

    it('should reject empty source', () => {
      const invalidArticle = { ...validArticle, source: '' };
      const result = ArticleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
    });

    it('should reject relevance score below 0', () => {
      const invalidArticle = {
        ...validArticle,
        relevanceScore: -0.1,
      };
      const result = ArticleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
    });

    it('should reject relevance score above 1', () => {
      const invalidArticle = {
        ...validArticle,
        relevanceScore: 1.1,
      };
      const result = ArticleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
    });

    it('should accept relevance score at boundaries', () => {
      const minScore = { ...validArticle, relevanceScore: 0 };
      const maxScore = { ...validArticle, relevanceScore: 1 };

      expect(ArticleSchema.safeParse(minScore).success).toBe(true);
      expect(ArticleSchema.safeParse(maxScore).success).toBe(true);
    });

    it('should validate datetime format for publishedAt', () => {
      const withValidDate = {
        ...validArticle,
        publishedAt: '2024-01-15T10:30:00Z',
      };
      expect(ArticleSchema.safeParse(withValidDate).success).toBe(true);

      const withDateOnly = {
        ...validArticle,
        publishedAt: '2024-01-15',
      };
      expect(ArticleSchema.safeParse(withDateOnly).success).toBe(true);
    });

    it('should reject invalid date formats', () => {
      const invalidDate = {
        ...validArticle,
        publishedAt: 'invalid-date',
      };
      const result = ArticleSchema.safeParse(invalidDate);
      expect(result.success).toBe(false);
    });

    it('should validate category enum', () => {
      const validCategories = [
        'research',
        'industry',
        'biohacking',
        'computational',
        'hardware',
        'desci',
        'offTopic',
      ];

      for (const category of validCategories) {
        const article = { ...validArticle, category };
        const result = ArticleSchema.safeParse(article);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid categories', () => {
      const invalidCategory = {
        ...validArticle,
        category: 'invalidCategory',
      };
      const result = ArticleSchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
    });
  });

  describe('SummaryOutputSchema', () => {
    const createValidSummary = () => ({
      research: [
        {
          title: 'Research Article 1',
          description: 'Description 1',
          url: 'https://example.com/1',
          source: 'Journal',
          relevanceScore: 0.9,
        },
      ],
      industry: [],
      biohacking: [],
      computational: [],
      hardware: [],
      desci: [],
      offTopic: [],
      timestamp: '2024-01-15T10:30:00Z',
    });

    it('should validate valid summary output', () => {
      const validSummary = createValidSummary();
      const result = SummaryOutputSchema.safeParse(validSummary);
      expect(result.success).toBe(true);
    });

    it('should validate datetime timestamp', () => {
      const validSummary = createValidSummary();
      const result = SummaryOutputSchema.safeParse(validSummary);
      expect(result.success).toBe(true);
    });

    it('should reject invalid timestamp', () => {
      const invalidSummary = {
        ...createValidSummary(),
        timestamp: 'invalid-date',
      };
      const result = SummaryOutputSchema.safeParse(invalidSummary);
      expect(result.success).toBe(false);
    });

    it('should reject summary with no articles', () => {
      const emptySummary = {
        research: [],
        industry: [],
        biohacking: [],
        computational: [],
        hardware: [],
        desci: [],
        offTopic: [],
        timestamp: '2024-01-15T10:30:00Z',
      };

      const result = SummaryOutputSchema.safeParse(emptySummary);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least one article');
      }
    });

    it('should accept summary with articles in any category', () => {
      const summaryWithIndustry = {
        research: [],
        industry: [
          {
            title: 'Industry News',
            description: 'Industry update',
            url: 'https://example.com/industry',
            source: 'News',
            relevanceScore: 0.8,
          },
        ],
        biohacking: [],
        computational: [],
        hardware: [],
        desci: [],
        offTopic: [],
        timestamp: '2024-01-15T10:30:00Z',
      };

      const result = SummaryOutputSchema.safeParse(summaryWithIndustry);
      expect(result.success).toBe(true);
    });

    it('should validate all articles within categories', () => {
      const summaryWithInvalidArticle = {
        research: [
          {
            title: '', // Invalid: empty title
            description: 'Description',
            url: 'https://example.com/1',
            source: 'Source',
            relevanceScore: 0.9,
          },
        ],
        industry: [],
        biohacking: [],
        computational: [],
        hardware: [],
        desci: [],
        offTopic: [],
        timestamp: '2024-01-15T10:30:00Z',
      };

      const result = SummaryOutputSchema.safeParse(summaryWithInvalidArticle);
      expect(result.success).toBe(false);
    });
  });

  describe('SummaryListSchema', () => {
    it('should validate list of articles', () => {
      const validList = {
        articles: [
          {
            title: 'Article 1',
            description: 'Description 1',
            url: 'https://example.com/1',
            source: 'Source',
            relevanceScore: 0.9,
          },
          {
            title: 'Article 2',
            description: 'Description 2',
            url: 'https://example.com/2',
            source: 'Source',
            relevanceScore: 0.8,
          },
        ],
      };

      const result = SummaryListSchema.safeParse(validList);
      expect(result.success).toBe(true);
    });

    it('should accept empty article list', () => {
      const emptyList = { articles: [] };
      const result = SummaryListSchema.safeParse(emptyList);
      expect(result.success).toBe(true);
    });
  });

  describe('ScrapingOutputSchema', () => {
    const validScrapingOutput = {
      sourceUrl: 'https://example.com',
      sourceName: 'Example Source',
      articles: [
        {
          title: 'Scraped Article',
          description: 'Article description',
          url: 'https://example.com/article',
          source: 'Example Source',
          relevanceScore: 0.85,
        },
      ],
      timestamp: '2024-01-15T10:30:00Z',
    };

    it('should validate valid scraping output', () => {
      const result = ScrapingOutputSchema.safeParse(validScrapingOutput);
      expect(result.success).toBe(true);
    });

    it('should validate source URL', () => {
      const result = ScrapingOutputSchema.safeParse(validScrapingOutput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid source URL', () => {
      const invalidOutput = {
        ...validScrapingOutput,
        sourceUrl: 'not-a-url',
      };
      const result = ScrapingOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it('should reject empty source name', () => {
      const invalidOutput = {
        ...validScrapingOutput,
        sourceName: '',
      };
      const result = ScrapingOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it('should accept optional error field', () => {
      const outputWithError = {
        ...validScrapingOutput,
        error: 'Failed to fetch some articles',
      };
      const result = ScrapingOutputSchema.safeParse(outputWithError);
      expect(result.success).toBe(true);
    });

    it('should validate datetime timestamp', () => {
      const result = ScrapingOutputSchema.safeParse(validScrapingOutput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid timestamp', () => {
      const invalidOutput = {
        ...validScrapingOutput,
        timestamp: 'invalid-date',
      };
      const result = ScrapingOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it('should validate all scraped articles', () => {
      const outputWithInvalidArticle = {
        ...validScrapingOutput,
        articles: [
          {
            title: 'Valid Article',
            description: 'Description',
            url: 'https://example.com/valid',
            source: 'Source',
            relevanceScore: 0.9,
          },
          {
            title: '', // Invalid
            description: 'Description',
            url: 'https://example.com/invalid',
            source: 'Source',
            relevanceScore: 0.8,
          },
        ],
      };

      const result = ScrapingOutputSchema.safeParse(outputWithInvalidArticle);
      expect(result.success).toBe(false);
    });
  });
});


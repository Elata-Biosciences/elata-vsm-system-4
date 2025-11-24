import { z } from "zod";

export const ArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title must be 500 characters or less"),
  description: z.string().min(1, "Description is required").max(2000, "Description must be 2000 characters or less"),
  url: z.string().url("Invalid article URL"),
  source: z.string().min(1, "Source is required"),
  author: z.string().optional(),
  publishedAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  category: z
    .enum([
      "research",
      "industry",
      "biohacking",
      "computational",
      "hardware",
      "desci",
      "offTopic",
    ])
    .optional(),
  relevanceScore: z.number().min(0, "Relevance score must be between 0 and 1").max(1, "Relevance score must be between 0 and 1")
});

export const SummaryOutputSchema = z.object({
  research: z.array(ArticleSchema),
  industry: z.array(ArticleSchema),
  biohacking: z.array(ArticleSchema),
  computational: z.array(ArticleSchema),
  hardware: z.array(ArticleSchema),
  desci: z.array(ArticleSchema),
  offTopic: z.array(ArticleSchema),
  timestamp: z.string().datetime(),
}).refine((data) => {
  const totalArticles = Object.values(data)
    .filter(val => Array.isArray(val))
    .reduce((sum: number, arr: unknown) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  return totalArticles > 0;
}, { message: "Summary must contain at least one article" });

export const SummaryListSchema = z.object({
  articles: z.array(ArticleSchema),
});

export const ScrapingOutputSchema = z.object({
  sourceUrl: z.string().url("Invalid source URL"),
  sourceName: z.string().min(1, "Source name is required"),
  articles: z.array(ArticleSchema),
  timestamp: z.string().datetime(),
  error: z.string().optional(),
});

export type Article = z.infer<typeof ArticleSchema>;

export type ScrapingOutput = z.infer<typeof ScrapingOutputSchema>;

export type SummaryList = z.infer<typeof SummaryListSchema>;

export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;

export type SummaryOutputCategories = Omit<SummaryOutput, "timestamp">;
export type SummaryOutputCategoriesKey = keyof SummaryOutputCategories;

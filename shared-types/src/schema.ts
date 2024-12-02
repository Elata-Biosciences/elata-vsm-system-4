import { z } from "zod";

export const ArticleSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
  source: z.string(),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
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
});

export const SummaryOutputSchema = z.object({
  research: z.array(ArticleSchema),
  industry: z.array(ArticleSchema),
  biohacking: z.array(ArticleSchema),
  computational: z.array(ArticleSchema),
  hardware: z.array(ArticleSchema),
  desci: z.array(ArticleSchema),
  offTopic: z.array(ArticleSchema),
  timestamp: z.string(),
});

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

export type Article = z.infer<typeof ArticleSchema>;

export type ScrapingOutput = z.infer<typeof ScrapingOutputSchema>;

export type SummaryList = z.infer<typeof SummaryListSchema>;

export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;

export type SummaryOutputCategories = Omit<SummaryOutput, "timestamp">;
export type SummaryOutputCategoriesKey = keyof SummaryOutputCategories;

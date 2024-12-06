# Elata VSM Shared Types

This package contains the shared TypeScript types, interfaces, and validation schemas used across the Elata VSM System. It ensures type safety and consistent data structures between the scraper, ChatGPT agent's output structure, and web platform.

## Overview

The shared types package serves several critical functions:

1. Defines the core data structures for news articles and categories
2. Provides Zod schemas for runtime validation
3. Ensures consistent typing between backend and frontend
4. Documents the shape of AI-generated content

## Core Types

### Article Interface

```typescript
interface Article {
  title: string;
  description: string;
  url: string;
  source: string;
  author?: string;
  relevanceScore: number;
}
```

### Category Types

```typescript
type SummaryOutputCategoriesKey =
  | "research"
  | "industry"
  | "biohacking"
  | "computational"
  | "hardware"
  | "desci"
  | "offTopic";

interface SummaryOutput {
  [key in SummaryOutputCategoriesKey]: Article[];
}
```

## Validation Schemas

### Article Schema

```typescript
export const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string().url(),
  source: z.string(),
  author: z.string().optional(),
  relevanceScore: z.number().min(0).max(1),
});
```

### Summary Schema

```typescript
export const summarySchema = z.object({
  research: z.array(articleSchema),
  industry: z.array(articleSchema),
  // ... other categories
});
```

### Validating Article Data

```typescript
import { articleSchema, type Article } from "@elata/shared-types";

const validateArticle = (data: unknown): Article => {
  return articleSchema.parse(data);
};
```

## Development

### Building

This package needs to be build before being accessed by other packages.

```bash
npm run build
```

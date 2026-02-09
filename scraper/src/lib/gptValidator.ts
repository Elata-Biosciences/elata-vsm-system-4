import { z } from "zod";
import { Ok, Err, type Result } from "./result";
import { NEWS_TAGS, type NewsTag } from "@elata/shared-types";

// ── Error types ─────────────────────────────────────────────────────

export interface GptValidationError {
  code: "null_response" | "parse_error" | "invalid_structure" | "no_valid_items";
  message: string;
  raw?: string;
}

// ── Internal schemas for partial GPT output ─────────────────────────

const PartialArticleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().min(1),
  source: z.string().min(1),
  relevanceScore: z.number().min(0).max(1),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
});

type PartialArticle = z.infer<typeof PartialArticleSchema>;

// ── Helper: strip markdown code fence ───────────────────────────────

const stripMarkdownFence = (input: string): string => {
  const fenceRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/;
  const match = input.trim().match(fenceRegex);
  return match ? match[1].trim() : input.trim();
};

// ── Helper: try to extract array from response ──────────────────────

const extractArray = (parsed: unknown): unknown[] | null => {
  if (Array.isArray(parsed)) return parsed;

  // GPT sometimes wraps in an object: { articles: [...] } or { results: [...] }
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    for (const key of ["articles", "results", "data", "items"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
    // Try first array value
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) return value;
    }
  }

  return null;
};

// ── Validators ──────────────────────────────────────────────────────

/**
 * Validate GPT article list response.
 * Handles: null, invalid JSON, markdown fences, partial data.
 * Salvages valid items from mixed responses.
 */
export const validateGptArticleResponse = (
  input: string | null | undefined,
): Result<PartialArticle[], GptValidationError> => {
  // Handle null/undefined/empty
  if (input === null || input === undefined || input.trim() === "") {
    return Err({ code: "null_response", message: "GPT returned null/empty response" });
  }

  // Strip markdown fences
  const cleaned = stripMarkdownFence(input);

  // Try to parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return Err({
      code: "parse_error",
      message: "GPT response is not valid JSON",
      raw: input.slice(0, 200),
    });
  }

  // Extract array
  const arr = extractArray(parsed);
  if (!arr) {
    return Err({
      code: "invalid_structure",
      message: "GPT response does not contain an array",
      raw: input.slice(0, 200),
    });
  }

  // Validate each item, salvaging valid ones
  const validItems: PartialArticle[] = [];
  for (const item of arr) {
    const result = PartialArticleSchema.safeParse(item);
    if (result.success) {
      validItems.push(result.data);
    }
  }

  if (validItems.length === 0) {
    return Err({
      code: "no_valid_items",
      message: `GPT returned ${arr.length} items but none were valid`,
      raw: input.slice(0, 200),
    });
  }

  return Ok(validItems);
};

/**
 * Validate GPT tag assignment response.
 * Filters to only valid tags from the 100-tag enum.
 */
export const validateGptTagResponse = (
  input: string | null | undefined,
): Result<NewsTag[], GptValidationError> => {
  if (input === null || input === undefined || input.trim() === "") {
    return Err({ code: "null_response", message: "GPT returned null/empty for tags" });
  }

  const cleaned = stripMarkdownFence(input);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return Err({ code: "parse_error", message: "Tag response is not valid JSON" });
  }

  // Extract array
  const arr = extractArray(parsed);
  if (!arr) {
    return Err({ code: "invalid_structure", message: "Tag response does not contain an array" });
  }

  // Filter to valid tags only
  const validTagSet = new Set<string>(NEWS_TAGS);
  const validTags = arr
    .filter((item): item is string => typeof item === "string")
    .filter((tag) => validTagSet.has(tag)) as NewsTag[];

  if (validTags.length === 0) {
    return Err({
      code: "no_valid_items",
      message: "No valid tags found in GPT response",
      raw: input.slice(0, 200),
    });
  }

  return Ok(validTags);
};

/**
 * Validate GPT summary response.
 * Expects a non-empty string.
 */
export const validateGptSummaryResponse = (
  input: string | null | undefined,
): Result<string, GptValidationError> => {
  if (input === null || input === undefined) {
    return Err({ code: "null_response", message: "GPT returned null for summary" });
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return Err({ code: "null_response", message: "GPT returned empty summary" });
  }

  return Ok(trimmed);
};

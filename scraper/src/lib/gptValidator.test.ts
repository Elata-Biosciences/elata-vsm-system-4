import { describe, it, expect } from "vitest";
import {
  validateGptArticleResponse,
  validateGptTagResponse,
  validateGptSummaryResponse,
} from "./gptValidator";

describe("validateGptArticleResponse", () => {
  it("accepts valid article array", () => {
    const input = JSON.stringify([
      { title: "Test", description: "Desc", url: "https://example.com", source: "Test", relevanceScore: 0.8 },
    ]);
    const result = validateGptArticleResponse(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.length).toBe(1);
      expect(result.data[0].title).toBe("Test");
    }
  });

  it("returns Err for null input", () => {
    const result = validateGptArticleResponse(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("null_response");
  });

  it("returns Err for undefined input", () => {
    const result = validateGptArticleResponse(undefined);
    expect(result.ok).toBe(false);
  });

  it("returns Err for empty string", () => {
    const result = validateGptArticleResponse("");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("null_response");
  });

  it("returns Err for invalid JSON", () => {
    const result = validateGptArticleResponse("not json at all");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("parse_error");
  });

  it("salvages partial data from mixed valid/invalid items", () => {
    const input = JSON.stringify([
      { title: "Good", description: "Desc", url: "https://example.com", source: "Test", relevanceScore: 0.8 },
      { title: "", description: "Missing fields" }, // Invalid
      { title: "Also Good", description: "Desc2", url: "https://example2.com", source: "Test2", relevanceScore: 0.5 },
    ]);
    const result = validateGptArticleResponse(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.length).toBe(2); // Only the valid ones
    }
  });

  it("returns Err when no items are valid", () => {
    const input = JSON.stringify([
      { invalid: true },
      { also: "invalid" },
    ]);
    const result = validateGptArticleResponse(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("no_valid_items");
  });

  it("handles non-array JSON (object response)", () => {
    const input = JSON.stringify({
      articles: [
        { title: "Test", description: "Desc", url: "https://example.com", source: "Test", relevanceScore: 0.8 },
      ],
    });
    // Should try to extract articles from nested object
    const result = validateGptArticleResponse(input);
    expect(result.ok).toBe(true);
  });

  it("handles markdown-wrapped JSON (```json ... ```)", () => {
    const input = '```json\n[{"title":"Test","description":"Desc","url":"https://example.com","source":"Test","relevanceScore":0.8}]\n```';
    const result = validateGptArticleResponse(input);
    expect(result.ok).toBe(true);
  });
});

describe("validateGptTagResponse", () => {
  it("accepts valid tag array", () => {
    const result = validateGptTagResponse('["eeg", "neurofeedback", "bci"]');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(["eeg", "neurofeedback", "bci"]);
    }
  });

  it("filters out invalid tags", () => {
    const result = validateGptTagResponse('["eeg", "not-a-real-tag", "bci"]');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(["eeg", "bci"]);
    }
  });

  it("returns Err for null", () => {
    expect(validateGptTagResponse(null).ok).toBe(false);
  });

  it("returns Err for non-array JSON", () => {
    const result = validateGptTagResponse('{"tags": ["eeg"]}');
    // Should try to extract from object
    expect(result.ok).toBe(true);
  });
});

describe("validateGptSummaryResponse", () => {
  it("accepts valid summary string", () => {
    const result = validateGptSummaryResponse("This is a valid summary.");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe("This is a valid summary.");
  });

  it("returns Err for null", () => {
    expect(validateGptSummaryResponse(null).ok).toBe(false);
  });

  it("returns Err for empty string", () => {
    expect(validateGptSummaryResponse("").ok).toBe(false);
  });

  it("trims whitespace", () => {
    const result = validateGptSummaryResponse("  summary with spaces  ");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe("summary with spaces");
  });
});

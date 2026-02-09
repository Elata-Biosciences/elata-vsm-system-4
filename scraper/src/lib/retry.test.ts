import { describe, it, expect, vi } from "vitest";
import { withRetry, type RetryConfig } from "./retry";

describe("withRetry", () => {
  const defaultConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 10, // Short delays for tests
    maxDelayMs: 100,
  };

  it("returns Ok on first successful attempt", async () => {
    const fn = vi.fn().mockResolvedValue(42);
    const result = await withRetry(fn, defaultConfig);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValue("success");

    const result = await withRetry(fn, defaultConfig);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("returns Err after exhausting all attempts", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"));
    const result = await withRetry(fn, defaultConfig);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("always fails");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("respects maxAttempts config", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    await withRetry(fn, { ...defaultConfig, maxAttempts: 5 });
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it("handles non-Error thrown values", async () => {
    const fn = vi.fn().mockRejectedValue("string error");
    const result = await withRetry(fn, defaultConfig);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("string error");
    }
  });

  it("works with single attempt config", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    const result = await withRetry(fn, { ...defaultConfig, maxAttempts: 1 });
    expect(result.ok).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("passes attempt number to the function", async () => {
    const fn = vi.fn().mockImplementation(async (attempt: number) => {
      if (attempt < 2) throw new Error(`attempt ${attempt}`);
      return `success on ${attempt}`;
    });

    const result = await withRetry(fn, defaultConfig);
    expect(result.ok).toBe(true);
    expect(fn).toHaveBeenCalledWith(0);
    expect(fn).toHaveBeenCalledWith(1);
    expect(fn).toHaveBeenCalledWith(2);
  });
});

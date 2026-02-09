import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCircuitBreaker } from "./circuitBreaker.js";
import { isOk, isErr } from "./result.js";

describe("CircuitBreaker", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts in closed state", () => {
    const cb = createCircuitBreaker();
    expect(cb.getState()).toBe("closed");
  });

  it("allows calls in closed state", async () => {
    const cb = createCircuitBreaker();
    const result = await cb.execute(() => Promise.resolve(42));
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toBe(42);
    }
  });

  it("opens after reaching failure threshold", async () => {
    const cb = createCircuitBreaker({ failureThreshold: 3 });
    const fail = () => Promise.reject(new Error("fail"));

    await cb.execute(fail);
    await cb.execute(fail);
    expect(cb.getState()).toBe("closed");

    await cb.execute(fail);
    expect(cb.getState()).toBe("open");
  });

  it("rejects calls when open", async () => {
    const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 60_000 });
    await cb.execute(() => Promise.reject(new Error("fail")));
    expect(cb.getState()).toBe("open");

    const result = await cb.execute(() => Promise.resolve(42));
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toContain("Circuit breaker is open");
    }
  });

  it("transitions to half-open after reset timeout", async () => {
    vi.useFakeTimers();
    const cb = createCircuitBreaker({
      failureThreshold: 1,
      resetTimeoutMs: 1000,
    });

    await cb.execute(() => Promise.reject(new Error("fail")));
    expect(cb.getState()).toBe("open");

    vi.advanceTimersByTime(1001);
    const result = await cb.execute(() => Promise.resolve("recovered"));
    expect(isOk(result)).toBe(true);
    expect(cb.getState()).toBe("closed");

    vi.useRealTimers();
  });

  it("reopens if half-open call fails", async () => {
    vi.useFakeTimers();
    const cb = createCircuitBreaker({
      failureThreshold: 1,
      resetTimeoutMs: 1000,
      halfOpenMaxAttempts: 1,
    });

    await cb.execute(() => Promise.reject(new Error("fail")));
    expect(cb.getState()).toBe("open");

    vi.advanceTimersByTime(1001);
    const result = await cb.execute(() => Promise.reject(new Error("still broken")));
    expect(isErr(result)).toBe(true);
    // After a failure in half-open, it should go back to open
    expect(cb.getState()).toBe("open");

    vi.useRealTimers();
  });

  it("closes after successful half-open call", async () => {
    vi.useFakeTimers();
    const cb = createCircuitBreaker({
      failureThreshold: 1,
      resetTimeoutMs: 1000,
    });

    await cb.execute(() => Promise.reject(new Error("fail")));
    vi.advanceTimersByTime(1001);

    const result = await cb.execute(() => Promise.resolve("fixed"));
    expect(isOk(result)).toBe(true);
    expect(cb.getState()).toBe("closed");

    vi.useRealTimers();
  });

  it("can be manually reset", async () => {
    const cb = createCircuitBreaker({ failureThreshold: 1 });
    await cb.execute(() => Promise.reject(new Error("fail")));
    expect(cb.getState()).toBe("open");

    cb.reset();
    expect(cb.getState()).toBe("closed");
  });

  it("handles non-Error throws", async () => {
    const cb = createCircuitBreaker();
    const result = await cb.execute(() => Promise.reject("string error"));
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe("string error");
    }
  });
});

import { match } from "ts-pattern";
import { type Result, Ok, Err } from "./result.js";

// ── Types ───────────────────────────────────────────────────────────

type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerConfig {
  readonly failureThreshold: number;
  readonly resetTimeoutMs: number;
  readonly halfOpenMaxAttempts: number;
}

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  lastFailureAt: number;
  halfOpenAttempts: number;
}

export interface CircuitBreaker {
  readonly execute: <T>(fn: () => Promise<T>) => Promise<Result<T, Error>>;
  readonly getState: () => CircuitState;
  readonly reset: () => void;
}

// ── Defaults ────────────────────────────────────────────────────────

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 60_000,
  halfOpenMaxAttempts: 1,
};

// ── Factory ─────────────────────────────────────────────────────────

export const createCircuitBreaker = (
  config: Partial<CircuitBreakerConfig> = {},
): CircuitBreaker => {
  const cfg: CircuitBreakerConfig = { ...DEFAULT_CONFIG, ...config };

  const internal: CircuitBreakerState = {
    state: "closed",
    failureCount: 0,
    lastFailureAt: 0,
    halfOpenAttempts: 0,
  };

  const shouldReset = (): boolean =>
    Date.now() - internal.lastFailureAt >= cfg.resetTimeoutMs;

  const recordSuccess = (): void => {
    internal.failureCount = 0;
    internal.halfOpenAttempts = 0;
    internal.state = "closed";
  };

  const recordFailure = (): void => {
    internal.failureCount += 1;
    internal.lastFailureAt = Date.now();

    if (internal.failureCount >= cfg.failureThreshold) {
      internal.state = "open";
    }
  };

  const execute = async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
    return match(internal.state as CircuitState)
      .with("open", async () => {
        if (shouldReset()) {
          internal.state = "half-open";
          internal.halfOpenAttempts = 0;
          return executeCall(fn);
        }
        return Err(
          new Error(
            `Circuit breaker is open. Retry after ${cfg.resetTimeoutMs}ms.`,
          ),
        );
      })
      .with("half-open", async () => {
        if (internal.halfOpenAttempts >= cfg.halfOpenMaxAttempts) {
          internal.state = "open";
          internal.lastFailureAt = Date.now();
          return Err(
            new Error("Circuit breaker half-open limit reached; reopening."),
          );
        }
        internal.halfOpenAttempts += 1;
        return executeCall(fn);
      })
      .with("closed", async () => executeCall(fn))
      .exhaustive();
  };

  const executeCall = async <T>(
    fn: () => Promise<T>,
  ): Promise<Result<T, Error>> => {
    try {
      const result = await fn();
      recordSuccess();
      return Ok(result);
    } catch (error) {
      recordFailure();
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  };

  const getState = (): CircuitState => internal.state;

  const reset = (): void => {
    internal.state = "closed";
    internal.failureCount = 0;
    internal.lastFailureAt = 0;
    internal.halfOpenAttempts = 0;
  };

  return { execute, getState, reset };
};

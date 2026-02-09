import { Ok, Err, type Result } from "./result";

/** Configuration for retry behavior */
export interface RetryConfig {
  /** Maximum number of attempts (including the first try) */
  maxAttempts: number;
  /** Base delay in milliseconds (doubles each attempt) */
  baseDelayMs: number;
  /** Maximum delay cap in milliseconds */
  maxDelayMs: number;
}

/** Default retry configuration */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1_000,
  maxDelayMs: 30_000,
};

/**
 * Calculate delay with exponential backoff + jitter.
 * Pure function.
 *
 * @param attempt - Zero-indexed attempt number
 * @param baseDelayMs - Base delay in ms
 * @param maxDelayMs - Maximum delay cap in ms
 * @returns Delay in milliseconds
 */
export const calculateDelay = (
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
): number => {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  // Add jitter: random between 50%-100% of the calculated delay
  const jitter = 0.5 + Math.random() * 0.5;
  return Math.floor(cappedDelay * jitter);
};

/** Sleep for a given duration */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry an async function with exponential backoff and jitter.
 * Returns a Result type — never throws.
 *
 * The function receives the current attempt number (0-indexed) as its argument.
 *
 * @example
 * const result = await withRetry(
 *   async (attempt) => fetchFromAPI(url),
 *   { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 10000 }
 * );
 * if (result.ok) console.log(result.data);
 * else console.error(result.error);
 */
export const withRetry = async <T>(
  fn: (attempt: number) => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<Result<T, Error>> => {
  let lastError: Error = new Error("No attempts made");

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      const result = await fn(attempt);
      return Ok(result);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));

      // Don't sleep after the last attempt
      if (attempt < config.maxAttempts - 1) {
        const delay = calculateDelay(attempt, config.baseDelayMs, config.maxDelayMs);
        await sleep(delay);
      }
    }
  }

  return Err(lastError);
};

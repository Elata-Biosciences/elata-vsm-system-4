/**
 * Result type for functional error handling.
 * Use instead of throwing exceptions — propagate errors explicitly.
 *
 * @example
 * const result = Ok(42);
 * if (result.ok) console.log(result.data); // 42
 *
 * const error = Err(new Error("failed"));
 * if (!error.ok) console.error(error.error.message);
 */

/** A successful result containing data of type T */
export type OkResult<T> = { readonly ok: true; readonly data: T };

/** A failed result containing an error of type E */
export type ErrResult<E> = { readonly ok: false; readonly error: E };

/** A Result is either Ok with data or Err with an error */
export type Result<T, E = Error> = OkResult<T> | ErrResult<E>;

/** Create a successful result */
export const Ok = <T>(data: T): OkResult<T> => ({ ok: true, data });

/** Create a failed result */
export const Err = <E>(error: E): ErrResult<E> => ({ ok: false, error });

/** Check if a Result is Ok */
export const isOk = <T, E>(result: Result<T, E>): result is OkResult<T> => result.ok;

/** Check if a Result is Err */
export const isErr = <T, E>(result: Result<T, E>): result is ErrResult<E> => !result.ok;

/** Map a successful result's data. If Err, passes through unchanged. */
export const mapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U,
): Result<U, E> => (result.ok ? Ok(fn(result.data)) : result);

/** Map a failed result's error. If Ok, passes through unchanged. */
export const mapErr = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> => (result.ok ? result : Err(fn(result.error)));

/** Chain operations that return Results. Like flatMap/bind. */
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E> => (result.ok ? fn(result.data) : result);

/** Extract data from Ok or return a default value. */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T =>
  result.ok ? result.data : defaultValue;

/** Wrap a function that might throw into one that returns Result. */
export const tryCatch = <T>(fn: () => T): Result<T, Error> => {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
};

/** Async version of tryCatch. */
export const tryCatchAsync = async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
};

import { describe, it, expect } from "vitest";
import {
  Ok,
  Err,
  isOk,
  isErr,
  mapResult,
  mapErr,
  flatMap,
  unwrapOr,
  tryCatch,
  tryCatchAsync,
  type Result,
} from "./result";

describe("Ok", () => {
  it("creates a successful result", () => {
    const result = Ok(42);
    expect(result.ok).toBe(true);
    expect(result.data).toBe(42);
  });

  it("works with complex types", () => {
    const result = Ok({ name: "test", values: [1, 2, 3] });
    expect(result.ok).toBe(true);
    expect(result.data.name).toBe("test");
  });
});

describe("Err", () => {
  it("creates a failed result", () => {
    const result = Err(new Error("failed"));
    expect(result.ok).toBe(false);
    expect(result.error.message).toBe("failed");
  });

  it("works with string errors", () => {
    const result = Err("something went wrong");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("something went wrong");
  });
});

describe("isOk / isErr", () => {
  it("correctly identifies Ok results", () => {
    const result: Result<number> = Ok(42);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
  });

  it("correctly identifies Err results", () => {
    const result: Result<number> = Err(new Error("nope"));
    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
  });
});

describe("mapResult", () => {
  it("maps Ok values", () => {
    const result = mapResult(Ok(5), (x) => x * 2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe(10);
  });

  it("passes through Err unchanged", () => {
    const err = Err(new Error("bad"));
    const result = mapResult(err, (x: number) => x * 2);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe("bad");
  });
});

describe("mapErr", () => {
  it("maps Err values", () => {
    const result = mapErr(Err("error"), (e) => `wrapped: ${e}`);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("wrapped: error");
  });

  it("passes through Ok unchanged", () => {
    const result = mapErr(Ok(42), (e: string) => `wrapped: ${e}`);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe(42);
  });
});

describe("flatMap", () => {
  it("chains Ok results", () => {
    const result = flatMap(Ok(5), (x) => Ok(x * 2));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe(10);
  });

  it("short-circuits on Err", () => {
    const result = flatMap(Err(new Error("first")), (_x: number) => Ok(42));
    expect(result.ok).toBe(false);
  });

  it("propagates errors from chain function", () => {
    const result = flatMap(Ok(5), (_x) => Err(new Error("chain failed")));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe("chain failed");
  });
});

describe("unwrapOr", () => {
  it("returns data for Ok", () => {
    expect(unwrapOr(Ok(42), 0)).toBe(42);
  });

  it("returns default for Err", () => {
    expect(unwrapOr(Err(new Error("fail")), 99)).toBe(99);
  });
});

describe("tryCatch", () => {
  it("returns Ok for successful functions", () => {
    const result = tryCatch(() => JSON.parse('{"a":1}'));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ a: 1 });
  });

  it("returns Err for throwing functions", () => {
    const result = tryCatch(() => JSON.parse("not json"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(Error);
  });

  it("wraps non-Error throws in Error", () => {
    const result = tryCatch(() => {
      throw "string error";
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("string error");
    }
  });
});

describe("tryCatchAsync", () => {
  it("returns Ok for successful async functions", async () => {
    const result = await tryCatchAsync(async () => 42);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBe(42);
  });

  it("returns Err for rejecting async functions", async () => {
    const result = await tryCatchAsync(async () => {
      throw new Error("async fail");
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe("async fail");
  });
});

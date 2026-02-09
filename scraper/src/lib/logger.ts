import { CONFIG } from "../config/config.js";

// ── Types ───────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  timestamp: string;
  durationMs?: number;
  context?: Record<string, unknown>;
  error?: { message: string; stack?: string };
}

export interface Logger {
  debug: (msg: string, ctx?: Record<string, unknown>) => void;
  info: (msg: string, ctx?: Record<string, unknown>) => void;
  warn: (msg: string, ctx?: Record<string, unknown>) => void;
  error: (msg: string, err?: unknown, ctx?: Record<string, unknown>) => void;
  /** Start a timer; returns a function that logs the elapsed time at info level. */
  time: (operation: string) => () => number;
}

// ── Level ordering ──────────────────────────────────────────────────

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// ── Config ──────────────────────────────────────────────────────────

const LOG_FORMAT: "pretty" | "json" =
  (process.env.SCRAPER_LOG_FORMAT as "pretty" | "json") ?? "pretty";

const LOG_LEVEL: LogLevel =
  (process.env.SCRAPER_LOG_LEVEL as LogLevel) ??
  (CONFIG.VERBOSE ? "debug" : "info");

// ── Colors for pretty mode ──────────────────────────────────────────

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  debug: "\x1b[36m",   // cyan
  info: "\x1b[32m",    // green
  warn: "\x1b[33m",    // yellow
  error: "\x1b[31m",   // red
  module: "\x1b[35m",  // magenta
} as const;

// ── Core log function ───────────────────────────────────────────────

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[LOG_LEVEL];
}

function formatError(err: unknown): { message: string; stack?: string } | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack };
  }
  return { message: String(err) };
}

function logEntry(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;

  if (LOG_FORMAT === "json") {
    // Structured JSON — one line per entry for machine parsing
    const output = process.stderr;
    output.write(JSON.stringify(entry) + "\n");
    return;
  }

  // Pretty format for dev
  const time = new Date(entry.timestamp).toLocaleTimeString("en-US", { hour12: false });
  const levelTag = entry.level.toUpperCase().padEnd(5);
  const color = COLORS[entry.level];
  const durationStr = entry.durationMs != null ? ` ${COLORS.dim}(${entry.durationMs}ms)${COLORS.reset}` : "";

  let line = `${COLORS.dim}${time}${COLORS.reset} ${color}${levelTag}${COLORS.reset} ${COLORS.module}[${entry.module}]${COLORS.reset} ${entry.message}${durationStr}`;

  if (entry.context && Object.keys(entry.context).length > 0) {
    line += ` ${COLORS.dim}${JSON.stringify(entry.context)}${COLORS.reset}`;
  }

  const stream = entry.level === "error" || entry.level === "warn" ? process.stderr : process.stdout;
  stream.write(line + "\n");

  if (entry.error?.stack) {
    stream.write(`  ${COLORS.dim}${entry.error.stack}${COLORS.reset}\n`);
  }
}

// ── Factory ─────────────────────────────────────────────────────────

export function createLogger(module: string): Logger {
  const log = (level: LogLevel, msg: string, ctx?: Record<string, unknown>, err?: unknown, durationMs?: number) => {
    logEntry({
      level,
      module,
      message: msg,
      timestamp: new Date().toISOString(),
      durationMs,
      context: ctx,
      error: formatError(err),
    });
  };

  return {
    debug: (msg, ctx?) => log("debug", msg, ctx),
    info: (msg, ctx?) => log("info", msg, ctx),
    warn: (msg, ctx?) => log("warn", msg, ctx),
    error: (msg, err?, ctx?) => log("error", msg, ctx, err),
    time: (operation: string) => {
      const start = Date.now();
      return () => {
        const elapsed = Date.now() - start;
        log("info", `${operation} completed`, undefined, undefined, elapsed);
        return elapsed;
      };
    },
  };
}

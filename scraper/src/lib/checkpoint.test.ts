import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCheckpointManager,
  type PipelinePhase,
} from "./checkpoint.js";

// Mock fs operations
vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

import { existsSync, writeFileSync, readFileSync, readdirSync } from "node:fs";

const mockExistsSync = vi.mocked(existsSync);
const mockWriteFileSync = vi.mocked(writeFileSync);
const mockReadFileSync = vi.mocked(readFileSync);
const mockReaddirSync = vi.mocked(readdirSync);

describe("createCheckpointManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
  });

  it("saves a checkpoint", () => {
    const manager = createCheckpointManager("/data/checkpoints");
    manager.save("2026-02-09", "scrape", { sources: ["test"] });
    expect(mockWriteFileSync).toHaveBeenCalledOnce();
    const [path, content] = mockWriteFileSync.mock.calls[0] as [string, string];
    expect(path).toContain("2026-02-09_scrape.json");
    expect(JSON.parse(content)).toEqual({ sources: ["test"] });
  });

  it("loads an existing checkpoint", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(JSON.stringify({ articles: [1, 2, 3] }));

    const manager = createCheckpointManager("/data/checkpoints");
    const result = manager.load("2026-02-09", "gpt");
    expect(result).toEqual({ articles: [1, 2, 3] });
  });

  it("returns null for missing checkpoint", () => {
    mockExistsSync.mockReturnValue(false);
    const manager = createCheckpointManager("/data/checkpoints");
    const result = manager.load("2026-02-09", "gpt");
    expect(result).toBeNull();
  });

  it("lists available checkpoints for a date", () => {
    mockReaddirSync.mockReturnValue([
      "2026-02-09_scrape.json" as unknown as import("node:fs").Dirent,
      "2026-02-09_gpt.json" as unknown as import("node:fs").Dirent,
      "2026-02-08_scrape.json" as unknown as import("node:fs").Dirent,
    ]);

    const manager = createCheckpointManager("/data/checkpoints");
    const phases = manager.listCheckpoints("2026-02-09");
    expect(phases).toEqual(["scrape", "gpt"]);
  });

  it("gets the latest phase for a date", () => {
    mockReaddirSync.mockReturnValue([
      "2026-02-09_scrape.json" as unknown as import("node:fs").Dirent,
      "2026-02-09_gpt.json" as unknown as import("node:fs").Dirent,
    ]);

    const manager = createCheckpointManager("/data/checkpoints");
    const latest = manager.getLatestPhase("2026-02-09");
    expect(latest).toBe("gpt"); // gpt comes after scrape in pipeline order
  });

  it("returns null for latest phase when no checkpoints exist", () => {
    mockReaddirSync.mockReturnValue([]);
    const manager = createCheckpointManager("/data/checkpoints");
    const latest = manager.getLatestPhase("2026-02-09");
    expect(latest).toBeNull();
  });
});

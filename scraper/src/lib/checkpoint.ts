import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** Pipeline phases in order of execution */
export const PIPELINE_PHASES = ["scrape", "gpt", "enrich", "moderate", "embed", "audio", "podcast", "final"] as const;
export type PipelinePhase = (typeof PIPELINE_PHASES)[number];

/** Phase ordering for determining the latest checkpoint */
const PHASE_ORDER: Record<PipelinePhase, number> = {
  scrape: 0,
  gpt: 1,
  enrich: 2,
  moderate: 3,
  embed: 4,
  audio: 5,
  podcast: 6,
  final: 7,
};

export interface CheckpointManager {
  /** Save data for a specific date and phase */
  save: (date: string, phase: PipelinePhase, data: unknown) => void;
  /** Load checkpoint data for a specific date and phase. Returns null if not found. */
  load: (date: string, phase: PipelinePhase) => unknown | null;
  /** List all phases that have checkpoints for a given date */
  listCheckpoints: (date: string) => PipelinePhase[];
  /** Get the latest completed phase for a given date, or null */
  getLatestPhase: (date: string) => PipelinePhase | null;
  /** Check if a checkpoint exists for a specific date and phase */
  exists: (date: string, phase: PipelinePhase) => boolean;
}

/**
 * Create a checkpoint manager for saving/resuming scraper pipeline state.
 *
 * Saves JSON files at: `{baseDir}/{date}_{phase}.json`
 *
 * @param baseDir - Directory for checkpoint files
 */
export const createCheckpointManager = (baseDir: string): CheckpointManager => {
  // Ensure directory exists
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }

  const getPath = (date: string, phase: PipelinePhase): string =>
    join(baseDir, `${date}_${phase}.json`);

  const save = (date: string, phase: PipelinePhase, data: unknown): void => {
    const path = getPath(date, phase);
    writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
  };

  const load = (date: string, phase: PipelinePhase): unknown | null => {
    const path = getPath(date, phase);
    if (!existsSync(path)) return null;
    try {
      const raw = readFileSync(path, "utf-8");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const checkpointExists = (date: string, phase: PipelinePhase): boolean =>
    existsSync(getPath(date, phase));

  const listCheckpoints = (date: string): PipelinePhase[] => {
    try {
      const files = readdirSync(baseDir);
      const prefix = `${date}_`;
      return files
        .map((f) => String(f))
        .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
        .map((f) => f.replace(prefix, "").replace(".json", "") as PipelinePhase)
        .filter((phase) => PIPELINE_PHASES.includes(phase))
        .sort((a, b) => PHASE_ORDER[a] - PHASE_ORDER[b]);
    } catch {
      return [];
    }
  };

  const getLatestPhase = (date: string): PipelinePhase | null => {
    const phases = listCheckpoints(date);
    return phases.length > 0 ? phases[phases.length - 1] : null;
  };

  return { save, load, listCheckpoints, getLatestPhase, exists: checkpointExists };
};

import envPaths from "env-paths";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ArtifactId, Settings } from "@shared/contracts.js";
import { ARTIFACT_IDS } from "@shared/contracts.js";

/** The settings a fresh install starts from: no pinned tab. */
export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  defaultArtifactTab: null,
};

/**
 * Read/write access to durable user preferences. The only write surface in the
 * viewer — kept behind an interface so the server depends on the contract, not
 * the file (DIP), and tests can swap in a temp-dir or in-memory implementation.
 * Writes MUST target only the user config directory, never a project's
 * `openspec/` tree.
 */
export interface SettingsStore {
  /** Always resolves to valid settings — defaults on a missing/bad file. */
  read(): Promise<Settings>;
  /** Merge a partial over the current settings, persist, and return the result. */
  write(patch: Partial<Settings>): Promise<Settings>;
}

/**
 * A `SettingsStore` backed by a JSON file in the OS-appropriate user config
 * directory (`env-paths`). Reads validate-and-default so a missing, unparseable,
 * or malformed file never breaks the app; writes are atomic (temp file + rename)
 * so a crash mid-write cannot corrupt the settings.
 */
export class FileSettingsStore implements SettingsStore {
  private readonly dir: string;
  private readonly file: string;

  /** `configDir` is injectable for tests; production resolves it via env-paths. */
  constructor(configDir?: string) {
    this.dir = configDir ?? envPaths("opsx-ui", { suffix: "" }).config;
    this.file = path.join(this.dir, "settings.json");
  }

  async read(): Promise<Settings> {
    const raw = await readFile(this.file, "utf8").catch(() => null);
    if (raw === null) return { ...DEFAULT_SETTINGS };
    try {
      return normalizeSettings(JSON.parse(raw));
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  async write(patch: Partial<Settings>): Promise<Settings> {
    const next = normalizeSettings({ ...(await this.read()), ...patch });
    await mkdir(this.dir, { recursive: true });
    const tmp = path.join(this.dir, `settings.json.${process.pid}.tmp`);
    await writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await rename(tmp, this.file); // atomic on the same filesystem
    return next;
  }
}

/** Coerce arbitrary parsed content into valid `Settings`, dropping anything
 *  unrecognized to its default — the basis of "tolerant of malformed settings". */
export function normalizeSettings(value: unknown): Settings {
  const obj =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const tab = obj.defaultArtifactTab;
  const validTab =
    typeof tab === "string" && (ARTIFACT_IDS as readonly string[]).includes(tab)
      ? (tab as ArtifactId)
      : null;
  return { version: 1, defaultArtifactTab: validTab };
}

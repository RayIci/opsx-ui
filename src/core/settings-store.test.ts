import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  DEFAULT_SETTINGS,
  FileSettingsStore,
  normalizeSettings,
} from "./settings-store.js";

let dir: string;

/** Recursively list every file under `root`, relative + sorted. */
async function listAllFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  const walk = async (current: string): Promise<void> => {
    const entries = await readdir(current, { withFileTypes: true }).catch(
      () => [],
    );
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else out.push(path.relative(root, full));
    }
  };
  await walk(root);
  return out.sort();
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "opsx-settings-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("FileSettingsStore.read", () => {
  it("returns defaults when no file exists", async () => {
    const store = new FileSettingsStore(dir);
    await expect(store.read()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it("returns defaults when the file is corrupt", async () => {
    await writeFile(path.join(dir, "settings.json"), "{ not json", "utf8");
    const store = new FileSettingsStore(dir);
    await expect(store.read()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it("coerces an invalid defaultArtifactTab to null", async () => {
    await writeFile(
      path.join(dir, "settings.json"),
      JSON.stringify({ version: 1, defaultArtifactTab: "bogus" }),
      "utf8",
    );
    const store = new FileSettingsStore(dir);
    const settings = await store.read();
    expect(settings.defaultArtifactTab).toBeNull();
  });
});

describe("FileSettingsStore.write", () => {
  it("persists and round-trips a valid preference", async () => {
    const store = new FileSettingsStore(dir);
    const written = await store.write({ defaultArtifactTab: "tasks" });
    expect(written.defaultArtifactTab).toBe("tasks");
    // A fresh store reading the same dir sees the persisted value.
    const reopened = new FileSettingsStore(dir);
    await expect(reopened.read()).resolves.toEqual({
      version: 1,
      defaultArtifactTab: "tasks",
    });
  });

  it("normalizes an invalid patch rather than persisting it", async () => {
    const store = new FileSettingsStore(dir);
    const written = await store.write({
      defaultArtifactTab: "nope" as never,
    });
    expect(written.defaultArtifactTab).toBeNull();
  });

  it("leaves no temp file behind and always writes complete JSON (atomicity)", async () => {
    const store = new FileSettingsStore(dir);
    await store.write({ defaultArtifactTab: "design" });
    const entries = await readdir(dir);
    expect(entries).toEqual(["settings.json"]);
    // The file is complete, valid JSON — never a partial write.
    const raw = await readFile(path.join(dir, "settings.json"), "utf8");
    expect(() => JSON.parse(raw)).not.toThrow();
  });
});

describe("normalizeSettings", () => {
  it("defaults non-object input", () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings(42)).toEqual(DEFAULT_SETTINGS);
  });
});

describe("read-only guarantee: writes never touch a project's openspec/", () => {
  it("writing a setting leaves a project openspec/ tree untouched", async () => {
    // A separate project directory with openspec/ state, isolated from the
    // config dir the settings store writes to.
    const project = await mkdtemp(path.join(tmpdir(), "opsx-project-"));
    const openspecDir = path.join(project, "openspec", "changes", "add-x");
    await mkdir(openspecDir, { recursive: true });
    await writeFile(path.join(openspecDir, "proposal.md"), "# X\n");

    const before = await listAllFiles(path.join(project, "openspec"));
    const store = new FileSettingsStore(dir); // dir is a distinct temp config dir
    await store.write({ defaultArtifactTab: "tasks" });
    const after = await listAllFiles(path.join(project, "openspec"));

    expect(after).toEqual(before);
    await rm(project, { recursive: true, force: true });
  });
});

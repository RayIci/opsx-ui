import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, readdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { FilesystemSource } from "./filesystem-source.js";

let root: string;

/** Recursively list every file path under `dir`, relative to it, sorted. */
async function listAllFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const walk = async (current: string): Promise<void> => {
    const entries = await readdir(current, { withFileTypes: true }).catch(
      () => [],
    );
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else out.push(path.relative(dir, full));
    }
  };
  await walk(dir);
  return out.sort();
}

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "opsx-fs-"));
  const archive = path.join(root, "openspec", "changes", "archive");
  const change = path.join(archive, "2026-07-10-add-thing");
  await mkdir(path.join(change, "specs", "widgets"), { recursive: true });
  await writeFile(path.join(change, "proposal.md"), "# Add thing\n\nWhy.");
  await writeFile(
    path.join(change, "tasks.md"),
    "## 1\n- [x] 1.1 done\n- [x] 1.2 done\n- [ ] 1.3 todo\n",
  );
  await writeFile(
    path.join(change, "specs", "widgets", "spec.md"),
    "## ADDED Requirements\n### Requirement: X\n",
  );
  await mkdir(path.join(root, "openspec", "specs", "widgets"), {
    recursive: true,
  });
  await writeFile(
    path.join(root, "openspec", "specs", "widgets", "spec.md"),
    "# widgets Specification\n",
  );

  // An active change without a design.md and a single delta spec.
  const changes = path.join(root, "openspec", "changes");
  const min = path.join(changes, "add-min");
  await mkdir(path.join(min, "specs", "widgets"), { recursive: true });
  await writeFile(path.join(min, "proposal.md"), "# Min\n");
  await writeFile(path.join(min, "tasks.md"), "## 1\n- [ ] 1.1 do\n");
  await writeFile(
    path.join(min, "specs", "widgets", "spec.md"),
    "## ADDED Requirements\n",
  );

  // An active change with a design.md and two delta specs.
  const full = path.join(changes, "add-full");
  await mkdir(path.join(full, "specs", "alpha"), { recursive: true });
  await mkdir(path.join(full, "specs", "beta"), { recursive: true });
  await writeFile(path.join(full, "proposal.md"), "# Full\n");
  await writeFile(path.join(full, "design.md"), "# Design\n");
  await writeFile(path.join(full, "tasks.md"), "## 1\n- [ ] 1.1 do\n");
  await writeFile(path.join(full, "specs", "alpha", "spec.md"), "## ADDED\n");
  await writeFile(path.join(full, "specs", "beta", "spec.md"), "## ADDED\n");
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("FilesystemSource.listArchived", () => {
  it("parses name, date, and task progress", async () => {
    const fs = new FilesystemSource(root);
    const list = await fs.listArchived();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: "2026-07-10-add-thing",
      name: "add-thing",
      archivedDate: "2026-07-10",
      tasks: { completed: 2, total: 3 },
    });
  });

  it("returns empty (not error) when there is no archive", async () => {
    const fs = new FilesystemSource(path.join(tmpdir(), "opsx-nope-xyz"));
    await expect(fs.listArchived()).resolves.toEqual([]);
  });
});

describe("FilesystemSource.getArchivedChange", () => {
  it("returns artifacts and deltas as raw markdown", async () => {
    const fs = new FilesystemSource(root);
    const detail = await fs.getArchivedChange("2026-07-10-add-thing");
    expect(detail.artifacts.map((a) => a.id)).toContain("proposal");
    expect(
      detail.artifacts.find((a) => a.id === "proposal")?.content,
    ).toContain("Add thing");
    expect(detail.deltas[0]).toMatchObject({ spec: "widgets" });
    expect(detail.deltas[0].content).toContain("ADDED Requirements");
  });

  it("rejects traversal ids", async () => {
    const fs = new FilesystemSource(root);
    await expect(fs.getArchivedChange("../../etc")).rejects.toThrow();
  });
});

describe("FilesystemSource.getChangeArtifactManifest", () => {
  it("reports an absent design and counts a single delta", async () => {
    const fs = new FilesystemSource(root);
    const manifest = await fs.getChangeArtifactManifest("add-min");
    expect(manifest).toEqual({
      changeName: "add-min",
      proposal: true,
      design: false,
      tasks: true,
      deltaCount: 1,
    });
  });

  it("reports a present design and counts multiple deltas", async () => {
    const fs = new FilesystemSource(root);
    const manifest = await fs.getChangeArtifactManifest("add-full");
    expect(manifest).toMatchObject({
      proposal: true,
      design: true,
      tasks: true,
      deltaCount: 2,
    });
  });

  it("reports all-absent for an unknown change without erroring", async () => {
    const fs = new FilesystemSource(root);
    const manifest = await fs.getChangeArtifactManifest("does-not-exist");
    expect(manifest).toMatchObject({
      proposal: false,
      design: false,
      tasks: false,
      deltaCount: 0,
    });
  });

  it("rejects traversal names", async () => {
    const fs = new FilesystemSource(root);
    await expect(fs.getChangeArtifactManifest("../../etc")).rejects.toThrow();
  });

  it("does not write to openspec/ when reading a manifest", async () => {
    const fs = new FilesystemSource(root);
    const openspecDir = path.join(root, "openspec");
    const before = await listAllFiles(openspecDir);
    await fs.getChangeArtifactManifest("add-min");
    await fs.getChangeArtifactManifest("add-full");
    const after = await listAllFiles(openspecDir);
    expect(after).toEqual(before);
  });
});

describe("FilesystemSource.getRawDocument", () => {
  it("reads a document under openspec/", async () => {
    const fs = new FilesystemSource(root);
    const doc = await fs.getRawDocument("specs/widgets/spec.md");
    expect(doc.content).toContain("widgets Specification");
  });

  it("refuses paths escaping openspec/", async () => {
    const fs = new FilesystemSource(root);
    await expect(fs.getRawDocument("../../../etc/passwd")).rejects.toThrow();
  });
});

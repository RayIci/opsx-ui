import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { FilesystemSource } from "./filesystem-source.js";

let root: string;

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

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { ArchiveSource } from "./archive-source.js";
import type {
  ArchivedArtifact,
  ArchivedChangeDetail,
  ArchivedChangeSummary,
  ArchivedDelta,
  ChangeArtifactManifest,
  RawDocument,
  TaskProgress,
} from "../shared/contracts.js";
import { DOCUMENT_ARTIFACT_IDS } from "../shared/contracts.js";
import { OpenSpecCliError } from "./errors.js";

const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})-(.+)$/;

/**
 * Reads OpenSpec state directly from disk for the things the CLI can't provide:
 * raw markdown and the archive tree (design D1/D6). Strictly read-only, and it
 * refuses paths that escape the project's `openspec/` directory.
 */
export class FilesystemSource implements ArchiveSource {
  private readonly openspecDir: string;
  private readonly changesDir: string;
  private readonly archiveDir: string;

  constructor(projectRoot: string) {
    this.openspecDir = path.join(projectRoot, "openspec");
    this.changesDir = path.join(this.openspecDir, "changes");
    this.archiveDir = path.join(this.changesDir, "archive");
  }

  async listArchived(): Promise<ArchivedChangeSummary[]> {
    const dirs = await this.safeReaddir(this.archiveDir);
    const summaries: (ArchivedChangeSummary & { mtime: number })[] = [];

    for (const entry of dirs) {
      const full = path.join(this.archiveDir, entry);
      const info = await stat(full).catch(() => null);
      if (!info?.isDirectory()) continue;

      const tasks = await this.readTaskProgress(path.join(full, "tasks.md"));
      const match = DATE_PREFIX.exec(entry);
      summaries.push({
        id: entry,
        name: match ? match[2] : entry,
        archivedDate: match ? match[1] : null,
        tasks,
        mtime: info.mtimeMs,
      });
    }

    return summaries
      .sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : b.mtime - a.mtime))
      .map(({ mtime: _mtime, ...summary }) => summary);
  }

  async getArchivedChange(id: string): Promise<ArchivedChangeDetail> {
    const dir = this.resolveArchiveEntry(id);
    const [summary] = (await this.listArchived()).filter((s) => s.id === id);
    if (!summary) {
      throw new OpenSpecCliError(`Archived change not found: ${id}`, [
        "archive",
        id,
      ]);
    }

    const artifacts: ArchivedArtifact[] = [];
    for (const artifact of DOCUMENT_ARTIFACT_IDS) {
      const content = await this.readIfExists(path.join(dir, `${artifact}.md`));
      if (content !== null) artifacts.push({ id: artifact, content });
    }

    const deltas = await this.readArchivedDeltas(path.join(dir, "specs"));
    return { ...summary, artifacts, deltas };
  }

  async getChangeArtifactManifest(
    name: string,
  ): Promise<ChangeArtifactManifest> {
    const dir = this.resolveChangeEntry(name);
    const present: Record<string, boolean> = {};
    for (const id of DOCUMENT_ARTIFACT_IDS) {
      present[id] = await this.exists(path.join(dir, `${id}.md`));
    }
    const deltaCount = await this.countSpecDeltas(path.join(dir, "specs"));
    return {
      changeName: name,
      proposal: present.proposal,
      design: present.design,
      tasks: present.tasks,
      deltaCount,
    };
  }

  async getRawDocument(relativePath: string): Promise<RawDocument> {
    const resolved = this.resolveWithin(this.openspecDir, relativePath);
    const content = await readFile(resolved, "utf8");
    return { path: relativePath, content };
  }

  // --- helpers ---

  private async readArchivedDeltas(specsDir: string): Promise<ArchivedDelta[]> {
    const capabilities = await this.safeReaddir(specsDir);
    const deltas: ArchivedDelta[] = [];
    for (const cap of capabilities) {
      const content = await this.readIfExists(
        path.join(specsDir, cap, "spec.md"),
      );
      if (content !== null) deltas.push({ spec: cap, content });
    }
    return deltas;
  }

  private async readTaskProgress(tasksPath: string): Promise<TaskProgress> {
    const content = await this.readIfExists(tasksPath);
    if (content === null) return { completed: 0, total: 0 };
    const done = (content.match(/^\s*- \[x\]/gim) ?? []).length;
    const todo = (content.match(/^\s*- \[ \]/gim) ?? []).length;
    return { completed: done, total: done + todo };
  }

  /** Count capability sub-directories under a change's `specs/` that hold a
   *  `spec.md` — i.e. how many delta specs the change proposes. */
  private async countSpecDeltas(specsDir: string): Promise<number> {
    const capabilities = await this.safeReaddir(specsDir);
    let count = 0;
    for (const cap of capabilities) {
      if (await this.exists(path.join(specsDir, cap, "spec.md"))) count += 1;
    }
    return count;
  }

  private async safeReaddir(dir: string): Promise<string[]> {
    return readdir(dir).catch(() => []);
  }

  private async exists(file: string): Promise<boolean> {
    return stat(file)
      .then((info) => info.isFile())
      .catch(() => false);
  }

  private async readIfExists(file: string): Promise<string | null> {
    return readFile(file, "utf8").catch(() => null);
  }

  /** Resolve an active change directory by name, guarding against traversal. */
  private resolveChangeEntry(name: string): string {
    if (name.includes("/") || name.includes("\\") || name.includes("..")) {
      throw new OpenSpecCliError(`Invalid change name: ${name}`, [
        "change",
        name,
      ]);
    }
    return path.join(this.changesDir, name);
  }

  /** Resolve an archive entry id, guarding against traversal. */
  private resolveArchiveEntry(id: string): string {
    if (id.includes("/") || id.includes("\\") || id.includes("..")) {
      throw new OpenSpecCliError(`Invalid archive id: ${id}`, ["archive", id]);
    }
    return path.join(this.archiveDir, id);
  }

  /** Resolve `relativePath` and ensure it stays under `base`. */
  private resolveWithin(base: string, relativePath: string): string {
    const resolved = path.resolve(base, relativePath);
    const rel = path.relative(base, resolved);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new OpenSpecCliError(`Path escapes openspec/: ${relativePath}`, [
        relativePath,
      ]);
    }
    return resolved;
  }
}

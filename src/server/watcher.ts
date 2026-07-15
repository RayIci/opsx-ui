import path from "node:path";
import chokidar, { type FSWatcher } from "chokidar";
import { randomUUID } from "node:crypto";
import type { ActivityEntry, ActivityKind } from "../shared/contracts.js";

export interface WatcherOptions {
  /** Coalesce bursts of edits into one snapshot rebuild (live-sync spec). */
  debounceMs?: number;
  /** Force polling where native fs events are unreliable (WSL/network). */
  usePolling?: boolean;
}

type Listener<T> = (value: T) => void;

/**
 * Watches a project's `openspec/` tree and signals two things (design D5):
 *  - `onInvalidated`: debounced — "state changed, rebuild the snapshot".
 *  - `onActivity`: per raw event — an entry for the live activity feed.
 * Read-only: it only observes; it never writes.
 */
export class OpenSpecWatcher {
  private watcher: FSWatcher | null = null;
  private readonly openspecDir: string;
  private readonly debounceMs: number;
  private readonly usePolling: boolean;
  private debounceTimer: NodeJS.Timeout | null = null;

  private invalidatedListeners = new Set<Listener<void>>();
  private activityListeners = new Set<Listener<ActivityEntry>>();

  constructor(projectRoot: string, options: WatcherOptions = {}) {
    this.openspecDir = path.join(projectRoot, "openspec");
    this.debounceMs = options.debounceMs ?? 150;
    this.usePolling = options.usePolling ?? false;
  }

  onInvalidated(listener: Listener<void>): void {
    this.invalidatedListeners.add(listener);
  }

  onActivity(listener: Listener<ActivityEntry>): void {
    this.activityListeners.add(listener);
  }

  start(): void {
    if (this.watcher) return;
    this.watcher = chokidar.watch(this.openspecDir, {
      ignoreInitial: true,
      usePolling: this.usePolling,
      awaitWriteFinish: { stabilityThreshold: 80, pollInterval: 20 },
    });
    this.watcher
      .on("add", (p) => this.handle(p, "created"))
      .on("change", (p) => this.handle(p, "modified"))
      .on("unlink", (p) => this.handle(p, "removed"));
  }

  async stop(): Promise<void> {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    await this.watcher?.close();
    this.watcher = null;
  }

  private handle(absPath: string, kind: ActivityKind): void {
    const entry = this.deriveActivity(absPath, kind);
    if (entry) {
      for (const listener of this.activityListeners) listener(entry);
    }
    this.scheduleInvalidation();
  }

  private scheduleInvalidation(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      for (const listener of this.invalidatedListeners) listener();
    }, this.debounceMs);
  }

  /** Translate a changed path into a human-legible feed entry. */
  private deriveActivity(
    absPath: string,
    kind: ActivityKind,
  ): ActivityEntry | null {
    const rel = path.relative(this.openspecDir, absPath).split(path.sep);
    const base: Omit<ActivityEntry, "targetType" | "targetId" | "detail"> = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      kind,
    };
    const verb =
      kind === "created" ? "added" : kind === "removed" ? "removed" : "updated";

    if (rel[0] === "changes" && rel[1] === "archive" && rel[2]) {
      return {
        ...base,
        targetType: "change",
        targetId: rel[2],
        detail: kind === "created" ? "Change archived" : `Archive ${verb}`,
      };
    }

    if (rel[0] === "changes" && rel[1]) {
      const change = rel[1];
      const artifact = rel[rel.length - 1];
      if (rel.length <= 2 || artifact === "README.md") {
        return {
          ...base,
          targetType: "change",
          targetId: change,
          detail: `Change ${verb}`,
        };
      }
      if (rel[2] === "specs") {
        return {
          ...base,
          targetType: "artifact",
          targetId: change,
          detail: `Delta ${verb}: ${rel[3] ?? "spec"}`,
        };
      }
      return {
        ...base,
        targetType: "artifact",
        targetId: change,
        detail: `${artifact.replace(/\.md$/, "")} ${verb}`,
      };
    }

    if (rel[0] === "specs" && rel[1]) {
      return {
        ...base,
        targetType: "spec",
        targetId: rel[1],
        detail: `Spec ${verb}`,
      };
    }

    return null;
  }
}

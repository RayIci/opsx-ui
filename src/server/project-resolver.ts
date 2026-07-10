import { existsSync } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import type { ProjectSource, ProjectView } from "@shared/contracts.js";

export interface RegisteredStore {
  id: string;
  name: string;
  root: string;
}

/**
 * Resolves which OpenSpec project the viewer points at (design D6). Owns cwd
 * detection, the `-g` global-mode decision, the init-fallback signal, and
 * store discovery — isolated from rendering and from the source port so launch
 * logic has a single home (SRP).
 */
export class ProjectResolver {
  /** True when `openspec/` exists directly under `dir`. */
  static hasOpenSpec(dir: string): boolean {
    return existsSync(path.join(dir, "openspec"));
  }

  /**
   * Resolve the current directory as a project. Returns `null` when no
   * `openspec/` is present so the caller can offer to initialize or pick
   * another project (viewer-cli: init fallback).
   */
  static fromCwd(cwd: string): ProjectView | null {
    if (!ProjectResolver.hasOpenSpec(cwd)) return null;
    return ProjectResolver.forDirectory(cwd, "cwd");
  }

  /** Build a ProjectView for an explicitly chosen directory. */
  static forDirectory(dir: string, source: ProjectSource): ProjectView {
    return {
      root: path.resolve(dir),
      name: path.basename(path.resolve(dir)) || dir,
      source,
      storeId: null,
    };
  }

  /** Build a ProjectView for a registered store. */
  static forStore(store: RegisteredStore): ProjectView {
    return {
      root: store.root,
      name: store.name || store.id,
      source: "store",
      storeId: store.id,
    };
  }

  /** Discover registered stores via `openspec store list --json`. */
  static async listStores(bin = "openspec"): Promise<RegisteredStore[]> {
    const stdout = await new Promise<string>((resolve) => {
      execFile(
        bin,
        ["store", "list", "--json", "--no-color"],
        { maxBuffer: 8 * 1024 * 1024 },
        (error, out) => resolve(error ? "" : out),
      );
    });
    if (!stdout.trim()) return [];
    try {
      const parsed = JSON.parse(stdout) as { stores?: unknown[] };
      return (parsed.stores ?? []).map((raw) => {
        const s = (raw ?? {}) as Record<string, unknown>;
        return {
          id: String(s.id ?? ""),
          name: typeof s.name === "string" ? s.name : String(s.id ?? ""),
          root: typeof s.root === "string" ? s.root : String(s.path ?? ""),
        };
      });
    } catch {
      return [];
    }
  }
}

import type { OpenSpecSource } from "./openspec-source.js";
import type { CliRunner } from "./cli-runner.js";
import type {
  ChangeSummary,
  DeltaView,
  SpecSummary,
  SpecView,
  StatusView,
  ValidationView,
} from "@shared/contracts.js";
import {
  mapChangeList,
  mapDeltas,
  mapSpec,
  mapSpecList,
  mapStatus,
  mapValidation,
} from "./mappers.js";
import { OpenSpecCliError, UnsupportedCliError } from "./errors.js";

const MIN_CLI_VERSION = "1.5.0";

export interface CliSourceOptions {
  /** When set, store-scoped commands are threaded with `--store <id>`. */
  storeId?: string | null;
}

/**
 * Read-only OpenSpecSource backed by the `openspec` CLI (design D2/D3).
 * Composes an injected CliRunner with the pure mappers; contains no rendering
 * or filesystem-mutating logic.
 */
export class CliOpenSpecSource implements OpenSpecSource {
  constructor(
    private readonly runner: CliRunner,
    private readonly options: CliSourceOptions = {},
  ) {}

  /** Append `--store <id>` to store-scoped commands when a store is active. */
  private scoped(args: string[]): string[] {
    return this.options.storeId
      ? [...args, "--store", this.options.storeId]
      : args;
  }

  private async json<T>(args: string[], map: (raw: unknown) => T): Promise<T> {
    const stdout = await this.runner.run(args);
    try {
      return map(JSON.parse(stdout) as unknown);
    } catch (error) {
      throw new OpenSpecCliError(
        `Could not parse JSON from openspec ${args.join(" ")}: ${
          (error as Error).message
        }`,
        args,
      );
    }
  }

  async version(): Promise<string> {
    const out = (await this.runner.run(["--version"])).trim();
    const found = out.split(/\s+/).pop() ?? out;
    if (compareSemver(found, MIN_CLI_VERSION) < 0) {
      throw new UnsupportedCliError(found, MIN_CLI_VERSION);
    }
    return found;
  }

  listChanges(): Promise<ChangeSummary[]> {
    return this.json(this.scoped(["list", "--json"]), mapChangeList);
  }

  listSpecs(): Promise<SpecSummary[]> {
    return this.json(this.scoped(["list", "--specs", "--json"]), mapSpecList);
  }

  getSpec(specId: string): Promise<SpecView> {
    return this.json(
      this.scoped(["show", specId, "--json", "--type", "spec"]),
      mapSpec,
    );
  }

  getDeltas(changeId: string): Promise<DeltaView> {
    return this.json(
      this.scoped(["show", changeId, "--json", "--deltas-only"]),
      mapDeltas,
    );
  }

  getStatus(changeId: string): Promise<StatusView> {
    return this.json(
      this.scoped(["status", "--change", changeId, "--json"]),
      mapStatus,
    );
  }

  validateChanges(): Promise<ValidationView[]> {
    return this.json(
      this.scoped(["validate", "--changes", "--json"]),
      mapValidation,
    );
  }
}

/** Minimal semver compare (major.minor.patch). Returns -1 / 0 / 1. */
export function compareSemver(a: string, b: string): number {
  const pa = a
    .replace(/^v/, "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const pb = b
    .replace(/^v/, "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return Math.sign(diff);
  }
  return 0;
}

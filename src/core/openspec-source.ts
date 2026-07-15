import type {
  ChangeSummary,
  DeltaView,
  SpecSummary,
  SpecView,
  StatusView,
  ValidationView,
} from "../shared/contracts.js";

/**
 * The single seam between opsx-ui and OpenSpec (design D2).
 *
 * Everything above this interface deals only in typed view-models and never
 * knows whether the data came from the CLI, a future node library, or an HTTP
 * API. This is what keeps the app testable (mock it) and extensible (swap the
 * implementation) without touching the server or UI.
 *
 * Implementations MUST be read-only: no method may create, edit, or delete
 * anything under a project's `openspec/` directory.
 */
export interface OpenSpecSource {
  /** Verify OpenSpec is present and supported; returns the detected version. */
  version(): Promise<string>;

  /** Active changes, most-recent first. */
  listChanges(): Promise<ChangeSummary[]>;

  /** Current specifications (capabilities) in the project. */
  listSpecs(): Promise<SpecSummary[]>;

  /** A single current specification, fully expanded. */
  getSpec(specId: string): Promise<SpecView>;

  /** The deltas a change proposes, grouped by operation. */
  getDeltas(changeId: string): Promise<DeltaView>;

  /** Artifact-completion status for a change. */
  getStatus(changeId: string): Promise<StatusView>;

  /** Validation results for every active change (single CLI call). */
  validateChanges(): Promise<ValidationView[]>;
}

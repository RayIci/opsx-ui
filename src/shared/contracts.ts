/**
 * Wire contracts shared by the server (which produces them via the
 * OpenSpecSource port) and the web app (which renders them). These are the
 * ONLY shape the UI knows about — it never sees raw OpenSpec CLI output.
 */

export type ChangeStatus = "in-progress" | "complete" | string;
export type ValidationStatus = "valid" | "invalid" | "unknown";
export type DeltaOperation = "ADDED" | "MODIFIED" | "REMOVED" | "RENAMED";
export type ArtifactStatus = "ready" | "blocked" | "done" | "pending" | string;
export type ActivityKind = "created" | "modified" | "removed";
export type ProjectSource = "cwd" | "store" | "picked";

export interface TaskProgress {
  completed: number;
  total: number;
}

/** One card on the change board. */
export interface ChangeSummary {
  name: string;
  status: ChangeStatus;
  tasks: TaskProgress;
  validation: ValidationStatus;
  lastModified: string | null;
}

export interface Scenario {
  rawText: string;
}

/** A single requirement. Note: OpenSpec JSON does not expose the
 *  `### Requirement: <name>` header, so `name` is best-effort / may be null. */
export interface Requirement {
  name: string | null;
  text: string;
  scenarios: Scenario[];
}

/** The current, on-disk specification for a capability. */
export interface SpecView {
  id: string;
  title: string;
  overview: string | null;
  requirements: Requirement[];
}

export interface SpecSummary {
  id: string;
  title: string;
  requirementCount: number;
}

/** One proposed change to a spec, grouped by operation. */
export interface Delta {
  spec: string;
  operation: DeltaOperation;
  description: string;
  requirement: Requirement | null;
}

/** All deltas a change proposes. */
export interface DeltaView {
  changeId: string;
  title: string;
  deltaCount: number;
  deltas: Delta[];
}

export interface ArtifactState {
  id: string;
  status: ArtifactStatus;
}

/** Artifact-completion status for a change. */
export interface StatusView {
  changeName: string;
  schema: string;
  isComplete: boolean;
  applyRequires: string[];
  artifacts: ArtifactState[];
}

export interface ValidationIssue {
  level: string;
  message: string;
}

export interface ValidationView {
  id: string;
  valid: boolean;
  issues: ValidationIssue[];
}

/** The resolved project the viewer is pointed at. */
export interface ProjectView {
  root: string;
  name: string;
  source: ProjectSource;
  storeId: string | null;
}

/** An entry in the live activity feed. */
export interface ActivityEntry {
  id: string;
  timestamp: string;
  kind: ActivityKind;
  targetType: "change" | "spec" | "artifact" | "unknown";
  targetId: string;
  detail: string;
}

/** The full board-level snapshot pushed to clients on every change. */
export interface Snapshot {
  project: ProjectView;
  changes: ChangeSummary[];
  specs: SpecSummary[];
  generatedAt: string;
}

/** Messages pushed from server to browser over the WebSocket. */
export type ServerMessage =
  | { type: "snapshot"; payload: Snapshot }
  | { type: "activity"; payload: ActivityEntry }
  | { type: "error"; payload: { message: string } };

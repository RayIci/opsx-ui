/**
 * Wire contracts shared by the server (which produces them via the
 * OpenSpecSource port) and the web app (which renders them). These are the
 * ONLY shape the UI knows about — it never sees raw OpenSpec CLI output.
 */

export type ChangeStatus = "in-progress" | "complete" | string;
export type ValidationStatus = "valid" | "invalid" | "unknown";
export type DeltaOperation = "ADDED" | "MODIFIED" | "REMOVED" | "RENAMED";

/** The file-backed document artifacts OpenSpec writes for a change, in reading
 *  order. Single source of truth for the archive reader and the manifest. */
export const DOCUMENT_ARTIFACT_IDS = ["proposal", "design", "tasks"] as const;
export type DocumentArtifactId = (typeof DOCUMENT_ARTIFACT_IDS)[number];

/** Every destination in the change artifact navigation, in tab order: the three
 *  document artifacts plus the delta-backed spec changes. */
export const ARTIFACT_IDS = [...DOCUMENT_ARTIFACT_IDS, "spec-changes"] as const;
export type ArtifactId = (typeof ARTIFACT_IDS)[number];

/** Which of a change's artifacts exist on disk — lets the drill-in show every
 *  destination while disabling the ones a change doesn't (yet) have. */
export interface ChangeArtifactManifest {
  changeName: string;
  proposal: boolean;
  design: boolean;
  tasks: boolean;
  deltaCount: number;
}
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

/** A raw markdown document read from disk (for rendering as-is). */
export interface RawDocument {
  path: string;
  content: string;
}

/** One archived change, summarized from its directory on disk. */
export interface ArchivedChangeSummary {
  /** Full archive directory name, e.g. `2026-07-10-add-opsx-ui-viewer`. */
  id: string;
  /** Change name with the date prefix stripped. */
  name: string;
  /** Archive date parsed from the `YYYY-MM-DD-` prefix, if present. */
  archivedDate: string | null;
  tasks: TaskProgress;
}

export interface ArchivedArtifact {
  id: string;
  content: string;
}

export interface ArchivedDelta {
  spec: string;
  content: string;
}

/** An archived change opened for reading — artifacts and deltas as raw markdown. */
export interface ArchivedChangeDetail extends ArchivedChangeSummary {
  artifacts: ArchivedArtifact[];
  deltas: ArchivedDelta[];
}

/** The full board-level snapshot pushed to clients on every change. */
export interface Snapshot {
  project: ProjectView;
  changes: ChangeSummary[];
  specs: SpecSummary[];
  archived: ArchivedChangeSummary[];
  generatedAt: string;
}

/** Messages pushed from server to browser over the WebSocket. */
export type ServerMessage =
  | { type: "snapshot"; payload: Snapshot }
  | { type: "activity"; payload: ActivityEntry }
  | { type: "error"; payload: { message: string } };

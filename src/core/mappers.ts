import type {
  ChangeSummary,
  Delta,
  DeltaOperation,
  DeltaView,
  Requirement,
  Scenario,
  SpecSummary,
  SpecView,
  StatusView,
  ValidationIssue,
  ValidationStatus,
  ValidationView,
} from "@shared/contracts.js";

/**
 * Pure mappers from raw `openspec … --json` output to typed view-models.
 * Kept side-effect-free and independently testable (task 2.3, 2.5). Every
 * mapper defends against missing/extra fields so a CLI shape drift degrades
 * gracefully rather than crashing a render.
 */

type Json = Record<string, unknown>;

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function mapScenario(raw: unknown): Scenario {
  const obj = (raw ?? {}) as Json;
  return { rawText: asString(obj.rawText) };
}

function mapRequirement(raw: unknown): Requirement {
  const obj = (raw ?? {}) as Json;
  return {
    name: typeof obj.name === "string" ? obj.name : null,
    text: asString(obj.text),
    scenarios: asArray(obj.scenarios).map(mapScenario),
  };
}

export function mapChangeList(raw: unknown): ChangeSummary[] {
  const obj = (raw ?? {}) as Json;
  return asArray(obj.changes).map((entry): ChangeSummary => {
    const c = (entry ?? {}) as Json;
    const completed = asNumber(c.completedTasks);
    const total = asNumber(c.totalTasks);
    return {
      name: asString(c.name),
      status: asString(c.status, "in-progress"),
      tasks: { completed, total },
      validation: "unknown",
      lastModified: typeof c.lastModified === "string" ? c.lastModified : null,
    };
  });
}

export function mapSpecList(raw: unknown): SpecSummary[] {
  const obj = (raw ?? {}) as Json;
  return asArray(obj.specs).map((entry): SpecSummary => {
    const s = (entry ?? {}) as Json;
    const id = asString(s.id);
    return {
      id,
      title: asString(s.title, id),
      requirementCount: asNumber(s.requirementCount),
    };
  });
}

export function mapSpec(raw: unknown): SpecView {
  const obj = (raw ?? {}) as Json;
  const id = asString(obj.id);
  return {
    id,
    title: asString(obj.title, id),
    overview: typeof obj.overview === "string" ? obj.overview : null,
    requirements: asArray(obj.requirements).map(mapRequirement),
  };
}

const KNOWN_OPERATIONS: DeltaOperation[] = [
  "ADDED",
  "MODIFIED",
  "REMOVED",
  "RENAMED",
];

function mapOperation(value: unknown): DeltaOperation {
  const upper = asString(value).toUpperCase();
  return (KNOWN_OPERATIONS.find((op) => op === upper) ??
    "MODIFIED") as DeltaOperation;
}

export function mapDeltas(raw: unknown): DeltaView {
  const obj = (raw ?? {}) as Json;
  const deltas = asArray(obj.deltas).map((entry): Delta => {
    const d = (entry ?? {}) as Json;
    return {
      spec: asString(d.spec),
      operation: mapOperation(d.operation),
      description: asString(d.description),
      requirement:
        d.requirement && typeof d.requirement === "object"
          ? mapRequirement(d.requirement)
          : null,
    };
  });
  return {
    changeId: asString(obj.id),
    title: asString(obj.title, asString(obj.id)),
    deltaCount: asNumber(obj.deltaCount, deltas.length),
    deltas,
  };
}

export function mapStatus(raw: unknown): StatusView {
  const obj = (raw ?? {}) as Json;
  return {
    changeName: asString(obj.changeName),
    schema: asString(obj.schemaName),
    isComplete: obj.isComplete === true,
    applyRequires: asArray(obj.applyRequires).map((x) => asString(x)),
    artifacts: asArray(obj.artifacts).map((entry) => {
      const a = (entry ?? {}) as Json;
      return { id: asString(a.id), status: asString(a.status) };
    }),
  };
}

function mapIssue(raw: unknown): ValidationIssue {
  if (typeof raw === "string") return { level: "error", message: raw };
  const obj = (raw ?? {}) as Json;
  return {
    level: asString(obj.level ?? obj.severity, "error"),
    message: asString(obj.message ?? obj.text, "Validation issue"),
  };
}

export function mapValidation(raw: unknown): ValidationView[] {
  const obj = (raw ?? {}) as Json;
  return asArray(obj.items).map((entry): ValidationView => {
    const i = (entry ?? {}) as Json;
    return {
      id: asString(i.id),
      valid: i.valid === true,
      issues: asArray(i.issues).map(mapIssue),
    };
  });
}

/** Fold a validation result into the board status a card renders. */
export function toValidationStatus(
  view: ValidationView | undefined,
): ValidationStatus {
  if (!view) return "unknown";
  return view.valid ? "valid" : "invalid";
}

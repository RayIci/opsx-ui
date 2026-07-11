import { describe, expect, it } from "vitest";
import {
  mapChangeList,
  mapDeltas,
  mapSpec,
  mapSpecList,
  mapStatus,
  mapValidation,
  toValidationStatus,
} from "./mappers.js";

// Captured from real `openspec … --json` output (v1.5.0).

describe("mapChangeList", () => {
  it("maps changes with task progress and defaults validation to unknown", () => {
    const result = mapChangeList({
      changes: [
        {
          name: "add-shortlink-analytics",
          completedTasks: 2,
          totalTasks: 4,
          lastModified: "2026-07-09T22:47:54.126Z",
          status: "in-progress",
        },
      ],
    });
    expect(result).toEqual([
      {
        name: "add-shortlink-analytics",
        status: "in-progress",
        tasks: { completed: 2, total: 4 },
        validation: "unknown",
        lastModified: "2026-07-09T22:47:54.126Z",
      },
    ]);
  });

  it("tolerates missing fields", () => {
    expect(mapChangeList({})).toEqual([]);
    const [c] = mapChangeList({ changes: [{ name: "x" }] });
    expect(c.tasks).toEqual({ completed: 0, total: 0 });
    expect(c.lastModified).toBeNull();
  });
});

describe("mapSpecList / mapSpec", () => {
  it("uses id as title fallback", () => {
    expect(
      mapSpecList({ specs: [{ id: "shortlinks", requirementCount: 2 }] }),
    ).toEqual([{ id: "shortlinks", title: "shortlinks", requirementCount: 2 }]);
  });

  it("expands requirements and scenarios", () => {
    const spec = mapSpec({
      id: "shortlinks",
      title: "shortlinks",
      overview: "Create and resolve short links.",
      requirements: [
        {
          text: "The system SHALL create a short code.",
          scenarios: [{ rawText: "- WHEN x" }],
        },
      ],
    });
    expect(spec.overview).toBe("Create and resolve short links.");
    expect(spec.requirements[0].scenarios[0].rawText).toBe("- WHEN x");
    expect(spec.requirements[0].name).toBeNull();
  });
});

describe("mapDeltas", () => {
  it("preserves operation grouping and requirement text", () => {
    const view = mapDeltas({
      id: "add-shortlink-analytics",
      title: "Add shortlink analytics",
      deltaCount: 2,
      deltas: [
        {
          spec: "shortlinks",
          operation: "ADDED",
          description: "Add requirement: …",
          requirement: {
            text: "The system SHALL expose total click count.",
            scenarios: [],
          },
        },
        {
          spec: "shortlinks",
          operation: "MODIFIED",
          description: "Modify requirement: …",
          requirement: { text: "…record a click event.", scenarios: [] },
        },
      ],
    });
    expect(view.deltaCount).toBe(2);
    expect(view.deltas.map((d) => d.operation)).toEqual(["ADDED", "MODIFIED"]);
    expect(view.deltas[0].requirement?.text).toContain("total click count");
  });

  it("falls back to a safe operation for unknown values", () => {
    const view = mapDeltas({
      deltas: [{ spec: "s", operation: "WEIRD", description: "" }],
    });
    expect(view.deltas[0].operation).toBe("MODIFIED");
    expect(view.deltas[0].requirement).toBeNull();
  });
});

describe("mapStatus", () => {
  it("maps artifacts and applyRequires", () => {
    const status = mapStatus({
      changeName: "add-shortlink-analytics",
      schemaName: "spec-driven",
      isComplete: false,
      applyRequires: ["tasks"],
      artifacts: [{ id: "proposal", status: "done" }],
    });
    expect(status.schema).toBe("spec-driven");
    expect(status.applyRequires).toEqual(["tasks"]);
    expect(status.artifacts[0]).toEqual({ id: "proposal", status: "done" });
  });
});

describe("mapValidation", () => {
  it("maps validation items and folds to a status", () => {
    const items = mapValidation({
      items: [{ id: "c", valid: true, issues: [] }],
    });
    expect(items[0].valid).toBe(true);
    expect(toValidationStatus(items[0])).toBe("valid");
    expect(toValidationStatus(undefined)).toBe("unknown");
    expect(toValidationStatus({ id: "x", valid: false, issues: [] })).toBe(
      "invalid",
    );
  });

  it("normalizes string and object issues", () => {
    const [item] = mapValidation({
      items: [
        {
          id: "c",
          valid: false,
          issues: ["bad thing", { level: "warn", message: "meh" }],
        },
      ],
    });
    expect(item.issues[0]).toEqual({ level: "error", message: "bad thing" });
    expect(item.issues[1]).toEqual({ level: "warn", message: "meh" });
  });
});

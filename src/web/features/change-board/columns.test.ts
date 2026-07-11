import { describe, expect, it } from "vitest";
import type { ArchivedChangeSummary, ChangeSummary } from "@shared/contracts";
import { activeStage, deriveColumns } from "./columns";

function change(name: string, completed: number, total: number): ChangeSummary {
  return {
    name,
    status: "in-progress",
    tasks: { completed, total },
    validation: "valid",
    lastModified: null,
  };
}

function archived(id: string): ArchivedChangeSummary {
  return {
    id,
    name: id,
    archivedDate: "2026-07-11",
    tasks: { completed: 3, total: 3 },
  };
}

describe("activeStage", () => {
  it("is proposed when no tasks are completed", () => {
    expect(activeStage(change("a", 0, 5))).toBe("proposed");
  });

  it("is in-progress when some but not all tasks are completed", () => {
    expect(activeStage(change("a", 2, 5))).toBe("in-progress");
  });

  it("is ready when all tasks are completed", () => {
    expect(activeStage(change("a", 5, 5))).toBe("ready");
  });

  it("treats a zero-task change as proposed, never ready", () => {
    expect(activeStage(change("a", 0, 0))).toBe("proposed");
  });
});

describe("deriveColumns", () => {
  it("places each change in exactly one column", () => {
    const columns = deriveColumns({
      changes: [
        change("fresh", 0, 4),
        change("working", 1, 4),
        change("done", 4, 4),
        change("empty", 0, 0),
      ],
      archived: [archived("old-one")],
    });

    expect(columns.proposed.map((c) => c.name)).toEqual(["fresh", "empty"]);
    expect(columns.inProgress.map((c) => c.name)).toEqual(["working"]);
    expect(columns.ready.map((c) => c.name)).toEqual(["done"]);
    expect(columns.archived.map((c) => c.id)).toEqual(["old-one"]);
  });

  it("returns empty columns without error when there are no changes", () => {
    const columns = deriveColumns({ changes: [], archived: [] });
    expect(columns.proposed).toEqual([]);
    expect(columns.inProgress).toEqual([]);
    expect(columns.ready).toEqual([]);
    expect(columns.archived).toEqual([]);
  });

  it("does not mutate the source archived array", () => {
    const source = { changes: [], archived: [archived("a")] };
    const columns = deriveColumns(source);
    columns.archived.push(archived("b"));
    expect(source.archived).toHaveLength(1);
  });
});

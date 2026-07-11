import type {
  ArchivedChangeSummary,
  ChangeSummary,
  Snapshot,
} from "@shared/contracts";

/** The active lifecycle stage a change is in, derived from its task progress. */
export type ActiveStage = "proposed" | "in-progress" | "ready";

export interface KanbanColumns {
  proposed: ChangeSummary[];
  inProgress: ChangeSummary[];
  ready: ChangeSummary[];
  archived: ArchivedChangeSummary[];
}

/**
 * Derive an active change's lifecycle stage from its task progress.
 *
 * A change with no tasks defined yet (`total === 0`) is Proposed, never Ready —
 * completing zero-of-zero tasks must not read as done.
 */
export function activeStage(change: ChangeSummary): ActiveStage {
  const { completed, total } = change.tasks;
  if (total > 0 && completed >= total) return "ready";
  if (completed > 0) return "in-progress";
  return "proposed";
}

/**
 * Project a snapshot onto the kanban's ordered lifecycle columns. Pure: every
 * active change lands in exactly one active column; archived changes fill the
 * terminal column from the snapshot's archived list.
 */
export function deriveColumns(
  snapshot: Pick<Snapshot, "changes" | "archived">,
): KanbanColumns {
  const proposed: ChangeSummary[] = [];
  const inProgress: ChangeSummary[] = [];
  const ready: ChangeSummary[] = [];

  for (const change of snapshot.changes) {
    switch (activeStage(change)) {
      case "ready":
        ready.push(change);
        break;
      case "in-progress":
        inProgress.push(change);
        break;
      default:
        proposed.push(change);
    }
  }

  return { proposed, inProgress, ready, archived: [...snapshot.archived] };
}

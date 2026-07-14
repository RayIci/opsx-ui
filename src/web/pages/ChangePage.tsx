import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useLiveState } from "@/lib/live-store";
import { SpecDiff } from "@/features/spec-diff/SpecDiff";
import { ChangeTasks } from "@/features/change-tasks/ChangeTasks";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { BackLink } from "./shared";

type View = "tasks" | "changes";

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "tasks", label: "Tasks" },
  { value: "changes", label: "Spec changes" },
];

/**
 * Drill-in for a single active change. Tasks and proposed spec deltas are two
 * separate views behind a switch (default: Tasks) rather than one crowded
 * scroll — see design D "distinct, switchable view".
 */
export function ChangePage() {
  const { name } = useParams();
  const { pulse } = useLiveState();
  const [view, setView] = useState<View>("tasks");

  if (!name) return <Navigate to="/board" replace />;

  return (
    <div>
      <BackLink to="/board" />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-lg font-semibold tracking-tight">
          {name}
        </h1>
        <SegmentedControl
          className="ml-auto"
          value={view}
          options={VIEW_OPTIONS}
          onChange={setView}
        />
      </div>
      {view === "tasks" ? (
        <ChangeTasks name={name} revision={pulse} />
      ) : (
        <SpecDiff changeId={name} revision={pulse} />
      )}
    </div>
  );
}

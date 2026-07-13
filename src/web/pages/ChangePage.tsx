import { Navigate, useParams } from "react-router-dom";
import { useLiveState } from "@/lib/live-store";
import { SpecDiff } from "@/features/spec-diff/SpecDiff";
import { BackLink } from "./shared";

/** Drill-in for a single active change's proposed spec deltas. */
export function ChangePage() {
  const { name } = useParams();
  const { pulse } = useLiveState();

  if (!name) return <Navigate to="/board" replace />;

  return (
    <div>
      <BackLink to="/board" />
      <SpecDiff changeId={name} revision={pulse} />
    </div>
  );
}

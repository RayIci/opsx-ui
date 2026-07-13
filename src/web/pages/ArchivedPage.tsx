import { Navigate, useParams } from "react-router-dom";
import { useLiveState } from "@/lib/live-store";
import { ArchivedChange } from "@/features/archive-browser/ArchivedChange";
import { BackLink } from "./shared";

/** Drill-in for a single archived change, rendered read-only. */
export function ArchivedPage() {
  const { id } = useParams();
  const { pulse } = useLiveState();

  if (!id) return <Navigate to="/archive" replace />;

  return (
    <div>
      <BackLink to="/archive" label="Archive" />
      <ArchivedChange id={id} revision={pulse} />
    </div>
  );
}

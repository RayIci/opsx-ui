import { useNavigate } from "react-router-dom";
import { useLiveState } from "@/lib/live-store";
import { ChangeBoard } from "@/features/change-board/ChangeBoard";
import { CenteredLoader } from "./shared";

/** The Board destination: the lifecycle kanban alone. */
export function BoardPage() {
  const navigate = useNavigate();
  const { snapshot } = useLiveState();

  if (!snapshot) return <CenteredLoader />;

  return (
    <ChangeBoard
      changes={snapshot.changes}
      archived={snapshot.archived}
      onOpenChange={(name) => navigate(`/changes/${encodeURIComponent(name)}`)}
      onOpenArchived={(id) => navigate(`/archive/${encodeURIComponent(id)}`)}
    />
  );
}

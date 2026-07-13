import { useNavigate } from "react-router-dom";
import { useLiveState } from "@/lib/live-store";
import { ArchiveList } from "@/features/archive-browser/ArchiveList";
import { BackLink, CenteredLoader } from "./shared";

/** The list of archived changes. */
export function ArchivePage() {
  const navigate = useNavigate();
  const { snapshot } = useLiveState();

  if (!snapshot) return <CenteredLoader />;

  return (
    <div>
      <BackLink to="/board" />
      <ArchiveList
        archived={snapshot.archived}
        onOpen={(id) => navigate(`/archive/${encodeURIComponent(id)}`)}
      />
    </div>
  );
}

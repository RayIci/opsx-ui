import { Navigate, useParams } from "react-router-dom";
import type { ArtifactProvider } from "@/features/change-artifacts/ArtifactBrowser";
import {
  ArtifactBrowser,
  ArtifactEmpty,
  ARTIFACT_LABELS,
  orderedArtifactTabs,
} from "@/features/change-artifacts/ArtifactBrowser";
import { MarkdownArtifact } from "@/components/MarkdownArtifact";
import { ChangeTasks } from "@/features/change-tasks/ChangeTasks";
import { SpecDiff } from "@/features/spec-diff/SpecDiff";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { useLiveState } from "@/lib/live-store";
import { Loader2 } from "lucide-react";
import { BackLink } from "./shared";

/**
 * Drill-in for a single active change. Its four artifacts — Proposal, Design,
 * Tasks, Spec changes — are read through the shared artifact nav (default:
 * Proposal), the same way an archived change is read.
 */
export function ChangePage() {
  const { name } = useParams();
  const { pulse } = useLiveState();

  if (!name) return <Navigate to="/board" replace />;

  return (
    <div>
      <BackLink to="/board" />
      <h1 className="mb-6 font-mono text-lg font-semibold tracking-tight">
        {name}
      </h1>
      <LiveArtifacts name={name} revision={pulse} />
    </div>
  );
}

/**
 * Builds the live `ArtifactProvider`: the manifest decides which tabs are
 * enabled without fetching every file; the active tab's content is fetched
 * lazily (proposal/design/tasks as markdown, spec changes via SpecDiff).
 */
function LiveArtifacts({ name, revision }: { name: string; revision: number }) {
  const manifest = useAsync(() => api.artifacts(name), [name, revision]);

  if (manifest.loading && !manifest.data)
    return (
      <div className="text-muted-foreground flex justify-center py-16">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );

  const m = manifest.data;
  const provider: ArtifactProvider = {
    tabs: orderedArtifactTabs({
      proposal: m?.proposal ?? false,
      design: m?.design ?? false,
      tasks: m?.tasks ?? false,
      "spec-changes": (m?.deltaCount ?? 0) > 0,
    }),
    renderArtifact: (id) => {
      switch (id) {
        case "tasks":
          return <ChangeTasks name={name} revision={revision} />;
        case "spec-changes":
          return <SpecDiff changeId={name} revision={revision} />;
        default:
          return (
            <MarkdownArtifact
              path={`changes/${name}/${id}.md`}
              revision={revision}
              empty={
                <ArtifactEmpty label={ARTIFACT_LABELS[id].toLowerCase()} />
              }
            />
          );
      }
    },
  };

  return <ArtifactBrowser provider={provider} />;
}

import type { ArchivedDelta } from "@shared/contracts";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { Markdown } from "@/components/Markdown";
import { Badge } from "@/components/ui/badge";
import type { ArtifactProvider } from "@/features/change-artifacts/ArtifactBrowser";
import {
  ArtifactBrowser,
  ArtifactEmpty,
  ARTIFACT_LABELS,
  orderedArtifactTabs,
} from "@/features/change-artifacts/ArtifactBrowser";
import { Loader2, Lock } from "lucide-react";

interface Props {
  id: string;
  revision: number;
}

/**
 * A frozen, read-only view of an archived change, read through the same
 * artifact nav as an active change: Proposal, Design, Tasks, Spec changes, one
 * at a time. The archived payload already carries every artifact and delta, so
 * the provider is built from in-memory content — no per-tab fetching. No
 * editing or re-running is offered.
 */
export function ArchivedChange({ id, revision }: Props) {
  const { data, error, loading } = useAsync(
    () => api.archived(id),
    [id, revision],
  );

  if (loading && !data)
    return (
      <div className="text-muted-foreground flex justify-center py-16">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  if (error)
    return (
      <div className="text-op-removed py-16 text-center text-sm">{error}</div>
    );
  if (!data) return null;

  // `data.artifacts` only ever holds proposal/design/tasks (a README in the
  // archive directory is never included), so it is not a nav destination.
  const has = (artifactId: string) =>
    data.artifacts.some((a) => a.id === artifactId);

  const provider: ArtifactProvider = {
    tabs: orderedArtifactTabs({
      proposal: has("proposal"),
      design: has("design"),
      tasks: has("tasks"),
      "spec-changes": data.deltas.length > 0,
    }),
    renderArtifact: (artifactId) => {
      if (artifactId === "spec-changes")
        return <ArchivedDeltas deltas={data.deltas} />;
      const artifact = data.artifacts.find((a) => a.id === artifactId);
      return artifact ? (
        <Markdown className="mx-auto max-w-3xl">{artifact.content}</Markdown>
      ) : (
        <ArtifactEmpty label={ARTIFACT_LABELS[artifactId].toLowerCase()} />
      );
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-semibold">{data.name}</h1>
          <Badge variant="secondary" className="gap-1">
            <Lock className="size-3" /> archived
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          {data.archivedDate ?? "—"} · {data.tasks.completed}/{data.tasks.total}{" "}
          tasks
        </p>
      </header>

      <ArtifactBrowser provider={provider} />
    </div>
  );
}

function ArchivedDeltas({ deltas }: { deltas: ArchivedDelta[] }) {
  if (deltas.length === 0) return <ArtifactEmpty label="spec changes" />;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {deltas.map((delta) => (
        <div key={delta.spec}>
          <p className="text-muted-foreground mb-1 font-mono text-xs">
            {delta.spec}
          </p>
          <Markdown>{delta.content}</Markdown>
        </div>
      ))}
    </div>
  );
}

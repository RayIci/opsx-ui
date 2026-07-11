import { useCallback, useEffect, useState } from "react";
import { api, type Bootstrap } from "@/lib/api";
import { liveStore, useLiveState } from "@/lib/live-store";
import { ChangeBoard } from "@/features/change-board/ChangeBoard";
import { ActivityFeed } from "@/features/activity-feed/ActivityFeed";
import { SpecDiff } from "@/features/spec-diff/SpecDiff";
import { SpecDetail } from "@/features/spec-browser/SpecDetail";
import { ArchiveList } from "@/features/archive-browser/ArchiveList";
import { ArchivedChange } from "@/features/archive-browser/ArchivedChange";
import { ProjectGate } from "@/features/project-gate/ProjectGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, RefreshCw, Loader2, Archive } from "lucide-react";

type View =
  | { kind: "board" }
  | { kind: "change"; changeId: string }
  | { kind: "spec"; specId: string }
  | { kind: "archive" }
  | { kind: "archived"; id: string };

export default function App() {
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
  const [view, setView] = useState<View>({ kind: "board" });
  const live = useLiveState();

  const load = useCallback(async () => {
    const data = await api.bootstrap();
    setBootstrap(data);
    if (data.project) {
      const snapshot = await api.refresh().catch(() => null);
      liveStore.seed(snapshot);
      liveStore.connect();
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!bootstrap) {
    return (
      <div className="text-muted-foreground flex min-h-dvh items-center justify-center">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (!bootstrap.project) {
    return <ProjectGate bootstrap={bootstrap} onOpened={() => void load()} />;
  }

  const snapshot = live.snapshot;
  const isLive = live.connection === "open";
  const archivedCount = snapshot?.archived.length ?? 0;
  const backTarget: View | null =
    view.kind === "archived" ? { kind: "archive" } : view.kind === "board" ? null : { kind: "board" };

  return (
    <div className="min-h-dvh">
      <Header
        projectName={bootstrap.project.name}
        version={bootstrap.version}
        live={isLive}
        archivedCount={archivedCount}
        onArchive={() => setView({ kind: "archive" })}
        back={backTarget}
        onBack={() => backTarget && setView(backTarget)}
        onRefresh={() => void api.refresh()}
      />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          {view.kind === "board" && snapshot && (
            <ChangeBoard
              changes={snapshot.changes}
              specs={snapshot.specs}
              onOpenChange={(changeId) => setView({ kind: "change", changeId })}
              onOpenSpec={(specId) => setView({ kind: "spec", specId })}
            />
          )}
          {view.kind === "change" && <SpecDiff changeId={view.changeId} revision={live.pulse} />}
          {view.kind === "spec" && <SpecDetail specId={view.specId} revision={live.pulse} />}
          {view.kind === "archive" && snapshot && (
            <ArchiveList
              archived={snapshot.archived}
              onOpen={(id) => setView({ kind: "archived", id })}
            />
          )}
          {view.kind === "archived" && <ArchivedChange id={view.id} revision={live.pulse} />}
          {view.kind === "board" && !snapshot && (
            <div className="text-muted-foreground flex justify-center py-24">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
        </main>

        <div className="lg:sticky lg:top-20 lg:h-[calc(100dvh-6rem)]">
          <ActivityFeed entries={live.activity} live={isLive} />
        </div>
      </div>
    </div>
  );
}

function Header({
  projectName,
  version,
  live,
  archivedCount,
  onArchive,
  back,
  onBack,
  onRefresh,
}: {
  projectName: string;
  version: string | null;
  live: boolean;
  archivedCount: number;
  onArchive: () => void;
  back: View | null;
  onBack: () => void;
  onRefresh: () => void;
}) {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-6 py-3">
        {back ? (
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
            <ArrowLeft /> Back
          </Button>
        ) : (
          <span className="font-display text-base font-semibold tracking-tight">opsx-ui</span>
        )}
        <div className="ml-1 flex items-baseline gap-2">
          <span className="font-mono text-sm">{projectName}</span>
          {version && <span className="text-muted-foreground text-xs">openspec {version}</span>}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onArchive} className="gap-1.5">
            <Archive className="size-4" /> Archive
            {archivedCount > 0 && (
              <span className="text-muted-foreground tabular-nums">{archivedCount}</span>
            )}
          </Button>
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span
              className={cn("size-2 rounded-full", live ? "bg-op-added" : "bg-op-modified animate-pulse")}
            />
            {live ? "live" : "reconnecting"}
          </span>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh">
            <RefreshCw />
          </Button>
        </div>
      </div>
    </header>
  );
}

import { useCallback, useEffect, useState } from "react";
import { api, type Bootstrap } from "@/lib/api";
import { liveStore, useLiveState } from "@/lib/live-store";
import { ChangeBoard } from "@/features/change-board/ChangeBoard";
import { ActivityFeed } from "@/features/activity-feed/ActivityFeed";
import { SpecDiff } from "@/features/spec-diff/SpecDiff";
import { SpecDetail } from "@/features/spec-browser/SpecDetail";
import { ProjectGate } from "@/features/project-gate/ProjectGate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";

type View =
  | { kind: "board" }
  | { kind: "change"; changeId: string }
  | { kind: "spec"; specId: string };

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

  return (
    <div className="min-h-dvh">
      <Header
        projectName={bootstrap.project.name}
        version={bootstrap.version}
        live={isLive}
        canGoBack={view.kind !== "board"}
        onBack={() => setView({ kind: "board" })}
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
          {view.kind === "change" && (
            <SpecDiff changeId={view.changeId} revision={live.pulse} />
          )}
          {view.kind === "spec" && (
            <SpecDetail specId={view.specId} revision={live.pulse} />
          )}
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
  canGoBack,
  onBack,
  onRefresh,
}: {
  projectName: string;
  version: string | null;
  live: boolean;
  canGoBack: boolean;
  onBack: () => void;
  onRefresh: () => void;
}) {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-6 py-3">
        {canGoBack ? (
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
            <ArrowLeft /> Board
          </Button>
        ) : (
          <span className="font-display text-sm font-bold tracking-tight">opsx-ui</span>
        )}
        <div className="ml-1 flex items-baseline gap-2">
          <span className="font-mono text-sm">{projectName}</span>
          {version && <span className="text-muted-foreground text-xs">openspec {version}</span>}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "size-2 rounded-full",
                live ? "bg-op-added" : "bg-op-modified animate-pulse",
              )}
            />
            {live ? "live" : "reconnecting"}
          </span>
          <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh">
            <RefreshCw />
          </Button>
        </div>
      </div>
    </header>
  );
}

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
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Archive,
  CircleAlert,
} from "lucide-react";

type View =
  | { kind: "board" }
  | { kind: "change"; changeId: string }
  | { kind: "spec"; specId: string }
  | { kind: "archive" }
  | { kind: "archived"; id: string };

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; bootstrap: Bootstrap };

export default function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [view, setView] = useState<View>({ kind: "board" });
  const live = useLiveState();

  const load = useCallback(async () => {
    setLoadState({ status: "loading" });
    try {
      const data = await api.bootstrap();
      if (data.project) {
        const snapshot = await api.refresh().catch(() => null);
        liveStore.seed(snapshot);
        liveStore.connect();
      }
      setLoadState({ status: "ready", bootstrap: data });
    } catch (error) {
      setLoadState({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadState.status === "loading") {
    return (
      <div className="text-muted-foreground flex min-h-dvh items-center justify-center">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (loadState.status === "error") {
    return (
      <LoadError message={loadState.message} onRetry={() => void load()} />
    );
  }

  const bootstrap = loadState.bootstrap;

  if (!bootstrap.project) {
    return <ProjectGate bootstrap={bootstrap} onOpened={() => void load()} />;
  }

  const snapshot = live.snapshot;
  const isLive = live.connection === "open";
  const archivedCount = snapshot?.archived.length ?? 0;
  const backTarget: View | null =
    view.kind === "archived"
      ? { kind: "archive" }
      : view.kind === "board"
        ? null
        : { kind: "board" };

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
              archived={snapshot.archived}
              onOpenChange={(changeId) => setView({ kind: "change", changeId })}
              onOpenSpec={(specId) => setView({ kind: "spec", specId })}
              onOpenArchived={(id) => setView({ kind: "archived", id })}
            />
          )}
          {view.kind === "change" && (
            <SpecDiff changeId={view.changeId} revision={live.pulse} />
          )}
          {view.kind === "spec" && (
            <SpecDetail specId={view.specId} revision={live.pulse} />
          )}
          {view.kind === "archive" && snapshot && (
            <ArchiveList
              archived={snapshot.archived}
              onOpen={(id) => setView({ kind: "archived", id })}
            />
          )}
          {view.kind === "archived" && (
            <ArchivedChange id={view.id} revision={live.pulse} />
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

function LoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="border-border flex max-w-md flex-col items-center gap-3 rounded-xl border p-8 text-center">
        <CircleAlert className="text-op-removed size-6" />
        <h1 className="font-display text-lg font-semibold">
          Couldn&apos;t reach the opsx-ui server
        </h1>
        <p className="text-muted-foreground text-sm">
          The viewer server isn&apos;t responding. In dev, make sure both
          processes are running — start them together with{" "}
          <code className="font-mono text-xs">npm run dev</code>.
        </p>
        <p className="text-muted-foreground/80 font-mono text-xs break-all">
          {message}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="mt-1"
        >
          <RefreshCw /> Retry
        </Button>
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
          <span className="font-display text-base font-semibold tracking-tight">
            opsx-ui
          </span>
        )}
        <div className="ml-1 flex items-baseline gap-2">
          <span className="font-mono text-sm">{projectName}</span>
          {version && (
            <span className="text-muted-foreground text-xs">
              openspec {version}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onArchive}
            className="gap-1.5"
          >
            <Archive className="size-4" /> Archive
            {archivedCount > 0 && (
              <span className="text-muted-foreground tabular-nums">
                {archivedCount}
              </span>
            )}
          </Button>
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "size-2 rounded-full",
                live ? "bg-op-added" : "bg-op-modified animate-pulse",
              )}
            />
            {live ? "live" : "reconnecting"}
          </span>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            title="Refresh"
          >
            <RefreshCw />
          </Button>
        </div>
      </div>
    </header>
  );
}

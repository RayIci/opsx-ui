import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { api, type Bootstrap } from "@/lib/api";
import { liveStore, useLiveState } from "@/lib/live-store";
import { useActivityDrawer } from "@/lib/activity-drawer";
import { ActivityDrawer } from "@/features/activity-feed/ActivityDrawer";
import { ProjectGate } from "@/features/project-gate/ProjectGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  Loader2,
  Archive,
  Activity,
  CircleAlert,
} from "lucide-react";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; bootstrap: Bootstrap };

/**
 * The app shell: owns the load lifecycle, the live-store connection, and the
 * persistent chrome (header nav + activity drawer). Routed pages render into
 * the Outlet and read live state from the shared store.
 */
export function Shell() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const live = useLiveState();
  const drawer = useActivityDrawer();

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

  const isLive = live.connection === "open";
  const archivedCount = live.snapshot?.archived.length ?? 0;

  return (
    <div className="min-h-dvh">
      <Header
        projectName={bootstrap.project.name}
        version={bootstrap.version}
        live={isLive}
        archivedCount={archivedCount}
        activityOpen={drawer.open}
        onToggleActivity={drawer.toggle}
        onRefresh={() => void api.refresh()}
      />

      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <Outlet />
      </div>

      <ActivityDrawer
        open={drawer.open}
        onClose={drawer.close}
        entries={live.activity}
        live={isLive}
      />
    </div>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
    isActive
      ? "bg-accent text-foreground"
      : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
  );

function Header({
  projectName,
  version,
  live,
  archivedCount,
  activityOpen,
  onToggleActivity,
  onRefresh,
}: {
  projectName: string;
  version: string | null;
  live: boolean;
  archivedCount: number;
  activityOpen: boolean;
  onToggleActivity: () => void;
  onRefresh: () => void;
}) {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-6 py-3">
        <span className="font-display text-base font-semibold tracking-tight">
          opsx-ui
        </span>
        <nav className="ml-2 flex items-center gap-1">
          <NavLink to="/board" className={navLinkClass}>
            Board
          </NavLink>
          <NavLink to="/specs" className={navLinkClass}>
            Specs
          </NavLink>
        </nav>
        <div className="ml-1 flex items-baseline gap-2">
          <span className="font-mono text-sm">{projectName}</span>
          {version && (
            <span className="text-muted-foreground text-xs">
              openspec {version}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <NavLink
            to="/archive"
            className={({ isActive }) =>
              cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
              )
            }
          >
            <Archive className="size-4" /> Archive
            {archivedCount > 0 && (
              <span className="tabular-nums">{archivedCount}</span>
            )}
          </NavLink>
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "size-2 rounded-full",
                live ? "bg-op-added" : "bg-op-modified animate-pulse",
              )}
            />
            {live ? "live" : "reconnecting"}
          </span>
          <Button
            variant={activityOpen ? "secondary" : "ghost"}
            size="icon"
            onClick={onToggleActivity}
            title="Activity"
            aria-pressed={activityOpen}
          >
            <Activity />
          </Button>
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

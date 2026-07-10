import { useState } from "react";
import type { Bootstrap } from "@/lib/api";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Database, FolderGit2, TriangleAlert } from "lucide-react";

interface Props {
  bootstrap: Bootstrap;
  onOpened: () => void;
}

/**
 * Shown when no project is open — either `opsx-ui -g` (global mode) or a cwd
 * with no `openspec/` (init fallback). Lets the user open the current
 * directory, a registered store, or a typed path.
 */
export function ProjectGate({ bootstrap, onOpened }: Props) {
  const [dir, setDir] = useState(bootstrap.cwd);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function open(body: { dir?: string; storeId?: string }) {
    setBusy(true);
    setError(null);
    try {
      await api.open(body);
      onOpened();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">opsx-ui</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Open an OpenSpec project to view its specs and changes.
        </p>
      </div>

      {bootstrap.cwdHasOpenSpec ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Current directory</p>
              <p className="text-muted-foreground truncate font-mono text-xs">{bootstrap.cwd}</p>
            </div>
            <Button onClick={() => open({ dir: bootstrap.cwd })} disabled={busy}>
              <FolderOpen /> Open
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-start gap-3">
            <TriangleAlert className="text-op-modified mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 text-sm">
              <p className="font-medium">No OpenSpec here</p>
              <p className="text-muted-foreground truncate font-mono text-xs">{bootstrap.cwd}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Run <code className="font-mono">openspec init</code> there, or open another
                project below.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {bootstrap.stores.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Database className="size-3.5" /> Registered stores
          </p>
          {bootstrap.stores.map((store) => (
            <button
              key={store.id}
              onClick={() => open({ storeId: store.id })}
              disabled={busy}
              className="border-border hover:border-ring/60 hover:bg-accent/40 flex items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-colors disabled:opacity-50"
            >
              <span className="text-sm font-medium">{store.name}</span>
              <span className="text-muted-foreground truncate font-mono text-xs">{store.id}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <FolderGit2 className="size-3.5" /> Open a path
        </p>
        <div className="flex gap-2">
          <input
            value={dir}
            onChange={(e) => setDir(e.target.value)}
            spellCheck={false}
            className="border-input bg-background focus-visible:ring-ring h-9 flex-1 rounded-md border px-3 font-mono text-xs outline-none focus-visible:ring-2"
            placeholder="/path/to/project"
          />
          <Button variant="outline" onClick={() => open({ dir })} disabled={busy}>
            Open
          </Button>
        </div>
      </div>

      {error && <p className="text-op-removed text-center text-xs">{error}</p>}
    </div>
  );
}

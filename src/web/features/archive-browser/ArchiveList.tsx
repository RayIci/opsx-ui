import type { ArchivedChangeSummary } from "@shared/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Archive as ArchiveIcon } from "lucide-react";

interface Props {
  archived: ArchivedChangeSummary[];
  onOpen: (id: string) => void;
}

export function ArchiveList({ archived, onOpen }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-xl font-semibold">Archive</h1>
        <span className="text-muted-foreground text-sm tabular-nums">
          {archived.length}
        </span>
      </div>

      {archived.length === 0 ? (
        <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <ArchiveIcon className="size-5" />
          <p className="text-foreground text-sm font-medium">
            Nothing archived yet
          </p>
          <p className="max-w-xs text-xs">
            Completed changes moved to{" "}
            <code className="font-mono">changes/archive/</code> appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {archived.map((change) => (
            <Card
              key={change.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpen(change.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(change.id);
                }
              }}
              className="hover:border-ring/60 cursor-pointer transition-colors hover:shadow-md"
            >
              <CardContent className="flex flex-col gap-3 py-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-sm">{change.name}</span>
                  <ArchiveIcon className="text-muted-foreground size-4 shrink-0" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {change.archivedDate ?? "—"}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {change.tasks.completed}/{change.tasks.total} tasks
                  </span>
                </div>
                <Progress
                  value={change.tasks.completed}
                  max={change.tasks.total}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

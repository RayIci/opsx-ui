import type { ActivityEntry, ActivityKind } from "@shared/contracts";
import { cn } from "@/lib/utils";
import { timeOfDay } from "@/lib/format";
import { FilePlus2, FilePenLine, FileX2, Radio } from "lucide-react";

const KIND: Record<ActivityKind, { color: string; Icon: typeof FilePlus2 }> = {
  created: { color: "text-op-added", Icon: FilePlus2 },
  modified: { color: "text-op-modified", Icon: FilePenLine },
  removed: { color: "text-op-removed", Icon: FileX2 },
};

interface Props {
  entries: ActivityEntry[];
  live: boolean;
}

export function ActivityFeed({ entries, live }: Props) {
  return (
    <aside className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2">
        <Radio className={cn("size-4", live ? "text-op-added" : "text-muted-foreground")} />
        <h2 className="text-sm font-semibold">Activity</h2>
        <span
          className={cn(
            "ml-auto size-2 rounded-full transition-colors",
            live ? "bg-op-added animate-pulse" : "bg-muted-foreground/40",
          )}
          title={live ? "live" : "reconnecting…"}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-xs">
            Waiting for changes… edits by an agent show up here instantly.
          </p>
        ) : (
          <ol className="flex flex-col gap-0.5">
            {entries.map((entry) => {
              const kind = KIND[entry.kind];
              return (
                <li
                  key={entry.id}
                  className="hover:bg-accent/40 flex items-start gap-2.5 rounded-md px-2 py-1.5"
                >
                  <kind.Icon className={cn("mt-0.5 size-3.5 shrink-0", kind.color)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">
                      <span className="text-muted-foreground">{entry.targetType}</span>{" "}
                      <span className="font-mono">{entry.targetId}</span>
                    </p>
                    <p className="text-muted-foreground truncate text-[0.7rem]">
                      {entry.detail}
                    </p>
                  </div>
                  <time className="text-muted-foreground/70 shrink-0 font-mono text-[0.65rem] tabular-nums">
                    {timeOfDay(entry.timestamp)}
                  </time>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </aside>
  );
}

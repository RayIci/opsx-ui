import type { ChangeSummary } from "@shared/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";
import { validationLabel } from "@/lib/operations";
import { CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";

const HEALTH = {
  valid: { color: "text-op-added", Icon: CheckCircle2 },
  invalid: { color: "text-op-removed", Icon: CircleAlert },
  unknown: { color: "text-muted-foreground", Icon: CircleDashed },
} as const;

interface Props {
  change: ChangeSummary;
  onOpen: (name: string) => void;
}

export function ChangeCard({ change, onOpen }: Props) {
  const health = HEALTH[change.validation] ?? HEALTH.unknown;
  const { completed, total } = change.tasks;
  const done = total > 0 && completed === total;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(change.name)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(change.name);
        }
      }}
      className="hover:border-ring/60 cursor-pointer transition-colors hover:shadow-md"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-mono text-[0.95rem] tracking-tight">
            {change.name}
          </CardTitle>
          <span
            className={cn("flex items-center gap-1 text-xs", health.color)}
            title={`validation: ${validationLabel(change.validation)}`}
          >
            <health.Icon className="size-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground capitalize">{change.status}</span>
          <span className={cn("tabular-nums", done ? "text-op-added" : "text-muted-foreground")}>
            {completed}/{total} tasks
          </span>
        </div>
        <Progress value={completed} max={total} />
        <div className="text-muted-foreground text-xs">
          updated {relativeTime(change.lastModified)}
        </div>
      </CardContent>
    </Card>
  );
}

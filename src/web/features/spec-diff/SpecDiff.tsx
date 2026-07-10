import { useMemo, useState } from "react";
import type { Delta } from "@shared/contracts";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { RequirementView } from "@/components/RequirementView";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OPERATION_ORDER, operationAccent, operationBadge } from "@/lib/operations";
import { Loader2, GitCompareArrows, FileQuestion } from "lucide-react";

interface Props {
  changeId: string;
  revision: number;
}

/**
 * The v1 diff (design D4): JSON-driven and operation-grouped. Left = the
 * current spec's requirements; right = this change's proposed deltas, grouped
 * and colored by operation. No markdown parsing, no lossy old↔new pairing.
 */
export function SpecDiff({ changeId, revision }: Props) {
  const deltas = useAsync(() => api.deltas(changeId), [changeId, revision]);

  const affectedSpecs = useMemo(() => {
    const set = new Set((deltas.data?.deltas ?? []).map((d) => d.spec));
    return [...set];
  }, [deltas.data]);

  const [selected, setSelected] = useState<string | null>(null);
  const activeSpec = selected && affectedSpecs.includes(selected) ? selected : affectedSpecs[0] ?? null;

  if (deltas.loading && !deltas.data)
    return <Centered><Loader2 className="size-5 animate-spin" /></Centered>;
  if (deltas.error)
    return <Centered><span className="text-op-removed text-sm">{deltas.error}</span></Centered>;

  const deltaView = deltas.data;
  if (!deltaView || deltaView.deltas.length === 0) {
    return (
      <Empty
        title="No proposed spec changes"
        hint="This change doesn't alter any specification."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <GitCompareArrows className="text-muted-foreground size-4" />
        <h1 className="font-display text-lg font-semibold">{deltaView.title}</h1>
        <span className="text-muted-foreground text-sm tabular-nums">
          · {deltaView.deltaCount} delta{deltaView.deltaCount === 1 ? "" : "s"}
        </span>
      </div>

      {affectedSpecs.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {affectedSpecs.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelected(spec)}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors",
                spec === activeSpec
                  ? "border-ring bg-accent"
                  : "border-border text-muted-foreground hover:bg-accent/40",
              )}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      {activeSpec && (
        <DiffColumns
          specId={activeSpec}
          revision={revision}
          deltas={deltaView.deltas.filter((d) => d.spec === activeSpec)}
        />
      )}
    </div>
  );
}

function DiffColumns({
  specId,
  revision,
  deltas,
}: {
  specId: string;
  revision: number;
  deltas: Delta[];
}) {
  const current = useAsync(() => api.spec(specId), [specId, revision]);
  const grouped = OPERATION_ORDER.map((op) => ({
    op,
    items: deltas.filter((d) => d.operation === op),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Current truth */}
      <Column
        title="Current spec"
        subtitle={specId}
        badge={current.data ? `${current.data.requirements.length} req` : undefined}
      >
        {current.loading && !current.data ? (
          <Loader2 className="text-muted-foreground size-4 animate-spin" />
        ) : current.error || !current.data ? (
          <Empty
            title="New capability"
            hint={`No current spec for “${specId}” — this change introduces it.`}
            compact
          />
        ) : (
          current.data.requirements.map((req, i) => (
            <RequirementView key={i} requirement={req} />
          ))
        )}
      </Column>

      {/* Proposed changes */}
      <Column title="Proposed changes" subtitle="this change" badge={`${deltas.length}`}>
        {grouped.map((group) => (
          <div key={group.op} className="flex flex-col gap-2">
            <Badge variant={operationBadge(group.op)}>{group.op}</Badge>
            {group.items.map((delta, i) =>
              delta.requirement ? (
                <RequirementView
                  key={i}
                  requirement={delta.requirement}
                  accent={operationAccent(group.op)}
                />
              ) : (
                <p
                  key={i}
                  className="text-muted-foreground border-l-2 pl-3 text-xs"
                  style={{ borderColor: operationAccent(group.op) }}
                >
                  {delta.description}
                </p>
              ),
            )}
          </div>
        ))}
      </Column>
    </div>
  );
}

function Column({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-muted-foreground font-mono text-xs">{subtitle}</span>
        {badge && (
          <span className="text-muted-foreground ml-auto text-xs tabular-nums">{badge}</span>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="text-muted-foreground flex justify-center py-16">{children}</div>;
}

function Empty({
  title,
  hint,
  compact,
}: {
  title: string;
  hint: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-border text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed text-center",
        compact ? "py-8" : "py-16",
      )}
    >
      <FileQuestion className="size-5" />
      <p className="text-foreground text-sm font-medium">{title}</p>
      <p className="max-w-xs text-xs">{hint}</p>
    </div>
  );
}

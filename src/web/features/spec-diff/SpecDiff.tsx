import { useMemo, useState } from "react";
import type { Delta } from "@shared/contracts";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { RequirementView } from "@/components/RequirementView";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";
import {
  OPERATION_ORDER,
  operationAccent,
  operationBadge,
} from "@/lib/operations";
import { Loader2, GitCompareArrows, FileQuestion } from "lucide-react";

type ViewMode = "current" | "proposed" | "sidebyside";

const MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "proposed", label: "Proposed" },
  { value: "sidebyside", label: "Side-by-side" },
];

interface Props {
  changeId: string;
  revision: number;
}

/**
 * The diff (design D3/D4): a Current / Proposed / Side-by-side switch over
 * JSON-driven, operation-grouped deltas, rendered as markdown. Side-by-side is
 * the default; single-column modes render full width.
 */
export function SpecDiff({ changeId, revision }: Props) {
  const deltas = useAsync(() => api.deltas(changeId), [changeId, revision]);
  const [mode, setMode] = useState<ViewMode>("sidebyside");

  const affectedSpecs = useMemo(() => {
    const set = new Set((deltas.data?.deltas ?? []).map((d) => d.spec));
    return [...set];
  }, [deltas.data]);

  const [selected, setSelected] = useState<string | null>(null);
  const activeSpec =
    selected && affectedSpecs.includes(selected)
      ? selected
      : (affectedSpecs[0] ?? null);

  if (deltas.loading && !deltas.data)
    return (
      <Centered>
        <Loader2 className="size-5 animate-spin" />
      </Centered>
    );
  if (deltas.error)
    return (
      <Centered>
        <span className="text-op-removed text-sm">{deltas.error}</span>
      </Centered>
    );

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
      <div className="flex flex-wrap items-center gap-3">
        <GitCompareArrows className="text-muted-foreground size-4" />
        <h1 className="font-display text-xl font-semibold">
          {deltaView.title}
        </h1>
        <span className="text-muted-foreground text-sm tabular-nums">
          · {deltaView.deltaCount} delta{deltaView.deltaCount === 1 ? "" : "s"}
        </span>
        <SegmentedControl
          className="ml-auto"
          value={mode}
          options={MODE_OPTIONS}
          onChange={setMode}
        />
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
        <DiffPanes
          specId={activeSpec}
          revision={revision}
          mode={mode}
          deltas={deltaView.deltas.filter((d) => d.spec === activeSpec)}
        />
      )}
    </div>
  );
}

function DiffPanes({
  specId,
  revision,
  mode,
  deltas,
}: {
  specId: string;
  revision: number;
  mode: ViewMode;
  deltas: Delta[];
}) {
  const showCurrent = mode === "current" || mode === "sidebyside";
  const showProposed = mode === "proposed" || mode === "sidebyside";

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6",
        mode === "sidebyside" && "lg:grid-cols-2",
      )}
    >
      {showCurrent && <CurrentPane specId={specId} revision={revision} />}
      {showProposed && <ProposedPane specId={specId} deltas={deltas} />}
    </div>
  );
}

function CurrentPane({
  specId,
  revision,
}: {
  specId: string;
  revision: number;
}) {
  const current = useAsync(() => api.spec(specId), [specId, revision]);
  return (
    <Pane
      title="Current spec"
      subtitle={specId}
      badge={
        current.data ? `${current.data.requirements.length} req` : undefined
      }
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
    </Pane>
  );
}

function ProposedPane({ specId, deltas }: { specId: string; deltas: Delta[] }) {
  const grouped = OPERATION_ORDER.map((op) => ({
    op,
    items: deltas.filter((d) => d.operation === op),
  })).filter((g) => g.items.length > 0);

  return (
    <Pane title="Proposed changes" subtitle={specId} badge={`${deltas.length}`}>
      {grouped.length === 0 ? (
        <Empty
          title="No deltas for this spec"
          hint="This change leaves this spec unchanged."
          compact
        />
      ) : (
        grouped.map((group) => (
          <div key={group.op} className="flex flex-col gap-1">
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
                  className="text-muted-foreground border-l-2 pl-4 text-sm"
                  style={{ borderColor: operationAccent(group.op) }}
                >
                  {delta.description}
                </p>
              ),
            )}
          </div>
        ))
      )}
    </Pane>
  );
}

function Pane({
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
        <span className="text-muted-foreground font-mono text-xs">
          {subtitle}
        </span>
        {badge && (
          <span className="text-muted-foreground ml-auto text-xs tabular-nums">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground flex justify-center py-16">
      {children}
    </div>
  );
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

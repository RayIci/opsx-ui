import type {
  ArchivedChangeSummary,
  ChangeSummary,
  SpecSummary,
} from "@shared/contracts";
import { ChangeCard } from "./ChangeCard";
import { deriveColumns } from "./columns";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Layers, Archive as ArchiveIcon } from "lucide-react";

interface Props {
  changes: ChangeSummary[];
  specs: SpecSummary[];
  archived: ArchivedChangeSummary[];
  onOpenChange: (name: string) => void;
  onOpenSpec: (id: string) => void;
  onOpenArchived: (id: string) => void;
}

export function ChangeBoard({
  changes,
  specs,
  archived,
  onOpenChange,
  onOpenSpec,
  onOpenArchived,
}: Props) {
  const columns = deriveColumns({ changes, archived });

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Board</h2>
          <span className="text-muted-foreground text-sm tabular-nums">
            {changes.length} active
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <KanbanColumn
            title="Proposed"
            accent="bg-muted-foreground/50"
            count={columns.proposed.length}
            empty="No proposed changes"
          >
            {columns.proposed.map((change) => (
              <ChangeCard
                key={change.name}
                change={change}
                onOpen={onOpenChange}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn
            title="In progress"
            accent="bg-op-modified"
            count={columns.inProgress.length}
            empty="Nothing in progress"
          >
            {columns.inProgress.map((change) => (
              <ChangeCard
                key={change.name}
                change={change}
                onOpen={onOpenChange}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn
            title="Ready to archive"
            accent="bg-op-added"
            count={columns.ready.length}
            empty="Nothing ready yet"
          >
            {columns.ready.map((change) => (
              <ChangeCard
                key={change.name}
                change={change}
                onOpen={onOpenChange}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn
            title="Archived"
            accent="bg-border"
            count={columns.archived.length}
            empty="Nothing archived"
          >
            {columns.archived.map((change) => (
              <ArchivedMiniCard
                key={change.id}
                change={change}
                onOpen={onOpenArchived}
              />
            ))}
          </KanbanColumn>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Specifications</h2>
          <span className="text-muted-foreground text-sm tabular-nums">
            {specs.length}
          </span>
        </div>
        {specs.length === 0 ? (
          <EmptyState
            icon={<Layers className="size-5" />}
            title="No specifications yet"
            hint="Specs are the living truth. They'll show once a change is archived."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {specs.map((spec) => (
              <button
                key={spec.id}
                onClick={() => onOpenSpec(spec.id)}
                className="group border-border hover:border-ring/60 hover:bg-accent/40 flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors"
              >
                <span className="font-mono text-sm">{spec.title}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {spec.requirementCount} req
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function KanbanColumn({
  title,
  accent,
  count,
  empty,
  children,
}: {
  title: string;
  accent: string;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${accent}`} />
        <h3 className="text-foreground text-sm font-semibold">{title}</h3>
        <span className="text-muted-foreground text-xs tabular-nums">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {count === 0 ? (
          <div className="border-border text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-xs">
            {empty}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function ArchivedMiniCard({
  change,
  onOpen,
}: {
  change: ArchivedChangeSummary;
  onOpen: (id: string) => void;
}) {
  return (
    <Card
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
        <Progress value={change.tasks.completed} max={change.tasks.total} />
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
      {icon}
      <p className="text-foreground text-sm font-medium">{title}</p>
      <p className="max-w-xs text-xs">{hint}</p>
    </div>
  );
}

import type { ChangeSummary, SpecSummary } from "@shared/contracts";
import { ChangeCard } from "./ChangeCard";
import { Layers, Inbox } from "lucide-react";

interface Props {
  changes: ChangeSummary[];
  specs: SpecSummary[];
  onOpenChange: (name: string) => void;
  onOpenSpec: (id: string) => void;
}

export function ChangeBoard({ changes, specs, onOpenChange, onOpenSpec }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Changes in flight</h2>
          <span className="text-muted-foreground text-sm tabular-nums">
            {changes.length}
          </span>
        </div>
        {changes.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-5" />}
            title="No active changes"
            hint="When a change is proposed, it appears here — live."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {changes.map((change) => (
              <ChangeCard key={change.name} change={change} onOpen={onOpenChange} />
            ))}
          </div>
        )}
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

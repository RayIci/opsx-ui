import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { Markdown } from "@/components/Markdown";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, Lock } from "lucide-react";

interface Props {
  id: string;
  revision: number;
}

const ARTIFACT_LABEL: Record<string, string> = {
  proposal: "Proposal",
  design: "Design",
  tasks: "Tasks",
};

/**
 * A frozen, read-only view of an archived change: its artifacts and delta specs
 * rendered as markdown. No editing or re-running is offered (archive-browser).
 */
export function ArchivedChange({ id, revision }: Props) {
  const { data, error, loading } = useAsync(() => api.archived(id), [id, revision]);

  if (loading && !data)
    return <div className="text-muted-foreground flex justify-center py-16"><Loader2 className="size-5 animate-spin" /></div>;
  if (error)
    return <div className="text-op-removed py-16 text-center text-sm">{error}</div>;
  if (!data) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-semibold">{data.name}</h1>
          <Badge variant="secondary" className="gap-1">
            <Lock className="size-3" /> archived
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          {data.archivedDate ?? "—"} · {data.tasks.completed}/{data.tasks.total} tasks
        </p>
      </header>

      {data.artifacts.map((artifact) => (
        <Section key={artifact.id} title={ARTIFACT_LABEL[artifact.id] ?? artifact.id}>
          <Markdown>{artifact.content}</Markdown>
        </Section>
      ))}

      {data.deltas.length > 0 && (
        <Section title="Delta specs">
          <div className="flex flex-col gap-6">
            {data.deltas.map((delta) => (
              <div key={delta.spec}>
                <p className="text-muted-foreground mb-1 font-mono text-xs">{delta.spec}</p>
                <Markdown>{delta.content}</Markdown>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-muted-foreground border-border border-b pb-1 text-xs font-semibold uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </section>
  );
}

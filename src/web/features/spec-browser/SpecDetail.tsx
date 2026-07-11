import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { RequirementView } from "@/components/RequirementView";
import { Loader2 } from "lucide-react";

interface Props {
  specId: string;
  revision: number;
}

export function SpecDetail({ specId, revision }: Props) {
  const { data, error, loading } = useAsync(
    () => api.spec(specId),
    [specId, revision],
  );

  if (loading && !data)
    return (
      <Centered>
        <Loader2 className="size-5 animate-spin" />
      </Centered>
    );
  if (error)
    return (
      <Centered>
        <span className="text-op-removed text-sm">{error}</span>
      </Centered>
    );
  if (!data) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <header>
        <h1 className="font-mono text-xl font-semibold">{data.title}</h1>
        {data.overview && (
          <p className="text-muted-foreground mt-1 text-sm">{data.overview}</p>
        )}
        <p className="text-muted-foreground mt-2 text-xs tabular-nums">
          {data.requirements.length} requirement
          {data.requirements.length === 1 ? "" : "s"}
        </p>
      </header>
      <div className="flex flex-col gap-3">
        {data.requirements.map((req, i) => (
          <RequirementView key={i} requirement={req} />
        ))}
      </div>
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

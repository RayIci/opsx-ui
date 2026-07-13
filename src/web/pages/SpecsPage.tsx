import { NavLink, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { useLiveState } from "@/lib/live-store";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/utils";
import { CenteredLoader } from "./shared";
import { FileText, Layers } from "lucide-react";

/**
 * The Specs destination: a persistent sidebar of capabilities beside a main
 * pane that renders the selected capability's full `spec.md` as markdown — a
 * document view rather than reconstructed requirement cards.
 */
export function SpecsPage() {
  const { capability } = useParams();
  const { snapshot } = useLiveState();
  const specs = snapshot?.specs ?? [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
      <nav className="lg:sticky lg:top-20 lg:self-start">
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Specifications
        </h2>
        {specs.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            No specifications yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {specs.map((spec) => (
              <li key={spec.id}>
                <NavLink
                  to={`/specs/${encodeURIComponent(spec.id)}`}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-md px-2.5 py-1.5 font-mono text-sm transition-colors",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/40",
                    )
                  }
                >
                  {spec.title}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <main className="min-w-0">
        {capability ? (
          <SpecDocument capability={capability} />
        ) : (
          <SelectPrompt hasSpecs={specs.length > 0} />
        )}
      </main>
    </div>
  );
}

function SpecDocument({ capability }: { capability: string }) {
  const { pulse } = useLiveState();
  const { data, error, loading } = useAsync(
    () => api.document(`specs/${capability}/spec.md`),
    [capability, pulse],
  );

  if (loading && !data) return <CenteredLoader />;
  if (error)
    return (
      <div className="text-op-removed py-16 text-center text-sm">{error}</div>
    );
  if (!data) return null;

  return <Markdown className="max-w-3xl">{data.content}</Markdown>;
}

function SelectPrompt({ hasSpecs }: { hasSpecs: boolean }) {
  return (
    <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed py-24 text-center">
      {hasSpecs ? (
        <>
          <FileText className="size-5" />
          <p className="text-foreground text-sm font-medium">
            Select a capability
          </p>
          <p className="max-w-xs text-xs">
            Choose a specification from the sidebar to read it here.
          </p>
        </>
      ) : (
        <>
          <Layers className="size-5" />
          <p className="text-foreground text-sm font-medium">
            No specifications yet
          </p>
          <p className="max-w-xs text-xs">
            Specs are the living truth. They&apos;ll show once a change is
            archived.
          </p>
        </>
      )}
    </div>
  );
}

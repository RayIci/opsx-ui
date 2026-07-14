import type { ReactNode } from "react";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { DocumentView } from "@/components/DocumentView";
import { Loader2 } from "lucide-react";

interface Props {
  /** Path under the project's `openspec/`, e.g. `changes/<name>/proposal.md`. */
  path: string;
  /** Live pulse — re-fetch when the server reports a change. */
  revision: number;
  /** Shown when the document is missing, blank, or fails to load. */
  empty: ReactNode;
  /** Optional extra "counts as empty" test on present content (e.g. a
   *  tasks.md with no task lines). */
  isEmpty?: (content: string) => boolean;
  className?: string;
}

/**
 * The shared loader shell behind every markdown artifact view: a spinner while
 * loading, then the rendered markdown, or a caller-supplied empty state. Reads
 * only — nothing here can mutate the document, consistent with the viewer's
 * read-only guarantee.
 */
export function MarkdownArtifact({
  path,
  revision,
  empty,
  isEmpty,
  className,
}: Props) {
  const { data, loading, error } = useAsync(
    () => api.document(path),
    [path, revision],
  );

  if (loading && !data)
    return (
      <div className="text-muted-foreground flex justify-center py-16">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );

  const content = data?.content ?? "";
  const blank =
    !!error || content.trim() === "" || (isEmpty ? isEmpty(content) : false);
  if (blank) return <>{empty}</>;

  return (
    <DocumentView className={className ?? "mx-auto max-w-5xl"}>
      {content}
    </DocumentView>
  );
}

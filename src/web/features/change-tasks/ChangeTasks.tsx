import { api } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { Markdown } from "@/components/Markdown";
import { Loader2, ListTodo } from "lucide-react";

/** Matches a GFM task line (`- [ ]` / `- [x]`) so we can tell an empty or
 *  missing tasks.md from one that actually lists work. */
const TASK_LINE = /^\s*[-*] \[[ xX]\]/m;

interface Props {
  /** The active change's name; its tasks.md lives at changes/<name>/tasks.md. */
  name: string;
  /** Live pulse — re-fetch when the server reports a change (like SpecDiff). */
  revision: number;
}

/**
 * Read-only view of an active change's task list (change-tasks), rendered from
 * its raw tasks.md as one of the change drill-in's switchable views. GFM renders
 * the checkboxes as disabled inputs, so nothing here can toggle a task —
 * consistent with the viewer's read-only guarantee. A missing or task-less file
 * degrades to a quiet empty state rather than an error.
 */
export function ChangeTasks({ name, revision }: Props) {
  const { data, loading, error } = useAsync(
    () => api.document(`changes/${name}/tasks.md`),
    [name, revision],
  );

  if (loading && !data)
    return (
      <div className="text-muted-foreground flex justify-center py-16">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );

  const content = data?.content ?? "";
  const hasTasks = !error && TASK_LINE.test(content);

  if (!hasTasks)
    return (
      <div className="border-border text-muted-foreground mx-auto flex max-w-3xl flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <ListTodo className="size-5" />
        <p className="text-foreground text-sm font-medium">No tasks recorded</p>
        <p className="max-w-xs text-xs">
          This change has no tasks.md, or it lists no tasks yet.
        </p>
      </div>
    );

  return <Markdown className="mx-auto max-w-3xl">{content}</Markdown>;
}

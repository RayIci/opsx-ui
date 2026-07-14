import { MarkdownArtifact } from "@/components/MarkdownArtifact";
import { ListTodo } from "lucide-react";

/** Matches a GFM task line (`- [ ]` / `- [x]`) so we can tell an empty or
 *  missing tasks.md from one that actually lists work. */
const TASK_LINE = /^\s*[-*] \[[ xX]\]/m;

interface Props {
  /** The active change's name; its tasks.md lives at changes/<name>/tasks.md. */
  name: string;
  /** Live pulse — re-fetch when the server reports a change. */
  revision: number;
}

/**
 * Read-only view of an active change's task list (change-tasks), rendered from
 * its raw tasks.md as one destination in the change drill-in's artifact nav.
 * GFM renders the checkboxes as disabled inputs, so nothing here can toggle a
 * task — consistent with the viewer's read-only guarantee. A missing or
 * task-less file degrades to a quiet empty state rather than an error.
 */
export function ChangeTasks({ name, revision }: Props) {
  return (
    <MarkdownArtifact
      path={`changes/${name}/tasks.md`}
      revision={revision}
      isEmpty={(content) => !TASK_LINE.test(content)}
      empty={<TasksEmpty />}
    />
  );
}

function TasksEmpty() {
  return (
    <div className="border-border text-muted-foreground mx-auto flex max-w-3xl flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
      <ListTodo className="size-5" />
      <p className="text-foreground text-sm font-medium">No tasks recorded</p>
      <p className="max-w-xs text-xs">
        This change has no tasks.md, or it lists no tasks yet.
      </p>
    </div>
  );
}

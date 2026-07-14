## Why

Active changes surface only a task *count* (`2/3 tasks`) on their board card, but there is no way to inspect the individual tasks — what is done, what remains, or how they are grouped. Ironically, archived changes are more inspectable than active ones: the archive drill-in renders the full `tasks.md`, while the active-change drill-in shows only spec deltas. Users must drop to the CLI or open the file by hand to read the checklist they are actively working through.

## What Changes

- Add a task list to the active-change drill-in (`ChangePage`) as its own view, switchable with the existing spec-diff (defaulting to Tasks), so a change's `tasks.md` is readable in the UI without crowding the spec deltas.
- Render tasks read-only from the raw `tasks.md` markdown, reusing the existing document-fetch API and Markdown renderer — GitHub-flavored checkboxes (`- [x]` / `- [ ]`) and `##` section headers display natively.
- Handle the empty/missing case (a change with no `tasks.md` or no task lines) without error.
- The board card is intentionally unchanged: it keeps the glanceable `completed/total` count. Task detail belongs on the drill-in, not the summary.

No breaking changes. No write-back — the viewer remains strictly read-only.

## Capabilities

### New Capabilities
- `change-tasks`: Reading an active change's task list on its drill-in — the checklist from `tasks.md` rendered as read-only markdown, alongside the spec deltas, with graceful handling when no tasks exist.

### Modified Capabilities
<!-- None. The change-board "Task progress on change cards" count is unchanged; this adds a new drill-in surface rather than altering existing requirements. -->

## Impact

- **New UI**: a task-list component on the change drill-in; wired into `src/web/pages/ChangePage.tsx` above `SpecDiff`.
- **Reused, unchanged**: `api.document(path)` (`src/web/lib/api.ts`) already fetches any file under `openspec/` (traversal-guarded); the `Markdown` component (`src/web/components/Markdown.tsx`) already renders GFM task lists. No server, contract, or `TaskProgress` changes required.
- **Read-only preserved**: no new write paths; consistent with the existing `read-only` guarantees.

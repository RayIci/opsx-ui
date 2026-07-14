## Context

The active-change drill-in (`src/web/pages/ChangePage.tsx`) currently renders only `<SpecDiff>`. Task detail exists on disk in each change's `tasks.md`, but the backend collapses it to a `{completed, total}` count (`readTaskProgress` in `filesystem-source.ts`) before it reaches the wire, so the UI never receives the individual tasks. Meanwhile the archive drill-in (`ArchivedChange.tsx`) already renders full `tasks.md` markdown — active changes are less inspectable than archived ones.

Two pieces of plumbing already exist and cover this need without backend work:

- `api.document(path)` (`src/web/lib/api.ts`) → `GET /api/document?path=` → `FilesystemSource.getRawDocument`, which reads any file under `openspec/` with traversal guarding (`resolveWithin`).
- `<Markdown>` (`src/web/components/Markdown.tsx`) uses `remark-gfm`, which renders `- [x]` / `- [ ]` as (disabled) checkboxes and `##` as section headers.

The viewer is strictly read-only (there is a `read-only.test.ts` guarding it); nothing here may introduce a write path.

## Goals / Non-Goals

**Goals:**

- Make an active change's task list readable on its drill-in.
- Reuse existing fetch + render infrastructure; no server, contract, or `TaskProgress` changes.
- Handle the missing/empty `tasks.md` case without error.
- Preserve the read-only guarantee.

**Non-Goals:**

- Checking tasks off / editing tasks from the UI (write-back).
- A structured task model with per-section progress bars or done/todo filtering — deferred; can graduate later if wanted.
- Changing the board card, which keeps its glanceable `completed/total` count.
- Showing tasks inline on board cards.

## Decisions

**Render raw `tasks.md` markdown rather than parsing into a structured `Task[]`.**
The document endpoint + `remark-gfm` already produce checkboxes and section headers for free, and this mirrors how `ArchivedChange.tsx` renders artifacts — so the result is idiomatic to the codebase and carries zero backend risk. Alternative (structured parse + extended contract) buys per-section progress and filtering but adds a parser to maintain and wire-contract churn for polish that isn't yet needed. Start raw; revisit only if a concrete need appears.

**Fetch `openspec/changes/<name>/tasks.md` via `api.document(path)`.**
The path is derived from the change name already in the route params. `getRawDocument` resolves within `openspec/` and rejects traversal, and the change name comes from the trusted snapshot, so no new validation is required. Alternative (a dedicated `/api/changes/:id/tasks` endpoint) is unnecessary given the general document route already exists.

**Make the task list a distinct view on `ChangePage`, switchable with `<SpecDiff>` via the existing `SegmentedControl`, defaulting to Tasks.**
Stacking tasks above the diff crowds two unrelated things onto one scroll; separate views keep each surface clean. The switch reuses the same `SegmentedControl` the diff already uses for its own view modes, so it reads as native. Tasks lead because "what's left" is the common reason to open a change and the motivation for this feature. The switch is local view state (not a route), consistent with how `SpecDiff` already holds its current/proposed/side-by-side mode locally. Note: the archive drill-in keeps its combined, stacked artifact layout — a frozen record reads fine as one document; only the active drill-in gets the switch.

**Treat a missing file or empty task list as an explicit empty state, not an error.**
`api.document` rejects when the file is absent; the component catches that and renders an "no tasks" indication while leaving `<SpecDiff>` intact, satisfying the graceful-absence requirement.

## Risks / Trade-offs

- **Raw markdown gives no per-section progress or done/todo filtering** → Accepted as a non-goal; the structured model remains an available future step, and the board card still carries the aggregate count.
- **A change with an unusual `tasks.md` layout renders as generic markdown** → Acceptable; GFM handles standard checkbox/heading structure, which is the OpenSpec convention, and non-conforming content still renders readably.
- **Fetch failure other than "not found" (e.g., read error)** → The component surfaces a non-fatal message and keeps the spec-delta view usable, matching existing async-error patterns (`use-async`).

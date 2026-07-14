## 1. Task list component

- [x] 1.1 Add a `ChangeTasks` component under `src/web/features/change-tasks/` that takes the change `name` (and live `revision`) and fetches `changes/<name>/tasks.md` via `api.document(path)`, using the existing `useAsync` hook for loading/error state.
- [x] 1.2 Render the fetched content with the existing `<Markdown>` component so GFM checkboxes and section headers display; checkboxes are read-only (remark-gfm renders them disabled — no toggle handlers).
- [x] 1.3 Handle the loading state and the not-found/empty case: when the document is absent or contains no task lines (`TASK_LINE` probe), render a non-fatal empty state instead of an error, without throwing.
- [x] 1.4 Add `md-prose` task-list CSS (suppress the disc bullet, align the checkbox) so checkboxes render cleanly wherever markdown task lists appear.

## 2. Wire into the change drill-in

- [x] 2.1 Make `ChangePage` switch between a `Tasks` view (`<ChangeTasks>`) and a `Spec changes` view (`<SpecDiff>`) via the existing `SegmentedControl`, defaulting to Tasks, instead of stacking both.
- [x] 2.2 Confirm the drill-in renders the task list and the spec-delta view as separate, switchable surfaces, and that a change with no `tasks.md` shows the empty state without error while `SpecDiff` stays reachable via the switch.

## 3. Verification

- [x] 3.1 Run `npm run typecheck` — no errors.
- [x] 3.2 Run `npm test` — `read-only.test.ts` and existing suites pass (27/27); confirm no UI control mutates task state.
- [x] 3.3 Run `openspec validate add-change-task-inspector` (valid) plus `npm run lint` (0 errors) / `npm run format:check` (clean).
- [x] 3.4 Eyeball the drill-in against a change with mixed done/incomplete tasks and section headers (e.g. this change's own `tasks.md`): completion state, grouping, and the Tasks/Spec-changes switch render correctly. (Task-list CSS reworked from flex to inline flow after the first render fragmented text — visually confirmed.)

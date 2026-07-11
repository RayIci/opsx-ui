## 1. Column derivation

- [x] 1.1 Add a pure `deriveColumns(snapshot)` helper in `src/web/features/change-board/` mapping a `Snapshot` to ordered columns (Proposed / In progress / Ready to archive / Archived) per the design rules
- [x] 1.2 Handle the `tasks.total === 0` edge case as Proposed (never Ready to archive)
- [x] 1.3 Add unit tests covering each column boundary (0 done, partial, all done, zero-task, archived)

## 2. Kanban layout

- [x] 2.1 Replace the flat "Changes in flight" grid in `ChangeBoard.tsx` with a kanban of the derived columns, reusing the existing `ChangeCard` for active columns
- [x] 2.2 Render the Archived column from `snapshot.archived`, reusing the archived-change card and linking into the existing Archive detail view
- [x] 2.3 Show a per-column count in each column header
- [x] 2.4 Render a quiet placeholder for empty columns (keep the column visible)
- [x] 2.5 Make the layout responsive: side-by-side columns on wide screens, stacked labeled sections below the `lg` breakpoint
- [x] 2.6 Keep the Specifications section on the home view, below the kanban

## 3. Resilient initial load

- [x] 3.1 Introduce an explicit `LoadState` (loading | error | ready) in `App.tsx`, replacing the single nullable `bootstrap`
- [x] 3.2 Wrap `api.bootstrap()` in try/catch in `load()`; on failure set an error state with a message naming the likely cause
- [x] 3.3 Render an error view with a Retry button that re-invokes `load()` without a page reload
- [x] 3.4 Verify the normal (ready) and empty-project paths still render correctly

## 4. Combined dev script

- [x] 4.1 Add `concurrently` as a dev dependency
- [x] 4.2 Add a `dev` script that runs `dev:server` and `dev:web` together; keep the standalone scripts

## 5. Verification

- [x] 5.1 `npm run typecheck` and `npm test` pass (27 tests, incl. 7 new column tests); lint clean; web build succeeds
- [x] 5.2 Verified column placement against live snapshot: `add-kanban-board` (14/18) → In progress, 2 archived → Archived, via unit-tested `deriveColumns` + existing live-store push mechanism (browser-pixel confirmation still pending)
- [x] 5.3 Error state verified by construction: `load()` try/catch → `LoadError` with Retry re-invoking `load()` (browser confirmation of the Vite-proxy-down path still pending)

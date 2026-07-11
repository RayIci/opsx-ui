## Context

The home view (`src/web/features/change-board/ChangeBoard.tsx`) renders two flat grids: active changes and specifications. All the data needed to show *lifecycle stage* is already present in the `Snapshot` pushed over the WebSocket — `changes[].tasks {completed, total}` and the `archived[]` list — but the board doesn't use it to organize anything. Separately, `App.tsx`'s `load()` awaits `api.bootstrap()` with no error handling, and the only gate on the top-level spinner is `if (!bootstrap)`; so any bootstrap failure (most commonly: the Vite dev server is up on :5273 but the API server on :4573 is not) leaves the app spinning forever with the real error buried in the browser console.

Constraints: the viewer is read-only end-to-end (a stated v1 principle) and the kanban must not introduce any write path. No server or wire-contract changes are wanted — the board should be a pure projection of the existing snapshot.

## Goals / Non-Goals

**Goals:**
- Organize active changes into derived lifecycle columns (Proposed / In progress / Ready to archive), with Archived as a terminal column fed by the existing archived list.
- Keep the board a pure, read-only projection of the current `Snapshot` — no new API routes, no new contracts.
- Replace the silent infinite spinner with a loading-vs-error distinction and a retry affordance.
- Make the two-process dev setup startable with one command.

**Non-Goals:**
- Drag-and-drop or any interaction that moves a change between columns (that would require writing to OpenSpec — explicitly out of scope).
- Changing how archived changes are read or how the Archive detail view works (the terminal column links into the existing archive view).
- Adding new lifecycle states beyond what task progress + archived status already imply (no "blocked", "review", etc.).
- Reworking the Specifications section beyond relocating it below the kanban.

## Decisions

### Derive columns on the client from the existing snapshot

A pure function maps the snapshot to columns, keeping the server untouched:

```
Proposed          ← active change, tasks.completed === 0
In progress       ← active change, 0 < tasks.completed < tasks.total
Ready to archive  ← active change, tasks.total > 0 && tasks.completed === tasks.total
Archived          ← snapshot.archived[]  (terminal)
```

Edge case: a change with `tasks.total === 0` (no tasks defined yet) is treated as **Proposed**, not "ready" — completing zero-of-zero tasks must not read as done. The derivation lives in a small, unit-testable helper (e.g. `deriveColumns(snapshot)`), not inline in JSX, so the mapping is verifiable in isolation.

*Alternative considered:* compute the stage server-side and add a `stage` field to `ChangeSummary`. Rejected — it adds a contract change and server logic for a purely presentational grouping the client can already compute, and it couples the wire format to one view's layout.

### Reuse the existing card; columns are the only new layout

Each active column renders the existing `ChangeCard` unchanged; the Archived column reuses the archived-change card already built for the Archive view (or a compact variant). The kanban is a column container plus the derivation helper — minimizing new surface area and keeping card visuals consistent with the rest of the app.

*Alternative considered:* a bespoke card per column. Rejected — needless divergence; the card already shows task progress and validation, which is exactly what each column needs.

### Responsive layout: columns on wide screens, stacked sections on narrow

On wide viewports the four columns sit side by side (horizontal scroll only if it can't fit); below the `lg` breakpoint they stack vertically as labeled sections so the board stays usable next to the activity rail and on small screens. Empty columns stay visible with a quiet placeholder so the lifecycle is always legible.

### Resilient load as explicit UI states

`App.tsx` gains an explicit load-state model instead of the single nullable `bootstrap`:

```
type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; bootstrap: Bootstrap };
```

`load()` wraps `api.bootstrap()` in try/catch, sets `error` on failure with a message that names the likely cause ("Couldn't reach the opsx-ui server — is it running?"), and the error view offers a **Retry** button that re-invokes `load()`. This directly satisfies the live-sync "Resilient initial load" requirement and turns the silent spinner into a diagnosable state.

### Combined dev script

Add a `dev` script that runs both processes together via `concurrently` (a dev dependency):

```
"dev": "concurrently -k -n server,web -c blue,magenta \"npm:dev:server\" \"npm:dev:web\""
```

This removes the most common trigger of the unreachable-server spinner (starting only one of the two processes). The existing `dev:server` / `dev:web` scripts stay for anyone who wants separate terminals.

## Risks / Trade-offs

- **Task counts drive placement, so a change with an incomplete/malformed `tasks.md` may land in an unexpected column** → the derivation is total (every change maps to exactly one column) and defaults ambiguous/zero-task changes to Proposed; no input produces an empty or duplicated placement.
- **Four columns can crowd the layout beside the activity rail** → columns collapse to stacked sections below the `lg` breakpoint, matching the existing responsive grid behavior.
- **The archived list can grow unbounded, making the Archived column long** → it reuses the same list the Archive view already renders; if length becomes a problem later, it can cap/scroll independently without affecting the active columns. Out of scope for this change.
- **`concurrently` adds a dev dependency** → dev-only, not shipped in the published package (`files` is `dist` only); the standalone scripts remain as a fallback.

## Migration Plan

No data or API migration. Purely additive front-end change plus a dev script. Rollback is reverting the `change-board` feature files, the `App.tsx` load-state change, and the `package.json` script/dependency. The spec deltas for `change-board` and `live-sync` are synced on archive.

## Open Questions

- None blocking. A possible future refinement (out of scope): let a user collapse the Archived column or the Specifications section to reduce home-view height.

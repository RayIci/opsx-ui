## Why

The home view is a pair of flat grids ("Changes in flight" and "Specifications") that show *which* changes exist but not *where each one is in its lifecycle* — proposed, being implemented, or ready to archive. A kanban makes the flow of work legible at a glance, which is the whole point of a viewer that exists to "see what agents are doing." Separately, when the viewer cannot reach its server (a common dev-mode misconfiguration where only one of the two processes is running), the app renders a silent, infinite loading spinner that hides the real error — so a lifecycle board that never loads is indistinguishable from one that is merely empty.

## What Changes

- Replace the flat "Changes in flight" grid with a **read-only lifecycle kanban**: active changes are placed into columns derived from their state — **Proposed** (no tasks started), **In progress** (some tasks done), **Ready to archive** (all tasks done) — with **Archived** as a terminal column sourced from the existing archived-change list.
- Columns are **derived, not draggable**: placement is computed from each change's task progress and archived status. The viewer stays read-only and never writes to OpenSpec.
- Each column reuses the existing change card (task progress + validation health) and shows a per-column count; empty columns render a quiet placeholder rather than disappearing.
- The **Specifications** section remains on the home view, below the kanban.
- Replace the top-level silent infinite spinner with a **resilient initial load**: distinguish "still loading" from "failed to reach the server," and on failure show an actionable error (with a retry) instead of spinning forever.
- Add a single combined dev command so the two-process dev setup (API server + Vite) can be started together, removing the most common cause of the unreachable-server spinner.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `change-board`: the board's home layout changes from a flat grid of active changes to a lifecycle kanban whose columns are derived from each change's task progress and archived status.
- `live-sync`: the client's initial load gains a defined failure behavior — surface an actionable error state instead of an indefinite loading state when the server or bootstrap cannot be reached.

## Impact

- **Web**: `src/web/features/change-board/` (new kanban layout + column derivation), `src/web/App.tsx` (bootstrap load now handles failure and renders an error/retry state; archived list feeds the terminal column).
- **Build/dev tooling**: `package.json` gains a combined `dev` script (adds a `concurrently` dev dependency).
- **No server or contract changes**: the kanban is derived entirely from the existing `Snapshot` (`changes[].tasks`, `archived[]`); no new API routes or wire contracts are required.

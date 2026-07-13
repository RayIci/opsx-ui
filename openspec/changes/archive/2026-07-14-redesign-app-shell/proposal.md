## Why

The viewer crams three jobs into one screen: a kanban, a specifications list, and an always-on activity sidebar all share the board view. The kanban never gets to breathe, specs are reduced to a cramped grid of cards, and the activity feed permanently claims 320px whether or not anyone is watching it. The app is really two distinct surfaces — an operational board and a specifications reference — and it should be structured as such.

## What Changes

- Introduce a top-level app shell with real URL-based routing and a persistent nav that switches between two destinations: **Board** and **Specs**.
- **BREAKING**: The board home becomes **kanban-only**. The Specifications grid is removed from the board and moves to the dedicated Specs page.
- Add a **Specs page** with a persistent left sidebar listing capabilities and a main pane that renders the selected capability's full `spec.md` as formatted markdown (a Confluence-like document view), replacing the structured requirement-card view.
- Make the **activity feed a toggleable drawer**: closed by default, opened on demand from the shell, and its open/closed state persists across reloads. It no longer occupies a permanent column.
- Change drill-ins (change deltas, archived changes) become addressable routes rather than in-place view swaps, so they are deep-linkable and survive the browser back button.

## Capabilities

### New Capabilities
- `app-navigation`: the top-level app shell — URL-based routing, the Board/Specs primary navigation, and deep-linkable drill-in routes for changes and archived changes.

### Modified Capabilities
- `change-board`: the board home is kanban-only; the specifications listing is removed from the board.
- `spec-browser`: reachable as a dedicated page with a persistent capability sidebar; renders each spec as its full raw markdown document rather than reconstructed requirement cards.
- `activity-feed`: presented as an on-demand drawer that is closed by default and toggled from the shell, rather than an always-visible column beside the board.

## Impact

- `src/web/App.tsx`: the `View` union state machine is replaced by a routed app shell.
- New dependency: a client-side router (`react-router`).
- `src/web/features/change-board/ChangeBoard.tsx`: specifications section removed.
- `src/web/features/spec-browser/`: new sidebar + markdown document layout; consumes the existing `/api/document` endpoint and `Markdown` component.
- `src/web/features/activity-feed/ActivityFeed.tsx`: rehomed into a toggleable drawer; open state persisted (localStorage, like theming).
- Server: no new endpoints required — `/api/document` already serves raw `spec.md`; the SPA fallback in `viewer-server.ts` already supports client-side routes.

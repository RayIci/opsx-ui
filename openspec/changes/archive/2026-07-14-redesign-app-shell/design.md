## Context

The web app (`src/web/App.tsx`) is a single-page view-switcher. A `View` union in component state (`board | change | spec | archive | archived`) selects what the main panel renders, and the layout is a fixed two-column grid: main content plus an always-visible 320px `ActivityFeed`. The board view (`ChangeBoard`) bundles both the kanban and a specifications grid. Specs are rendered by `SpecDetail` as reconstructed requirement cards (`RequirementView`) built from parsed JSON.

Two pieces of substrate already support a routed, document-oriented redesign:
- The server has an SPA fallback (`viewer-server.ts:226`) that serves `index.html` for any non-`/api`, non-`/ws` path — client-side routes will resolve on hard refresh.
- A `/api/document?path=…` endpoint (`session.getRawDocument`) returns raw markdown for any file under the openspec root, and `react-markdown` + `remark-gfm` + the `Markdown` component are already in the tree. A spec's source lives at `openspec/specs/<capability>/spec.md`.

## Goals / Non-Goals

**Goals:**
- Two distinct top-level surfaces — a kanban-only Board and a document-style Specs page — with real URLs.
- Specs page: persistent capability sidebar + full raw `spec.md` rendered as markdown.
- Activity feed as an on-demand drawer, closed by default, state persisted across reloads.
- Deep-linkable, back-button-friendly drill-ins for changes and archived changes.

**Non-Goals:**
- No new server endpoints or contract changes — reuse `/api/document` and the existing snapshot.
- No change to the read-only nature of the viewer or to live-sync mechanics.
- No editing/authoring of specs; the Specs page is read-only rendering.
- No redesign of card visuals, columns logic, or archive detail internals beyond rehoming them under routes.

## Decisions

### Routing: adopt `react-router`
Replace the `View` union with `react-router` (`createBrowserRouter`). Routes:
- `/` → redirect to `/board`
- `/board` → kanban only
- `/specs` and `/specs/:capability` → Specs page (sidebar always present; capability in the URL drives the main pane)
- `/changes/:name` → change deltas drill-in
- `/archive` and `/archive/:id` → archive list and archived-change detail

*Why over keeping the state machine:* the asks are phrased as pages, deep-linkable specs are a core part of the Confluence-like feel, and the server SPA fallback already anticipates client routes. Alternative considered — adding a top-level `page` field to the existing `View` state — avoids a dependency but leaves specs and drill-ins un-addressable, which defeats the point of the Specs page.

### App shell owns bootstrap + live store; routes are children
The bootstrap/load/`ProjectGate` logic and the live-store connection stay in a shell layout component (router root). Routed pages consume `useLiveState()` as they do today. This keeps a single WebSocket connection and one load lifecycle regardless of route.

### Specs page renders raw `spec.md` via `/api/document`
The Specs page fetches `specs/<capability>/spec.md` through the existing `/api/document` endpoint and renders it with the `Markdown` component. The capability list comes from the snapshot's `specs: SpecSummary[]` (already present). `SpecDetail`/`RequirementView` (structured cards) are retired from the Specs path.

*Why over the structured view:* fidelity to the authored document and the requested Confluence feel; also less code. Trade-off: we lose per-requirement anchors and parsed scenario structure — acceptable for a reading surface, and headings still provide in-document structure.

### Activity drawer: right-side slide-over, persisted like theming
The feed moves out of the grid into a slide-over drawer toggled from the shell header. Open/closed state persists in `localStorage`, mirroring the existing theme persistence pattern (`lib/theme.ts`). `ActivityFeed`'s internals are reused; only its container changes.

*Why:* reclaims the permanent 320px column, matches "closed by default, shown only when opened," and the persistence pattern already exists in the codebase.

## Risks / Trade-offs

- **New dependency (`react-router`)** → It is small, standard, and the server already supports its routes; contained to the web layer.
- **Losing the structured requirement view** → Headings in the rendered markdown preserve navigability; if per-requirement deep links are later wanted, they can be layered on heading anchors without reintroducing the card view.
- **Drill-ins now depend on live snapshot being loaded before a deep link resolves** → The shell already gates on bootstrap/load and shows a loader; deep links render once the snapshot seeds, same as today's first paint.
- **`/api/document` path handling for `:capability`** → Reuse the endpoint's existing relative-path resolution; the client passes `specs/<capability>/spec.md`. No new traversal surface beyond what the endpoint already guards.

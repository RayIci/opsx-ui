## 1. Routing foundation

- [x] 1.1 Add `react-router` to `package.json` dependencies
- [x] 1.2 Create an app shell layout component that owns bootstrap/load, `ProjectGate`, the live-store connection, and renders the shell header + `<Outlet />`
- [x] 1.3 Define the router (`createBrowserRouter`) with routes: `/` → redirect `/board`, `/board`, `/specs`, `/specs/:capability`, `/changes/:name`, `/archive`, `/archive/:id`
- [x] 1.4 Mount the router in `main.tsx` and reduce `App.tsx` to the shell/router wiring, removing the `View` union state machine
- [x] 1.5 Verify hard-refresh on every route resolves via the server SPA fallback

## 2. Primary navigation

- [x] 2.1 Add a persistent Board/Specs primary nav to the shell header, marking the active destination
- [x] 2.2 Wire nav links to `/board` and `/specs`; confirm the browser URL updates and back/forward work

## 3. Board becomes kanban-only

- [x] 3.1 Remove the Specifications section (and its props) from `ChangeBoard.tsx`, leaving only the kanban
- [x] 3.2 Route the `/board` page to render `ChangeBoard`; make change cards navigate to `/changes/:name` and archived cards to `/archive/:id`
- [x] 3.3 Update/remove the `columns.test.ts` expectations only if board data wiring changed

## 4. Specs page (Confluence-like)

- [x] 4.1 Build a Specs page layout with a persistent left sidebar listing capabilities from the snapshot `specs` and a main pane
- [x] 4.2 Fetch the selected capability's `specs/<capability>/spec.md` via `/api/document` and render it with the `Markdown` component
- [x] 4.3 Drive the selected capability from `:capability` in the URL; mark the active item in the sidebar
- [x] 4.4 Handle `/specs` with no capability selected (sidebar + prompt) and refresh the rendered doc on live `pulse`
- [x] 4.5 Retire `SpecDetail`/`RequirementView` from the specs path

## 5. Drill-in routes

- [x] 5.1 Route `/changes/:name` to `SpecDiff` and `/archive/:id` to `ArchivedChange`, reading the id from the route
- [x] 5.2 Route `/archive` to `ArchiveList`; ensure a Back affordance returns to the originating view
- [x] 5.3 Confirm deep-linking directly to a change/archived URL renders correctly once the snapshot has seeded

## 6. Activity drawer

- [x] 6.1 Add a `localStorage`-backed open/closed store for the drawer, closed by default (mirroring the theme persistence pattern)
- [x] 6.2 Move `ActivityFeed` into a right-side slide-over drawer rendered by the shell (available on all routes)
- [x] 6.3 Add an activity toggle to the shell header wired to the drawer store
- [x] 6.4 Remove the always-on activity column from the old grid layout

## 7. Verification

- [x] 7.1 Run `npm run typecheck`, `npm run lint`, and `npm test`
- [x] 7.2 Manually verify: Board is kanban-only, Specs renders markdown with working sidebar, drawer is closed by default and persists, and every route deep-links and survives refresh

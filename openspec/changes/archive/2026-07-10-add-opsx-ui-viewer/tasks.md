## 1. Project scaffolding

- [x] 1.1 Initialize the npm package with an `opsx-ui` bin entry and TypeScript config
- [x] 1.2 Scaffold the React + Vite front end with TailwindCSS
- [x] 1.3 Add shadcn/ui (nova style, zinc) and wire the modern/minimal Google Fonts pairing
- [x] 1.4 Set up the Node server (Express) and a build that bundles the front end for serving
- [x] 1.5 Configure lint/format/test tooling and a CI-friendly `test` script

## 2. OpenSpec source port (read model)

- [x] 2.1 Define the `OpenSpecSource` interface and the view-model types (`ChangeSummary`, `SpecView`, `DeltaView`, `StatusView`, `ValidationView`)
- [x] 2.2 Implement `CliOpenSpecSource` that shells out to `openspec … --json`
- [x] 2.3 Implement mappers from CLI JSON to each view-model (one unit per mapper)
- [x] 2.4 Handle unsupported/absent `openspec` CLI with a clear error surface
- [x] 2.5 Unit-test the port against captured CLI JSON fixtures (mock the CLI)

## 3. Launch, resolution, and shell

- [x] 3.1 Implement `ProjectResolver`: cwd detection and `openspec/` discovery
- [x] 3.2 Implement `opsx-ui -g` global mode (skip cwd → project picker)
- [x] 3.3 Implement the init fallback when no `openspec/` is found
- [x] 3.4 Implement store awareness (`openspec store list --json`, thread `--store <id>`)
- [x] 3.5 Start the server on an available port and open the browser

## 4. Live sync

- [x] 4.1 Watch the resolved `openspec/` tree with debounced/coalesced events (polling fallback)
- [x] 4.2 Re-query affected view-models through the port on change
- [x] 4.3 Push updates to browsers over a WebSocket channel
- [x] 4.4 Apply pushed state in the front-end store as the single source of truth
- [x] 4.5 Add a manual refresh path as a watching fallback
- [x] 4.6 Guarantee read-only behavior (no write path into `openspec/`) and cover it with a test

## 5. Change board (home)

- [x] 5.1 Render active changes as cards from `ChangeSummary`
- [x] 5.2 Show task-completion progress per card
- [x] 5.3 Show validation health per card
- [x] 5.4 Handle the empty state (no active changes)
- [x] 5.5 Reflect live add/progress/remove on the board

## 6. Activity feed

- [x] 6.1 Derive reverse-chronological activity entries from watch events/state
- [x] 6.2 Render the feed rail alongside the board
- [x] 6.3 Append new entries live at the top
- [x] 6.4 Include affected change/spec and nature-of-change in each entry

## 7. Spec browser (drill-down)

- [x] 7.1 List capabilities from `SpecView`
- [x] 7.2 Render a capability's requirements and scenarios
- [x] 7.3 Enable drill-down navigation from a change to its affected specs
- [x] 7.4 Update displayed spec live when its file changes

## 8. Spec diff (side-by-side)

- [x] 8.1 Load current spec (`show <spec>`) and deltas (`show <change> --deltas-only`) via the port
- [x] 8.2 Render current requirements on one side, proposed deltas on the other
- [x] 8.3 Group deltas by operation with distinct color for ADDED/MODIFIED/REMOVED
- [x] 8.4 Handle empty/partial deltas (no deltas for the selected spec) without error
- [x] 8.5 Update the diff live when delta or current spec changes

## 9. Packaging and verification

- [x] 9.1 Verify launch modes end-to-end against a sample OpenSpec project
- [x] 9.2 Verify live auto-update reflects an external edit without manual refresh
- [x] 9.3 Prepare the package for global install (`npm i -g`) and smoke-test the `opsx-ui` bin
- [x] 9.4 Write a README covering install, launch modes, and scope

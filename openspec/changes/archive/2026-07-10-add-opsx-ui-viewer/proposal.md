## Why

OpenSpec's state lives as markdown on disk and is only inspectable through the terminal (`openspec view`), which cannot update live while an agent is working or render a change's deltas against the current spec. Developers and reviewers need a calm, always-current visual window into what OpenSpec touches — the specs that are true, the changes in flight, and how each change proposes to alter the specs.

## What Changes

- Introduce `opsx-ui`, a globally-installed CLI that boots a local web server and opens a browser-based, **read-only** viewer of a project's OpenSpec state.
- Launch modes: `opsx-ui` resolves the current directory (offering to initialize OpenSpec if none is found), and `opsx-ui -g` skips the cwd and opens a project picker. Both are store-aware.
- A **live, auto-updating** UI: the server watches the `openspec/` directory and pushes fresh state to the browser without a manual refresh — so agent activity is reflected as it happens.
- A **change board** home view listing in-flight changes with task progress and validation health.
- A **live activity feed** showing recent OpenSpec file activity in temporal order.
- A **spec browser** to drill into capabilities, requirements, and scenarios.
- A **side-by-side spec diff**: the current spec beside a change's proposed deltas, grouped and colored by operation (ADDED / MODIFIED / REMOVED).
- Explicitly **out of scope for this change**: driving agents, running `explore`/`propose`/`apply`/`sync`/`archive`, and observing agent session internals (messages, reasoning). The viewer only reads and renders OpenSpec state.

## Capabilities

### New Capabilities
- `viewer-cli`: Global `opsx-ui` command — launch modes (`opsx-ui`, `opsx-ui -g`), current-directory detection, init fallback, and store/project resolution that boots the local server and opens the browser.
- `live-sync`: Read-only ingestion of OpenSpec state into typed view-models plus filesystem watching that pushes updates to connected clients (auto-update is a hard requirement); never mutates OpenSpec.
- `change-board`: Home view listing active changes as cards with task-completion progress and validation health.
- `activity-feed`: Live temporal feed of recent OpenSpec changes/events, always visible alongside the board.
- `spec-browser`: Navigable view of specs — capabilities, their requirements, and scenarios — reached by drill-down.
- `spec-diff`: Side-by-side view of a change's proposed deltas against the current spec, grouped and colored by operation.

### Modified Capabilities
<!-- None — this project has no existing specs; all capabilities above are new. -->

## Impact

- **New codebase** (greenfield): React + Vite front end (TailwindCSS, shadcn/ui — nova style, zinc — with a modern/minimal Google Fonts pairing) and a Node server (Express + WebSocket).
- **External dependency**: shells out to the installed `openspec` CLI (v1.5.0) and consumes its `--json` output; treats the CLI as the read source behind a swappable port.
- **Distribution**: published as a global npm package exposing the `opsx-ui` bin; launchable from any directory.
- **No impact on target projects**: strictly read-only; opens no write path into any project's `openspec/`.
- **Known constraint (v1)**: OpenSpec's delta JSON drops the `### Requirement:` header used as identity, so v1 renders operation-grouped delta cards beside current-spec cards rather than a token-level paired diff (paired highlighting is deferred to a follow-up).

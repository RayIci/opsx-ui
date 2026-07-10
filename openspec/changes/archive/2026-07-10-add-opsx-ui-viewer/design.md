## Context

OpenSpec state is markdown-on-disk, inspectable today only via the `openspec view` TUI. That TUI cannot update live while an agent edits files, cannot render a change's deltas against the current spec, and offers no clickable navigation. `opsx-ui` is a greenfield, **read-only** web viewer that fills those gaps: a global CLI boots a local server that reads OpenSpec state and streams it, live, to a browser.

Key facts established during exploration (against `openspec` CLI v1.5.0):
- The CLI exposes structured `--json` for `list`, `show`, `status`, `validate`, `spec`, `change` — sufficient for lists, boards, progress, and health.
- `openspec show <change> --json --deltas-only` returns each delta's `operation`, `spec`, and the **new** requirement text/scenarios — but **drops the `### Requirement: <name>` header** that OpenSpec uses as requirement identity. There is therefore no reliable JSON join key from a MODIFIED delta back to the requirement it replaces.
- `openspec status --change <x> --json` yields `applyRequires`, per-artifact status, `changeRoot`, `artifactPaths`, and `actionContext` (including store/repo mode).

## Goals / Non-Goals

**Goals:**
- A read-only, always-current visual window into everything OpenSpec touches.
- Auto-update as a hard requirement — no manual refresh.
- Clean, SOLID, extensible architecture with a single swappable seam between the app and OpenSpec.
- Ship a side-by-side current-vs-proposed spec view in v1 without a bespoke markdown parser.

**Non-Goals:**
- Driving agents or running `explore`/`propose`/`apply`/`sync`/`archive` (future shelf).
- Observing agent session internals — messages, reasoning, tool calls.
- Writing to, or mutating, any project's `openspec/` in any way.
- Token-level, paired before→after diff with inline highlighting (deferred; see Decisions).

## Decisions

### D1 — Two-tier architecture: global CLI bin → local server → browser
The npm package exposes an `opsx-ui` bin that starts a Node (Express + `ws`) server on localhost and opens the default browser. The browser app (React + Vite) is the only UI. Rationale: mirrors the well-worn `vite`/`storybook` pattern; keeps filesystem/CLI access server-side and the UI a pure consumer. *Alternative considered:* an Electron/Tauri desktop app — rejected for v1 as heavier to build and distribute than `npm i -g` + browser.

### D2 — The `OpenSpecSource` port is the one architectural seam (SOLID core)
All OpenSpec reads go through a single interface, `OpenSpecSource`, that returns **typed view-models** (`ChangeSummary`, `SpecView`, `DeltaView`, `StatusView`, `ValidationView`) — never raw CLI text. v1 ships a `CliOpenSpecSource` implementation that shells out to `openspec … --json` and maps output to those types. Rationale: Dependency Inversion — the UI/server depend on the interface, not the CLI; makes the read layer trivially mockable in tests and swappable if OpenSpec later ships a node library or HTTP API. Each mapper (change, spec, delta) is a single-responsibility unit. *Alternative considered:* calling the CLI ad hoc throughout the server — rejected; it scatters a volatile dependency and defeats testability.

### D3 — Read model is two pipelines, unified behind the port
- **Structured pipeline** (board, lists, task %, validation health, activity): consumes clean CLI JSON directly.
- **Diff pipeline** (spec-diff): consumes `show <spec> --json` + `show <change> --deltas-only --json`.
Both surface as view-models from the same port, so consumers don't know or care which CLI calls produced them.

### D4 — v1 spec-diff is JSON-driven and operation-grouped (no markdown parser)
Because the delta JSON drops the requirement-header identity (see Context), v1 does **not** attempt to pair a MODIFIED delta with its current requirement. Instead it renders two columns: left = current spec requirements (from `show <spec>`), right = delta cards grouped and colored by `operation` (🟢 ADDED / 🟡 MODIFIED / 🔴 REMOVED) from `show <change> --deltas-only`. This delivers a genuine "what's true | what this change does" side-by-side using only clean JSON. Rationale: easiest correct path; avoids depending on lossy data. *Alternative considered / deferred:* a small OpenSpec-markdown parser that splits raw `spec.md`/delta files on `### Requirement: <name>` to recover identity, pairs old↔new, and runs a token-level diff — this is the clear v1.1 upgrade and D2's port makes it an additive `DeltaView` enrichment, not a rewrite.

### D5 — Live-sync via filesystem watch + WebSocket push
The server watches the resolved `openspec/` tree (via `chokidar`), debounces bursts, re-queries the affected view-models through the port, and pushes them to connected browsers over a WebSocket. The browser applies pushed state to its store. Rationale: watching disk is the only read-only way to reflect "what agents are doing"; WebSocket gives instant, refresh-free updates. *Alternatives considered:* browser polling (simpler but laggy and chatty — fails the "feels live" bar); server-sent events (viable, but WebSocket keeps a single channel open for future bidirectional agent-driving).

### D6 — Project & store resolution owned by a `ProjectResolver`
A dedicated resolver encapsulates: cwd detection, `opsx-ui -g` (skip cwd → picker), init fallback when no `openspec/` is found, and store selection (`openspec store list --json`, threading `--store <id>` onto store-scoped commands). Rationale: Single Responsibility — launch/resolution logic is isolated from rendering and from the source port.

### D7 — Front-end stack and structure
React + Vite, TailwindCSS, shadcn/ui (nova style, zinc), a modern/minimal Google Fonts pairing. Feature-oriented modules (`change-board`, `activity-feed`, `spec-browser`, `spec-diff`) each own their components and a thin view-model client; shared UI primitives live in a `ui` layer. State from the server is the single source of truth (no client-side mutation of OpenSpec data). Rationale: keeps features independently extensible (Open/Closed) and the visual system consistent.

## Risks / Trade-offs

- **Lossy delta JSON limits v1 diff fidelity** → Ship operation-grouped columns now; recover identity via a markdown parser behind the same port in v1.1. No user-facing rework.
- **`openspec` CLI is an external, versioned dependency; output shape may drift** → Isolate every CLI call and mapping inside `CliOpenSpecSource`; pin/verify against a known CLI version; fail gracefully with a clear "unsupported openspec version" surface.
- **CLI process-spawn cost on every file change could thrash under rapid agent edits** → Debounce/coalesce watch events and cache the last view-model; only re-query what changed.
- **Filesystem watching is unreliable on some platforms (WSL/network mounts)** → Use `chokidar` with polling fallback; expose an explicit manual refresh as a safety net.
- **Auth/global config for `openspec` differs per machine** → The server inherits the user's environment and shells out exactly as they would; no separate credential handling in v1.

## Migration Plan

Greenfield — no migration. Deploy is `npm publish` of the global package; users `npm i -g opsx-ui` and run `opsx-ui`. Rollback is trivial (uninstall / pin previous version); the tool never writes to user projects, so there is nothing to reverse.

## Open Questions

- Multi-project hub vs. one-project-at-a-time: `-g` implies a picker; is v1 a single active project with a switcher, or a dashboard across many at once? (Leaning single-active with a switcher.)
- Exact port-selection behavior when the default localhost port is taken (auto-increment vs. flag).
- Whether validation health on the board should be computed eagerly on every change (cost) or lazily on card focus.

# opsx-ui

A read-only, live-updating **web viewer for everything OpenSpec touches** — a
browser home for your specs, changes, and proposed deltas that replaces the
`openspec view` TUI and updates *as agents work*.

> opsx-ui only **reads** OpenSpec state. It never writes to, or mutates, any
> project's `openspec/` directory. Driving agents (propose / apply / archive) is
> intentionally out of scope for now.

## Install

```bash
npm install -g opsx-ui
```

Requires the [`openspec`](https://github.com/Fission-AI/OpenSpec) CLI **>= 1.5.0**
on your PATH.

## Usage

```bash
opsx-ui                 # open the OpenSpec project in the current directory
opsx-ui ./some/project  # open a specific project
opsx-ui -g              # global mode: skip cwd, show the project picker
```

Options:

| Flag             | Meaning                                                   |
| ---------------- | --------------------------------------------------------- |
| `-g, --global`   | Skip the current directory and open the project picker.   |
| `-p, --port <n>` | Preferred port (auto-increments if taken). Default 4573.  |
| `--poll`         | Use filesystem polling (WSL / network mounts).            |
| `--no-open`      | Don't open a browser automatically.                       |

If the current directory has no `openspec/`, opsx-ui offers to point you at
another project or a registered store. Running it in a project with `openspec/`
opens straight to the **change board**.

## What you get

- **Change board** — every active change as a card with task progress and
  validation health, updating live.
- **Activity feed** — a reverse-chronological rail of what just changed on disk,
  so you can watch an agent's edits land in real time.
- **Spec browser** — drill into capabilities, requirements, and scenarios.
- **Spec diff** — a change's proposed deltas beside the current spec, grouped and
  colored by operation (ADDED / MODIFIED / REMOVED).

## Architecture

A global CLI boots a local Node server (Express + WebSocket) that reads OpenSpec
state and streams it to a React/Vite UI.

```
  Browser (React/Vite)  ◀── WebSocket (live snapshot + activity) ──▶  Node server
                                                                          │
                                              chokidar watch(openspec/)   │
                                                                          ▼
                                                      OpenSpecSource (port)
                                                      └ CliOpenSpecSource → `openspec … --json`
```

All OpenSpec reads go through a single `OpenSpecSource` interface that returns
typed view-models — the UI never sees raw CLI output. The CLI adapter is the one
swappable seam, so a future OpenSpec library or HTTP API drops in without
touching the server or UI.

## Develop

```bash
npm install
npm run dev:server   # local API + watcher (port 4573)
npm run dev:web      # Vite dev server (port 5273, proxies /api and /ws)
npm test             # unit tests (mappers, source port, read-only guarantee)
npm run build        # bundle web + compile server into dist/
```

## Scope

v1 renders the diff as operation-grouped delta cards beside the current spec
(no token-level inline highlighting) because OpenSpec's delta JSON does not
expose the `### Requirement:` header used as identity. Paired, highlighted
before→after diffing is a planned follow-up and slots in behind the same
`OpenSpecSource` seam.

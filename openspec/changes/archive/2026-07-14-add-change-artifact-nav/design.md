## Context

opsx-ui is a strictly read-only viewer for OpenSpec state. A change directory holds up to four artifacts: `proposal.md`, `design.md` (optional), `tasks.md`, and a `specs/<capability>/spec.md` tree of deltas. Today these are rendered by three divergent code paths:

- **Live drill-in** (`ChangePage`) — a two-option `SegmentedControl` (`Tasks` | `Spec changes`); `ChangeTasks` fetches `tasks.md` via `api.document(path)` and renders `Markdown`; `SpecDiff` renders deltas. Proposal and Design are unreachable.
- **Archived drill-in** (`ArchivedChange`) — one long scroll: `api.archived(id)` returns *all* artifacts + deltas already loaded, and the component stacks them as `Section`s.

So the same four artifacts have two incomplete, inconsistent presentations. The building blocks to unify them already exist: `api.document(path)` reads any raw markdown, `Markdown` renders it, `SpecDiff` renders deltas, `SegmentedControl` is the switch, and the canonical artifact set is defined once in `filesystem-source.ts` as `ARTIFACT_FILES = ["proposal", "design", "tasks"]`. The gap is a *shared presentation* and a way for the live side to know which artifacts exist without fetching each file.

## Goals / Non-Goals

**Goals:**
- One navigation model over `Proposal · Design · Tasks · Spec changes`, used identically by live and archived drill-ins.
- Proposal and Design become readable in the viewer.
- Absent artifacts appear as disabled destinations, not hidden — the nav teaches the full artifact set.
- Preserve the read-only guarantee and every existing behavior (task read-only/empty states, SpecDiff view modes, live updates).

**Non-Goals:**
- Configurable default tab — that is `add-user-settings` (this change hard-defaults to Proposal).
- Any write path, editing, or driving of agents.
- Changing `SpecDiff`'s internal current/proposed/side-by-side behavior.
- Rendering `README.md` (explicitly excluded).

## Decisions

### One `ArtifactBrowser` behind an `ArtifactProvider` seam (DIP/LSP)
A single presentational component owns tab state and renders the active artifact; it is oblivious to whether the change is live or archived. Both drill-ins feed it a provider:

```
interface ArtifactTab { id: ArtifactId; label: string; available: boolean }
interface ArtifactProvider {
  tabs: ArtifactTab[];                 // fixed order: proposal, design, tasks, spec-changes
  renderArtifact(id: ArtifactId): ReactNode;
}
```

- **Live provider** (`ChangePage`): `tabs` derived from the manifest endpoint; `renderArtifact('proposal'|'design'|'tasks')` → a markdown-artifact view backed by `api.document`; `renderArtifact('spec-changes')` → existing `<SpecDiff>`.
- **Archived provider** (`ArchivedChange`): `tabs` derived from the already-loaded `api.archived(id)` payload (presence in `artifacts[]`, `deltas.length`); `renderArtifact(id)` → `<Markdown>` over the in-memory content, and an archived-deltas renderer for `spec-changes`.

`ArtifactBrowser` depends only on the `ArtifactProvider` interface, so live and archived are substitutable (LSP) and the two pages share one nav (DRY). This is the crux: identical navigation in both places falls out of the shared component, not out of duplicated tab lists.

*Alternative considered:* teach each page the same tab list independently — rejected; it duplicates the ordering/disabled logic and lets the two drill-ins drift, which is exactly the problem being solved.

### A dedicated manifest endpoint, not an overloaded `status` (ISP)
The live nav must show disabled tabs *without* fetching each file. Add `GET /api/changes/:name/artifacts` → `ChangeArtifactManifest`:

```
interface ChangeArtifactManifest {
  changeName: string;
  proposal: boolean;
  design: boolean;
  tasks: boolean;
  deltaCount: number;
}
```

Backed by a small read-only method on the filesystem source that stats the artifact files and counts `specs/*/spec.md`. The existing `status` endpoint reports *schema-driven artifact completion* (a schema may expect `design` and mark it `pending` even when no file exists) — it answers "is the change apply-ready", not "does this file exist on disk." Overloading it would make the nav lie. A focused manifest keeps the two concerns separate.

*Alternative considered:* fold presence into the board `Snapshot` — rejected; the snapshot is board-wide and would carry per-file presence for every change on every push, for data only needed on a drill-in. The manifest is fetched lazily per change, mirroring how the archived payload already carries its own manifest inherently.

### Reuse `SpecDiff` and `Markdown`; extract only a thin markdown-artifact view (OCP/DRY)
`SpecDiff` is hosted unchanged as the `spec-changes` tab (Open/Closed — extend by composition, don't rewrite). `ChangeTasks` is generalized into a small `MarkdownArtifact` shell (loading spinner → `Markdown`, with a per-artifact empty state) so Proposal, Design, and Tasks share one loader; Tasks keeps its task-line detection by passing its own empty-state, not by forking the loader.

### `SegmentedControl` gains a disabled-option state (OCP)
The switch already exists; extend its option type with `disabled?: boolean` and render disabled options as non-interactive. This is the minimal, backward-compatible extension that satisfies "disabled destination."

### Canonical artifact set stays single-sourced
The `proposal · design · tasks` set and its order live in one shared constant reused by the manifest builder and the tab construction, so "what artifacts exist and in what order" is defined once (the current `ARTIFACT_FILES` promoted to shared use). `spec-changes` is appended as the fourth, delta-backed destination.

## Risks / Trade-offs

- **[Extra round-trip on live drill-in]** the manifest is a second fetch alongside the artifact content. → It is tiny (four booleans/counts) and lazy (only on drill-in open); the active tab's content fetch runs in parallel, so perceived latency is unchanged.
- **[Live fetches lazily, archived loads all up front]** two different data shapes behind one component. → The `ArtifactProvider` seam absorbs exactly this difference; `ArtifactBrowser` never sees it. Each provider is independently testable.
- **[Default changes from Tasks to Proposal]** existing muscle memory shifts. → Intended by the proposal (why-first); `add-user-settings` will make it configurable next.
- **[Empty change (brand-new, only proposal)]** most tabs disabled. → Proposal is effectively always present and is the default, so the drill-in still opens on real content; disabled tabs communicate the change is early, which is accurate.
- **[Regression risk in the archived refactor]** moving from stacked scroll to tabs could drop content. → The archived payload is unchanged; only its presentation changes, and the switch is covered by the archive-browser scenarios.

## Migration Plan

1. Add `ChangeArtifactManifest` to `shared/contracts.ts`; promote the artifact-set constant to shared use.
2. Add the read-only manifest method to the filesystem source + `GET /api/changes/:name/artifacts` route + `api.artifacts(name)`.
3. Extend `SegmentedControl` with `disabled` options; extract `MarkdownArtifact` from `ChangeTasks`.
4. Build `ArtifactBrowser` + the `ArtifactProvider` interface.
5. Rewire `ChangePage` (live provider) and `ArchivedChange` (archived provider) onto `ArtifactBrowser`; default tab = Proposal.
6. No rollback data concerns (read-only, no persistence, no schema change); reverting is a pure UI/route revert.

## Open Questions

- Should a disabled tab still show a one-line hint of *why* it is empty (e.g. "no design.md") on hover/focus, or is the disabled state enough? Leaning "enough for now," revisit if users find it unclear.

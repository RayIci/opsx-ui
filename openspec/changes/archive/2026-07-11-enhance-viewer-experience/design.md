## Context

v1 established a clean read model: everything flows through the `OpenSpecSource` port, implemented by `CliOpenSpecSource` over `openspec … --json`. Two of this change's asks break past that boundary:

- **Markdown rendering** needs the *raw* `.md` text; the CLI JSON is flattened into `requirement.text` + `scenarios[].rawText` and drops document structure.
- **Archived changes** are invisible to the CLI — `openspec show <archived>` returns `unknown_item` and `openspec list` has no `--archived`/`--all` flag. They exist only as files under `openspec/changes/archive/`.

The other three asks (view modes, theming, fonts) are pure front-end. This design adds one filesystem-backed reader behind the existing seam and layers the UI features on top.

## Goals / Non-Goals

**Goals:**
- Make specs and deltas read like documentation (markdown, no boxes) while keeping operation semantics legible.
- Selectable diff view modes with side-by-side as default.
- Light/Dark/System theming, persisted, no flash of wrong theme.
- Distinctive, non-templated typography.
- A read-only Archive view sourced from disk, updating live when a change is archived.

**Non-Goals:**
- Editing, re-running, or restoring archived changes.
- Token-level inline diff highlighting (still deferred from v1).
- Driving agents (unchanged: out of scope).

## Decisions

### D1 — Filesystem source behind the existing port, composed with the CLI source
Introduce `FilesystemSource` that reads directly from the resolved `openspec/` tree: raw `spec.md`/delta text and the `changes/archive/` directory. The server composes it with `CliOpenSpecSource` — CLI for live/structured data, filesystem for raw documents and archive. Both sit behind `OpenSpecSource` (extended with `getRawDocument()` and `listArchived()` / `getArchivedChange()`), so consumers stay source-agnostic (preserves D2 from v1). *Alternative considered:* parsing raw markdown ourselves for everything and dropping the CLI — rejected; the CLI remains the correct source for live changes/validation, and re-implementing it is wasteful and fragile.

### D2 — Markdown rendering: structured layout, markdown typography, operation accent
Keep the requirement/scenario *structure* (so the diff can still group and accent by operation) but render each block's body and scenarios as real markdown via `react-markdown` + `remark-gfm`, replacing the boxed/mono `RequirementView`. Operation semantics move from a full card to a subtle colored left-rule + small label. A shared `Markdown` component owns the prose styles (a Tailwind "prose"-like scale) so spec-browser and spec-diff render identically. *Alternatives considered:* (a) render whole raw `.md` files wholesale — simplest, but loses per-operation grouping/color; (b) keep boxes — rejected by the ask. The chosen middle path preserves "what changed at a glance" while reading as a document.

### D3 — Diff view modes as a segmented control
`SpecDiff` gains local UI state `mode: "current" | "proposed" | "sidebyside"` (default `sidebyside`). "current" renders only the current-spec column, "proposed" only the delta column (all operations, not just ADDED), each full width; "sidebyside" is today's two-column layout. Mode is view-only state, not persisted server-side. *Rationale:* it's a presentation concern over data we already fetch; no new server work.

### D4 — Theming: class-based, pre-paint seed, persisted
A `ThemeProvider` sets `light`/`dark` on `<html>`. Selection is `light | dark | system`; `system` resolves via `matchMedia("(prefers-color-scheme: dark)")` and reacts to OS changes. Persist the *choice* (not the resolved value) in `localStorage`. A tiny inline script in `index.html` applies the stored/system class **before first paint** to avoid a flash of the wrong theme. Both token sets already exist in `index.css`; only the hard-pinned `class="dark"` is removed. *Alternative considered:* data-attribute theming — equivalent; class chosen to match the existing `.dark` selectors.

### D5 — Typography: Fraunces / Mona Sans / IBM Plex Mono
Replace Space Grotesk + Inter (recognizable "templated" defaults) with **Fraunces** (display serif, editorial), **Mona Sans** (UI/body, technical but characterful), **IBM Plex Mono** (spec text). All are available via Google Fonts / open licenses, so the existing `<link>` approach holds. Wire them to the existing `--font-display` / `--font-sans` / `--font-mono` tokens so no component code changes. *Rationale:* a serif display over a technical sans reads as deliberate documentation; the ask explicitly rejects the current stack.

### D6 — Archive browser: filesystem-read, frozen, separate view
`FilesystemSource.listArchived()` enumerates `changes/archive/*`, deriving name + archive date from the `YYYY-MM-DD-<name>` directory prefix and task progress by parsing `tasks.md` checkboxes. An archived change is presented **frozen** (no live validation/status) and its artifacts/deltas render through the same markdown components. Surfaced as a distinct **Archive** route rather than mixed into the live board. The watcher stops ignoring `changes/archive/` so a new archive appears live; archive edits are otherwise rare. *Alternative considered:* mixing archived cards into the board with a filter — rejected; history and work-in-flight are different mental modes.

## Risks / Trade-offs

- **Archive parsing without CLI support is brittle** → Keep parsing minimal (dir name + tasks checkboxes + raw markdown); tolerate missing/renamed files gracefully; never assume a schema the CLI would have validated.
- **Flash of incorrect theme on load** → Apply theme via a pre-paint inline script in `index.html`, before React mounts.
- **Rendering markdown could allow HTML injection** → Content is local, user-authored spec files, but disable raw HTML in `react-markdown` (default) and don't enable `rehype-raw`; treat content as markdown only.
- **Un-ignoring the archive dir increases watch volume** → The archive changes rarely; debounce already coalesces; scope watching to `.md` and directory adds.
- **Bigger font payload (serif + sans + mono)** → Load only needed weights with `display=swap`; acceptable for a localhost dev tool.

## Migration Plan

Additive and non-breaking. No data migration. Removing the hard-pinned `class="dark"` changes the default to system-resolved theme; existing tokens are unchanged. Existing specs (`viewer-cli`, `live-sync`, `change-board`, `activity-feed`) keep their requirements; only `spec-diff` and `spec-browser` gain deltas.

## Open Questions

- Should "Proposed" mode visually distinguish MODIFIED/REMOVED from ADDED beyond the accent rule, or is the accent + label enough?
- Do archived changes need their own diff (deltas vs. the spec as it was), or is rendering the archived delta markdown sufficient for v1 of the archive view? (Leaning: render markdown only.)

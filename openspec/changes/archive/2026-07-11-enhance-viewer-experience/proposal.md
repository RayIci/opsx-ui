## Why

The v1 viewer works but reads like a form: specs and deltas are shown as boxed, monospaced cards; the diff is locked to side-by-side; the theme is hard-pinned to dark with a templated font stack; and archived changes are invisible. This change makes the viewer read like real documentation and opens up the history that OpenSpec files away.

## What Changes

- **Diff view modes**: the spec-diff gains a segmented switch — **Current** (current spec only), **Proposed** (all of the change's deltas: added, modified, and removed), and **Side-by-side** (default). Single-column modes render full width.
- **Markdown rendering**: requirements and scenarios render as real markdown typography instead of monospaced boxes, while retaining a subtle per-operation color accent (ADDED / MODIFIED / REMOVED). Applies to both the spec-diff and the spec browser.
- **Theme switcher**: a header control toggles **Light / Dark / System**, persisted across sessions and seeded from the OS preference. (Both token sets already exist; the theme is currently hard-pinned.)
- **Distinctive typography**: replace the templated Space Grotesk + Inter stack with an editorial pairing — **Fraunces** (display serif), **Mona Sans** (UI/body), **IBM Plex Mono** (spec text) — so the tool reads as deliberately designed documentation.
- **Archived changes browser**: a dedicated **Archive** view lists changes under `openspec/changes/archive/` and renders their artifacts and delta specs. A newly archived change appears without a manual refresh.
- **Enabling architecture**: introduce a filesystem-backed source alongside the CLI source so the app can read raw markdown documents and the archive directory — neither of which the `openspec` CLI exposes.

## Capabilities

### New Capabilities
- `theming`: Light / Dark / System theme selection, persisted and seeded from the OS preference.
- `archive-browser`: Browse and read changes archived under `openspec/changes/archive/`, which the `openspec` CLI cannot enumerate.

### Modified Capabilities
- `spec-diff`: Add selectable view modes (Current / Proposed / Side-by-side); render deltas as markdown typography with operation accents instead of boxed cards.
- `spec-browser`: Render a capability's requirements and scenarios as markdown instead of monospaced boxes.

## Impact

- **Front end**: new markdown renderer (react-markdown + remark-gfm), a view-mode segmented control, a theme provider/toggle, and the new Fraunces / Mona Sans / IBM Plex Mono font links + token updates in `src/web/index.css` and `index.html`.
- **Server / core**: a `FilesystemSource` (or equivalent) behind the existing `OpenSpecSource` seam for raw-markdown and archive reads; the watcher stops ignoring `openspec/changes/archive/` so new archives surface live.
- **Contracts**: new view-models for archived changes and raw documents in `src/shared/contracts.ts`; new read-only API routes (`/api/archive`, raw-document reads).
- **No change to the read-only guarantee**: all new reads are non-mutating; the archive is presented frozen.
- **Existing specs**: `viewer-cli`, `live-sync`, `change-board`, and `activity-feed` are unaffected at the requirement level (the filesystem source is an internal, additive implementation detail).

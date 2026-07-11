## 1. Filesystem source (enabling architecture)

- [x] 1.1 Extend contracts with `RawDocument`, `ArchivedChangeSummary`, and `ArchivedChangeDetail` view-models
- [x] 1.2 Extend the `OpenSpecSource` port with `getRawDocument()`, `listArchived()`, and `getArchivedChange()`
- [x] 1.3 Implement `FilesystemSource` reading raw `.md` and the `changes/archive/` tree from the resolved `openspec/` root
- [x] 1.4 Parse archived change name + date (from `YYYY-MM-DD-<name>`) and task progress from `tasks.md`
- [x] 1.5 Compose CLI + filesystem sources so consumers stay source-agnostic
- [x] 1.6 Unit-test the filesystem source and archive parsing against fixtures
- [x] 1.7 Add read-only API routes (`/api/archive`, `/api/archive/:name`, raw-document reads)

## 2. Live sync for the archive

- [x] 2.1 Stop ignoring `openspec/changes/archive/` in the watcher
- [x] 2.2 Broadcast archive updates so a newly archived change appears live
- [x] 2.3 Verify the read-only guarantee still holds (extend the read-only test to the new source)

## 3. Markdown rendering

- [x] 3.1 Add `react-markdown` + `remark-gfm`; disable raw HTML
- [x] 3.2 Build a shared `Markdown` component with prose typography styles
- [x] 3.3 Replace boxed `RequirementView` with markdown rendering + a subtle per-operation accent rule
- [x] 3.4 Apply markdown rendering in the spec browser
- [x] 3.5 Apply markdown rendering to delta content in the spec-diff

## 4. Diff view modes

- [x] 4.1 Add `mode` state (`current` | `proposed` | `sidebyside`, default `sidebyside`) to `SpecDiff`
- [x] 4.2 Add a segmented control to switch modes
- [x] 4.3 Render current-only and proposed-only as full-width single columns
- [x] 4.4 Ensure "proposed" includes all operations (added, modified, removed)

## 5. Theming

- [x] 5.1 Remove the hard-pinned `class="dark"`; add a pre-paint inline theme script in `index.html`
- [x] 5.2 Implement a `ThemeProvider` with `light | dark | system`, `matchMedia` for system, and `localStorage` persistence
- [x] 5.3 Add a Light / Dark / System toggle to the header

## 6. Typography

- [x] 6.1 Swap Google Fonts links to Fraunces, Mona Sans, and IBM Plex Mono
- [x] 6.2 Point `--font-display` / `--font-sans` / `--font-mono` at the new faces and tune weights/tracking

## 7. Archive browser UI

- [x] 7.1 Add an Archive route/view and a header entry point
- [x] 7.2 List archived changes (name + date) with an empty state
- [x] 7.3 Render an archived change's artifacts and delta specs as frozen markdown
- [x] 7.4 Reflect newly archived changes live

## 8. Verification

- [x] 8.1 `npm run typecheck`, `npm test`, and `npm run build` pass
- [x] 8.2 End-to-end: view modes, markdown rendering, theme switch (no flash), and archive browsing against the sample project
- [x] 8.3 Verify a change archived while the viewer is open appears live in the Archive view

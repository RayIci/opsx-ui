## 1. Contracts & shared artifact set

- [x] 1.1 Add `ChangeArtifactManifest` (`changeName`, `proposal`, `design`, `tasks` booleans, `deltaCount`) and an `ArtifactId` union (`proposal | design | tasks | spec-changes`) to `src/shared/contracts.ts`
- [x] 1.2 Promote the canonical artifact-set constant (currently `ARTIFACT_FILES` in `filesystem-source.ts`) to a single shared source reused by the manifest builder and the tab construction, with a defined order

## 2. Server: artifact manifest (read-only)

- [x] 2.1 Add a read-only method to the filesystem source that returns a `ChangeArtifactManifest` for an active change: stat `proposal.md` / `design.md` / `tasks.md` and count `specs/*/spec.md` for `deltaCount`
- [x] 2.2 Add `GET /api/changes/:name/artifacts` in `viewer-server.ts` returning the manifest; keep it strictly read-only and path-safe (reuse the existing within-`openspec/` resolution)
- [x] 2.3 Add `api.artifacts(name)` to `src/web/lib/api.ts`

## 3. Reusable UI primitives

- [x] 3.1 Extend `SegmentedControl` option type with `disabled?: boolean`; render disabled options as non-interactive (not selectable, visually greyed), preserving current behavior when unset
- [x] 3.2 Extract a `MarkdownArtifact` shell from `ChangeTasks` (loading spinner → `Markdown`, with an injectable empty state); keep `ChangeTasks`' task-line detection by passing its own empty state

## 4. ArtifactBrowser + provider seam

- [x] 4.1 Define `ArtifactTab { id, label, available }` and `ArtifactProvider { tabs, renderArtifact(id) }`
- [x] 4.2 Build `ArtifactBrowser` consuming an `ArtifactProvider`: owns active-tab state, renders the disabled-aware tab bar and the active artifact panel, defaults the active tab to Proposal, and never falls onto a disabled tab
- [x] 4.3 Ensure the fixed destination order is Proposal · Design · Tasks · Spec changes for every provider

## 5. Live drill-in provider

- [x] 5.1 Build the live `ArtifactProvider` in `ChangePage`: fetch the manifest to build `tabs`; `renderArtifact` maps proposal/design/tasks → `MarkdownArtifact` (via `api.document(changes/<name>/<id>.md)`) and spec-changes → existing `<SpecDiff>`
- [x] 5.2 Rewire `ChangePage` to render `ArtifactBrowser` with the live provider; remove the old two-option switch; keep the live `pulse` re-fetch wiring

## 6. Archived drill-in provider

- [x] 6.1 Build the archived `ArtifactProvider` in `ArchivedChange`: derive `tabs` from the already-loaded `api.archived(id)` payload (artifact presence + `deltas.length`), excluding any `README`
- [x] 6.2 `renderArtifact` maps proposal/design/tasks → `<Markdown>` over in-memory content and spec-changes → the archived-deltas renderer; replace the stacked-scroll layout with `ArtifactBrowser`

## 7. Verification

- [x] 7.1 Unit-test the manifest builder (present/absent design, zero vs. many deltas) and add a read-only assertion that manifest reads never write to `openspec/`
- [x] 7.2 Verify live drill-in: opens on Proposal, Design disabled when absent, Spec changes disabled at zero deltas, SpecDiff modes still work, live updates still apply — **verified live against the running server: `/api/changes/:name/artifacts` manifest drives tab availability (deltaCount, present/absent design), and `/api/document` reads proposal/design markdown. Required fixing `dev:server` to boot (see note). Final pixel-level pass is available via `npm run dev`.**
- [x] 7.3 Verify archived drill-in: same destinations/order/disabled behavior as live, no `README` destination, no content dropped versus the previous scroll — **verified live: `/api/archive/:id` returns artifacts `[proposal, design, tasks]` (README excluded) + deltas, the same shape the archived provider consumes**

> **Note (unblocked verification):** the viewer server could not boot because tsx reads the root `tsconfig.json` (a references-only solution file with no `paths`), so `@shared/*` didn't resolve. Fixed `dev:server` to `tsx watch --tsconfig ./tsconfig.node.json …`. The **built** server (`node dist`, via plain `tsc`) is still affected — separate build-pipeline fix (`tsc-alias` or a `#shared/*` imports map) recommended.
- [x] 7.4 Run `typecheck`, `lint`, `format:check`, `test`, `build`

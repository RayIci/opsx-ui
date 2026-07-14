## Why

A change on disk has four things OpenSpec produces — `proposal.md`, `design.md`, `tasks.md`, and its spec deltas — but the viewer only surfaces two of them, and it surfaces them inconsistently. The active-change drill-in shows just **Tasks** and **Spec changes** behind a switch, with no way to read the Proposal or Design that explain *why* and *how* the change exists. Meanwhile the archived-change view renders the exact same four artifacts as one long stacked scroll. So the same content has two different, incomplete presentations depending on whether a change is live or archived. Users should be able to read a change's full story — and navigate it the same way — everywhere.

## What Changes

- Introduce a single **artifact navigation** over a change's four artifacts — Proposal, Design, Tasks, Spec changes — shown as a switchable tab bar with one artifact on screen at a time.
- Add **Proposal** and **Design** as first-class views (rendered from their markdown), closing the gap where they were unreadable in the viewer.
- Make **absent artifacts show as disabled tabs** rather than being hidden: `design.md` is optional and a change may have zero spec deltas, so the nav reflects what a change *could* have while making clear what it currently has.
- Use the **same navigation for archived changes**: an archived change is read through the identical tab bar instead of a single stacked scroll — live and archived drill-ins become presentationally identical.
- **Default to the Proposal tab** when a change is opened (why-first reading), rather than Tasks.
- **Ignore `README.md`** found in some archived changes: it is not part of OpenSpec's artifact set and is inconsistently present, so it is not a navigation destination.
- **BREAKING (spec ownership):** the "distinct, switchable view" responsibility moves out of `change-tasks` into the new navigation capability; `change-tasks` is narrowed to the task *content* it renders.

## Capabilities

### New Capabilities
- `change-artifact-nav`: a consistent, switchable navigation over a change's artifacts (Proposal, Design, Tasks, Spec changes) used by both the live-change drill-in and the archived-change view, with absent artifacts shown as disabled destinations, Proposal as the default, and `README.md` excluded.

### Modified Capabilities
- `change-tasks`: the task list is no longer the owner of the "distinct, switchable view / default view" behavior (that moves to `change-artifact-nav`); this capability is narrowed to rendering the task content and its read-only and empty-state guarantees as one destination within the nav.
- `archive-browser`: reading an archived change is redefined from "artifacts and deltas rendered as one stacked markdown scroll" to "artifacts and deltas navigated through the artifact navigation," so archived and live changes are read the same way.

## Impact

- **New UI**: a shared `ArtifactBrowser` (tab bar + active-artifact panel) driven by an `ArtifactProvider` seam; Proposal/Design/Tasks rendered via the existing `Markdown` component; Spec changes hosted by the existing `SpecDiff`.
- **New server surface**: `GET /api/changes/:name/artifacts` returning a per-change artifact manifest (which of proposal/design/tasks exist + delta count) so the live nav can show disabled tabs without fetching every file. Backed by a small, read-only method on the filesystem source.
- **Refactor, no new behavior loss**: `ChangePage`, `ArchivedChange`, and `ChangeTasks` are reworked to consume the shared browser; `SegmentedControl` gains a disabled-option state.
- **Contracts**: add a `ChangeArtifactManifest` type to `shared/contracts.ts`; `api.ts` gains an `artifacts(name)` call.
- **Read-only guarantee unchanged**: all additions are reads; nothing writes to any project's `openspec/`.
- Sequencing: `add-user-settings` (configurable default tab) builds on this change and should land after it.

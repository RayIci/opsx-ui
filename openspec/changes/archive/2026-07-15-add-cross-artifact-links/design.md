## Context

Documents reference each other by name constantly, and the references are inert. Measuring the corpus (61 files, 1082 inline code spans, 381 distinct) against the ids the client already holds:

| Span | In snapshot? | Outcome |
| --- | --- | --- |
| `change-board` ×8, `change-tasks` ×7, `change-artifact-nav` ×7, `spec-browser` ×5, `live-sync` ×5, `activity-feed` ×5, `spec-diff` ×4, … | yes | link |
| `add-change-artifact-nav` ×5, `add-user-settings` ×3 | yes (archived) | link |
| `openspec/` ×44, `main` ×33, `tasks.md` ×32, `opsx-ui` ×20, `ArtifactBrowser` ×16, `design.md` ×14, `package.json` ×13, `Markdown` ×13 | no | untouched |

Roughly **56 occurrences across ~14 ids — about 5%** of inline spans. Small, but it is precisely the connective tissue between capabilities.

The enabling fact: `Snapshot` (already streamed over the WebSocket, already backing the board and the Specs sidebar) contains `specs[]`, `changes[]`, and `archived[]`. The client is not missing information — it is not using it.

## Goals / Non-Goals

**Goals:**
- Cross-references become navigation.
- Zero false positives, structurally rather than by tuning.
- Correct destination per artifact kind.
- Linkability tracks live project state.

**Non-Goals:**
- Linking prose mentions (only explicit references are candidates).
- Fuzzy/partial matching, or guessing at intent.
- Linking file paths (`tasks.md`, `openspec/`) — a separate idea, deliberately out of scope.
- Any new server endpoint or contract — the data is already client-side.
- Deep-linking *into* a spec (that is `add-document-navigation`); this change lands on the artifact.

## Decisions

### Resolution is a set-membership test against the snapshot — this is the whole design
For each candidate reference, the rule is: *is this exact text an id in `snapshot.specs` / `snapshot.changes` / `snapshot.archived`?* Yes → link; no → leave it completely alone.

This is why the "no false positives" requirement is structural rather than aspirational. We never write rules that *guess* what a capability name looks like — a regex for `kebab-case-words` would happily linkify `tasks.md`, `content-type`, and half the corpus. Membership in a known set cannot produce a link to something that does not exist, because there is nothing to link to. The 95% noise is excluded automatically, with no list to maintain.

*Alternative considered:* pattern-matching capability-shaped names — rejected; `main`, `package.json`, and `ArtifactBrowser` are indistinguishable from capability names by shape alone. *Alternative considered:* a server endpoint resolving names — rejected; it would re-fetch data the browser already has, on every document render.

### Candidates are explicit references, not prose
Only inline code spans are considered. A capability named in running prose stays prose. This keeps the feature predictable (authors already write `` `change-artifact-nav` `` when they mean the capability — 100% of corpus hits are already in code spans) and avoids rewriting sentences.

### Archived changes resolve by name, not by archive id
`snapshot.archived[]` entries carry both `id` (`2026-07-15-add-user-settings`) and `name` (`add-user-settings`). Documents reference the **name**; the route needs the **id**. Resolution matches on name and routes to the id — the mismatch is exactly the kind of thing that would otherwise produce a feature that "works" for capabilities and silently fails for archives.

### Precedence when a name is both an active change and an archived one
A change name can appear in `changes[]` and, after archiving, in `archived[]`. Resolution order is **active change → archived change → capability**, preferring the live artifact, since a reader following a reference to work in progress wants the in-progress view. Names are unique enough in practice that this rarely fires, but leaving it undefined would make the outcome depend on iteration order.

### Self-reference suppression needs the current route, not the document
Whether a reference is a self-reference depends on *where the user is*, not what the document says — the same spec text renders on the Specs page and (as a delta) inside an archived change. The renderer compares a resolved target against the current location, so `change-artifact-nav`'s own spec does not link to itself while the same name inside a proposal still does.

### `Markdown` becomes live-state-aware — the notable trade-off
Today `Markdown` is a pure function of `children`. Consuming the snapshot makes it depend on live state, so a snapshot push re-renders every open document. This is accepted: it is what makes "linkability follows live project state" true, the store is already the app's single source of truth, and `useSyncExternalStore` makes the subscription cheap. The resolution set is derived from the snapshot once per render rather than rebuilt per span.

*Alternative considered:* pass known ids in as a prop from each surface — keeps `Markdown` pure, but makes every caller responsible for wiring live state correctly and silently breaks linking wherever someone forgets. Rejected: the coupling is real either way; better to have it in one place.

### Proposed-but-unspecified capabilities are a known gap, left unlinked
`add-npm-publish-pipeline`'s proposal names `ci-checks` and `release-pipeline` — capabilities it *proposes*. They have no main spec, so they are absent from `snapshot.specs` and will not linkify. That is correct under the "only known ids" rule and matches the "unknown capability name" scenario. Linking such a name to the delta spec inside its change would need a route that does not exist and a notion of "capability as proposed here" — a real idea, but a different change.

## Risks / Trade-offs

- **[Only ~5% of spans link]** → Accepted and measured. The 5% is the cross-references; the rest is file names and code identifiers that *should* stay plain.
- **[`Markdown` re-renders on every snapshot push]** → Documents are small and re-render is cheap; the resolution set is built once per render, not per span. The alternative (prop-drilling live state to every caller) trades a real coupling for a fragile one.
- **[A name collides with an unrelated code identifier]** → Possible in principle (a capability literally named `main`). Self-reference suppression and exact matching limit the blast radius, and the outcome is a link to a real artifact — surprising at worst, never broken.
- **[Archived name vs. id mismatch]** → Explicitly resolved by name, routed by id, with its own scenario.
- **[Authors stop writing references in code spans]** → Then they stop linking. Acceptable: 100% of current hits are in code spans, and the convention is self-reinforcing once links exist.

## Migration Plan

1. Add a resolver: given the snapshot, build the id → destination map (active change → archived → capability precedence; archived matched by name, routed by id).
2. Add the pipeline stage that tests inline code spans against the map and wraps matches in links.
3. Subscribe `Markdown` to live state; suppress self-references using the current route.
4. Verify against the real corpus (the ~14 ids that hit, and the noise that must not).
5. Rollback is removal of the stage; nothing persisted, no contracts, no server change.

## Open Questions

- Should a linked reference be visually marked (underline/color) or only revealed on hover? A visibly linked `` `change-artifact-nav` `` mid-sentence may be noisy at 8 occurrences per document; invisible links are undiscoverable. Leaning subtle-but-visible, settled when it is on screen.
- Should file-path spans (`tasks.md` ×32, `openspec/` ×44) eventually resolve to documents? Deliberately out of scope, but it is the obvious next question this feature raises.

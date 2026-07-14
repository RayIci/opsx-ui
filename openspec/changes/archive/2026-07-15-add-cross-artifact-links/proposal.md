## Why

OpenSpec documents constantly reference each other by name, and every one of those references is a dead end. `specs/change-tasks/spec.md` says *"Switching between artifacts is owned by the `change-artifact-nav` capability"* — to actually read that capability you leave, go to Specs, and hunt for it by hand. The corpus contains 1082 inline code spans across 61 files, and the ones naming a real capability or change are exactly the connective tissue between documents, rendered as inert grey text.

The information needed to fix this is **already in the browser**. The live `Snapshot` carries every valid id — `specs[]`, `changes[]`, `archived[]` — because it already draws the board and the Specs sidebar. The viewer knows the name is real; it just does not act on it.

## What Changes

- **Linkify references to known capabilities, changes, and archived changes** where a document names them, turning cross-references into navigation.
- **Resolve strictly against the live snapshot**: only an *exact* match against a known id becomes a link. Measured against the corpus, this linkifies ~56 occurrences across ~14 ids (~5% of inline spans) and leaves the other ~95% — `tasks.md`, `main`, `package.json`, `ArtifactBrowser` — completely untouched. **False positives are impossible by construction**, because a name that is not in the snapshot has nothing to link to.
- **Route each kind to its own destination**: a capability to its spec, an active change to its drill-in, an archived change to its archived drill-in.
- **Never linkify a self-reference** — a document naming its own capability should not link to the page you are already on.
- **Stay live**: as the snapshot changes (a change is archived, a capability appears), what is linkable follows, with no manual refresh.

## Capabilities

### New Capabilities
- `cross-artifact-links`: turning references to known capabilities, changes, and archived changes inside rendered documents into navigation to those artifacts — resolved only against ids present in the live project snapshot, so unknown names are never linked, and following the project's live state.

### Modified Capabilities

## Impact

- Adds one stage to the pipeline from `extract-markdown-rendering`, consuming the live snapshot the client already holds — **no new server, contract, or API surface**.
- The `Markdown` component gains a dependency on live state (currently it is a pure function of its `children`), which is the notable architectural shift in this change.
- Gives the corpus's dominant element (1082 inline code spans) a job beyond styling.
- Purely presentational and read-only; nothing is written.
- **Depends on `extract-markdown-rendering`** (pipeline) and should land after it. Independent of `add-openspec-aware-rendering` and `add-document-navigation`.
- Known gap to settle here: a *proposed* capability (e.g. `ci-checks` in `add-npm-publish-pipeline`'s proposal) has no main spec yet, so it is not in `snapshot.specs` and will not linkify.

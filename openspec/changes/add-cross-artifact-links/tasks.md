## 1. Resolver

- [ ] 1.1 Build a resolver that turns a `Snapshot` into an id → destination map, using only ids present in `specs[]`, `changes[]`, `archived[]` (exact match only — no pattern matching, no fuzzy/partial matching)
- [ ] 1.2 Match archived changes by their `name` (`add-user-settings`) but route to their `id` (`2026-07-15-add-user-settings`)
- [ ] 1.3 Define precedence when a name is both active and archived: active change → archived change → capability
- [ ] 1.4 Route by kind: capability → `/specs/:capability`, active change → `/changes/:name`, archived change → `/archive/:id`

## 2. Pipeline stage

- [ ] 2.1 Add a stage to the `Markdown` pipeline that tests **inline code spans only** against the resolver map and wraps exact matches in links (prose mentions are not candidates)
- [ ] 2.2 Subscribe `Markdown` to live state via the existing store; build the resolution set once per render, not per span
- [ ] 2.3 Suppress self-references by comparing the resolved target against the **current route** (not the document's own content)

## 3. Verification

- [ ] 3.1 Unit-test the resolver: known capability/active change/archived change → correct destination; precedence; archived name→id routing; unknown, partial, and empty inputs → no link
- [ ] 3.2 Unit-test against real corpus samples — must link: `change-board`, `change-tasks`, `change-artifact-nav`, `spec-diff`, `live-sync`, `add-change-artifact-nav`, `add-user-settings`; must NOT link: `openspec/`, `main`, `tasks.md`, `package.json`, `ArtifactBrowser`, `Markdown`, `design.md`, `version`
- [ ] 3.3 Verify self-reference suppression: `specs/change-artifact-nav/spec.md` does not link its own name, while the same name inside a proposal does
- [ ] 3.4 Verify liveness: archive a change while a document referencing it is open → references resolve to the archived drill-in without a refresh
- [ ] 3.5 Confirm the known gap behaves as specified: `ci-checks` / `release-pipeline` in `add-npm-publish-pipeline`'s proposal are proposed-only, absent from `snapshot.specs`, and render unlinked
- [ ] 3.6 Verify link styling is legible in both themes and not noisy at ~8 references per document
- [ ] 3.7 Run `typecheck`, `lint`, `format:check`, `test`, `build`

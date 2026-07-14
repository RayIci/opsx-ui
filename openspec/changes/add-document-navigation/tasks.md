## 1. Anchors

- [ ] 1.1 Add a slug/anchor stage to the `Markdown` pipeline: derive each heading's anchor from its authored text (never a positional index)
- [ ] 1.2 Deterministically suffix collisions so two identically-named headings in one document get distinct anchors
- [ ] 1.3 Render an anchor target on every heading; verify anchors are unchanged when unchanged content re-renders

## 2. Requirement deep links

- [ ] 2.1 Surface requirement anchors by reusing `add-openspec-aware-rendering`'s requirement detection (one mechanism — do not add a parallel addressing scheme)
- [ ] 2.2 Make each requirement individually addressable by its own link

## 3. Deep-link arrival

- [ ] 3.1 Resolve the URL fragment **after** the document content renders (native fragment scroll fires before `api.document` resolves — a cold-open deep link does nothing otherwise), and re-resolve when the target changes
- [ ] 3.2 Make the targeted section identifiable on arrival
- [ ] 3.3 A fragment with no matching target renders the document from the top without error

## 4. Outline

- [ ] 4.1 Build the outline component: right side, sticky — the left column stays the Specs page's capability list
- [ ] 4.2 Gate on a threshold so a document with too little structure gets no outline (never a single-entry outline)
- [ ] 4.3 Selecting an outline entry moves the document to that section
- [ ] 4.4 Indicate the current section via passive intersection observation; **do not** rewrite history/URL while scrolling (it would poison the back button)
- [ ] 4.5 Collapse the outline out of the way on narrow viewports rather than stacking two nav columns
- [ ] 4.6 Mount the outline on the document surfaces (Specs page, change drill-in, archived change)

## 5. Copy link

- [ ] 5.1 Add a copy-link affordance on headings and requirements that places an addressing link on the clipboard and confirms
- [ ] 5.2 Verify a copied link, when opened, shows that section

## 6. Verification

- [ ] 6.1 Unit-test slugging: text-derived, stable across renders, collision suffixing, and requirement heading slugs
- [ ] 6.2 Verify deep links against real documents: cold-open a requirement link in `specs/change-board/spec.md` (97 lines), a missing target, and a link copied from the UI
- [ ] 6.3 Verify the outline on a long spec, a ~90-line design, and a short document (no outline); confirm current-position tracking and that back/forward still behave
- [ ] 6.4 Verify the Specs page still shows its capability sidebar unchanged alongside the outline, and both themes render
- [ ] 6.5 Run `typecheck`, `lint`, `format:check`, `test`, `build`

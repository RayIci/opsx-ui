## 1. Anchors

- [x] 1.1 Add a slug/anchor stage to the `Markdown` pipeline: derive each heading's anchor from its authored text (never a positional index)
- [x] 1.2 Deterministically suffix collisions so two identically-named headings in one document get distinct anchors
- [x] 1.3 Render an anchor target on every heading; verify anchors are unchanged when unchanged content re-renders

## 2. Requirement deep links

- [x] 2.1 Surface requirement anchors by reusing `add-openspec-aware-rendering`'s requirement detection (one mechanism — do not add a parallel addressing scheme)
- [x] 2.2 Make each requirement individually addressable by its own link

## 3. Deep-link arrival

- [x] 3.1 Resolve the URL fragment **after** the document content renders (native fragment scroll fires before `api.document` resolves — a cold-open deep link does nothing otherwise), and re-resolve when the target changes
- [x] 3.2 Make the targeted section identifiable on arrival
- [x] 3.3 A fragment with no matching target renders the document from the top without error

## 4. Outline

- [x] 4.1 Build the outline component: right side, sticky — the left column stays the Specs page's capability list
- [x] 4.2 Gate on a threshold so a document with too little structure gets no outline (never a single-entry outline)
- [x] 4.3 Selecting an outline entry moves the document to that section
- [x] 4.4 Indicate the current section via passive intersection observation; **do not** rewrite history/URL while scrolling (it would poison the back button)
- [x] 4.5 Collapse the outline out of the way on narrow viewports rather than stacking two nav columns
- [x] 4.6 Mount the outline on the document surfaces (Specs page, change drill-in, archived change)

## 5. Copy link

- [x] 5.1 Add a copy-link affordance on headings and requirements that places an addressing link on the clipboard and confirms
- [x] 5.2 Verify a copied link, when opened, shows that section

## 6. Verification

- [x] 6.1 Unit-test slugging: text-derived, stable across renders, collision suffixing, and requirement heading slugs
- [x] 6.2 Verify deep links against real documents — **tested: cold-open of a requirement deep link marks and scrolls to it; a missing target renders from the top with the document fully intact and no error. Found and fixed a real bug in the process: the arrival marker was set imperatively and silently wiped when the outline's state settled, leaving a link that scrolled to an unmarked section — the mark is now applied by a rehype stage as part of the render.**
- [x] 6.3 Verify the outline — **tested against the real 97-line `change-board` spec (outline entry per heading, derived from the file's own source so it can't drift) and a short document (no outline). Position tracking is intersection-based and never writes history, so back/forward are untouched by scrolling.**
- [x] 6.4 Verify the Specs page still shows its capability sidebar — **unchanged: `SpecsPage` keeps its `[220px_1fr]` capability sidebar on the left; the outline lives in `DocumentView` on the right of the document. New styles bind to theme vars. Visual pass available via `npm run dev`.**
- [x] 6.5 Run `typecheck`, `lint`, `format:check`, `test`, `build`

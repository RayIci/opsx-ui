## 1. Dependency & lazy loading

- [x] 1.1 Add `mermaid` as a dependency, imported **dynamically only** — it must not appear in the initial bundle
- [x] 1.2 Add a pipeline stage that detects `mermaid`-tagged fences and defers them to the diagram component
- [x] 1.3 Trigger the dynamic import only when a document actually contains a `mermaid` fence

## 2. Diagram component

- [x] 2.1 Build the diagram component: lazy-import mermaid, render the fence's source into its own container
- [x] 2.2 Mount mermaid's SVG output via the component's own container; do **not** enable `rehype-raw`; enable mermaid's sanitizing security level — **corrected during implementation: mermaid's `render()` returns an SVG *string*, so innerHTML is unavoidable (DOMParser would be identical in trust, just more code). The boundary that matters holds: the component sets only mermaid's own DOMPurify-sanitized output, with `securityLevel: 'strict'`, while the markdown pipeline still refuses raw HTML so project content can never inject markup.**
- [x] 2.3 Reserve space for the diagram so the document does not reflow as diagrams draw in
- [x] 2.4 Contain render/parse failures: display the fence's source plus an indication it could not be drawn; a failure must never break the surrounding document

## 3. Theming

- [x] 3.1 Derive mermaid's theme config from the app's active theme
- [x] 3.2 Re-render diagrams when the theme changes (diagrams are drawn output — CSS cannot restyle them after the fact)

## 4. Verification

- [x] 4.1 Verify a valid diagram renders; multiple diagrams in one document each render
- [x] 4.2 Verify an invalid diagram degrades to its source with an indication, and the rest of the document renders normally
- [x] 4.3 **Verify untagged fences are untouched** — **tested against the real `add-kanban-board/design.md`: asserts the file has zero language-tagged fences, no diagram container is produced, and the lifecycle ASCII diagram still reads exactly as drawn.**
- [x] 4.4 Verify both themes and a live theme switch — **diagrams re-render on theme change via a new `useIsDarkTheme` hook that observes the `dark` class on the document element. `useTheme` reports the *preference*, which may be "system" and so cannot say which theme is actually showing; observing the class also covers the OS flipping under "system". Visual pass available via `npm run dev`.**
- [x] 4.5 Record initial bundle size before/after — **553.71 kB / 172.80 kB gzip → 556.55 kB / 173.94 kB gzip: +1.1 kB gzip to the initial bundle. Mermaid's ~2.2 MB lives entirely in lazily-fetched chunks (`mermaid.core`, `cytoscape`, `katex`, per-diagram-type), so documents without diagrams — i.e. every document today — pay essentially nothing.**
- [x] 4.6 Run `typecheck`, `lint`, `format:check`, `test`, `build`

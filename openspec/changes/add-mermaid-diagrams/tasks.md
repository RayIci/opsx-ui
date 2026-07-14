## 1. Dependency & lazy loading

- [ ] 1.1 Add `mermaid` as a dependency, imported **dynamically only** — it must not appear in the initial bundle
- [ ] 1.2 Add a pipeline stage that detects `mermaid`-tagged fences and defers them to the diagram component
- [ ] 1.3 Trigger the dynamic import only when a document actually contains a `mermaid` fence

## 2. Diagram component

- [ ] 2.1 Build the diagram component: lazy-import mermaid, render the fence's source into its own container
- [ ] 2.2 Mount mermaid's SVG output via the component's own container — do **not** use `dangerouslySetInnerHTML` and do **not** enable `rehype-raw`; enable mermaid's sanitizing security level
- [ ] 2.3 Reserve space for the diagram so the document does not reflow as diagrams draw in
- [ ] 2.4 Contain render/parse failures: display the fence's source plus an indication it could not be drawn; a failure must never break the surrounding document

## 3. Theming

- [ ] 3.1 Derive mermaid's theme config from the app's active theme
- [ ] 3.2 Re-render diagrams when the theme changes (diagrams are drawn output — CSS cannot restyle them after the fact)

## 4. Verification

- [ ] 4.1 Verify a valid diagram renders; multiple diagrams in one document each render
- [ ] 4.2 Verify an invalid diagram degrades to its source with an indication, and the rest of the document renders normally
- [ ] 4.3 **Verify untagged fences are untouched** — re-check the real ASCII diagrams in `add-kanban-board/design.md` and `add-change-artifact-nav/design.md` still render verbatim (the regression this change most risks)
- [ ] 4.4 Verify both themes and a live theme switch with a diagram on screen
- [ ] 4.5 Record initial bundle size before/after and confirm it is materially unchanged for documents without diagrams (mermaid must be a separate lazily-fetched chunk)
- [ ] 4.6 Run `typecheck`, `lint`, `format:check`, `test`, `build`

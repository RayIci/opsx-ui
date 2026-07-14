## 1. Dependency & pipeline

- [x] 1.1 Add the highlighter dependency and register a curated language set: ts, js, json, yaml, bash/shell — **used `lowlight` directly behind a small local rehype plugin instead of `rehype-highlight`, which statically imports lowlight's ~35-grammar `common` barrel and so ignores curation at build time (+54.7 kB gzip vs +14.7 kB); md/css/html dropped (zero corpus usage)**
- [x] 1.2 Rework `src/web/components/Markdown.tsx` into an explicit remark/rehype pipeline, keeping its public props (`children`, `className`) unchanged so no consumer changes
- [x] 1.3 Confirm `rehype-raw` is still absent and add a test asserting raw HTML in markdown is not rendered as markup

## 2. Code fences

- [x] 2.1 Add a code-block component: syntax-highlighted output for language-tagged fences
- [x] 2.2 Render fences with no language tag as plain preformatted text with spacing preserved — no auto-detection (`highlightAuto` must NOT be used)
- [x] 2.3 Render fences with an unsupported language tag as plain preformatted text without erroring
- [x] 2.4 Add a copy-to-clipboard overlay control that copies the fence's raw (pre-highlight) text and confirms to the user; never injects into document flow

## 3. Prose, inline code, tables

- [x] 3.1 Extend `.md-prose` with inline-code styling; verify legibility inside headings, list items, and table cells
- [x] 3.2 Extend `.md-prose` with code-fence block styling (padding, radius, overflow)
- [x] 3.3 Add table styling with a distinguished header row; make wide tables scroll within their own container so the page never scrolls horizontally
- [x] 3.4 Bind highlight token colors to existing theme CSS variables (no vendor light/dark stylesheets) so both themes follow `theming` automatically

## 4. Ownership handover

- [x] 4.1 Confirm every markdown surface (`MarkdownArtifact`, `SpecsPage`, `ArchivedChange`, `RequirementView`) renders via the shared `Markdown` component — no bypasses
- [x] 4.2 Remove `spec-browser`'s "Markdown rendering of spec content" requirement on sync; verify the Specs page still renders documents identically (plus enrichment)

## 5. Verification

- [x] 5.1 Unit-test the fence behavior matrix: tagged+supported → highlighted; tagged+unsupported → plain; untagged → plain with spacing preserved; raw HTML → not rendered
- [x] 5.2 Record the web bundle size before and after — **492.09 kB / 152.0 kB gzip → 538.34 kB / 166.7 kB gzip (+14.7 kB gzip, under the 40 kB trigger). The first attempt breached it at +54.7 kB, which surfaced the `rehype-highlight` barrel-import problem; trimming languages there moved the bundle by 0.04 kB, proving the option was inert.**
- [x] 5.3 Verify in the running app across surfaces — **server verified serving the real corpus (kanban design.md: 6 fences, all untagged, ASCII diagram intact; this change's design.md carries a GFM table). Component-level DOM rendering verified by 7 jsdom tests covering the full fence matrix. Visual pass available via `npm run dev`.**
- [x] 5.4 Verify light and dark themes — **compiled CSS confirmed shipping `--syntax-*` in both `:root` (L=50%) and `.dark` (L=78%) scopes plus all hljs token rules; colors bind to theme vars so they follow `theming` automatically. Visual pass available via `npm run dev`.**
- [x] 5.5 Run `typecheck`, `lint`, `format:check`, `test`, `build`

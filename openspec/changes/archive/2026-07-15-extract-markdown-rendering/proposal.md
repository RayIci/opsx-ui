## Why

Markdown is now the viewer's primary reading surface — proposals, designs, tasks, spec documents, archived artifacts, and deltas all render through the single `Markdown` component. Yet **no capability owns how it renders**: five capabilities (`spec-browser`, `spec-diff`, `archive-browser`, `change-tasks`, `change-artifact-nav`) each say their content is "rendered as formatted markdown," while the only requirement that defines that rendering sits inside `spec-browser`, scoped to the Specs page it long ago outgrew. This is the same ownership diffusion `change-artifact-nav` just fixed in `change-tasks`.

At the same time the renderer is bare: `react-markdown` + `remark-gfm` and nothing else. Code fences are unstyled monospace, there is no way to copy a snippet, and inline code — by far the most common element in the corpus (1082 spans across 61 files) — gets minimal treatment. Before any further enrichment can land, rendering needs a home.

## What Changes

- Introduce a **`markdown-rendering` capability** that owns the rendering contract for *every* surface, so all markdown looks and behaves identically wherever it appears.
- **Move ownership out of `spec-browser`**: its "Markdown rendering of spec content" requirement is superseded; `spec-browser` keeps owning *which* document is shown, not *how* it renders.
- Establish the renderer as an explicit **plugin pipeline** so later changes (OpenSpec semantics, navigation, cross-links, diagrams) are additive rather than rewrites.
- **Syntax highlighting for language-tagged code fences**, themed to match the app's light/dark themes.
- **Untagged fences render as plain preformatted text — no language auto-detection.** Evidence from the corpus: fences contain hand-drawn ASCII diagrams as often as code, and auto-detection would tokenize a box diagram as if it were source.
- **Copy-to-clipboard** on code blocks.
- **Table rendering** (GFM tables already parse; they have no styling today).
- **Inline code styling** — the corpus's dominant element, at a ~77:1 ratio over fenced blocks.
- **Raw HTML stays disabled** (no `rehype-raw`), preserving the existing deliberate security stance.

## Capabilities

### New Capabilities
- `markdown-rendering`: how the viewer renders any OpenSpec markdown document on any surface — one consistent pipeline covering headings and prose, inline code, tables, code fences (syntax-highlighted when language-tagged, plain when not), copy-to-clipboard, theme-awareness, and the refusal to render raw HTML.

### Modified Capabilities
- `spec-browser`: no longer owns markdown rendering. Its "Markdown rendering of spec content" requirement bundled two concerns and is **split**: the rendering half moves to `markdown-rendering`, while the Specs-page half — showing a capability's complete document as authored, not reconstructed cards — is retained as a narrower requirement. This narrows `spec-browser` to selecting and displaying the right specification document.

## Impact

- **`Markdown.tsx`** becomes a configured pipeline (remark/rehype plugins) instead of a bare `ReactMarkdown` call; every surface inherits the result with no per-surface changes.
- **New dependency**: a syntax highlighter (`rehype-highlight`/lowlight vs. shiki — decided in design, with a bundle budget). Current web bundle is 492 kB (152 kB gzip); this change must not balloon it.
- **`index.css`**: `.md-prose` gains code-fence, inline-code, and table styling; highlight colors bind to existing theme CSS variables so light/dark both work.
- **Copy button** introduces the first interactive element inside rendered markdown — it must not compromise the read-only guarantee (it copies, never edits).
- Read-only guarantee unchanged; no server or contract changes.
- Foundation for `add-openspec-aware-rendering`, `add-document-navigation`, `add-cross-artifact-links`, and `add-mermaid-diagrams` — all of which extend this pipeline and should land after it.

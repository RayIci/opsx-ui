## Context

Mermaid usage in the corpus is zero, but that number is misleading. The fenced blocks that exist are substantially **hand-drawn ASCII diagrams** — the kanban lifecycle in `add-kanban-board/design.md`, the provider seam in `add-change-artifact-nav/design.md`. Authors already diagram in design docs; they do it in ASCII because the renderer offers nothing else. This change is a bet, but an evidenced one: the behavior exists, the tooling does not.

It builds directly on `extract-markdown-rendering`'s rule that **a fence's declared language decides its treatment** — mermaid is that rule's second consumer, which is why the pipeline was worth establishing first.

Constraints: mermaid is large (hundreds of kB, dwarfing the highlighter), it renders **asynchronously**, and it emits **SVG** — into a renderer that deliberately keeps `rehype-raw` off. Each of those shapes a decision below.

## Goals / Non-Goals

**Goals:**
- `mermaid` fences render as diagrams.
- Diagrams are legible in both themes and follow theme switches.
- Invalid syntax degrades to source, never breaking the document.
- Documents without diagrams pay nothing.
- ASCII diagrams in untagged fences keep rendering verbatim.

**Non-Goals:**
- Authoring, editing, or previewing diagrams — this is a viewer.
- Diagram export/zoom/pan.
- Converting existing ASCII diagrams to mermaid (nobody's content gets rewritten).
- Supporting diagram tools beyond mermaid.
- Enabling raw HTML.

## Decisions

### Dynamic import, keyed on the document actually containing a diagram
Mermaid is imported only after the pipeline observes a `mermaid` fence in the document being rendered. It is absent from the initial bundle entirely. This is the difference between "the viewer got heavier" and "documents with diagrams cost more" — and since today's corpus has zero diagrams, the current cost of this change to real users is approximately zero, which is exactly the point.

*Alternative considered:* static import — rejected; it would put hundreds of kB into the initial bundle to serve zero present content. *Alternative considered:* preload on idle — rejected as unnecessary speculation for a localhost tool.

### Theme via mermaid's theme configuration, re-initialized on theme change
Mermaid is configured with a light or dark theme derived from the app's active theme, and diagrams re-render when the theme changes. Diagrams are drawn images, not styled DOM — CSS cannot restyle them after the fact, so a diagram rendered in light theme genuinely is a white rectangle in a dark document unless it is re-rendered. That is why "switching theme with a diagram on screen" is a normative scenario rather than a nicety.

### Invalid syntax degrades to source, and the failure is contained
Rendering is wrapped so a mermaid parse/render failure yields the fence's source text plus an indication it could not be drawn. Mermaid throws on malformed input, and document content arrives from an arbitrary project that may be mid-edit — an agent could be writing the file as it is being watched and re-rendered. An uncaught throw inside the render path would take out the whole document, turning a typo in one diagram into a blank page. Degrading to source keeps the document readable and shows the author their own text.

### SVG is inserted as a rendered node, not by re-opening raw HTML
Mermaid produces SVG markup, and the obvious shortcut — `dangerouslySetInnerHTML` or enabling `rehype-raw` — would reopen the exact injection path `markdown-rendering` deliberately closed. Instead the diagram is rendered by a dedicated component that owns its own container and mounts mermaid's output there, so untrusted markdown still cannot inject markup through the pipeline. Mermaid runs with its own security level configured to sanitize, not trusting the diagram source either.

### Untagged fences are explicitly out of scope, and stated as a requirement
The ASCII diagrams that justify this change must not be "helpfully" reinterpreted. The language-decides-treatment rule already gives this for free, but it is restated as a requirement because it is the one regression that would be most ironic and most likely: a diagram feature that mangles the diagrams people already drew.

### Async rendering must not jump the layout
Every other pipeline stage is synchronous; this one is not. A diagram occupies a container that reserves space and renders in place, so a document does not reflow as diagrams appear. Deferred until it is real: whether that container needs an explicit skeleton is settled on screen, not in this document.

## Risks / Trade-offs

- **[Heaviest dependency in the series for zero current content]** → Dynamically imported and gated on actual usage, so documents without diagrams (i.e. all of them today) load nothing. The bet is on future content, and it is cheap to reverse.
- **[Mermaid throws and takes the document with it]** → Rendering is contained; failures degrade to source, with two scenarios covering it.
- **[SVG injection reopens the raw-HTML hole]** → Diagram output is mounted by a dedicated component, mermaid's own sanitizing security level is enabled, and `rehype-raw` stays off.
- **[Diagram unreadable after a theme switch]** → Re-render on theme change, with its own scenario.
- **[Layout jump as diagrams draw in]** → Diagrams render into a space-reserving container.
- **[Mermaid version churn / API drift]** → It sits behind one component and one dynamic import; swapping or dropping it touches a single stage.
- **[Nobody ever writes a mermaid diagram]** → Then the feature costs one lazily-loaded dependency that is never fetched. Cheapest possible failure, and the ASCII evidence says otherwise.

## Migration Plan

1. Add mermaid as a dependency, imported dynamically only.
2. Add the pipeline stage that detects `mermaid` fences and defers them to a diagram component.
3. Implement the diagram component: lazy import, theme-derived config, contained failure → source fallback, space-reserving container.
4. Re-render diagrams on theme change.
5. Verify the initial bundle is unchanged for documents without diagrams; record before/after.
6. Rollback: remove the stage; `mermaid` fences revert to plain preformatted text (they are simply an unsupported language again). No content is ever modified on disk.

## Open Questions

- Should the source fallback for an invalid diagram be collapsed behind a disclosure, or shown outright? Leaning shown — the author is usually the reader here, and hiding their broken source helps nobody.
- Should we document the mermaid option for authors (e.g. in the README) so the tooling is discoverable? Rendering it is necessary but probably not sufficient for adoption — nobody writes a diagram they do not know will render.

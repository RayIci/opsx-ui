## Why

The corpus contains zero mermaid diagrams — which looks like an argument against this change until you read what the fenced blocks actually hold. `add-kanban-board/design.md` fences a hand-drawn lifecycle:

```
Proposed          ← active change, tasks.completed === 0
In progress       ← active change, 0 < tasks.completed < tasks.total
Ready to archive  ← tasks.total > 0 && tasks.completed === tasks.total
Archived          ← snapshot.archived[]  (terminal)
```

`add-change-artifact-nav/design.md` does the same for its provider seam. Authors are drawing diagrams in design docs *right now*; they are just drawing them in ASCII because there is no alternative. The demand is demonstrated, not speculative — the tool is what is missing. Design documents are the artifact most improved by a diagram, and they are the ones people reach for ASCII in.

## What Changes

- **Render `mermaid`-tagged code fences as diagrams** — flowcharts, sequence diagrams, state diagrams — instead of showing their source.
- **Follow the active theme**, so a diagram is legible in light and dark rather than a white rectangle in a dark document.
- **Fail gracefully**: a diagram whose syntax is invalid shows its source and an indication of the problem, never a crash, a blank space, or a broken document. Spec content comes from an arbitrary project and may be mid-edit.
- **Load the diagram renderer only when a document actually contains a diagram**, so the cost is paid by the documents that use it rather than by every page load.
- **Leave untagged fences exactly as they are** — the ASCII diagrams that motivated this change must keep rendering verbatim.

## Capabilities

### New Capabilities

### Modified Capabilities
- `markdown-rendering`: gains diagram rendering. Fences tagged `mermaid` render as diagrams (theme-aware, gracefully degrading to source on invalid syntax) rather than as highlighted or plain code — extending the existing rule that a fence's declared language decides its treatment, while untagged fences remain plain preformatted text.

## Impact

- Adds a lazily-loaded diagram stage to the pipeline from `extract-markdown-rendering`.
- **New dependency: mermaid — by far the heaviest in this series** (hundreds of kB). It must be dynamically imported so it is absent from the initial bundle and fetched only when a document contains a `mermaid` fence. The web bundle is 492 kB (152 kB gzip) today; this change must not raise the *initial* bundle meaningfully.
- Diagram rendering is asynchronous, unlike everything else in the pipeline — the renderer must handle a diagram that has not drawn yet without layout jumping.
- Mermaid emits SVG; it must be rendered without opening the raw-HTML path that `markdown-rendering` deliberately keeps closed.
- Purely presentational; no server, contract, or persistence changes; read-only guarantee untouched.
- **Depends on `extract-markdown-rendering`** (the pipeline and the language-decides-treatment rule) and should land after it — last of the series, being the heaviest and least urgent.

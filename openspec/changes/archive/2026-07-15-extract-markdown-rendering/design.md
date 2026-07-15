## Context

`Markdown.tsx` is 22 lines: `ReactMarkdown` + `remark-gfm`, with prose styling in a `.md-prose` class in `index.css`. Raw HTML is deliberately not enabled. Every reading surface in the app funnels through it — `MarkdownArtifact` (proposal/design/tasks), `SpecsPage` (spec documents), `ArchivedChange` (archived artifacts + deltas), and `RequirementView` (delta text).

Two facts from measuring the actual corpus (61 files) drove this design:

| Element | Count | Implication |
| --- | --- | --- |
| inline code spans | 1082 | the dominant element by far (~77:1 over fences) |
| task list items | 181 | already handled by GFM |
| fenced code blocks | **14** | rare — and **0 declare a language** |
| tables / links / images / mermaid / footnotes | 0 | unused today |

And the fences themselves are a mix: TypeScript interfaces, a JSON fragment, and **hand-drawn ASCII diagrams** (e.g. the kanban column mapping in `add-kanban-board/design.md`). That single observation shapes the most important decision below.

Constraints: the web bundle is **492 kB (152 kB gzip)** today; the app ships as a local CLI so bundle size is not a network concern but is still a build/dev cost. The read-only guarantee and the no-raw-HTML stance are non-negotiable.

## Goals / Non-Goals

**Goals:**
- Give markdown rendering an owning capability, moving it out of `spec-browser`.
- Make the renderer an explicit pipeline that later changes extend additively.
- Syntax highlighting for tagged fences, themed for light and dark.
- Copy-to-clipboard, table styling, and inline-code treatment.
- Keep the bundle increase proportionate and measured.

**Non-Goals:**
- OpenSpec semantics (Requirement/Scenario/WHEN/THEN) — that is `add-openspec-aware-rendering`.
- Anchors, outline, deep links — `add-document-navigation`.
- Cross-artifact linkification — `add-cross-artifact-links`.
- Mermaid — `add-mermaid-diagrams`.
- Enabling raw HTML, or any authoring/editing affordance.

## Decisions

### One capability owns rendering; consumers keep owning *what* is shown
`markdown-rendering` owns *how* any OpenSpec document renders; `spec-browser`, `archive-browser`, `change-artifact-nav`, `change-tasks`, and `spec-diff` keep owning *which* document appears where. This mirrors the `change-artifact-nav` / `change-tasks` split we just made: a cross-cutting concern gets a home instead of squatting in one consumer. Consumers need no changes — they already call `Markdown`.

*Alternative considered:* leave the requirement in `spec-browser` and add rendering rules there — rejected; four other capabilities render markdown and would either duplicate the rules or silently depend on a page-scoped spec.

### The renderer is a pipeline, not a component with features
`Markdown.tsx` becomes a single configured pipeline:

```
remark-parse → remark-gfm → [future remark plugins] → rehype → [highlight] → React
```

Each subsequent change in this series adds exactly one stage. Keeping the plugin list in one place means "how documents render" is answerable by reading one file, and no surface can drift.

### Untagged fences are left alone — no language auto-detection
This is the decision most likely to be questioned, so the reasoning is explicit. Every fence in the corpus is untagged, so an "auto-detect the language" strategy (e.g. `lowlight`'s `highlightAuto`) is the only way highlighting would do anything *today*. It is still rejected: roughly half those fences are ASCII diagrams and plain-text mappings, and auto-detection would confidently tokenize box-drawing characters and prose arrows as some language, producing rainbow noise over a diagram. **Wrong highlighting is worse than none.** Tagged fences highlight; untagged fences render as clean, spacing-preserved preformatted text.

The corollary is honest: this change delivers highlighting that today's content cannot exercise. It is an investment in future documents (and a nudge for authors — human or agent — to tag their fences), not a fix for present pain. `add-mermaid-diagrams` later relies on the same rule: a fence's behavior is driven by its declared language.

*Alternative considered:* auto-detect and accept occasional misfires — rejected on the corpus evidence above. *Alternative considered:* auto-detect only when the content "looks like code" — rejected as a heuristic on top of a heuristic.

### Highlighter: lowlight with a curated language set, not full shiki
highlight.js (via lowlight) plugs into the rehype half of the pipeline and lets us register only the languages our corpus plausibly references — ts/js, json, yaml, bash/shell. Shiki produces more accurate, VS Code-grade highlighting, but ships TextMate grammars plus a WASM regex engine and — imported naively — can exceed the size of the entire current bundle. For a viewer whose corpus contains 14 fences, that trade is not justified.

**We drive lowlight through a small local rehype plugin rather than using `rehype-highlight`.** This was not the original plan and the measurement forced it: `rehype-highlight` does `import {common, createLowlight} from 'lowlight'` at module scope and uses `common` as its default `languages` value. That static import of a ~35-grammar barrel is unshakeable by the bundler, so its `languages` option changes *runtime* behavior while the build still ships every common grammar. Measured: registering five languages through `rehype-highlight` cost **+54.7 kB gzip**, and trimming from eight languages to five changed the bundle by 0.04 kB — proof the option was doing nothing for size. The same five grammars behind `createLowlight` directly cost **+14.7 kB gzip**. The local plugin is ~40 lines, implements exactly the two rules below, and is covered by the same fence-matrix tests.

Highlight colors bind to the existing theme CSS variables rather than shipping a vendor theme stylesheet for each mode, so light/dark follow the `theming` capability automatically and we do not hand-maintain two color files.

*Alternative considered:* shiki with fine-grained language/theme imports — genuinely better output and worth revisiting if code-heavy designs become common; rejected now on bundle cost for near-zero present benefit. *Alternative considered:* no highlighter, CSS only — rejected; it cannot tokenize. *Alternative considered:* keep `rehype-highlight` and accept +54.7 kB gzip — rejected; a 36% bundle increase to highlight content that does not yet exist is exactly what the budget exists to catch.

**Bundle budget:** record the before/after gzip size in verification and treat a >40 kB gzip increase as a signal to trim the language set. This keeps the "don't balloon the bundle" goal falsifiable rather than aspirational — and it earned its keep immediately: the first implementation breached it at +54.7 kB, which is what surfaced the `rehype-highlight` barrel-import problem. Final measurement: **492.09 kB → 538.34 kB raw, 152.0 kB → 166.7 kB gzip (+14.7 kB)**.

### Copy button: an overlay control, not markup in the document
The copy affordance is rendered by the code-block component as an overlay on hover/focus, never injected into the document content. It copies the fence's raw text (pre-highlighting, so the clipboard gets source, not tokenized spans). It is the first interactive element inside rendered markdown; it reads and copies only, so the read-only guarantee is untouched.

### Inline code gets the attention its frequency earns
At 1082 spans versus 14 fences, inline code *is* the reading experience. It gets deliberate treatment (subtle background, tuned size/padding so it doesn't disturb line rhythm) and must stay legible inside headings, list items, and table cells — where naive styling usually breaks. This also sets up `add-cross-artifact-links`, which turns a subset of these spans into links.

### Raw HTML stays off
`rehype-raw` is not added. Project markdown is untrusted input from an arbitrary repo; treating it as markdown-only means content can never inject markup into the viewer. The existing comment in `Markdown.tsx` documents this; the new capability makes it a testable requirement rather than a code comment.

## Risks / Trade-offs

- **[Highlighting benefits nothing today]** → Accepted and stated in the spec's intent: tagged fences highlight, untagged do not. The value arrives with future content; the cost is one small dependency.
- **[Bundle growth]** → Curated language set + a recorded before/after gzip measurement with a 40 kB gzip trigger to trim.
- **[Highlight colors drift from the theme]** → Colors bind to existing theme CSS variables instead of a vendor stylesheet, so they move with the theme by construction.
- **[Copy button interferes with reading or selection]** → Overlay on hover/focus only, positioned clear of content; it is never part of the document flow.
- **[A future surface bypasses the shared renderer]** → The capability's first requirement makes "use the shared renderer" normative, so a bypass is a spec violation rather than a style opinion.
- **[Moving the requirement out of `spec-browser` loses behavior]** → The REMOVED delta names the superseding requirement; `markdown-rendering` mandates the same rendering for the Specs page and everywhere else.

## Migration Plan

1. Add the highlighter dependency and register the curated language set.
2. Rework `Markdown.tsx` into the explicit pipeline; keep its public props unchanged so no consumer changes.
3. Add the code-block component (highlighted output + copy overlay + untagged passthrough).
4. Extend `.md-prose` with fence, inline-code, and table styling bound to theme variables.
5. Record the bundle before/after; trim languages if over budget.
6. No rollback concerns: presentational only, no contracts, no persistence.

## Open Questions

- Should the copy control also appear on untagged fences (diagrams)? Leaning yes — copying an ASCII diagram is useful and the rule stays simple ("every fence is copyable").
- Is `diff` worth registering as a language? Spec deltas are conceptually diffs, but they are authored as prose+markdown, not unified diffs — probably not until something actually emits one.

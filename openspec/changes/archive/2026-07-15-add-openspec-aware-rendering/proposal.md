## Why

OpenSpec documents are not generic prose — they are a rigid, structured language that happens to be written in markdown. The corpus proves it: 124 `### Requirement:` headings, 216 `#### Scenario:` headings, 216 `**WHEN**` / `**THEN**` pairs, 149 `SHALL`s, and 26 `## ADDED/MODIFIED/REMOVED Requirements` headers — against zero tables, links, images, or footnotes.

Today all of that renders as undifferentiated prose. Worse, the viewer already knows better *somewhere else*: `SpecDiff` renders the exact same concepts through `RequirementView` with operation badges and colored accents from `operations.ts`. So the identical content has two visual languages depending on whether it arrived as CLI JSON or as raw markdown — a spec document on the Specs page is flat, while the same requirement in a diff is styled. Reading a 90-line design or a 97-line spec means scanning walls of text for structure the system could show.

## What Changes

- Teach the renderer OpenSpec's document structure so it renders **semantically**, not just typographically.
- **Requirement headings** (`### Requirement: <name>`) become visually distinct, scannable units rather than generic h3s.
- **Scenario headings** (`#### Scenario: <name>`) are set apart from their parent requirement.
- **WHEN / THEN / AND** steps render as a readable given-when-then sequence instead of a bullet list of bold words.
- **`SHALL`** — the normative keyword that carries a requirement's obligation — is emphasized rather than lost mid-sentence.
- **Delta operation headers** (`## ADDED / MODIFIED / REMOVED / RENAMED Requirements`) are colored by operation, **reusing the existing `operations.ts` accent and badge vocabulary** so the markdown path and `SpecDiff` finally speak one visual language.
- Structure is **detected, never required**: a document without OpenSpec structure keeps rendering as ordinary markdown.

## Capabilities

### New Capabilities
- `openspec-document-semantics`: rendering OpenSpec's own document structure — requirements, scenarios, WHEN/THEN steps, the normative `SHALL`, and delta operation groupings — as recognizable, consistently-styled units on every markdown surface, sharing one visual vocabulary with the diff view, and degrading to plain markdown for content that has no such structure.

### Modified Capabilities

## Impact

- Adds one **remark/rehype stage** to the pipeline established by `extract-markdown-rendering`; no consumer changes — every surface inherits it.
- **Reuses `src/web/lib/operations.ts`** (`operationAccent`, `operationBadge`) rather than introducing a second color vocabulary; this is the change's main consistency win.
- `.md-prose` gains styling for requirement/scenario/step units, bound to theme variables so both themes work.
- Purely presentational: no server, contract, or persistence changes; read-only guarantee untouched.
- **Depends on `extract-markdown-rendering`** (needs the pipeline and the `markdown-rendering` capability) and should land after it. `add-document-navigation` in turn depends on the requirement identification introduced here.

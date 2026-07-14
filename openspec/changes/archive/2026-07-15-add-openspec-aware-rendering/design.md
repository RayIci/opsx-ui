## Context

Measuring the corpus (61 files) shows OpenSpec markdown is a structured document language, not free prose:

| Structure | Count |
| --- | --- |
| `### Requirement:` | 124 |
| `#### Scenario:` | 216 |
| `**WHEN**` / `**THEN**` | 216 / 216 |
| `SHALL` | 149 |
| `## ADDED/MODIFIED/REMOVED Requirements` | 26 |
| tables / links / images / footnotes | 0 |

The viewer already renders these concepts semantically — but only on one path. `SpecDiff` consumes CLI JSON and renders `RequirementView` with `operationBadge` / `operationAccent` from `src/web/lib/operations.ts`. Every markdown path (`SpecsPage`, `ArchivedChange`, `MarkdownArtifact`) renders the same concepts as flat h3/h4/bullets. Same content, two visual languages, decided by an implementation detail (JSON vs. raw file) the reader neither sees nor cares about.

This change adds one stage to the pipeline established by `extract-markdown-rendering`.

## Goals / Non-Goals

**Goals:**
- Requirements, scenarios, and WHEN/THEN steps render as recognizable units.
- `SHALL` is visible as the normative keyword it is.
- Delta operations look the same in rendered markdown as in `SpecDiff`.
- Documents without OpenSpec structure are untouched.

**Non-Goals:**
- Anchors, deep links, outline — `add-document-navigation` (it builds on the detection introduced here).
- Cross-artifact linkification — `add-cross-artifact-links`.
- Changing `SpecDiff` or `RequirementView`; this change makes markdown *match* them, not replace them.
- Validating or linting spec structure — this is a viewer, not a linter. Malformed structure renders as plain markdown, it does not raise errors.
- Reconstructing requirement *cards* — `spec-browser` explicitly requires documents render as documents, not cards. Semantic styling must respect that.

## Decisions

### Detect structure in the tree; never rewrite the author's text
A remark stage walks the parsed document and annotates nodes it recognizes — a heading whose text starts with `Requirement:` / `Scenario:`, a list item starting with a bold `WHEN` / `THEN` / `AND`, an `## ADDED Requirements`-style operation header. Annotation only: the author's words are never rewritten, reordered, or synthesized. This keeps the renderer honest (what you see is what is on disk) and makes the "documents without structure are unaffected" requirement fall out for free — no annotation, no styling.

*Alternative considered:* parse spec.md into a requirement model server-side and render cards from it — rejected twice over: it duplicates what the CLI's JSON path already does, and `spec-browser` requires the Specs page render the document *as authored*, not as reconstructed cards.

### Reuse `operations.ts`; do not invent a second color vocabulary
Operation styling comes from the existing `operationAccent` / `operationBadge` helpers that `SpecDiff` already uses. This is the whole point of the change: one vocabulary, two paths. A second palette would recreate the inconsistency in a new place.

*Alternative considered:* new markdown-specific operation colors — rejected; that is the bug, not the fix.

### Styling is CSS on annotated nodes, not new React components per concept
The stage attaches data attributes / classes; `.md-prose` styles them. This keeps the pipeline's output plain markup, keeps every surface consistent, avoids a component tree per document concept, and means a future surface inherits the treatment with no wiring. Only the operation badge — which needs the shared helper's output — warrants a component.

### Structure detection is conservative and anchored
Requirement/Scenario are recognized only as **headings** whose text begins with the exact `Requirement:` / `Scenario:` prefix; operations only as headings matching the `ADDED|MODIFIED|REMOVED|RENAMED Requirements` form; WHEN/THEN only as **leading** bold text in a list item. Prose that merely mentions "scenario", or a sentence containing the word "added", is never touched. Conservative detection is why the "prose that merely mentions a keyword" scenario holds.

### `SHALL` is emphasized in requirement text only
The keyword is emphasized where it functions normatively — inside a requirement's descriptive text — matched as a standalone word (`\bSHALL\b`), so `SHALL NOT` is naturally covered and words like "shall" in ordinary prose or inside code spans are not. It is emphasis, not a badge: 149 occurrences styled loudly would be noise, not signal.

## Risks / Trade-offs

- **[Semantic styling drifts toward the "cards" `spec-browser` forbids]** → The rule is typographic distinction of authored content, never reconstruction; the specs keep "rendered as a document" intact and the Non-Goals name this explicitly.
- **[Over-detection distorts ordinary prose]** → Detection is anchored to headings and leading bold list text with exact prefixes; a scenario covers the "merely mentions a keyword" case.
- **[Visual noise from 216 scenarios and 149 SHALLs]** → Emphasis is calibrated as hierarchy, not decoration: requirements are the loudest unit, scenarios subordinate, SHALL a light inline emphasis.
- **[Two paths drift again later]** → Both now consume `operations.ts`; a change to operation colors moves both at once.
- **[Non-OpenSpec markdown regresses]** → "Documents without OpenSpec structure are unaffected" is a normative requirement with its own scenarios, not an assumption.

## Migration Plan

1. Add the remark stage that annotates requirement / scenario / step / operation nodes.
2. Style the annotations in `.md-prose`, bound to theme variables.
3. Wire operation styling to the existing `operations.ts` helpers.
4. Verify against real corpus documents (a spec with many requirements, an archived delta with all operations, a design with none).
5. Rollback is a pipeline-stage removal; content is never modified on disk.

## Open Questions

- Should a requirement's `SHALL NOT` be distinguished from `SHALL` (prohibition vs. obligation)? Leaning no for now — `\bSHALL\b` covers both and the distinction may be more precision than readers need.
- Should scenarios be collapsible on very long specs (`change-board` is 97 lines)? That is arguably `add-document-navigation`'s problem, not this change's.

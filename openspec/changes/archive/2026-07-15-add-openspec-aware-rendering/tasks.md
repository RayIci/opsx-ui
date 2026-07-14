## 1. Structure detection

- [x] 1.1 Add a remark stage to the `Markdown` pipeline that annotates recognized OpenSpec nodes (annotate only — never rewrite, reorder, or synthesize the author's text)
- [x] 1.2 Detect requirement headings: a heading whose text begins with the exact `Requirement:` prefix; capture the requirement name
- [x] 1.3 Detect scenario headings: a heading whose text begins with the exact `Scenario:` prefix; capture the scenario name
- [x] 1.4 Detect step items: list items whose text *begins* with bold `WHEN` / `THEN` / `AND`
- [x] 1.5 Detect operation headers matching the `ADDED|MODIFIED|REMOVED|RENAMED Requirements` heading form
- [x] 1.6 Keep detection conservative: prose that merely mentions "scenario"/"added", or keywords inside code spans, must not be annotated

## 2. Semantic styling

- [x] 2.1 Style requirements as distinct scannable units in `.md-prose` (loudest level of the hierarchy), keeping the document reading as a document — not reconstructed cards (`spec-browser` requires document rendering)
- [x] 2.2 Style scenarios as units subordinate to their requirement
- [x] 2.3 Style WHEN/THEN/AND steps as a condition→outcome sequence, with conditions distinguishable from outcomes and AND steps reading as continuations
- [x] 2.4 Emphasize the standalone keyword `SHALL` (`\bSHALL\b`, covering `SHALL NOT`) within requirement text only — light inline emphasis, not a badge
- [x] 2.5 Bind all new styling to theme CSS variables so light and dark both work

## 3. Operation vocabulary (the consistency win)

- [x] 3.1 Style operation groupings using the **existing** `src/web/lib/operations.ts` helpers (`operationAccent`, `operationBadge`) — do not introduce a second color vocabulary
- [x] 3.2 Verify an operation renders identically in a markdown delta document and in `SpecDiff`

## 4. Verification

- [x] 4.1 Unit-test detection: requirement/scenario prefixes, WHEN/THEN/AND leading-bold items, operation headings; and the negative cases (prose mentioning a keyword, keyword inside a code span, malformed structure → plain markdown, no error)
- [x] 4.2 Verify against real corpus documents — **covered by drift-proof tests that derive expectations from each file's own source: `specs/change-board/spec.md` (97 lines) has all 8 requirements / 16 scenarios / 35 steps annotated; a real 86-line design with zero requirements renders completely untouched.**
- [x] 4.3 Verify light and dark themes — **all new treatments bind to theme CSS vars (`--color-border`, `--op-added-soft`, `--color-muted-foreground`), so they follow `theming` automatically; no hard-coded colors. Visual pass available via `npm run dev`.**
- [x] 4.4 Confirm no regression on `SpecDiff` / `RequirementView` — **verified untouched: `git diff` reports no changes to `features/spec-diff/` or `RequirementView.tsx`.**
- [x] 4.5 Run `typecheck`, `lint`, `format:check`, `test`, `build`

## Context

The rendered documents are long and structured — `specs/change-board/spec.md` is 97 lines, designs run ~90 lines across `## Context` / `## Goals / Non-Goals` / `## Decisions` / `## Risks`, and the corpus holds 124 requirements across 12 capabilities. They render as one flat scroll.

`app-navigation` already establishes that every destination and drill-in is addressable by URL, and the viewer honors it down to a capability, a change, an archived change — then stops. The unit people actually discuss, a *requirement*, has no address.

Two pieces of existing structure matter here:
- `add-openspec-aware-rendering` already detects requirement headings; this change consumes that detection rather than re-implementing it.
- `SpecsPage` already uses a `lg:grid-cols-[220px_1fr]` layout with a **sticky capability sidebar** on the left. That space is taken, which constrains where an outline can live.

## Goals / Non-Goals

**Goals:**
- Stable, text-derived anchors on every heading.
- Requirements individually deep-linkable.
- An outline of long documents with a current-position indicator.
- Deep links that land accurately even though documents load asynchronously.
- A copy-link affordance so precise references are shareable.

**Non-Goals:**
- Changing `app-navigation`'s requirements — this extends addressability within a document, it does not alter routing between destinations.
- Cross-document linking — that is `add-cross-artifact-links`.
- Search within a document, or collapsible sections.
- A global "outline everything" sidebar competing with the Specs page's capability list.

## Decisions

### Anchors are slugs of the authored text, not positional indices
A heading's anchor derives from its own text (`### Requirement: Proposal is the default destination` → `requirement-proposal-is-the-default-destination`), with a deterministic suffix for collisions within a document. Text-derived slugs stay valid when a document is edited elsewhere — a positional scheme (`#h-7`) silently repoints every link the moment someone inserts a paragraph. Since specs are living documents edited by agents constantly, link stability is the whole point.

The trade-off is honest and accepted: **renaming a requirement breaks links to it.** That is correct behavior — the thing being referenced genuinely changed identity — and it is the same contract GitHub, MDN, and every docs site make.

*Alternative considered:* a stable id authored into the document — rejected; the viewer cannot make authors add ids, and it is read-only.

### Requirement anchors are just heading anchors, given a name
Requirements *are* headings. Rather than a parallel addressing scheme, requirement deep-links reuse the heading slug, and `add-openspec-aware-rendering`'s detection is what lets the outline and copy-link affordance treat them as first-class. One mechanism, two presentations.

### Deep-link arrival must survive async loading
The browser's native fragment scroll fires before `api.document(...)` resolves, so a naive `#anchor` silently does nothing on a cold open — the target does not exist yet. The document surface therefore resolves the fragment *after* content renders, and again when the target changes. This is exactly why "the document loads asynchronously" is a normative scenario and not an implementation footnote: it is the failure mode a deep-link feature dies of.

A missing target degrades to "render from the top, no error" — a spec may have been edited since the link was made.

### Outline placement must not fight the Specs sidebar
`SpecsPage` already spends its left column on the capability list. The outline goes on the **right** of the document (sticky, like the existing sidebar), where the change drill-in and archived change have room and the Specs page can host it without displacing its capability list. On narrow viewports the outline collapses out of the way rather than stacking two navigation columns above the content.

*Alternative considered:* reuse the left column and swap capability list ↔ outline — rejected; it removes the navigation you used to arrive in favor of the navigation you use to read.

### The outline appears only when it earns its space
A document with one or two headings gets no outline — an outline with a single entry is furniture, not navigation. The threshold lives with the outline, so every surface behaves the same.

### Current-position indication is a reading aid, not a URL rewrite
Scrolling updates which outline entry is marked current; it does **not** rewrite the address bar. Continuously mutating history while someone scrolls poisons the back button — the very navigation `app-navigation` guarantees. The URL changes only on deliberate acts: selecting an outline entry, or opening a copied link.

## Risks / Trade-offs

- **[Renaming a requirement breaks its links]** → Accepted and stated: identity changed. Text-derived slugs are still strictly better than positional ids, which break on *unrelated* edits.
- **[Deep links silently fail on cold open]** → The known failure mode; resolution runs after content renders and is covered by its own scenario.
- **[Outline competes with the Specs sidebar]** → Outline is right-side and collapses on narrow viewports; the capability list keeps the left column.
- **[Scroll-spy churns history or costs performance]** → Position indication never touches history; observation is passive (intersection-based), not a scroll handler recomputing layout.
- **[Duplicate headings collide]** → Deterministic per-document suffixing, with its own scenario.
- **[Outline noise on long specs]** → 124 requirements across 12 files means a single spec's outline is a dozen entries at most — navigable, not a wall.

## Migration Plan

1. Add the slug/anchor stage to the pipeline; render heading anchors.
2. Surface requirement anchors using the existing requirement detection.
3. Add fragment resolution on the document surfaces, running after content renders.
4. Add the outline component (right side, sticky, threshold-gated, collapsing on narrow viewports) with intersection-based current-position indication.
5. Add the copy-link affordance to headings/requirements.
6. Rollback is removal of the stage and the outline; nothing persisted, no contracts.

## Open Questions

- Should the outline list only `##`/`###` levels, or requirements too? Leaning: section headings plus requirements, since requirements are what people navigate specs *for* — but this may be noisy on the longest specs and is worth checking against `change-board`'s 97 lines once it is real.
- Should a deep-linked requirement be briefly highlighted on arrival, or is scrolling it into view enough to be "identifiable"? Leaning toward a brief highlight; the spec deliberately states the outcome, not the mechanism.

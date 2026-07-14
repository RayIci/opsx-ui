## Why

The documents this viewer exists to show are long and highly structured: specifications run to ~97 lines with a dozen requirements, designs to ~90 lines of `## Context` / `## Goals` / `## Decisions` / `## Risks`. They are rendered as one undifferentiated scroll with no way to see their shape or jump within them — you scroll and hunt.

There is also a gap in the app's own principle. `app-navigation` states that every destination and drill-in gets its own URL, and the viewer honors that: you can link someone to a capability, a change, an archived change. But you **cannot link to a requirement** — the very unit specs are made of. Discussing "the disabled-destinations requirement in `change-artifact-nav`" means sending a spec link and telling the reader to scroll. The app is addressable down to the document, and then stops.

## What Changes

- Give every heading in a rendered document a **stable anchor**, so any section is directly reachable.
- Make **requirements individually deep-linkable** — the unit specs are actually made of — so a single requirement can be linked, shared, and opened directly.
- Show a **document outline** for long documents: the headings (and requirements) as a navigable structure beside the content, indicating where you currently are.
- **Open a deep link accurately**: arriving at a URL that targets a heading or requirement scrolls to it and makes it identifiable.
- **Copy-a-link affordance** on headings/requirements, so sharing a precise reference does not require hand-crafting a URL.
- Anchors are **derived from authored text** and stable across renders — not positional indices that shift when a document is edited.

## Capabilities

### New Capabilities
- `document-navigation`: navigating within a long rendered document — stable heading anchors, individually deep-linkable requirements, an outline of the document's structure with a current-position indicator, accurate arrival at a deep link, and a way to copy a link to any section.

### Modified Capabilities

## Impact

- Adds an anchor/slug stage to the pipeline from `extract-markdown-rendering`, and consumes the requirement detection from `add-openspec-aware-rendering` (a requirement anchor needs to know what a requirement *is*).
- New outline UI beside the document surfaces (Specs page, change drill-in, archived change); must not disturb the existing `SpecsPage` sidebar, which already occupies that space with a capability list.
- Routing: URL fragments become meaningful; deep links must survive the async load of a document (the target may not exist when the URL is first read).
- Extends `app-navigation`'s addressability principle to sub-document granularity without changing that capability's requirements.
- Purely presentational: no server, contract, or persistence changes; read-only guarantee untouched.
- **Depends on `extract-markdown-rendering` and `add-openspec-aware-rendering`**; should land after both.

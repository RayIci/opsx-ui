## REMOVED Requirements

### Requirement: Markdown rendering of spec content

**Reason**: This requirement bundled two concerns: *how* content renders ("in formatted markdown") and *what* `spec-browser` shows ("the complete `spec.md` as authored, not reconstructed cards"). The rendering half is cross-cutting — five capabilities render markdown, but this, the only requirement defining it, was scoped to "a selected capability on the Specs page." Keeping it here would mean every future rendering rule either duplicates across five capabilities or hides inside one of them. It is therefore split: rendering moves to the new `markdown-rendering` capability, and the Specs-page half is retained as a narrower requirement below.

**Migration**: Rendering behavior is preserved and generalized by `markdown-rendering`'s "Consistent rendering on every surface", which mandates one shared renderer everywhere — including the Specs page. The retained half is covered by the ADDED requirement "A capability is shown as its full specification document" below, which keeps the "not reconstructed cards, not monospaced boxes" guarantee that `spec-browser` still owns. `spec-browser`'s other requirements (listing capabilities, selecting one, live updates) are unaffected.

## ADDED Requirements

### Requirement: A capability is shown as its full specification document

The system SHALL show a selected capability as its complete specification document as authored on disk — rather than as reconstructed requirement cards or monospaced boxes — leaving how that document renders to `markdown-rendering`.

#### Scenario: Viewing a capability's specification

- **WHEN** a user views a capability on the Specs page
- **THEN** its complete `spec.md` document is shown
- **AND** it is not displayed as reconstructed requirement cards or inside monospaced boxes

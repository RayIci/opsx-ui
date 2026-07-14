## ADDED Requirements

### Requirement: Mermaid fences render as diagrams

The system SHALL render a fenced code block declaring the `mermaid` language as the diagram it describes rather than as source text, so design documents can carry real diagrams. This is a more specific rule than the general treatment of language-tagged fences, and takes precedence over it.

#### Scenario: A document contains a mermaid diagram

- **WHEN** a user views a document containing a fenced block tagged `mermaid` with valid diagram source
- **THEN** the diagram is displayed as a rendered diagram
- **AND** its source text is not displayed as code

#### Scenario: A document contains several diagrams

- **WHEN** a document contains more than one mermaid fence
- **THEN** each is rendered as its own diagram

### Requirement: Diagrams follow the active theme

The system SHALL render diagrams using the active light or dark theme, so a diagram is legible in either theme rather than appearing as a light block inside a dark document.

#### Scenario: Viewing a diagram in dark theme

- **WHEN** a user views a document containing a diagram while the dark theme is active
- **THEN** the diagram is rendered legibly for that theme

#### Scenario: Switching theme with a diagram on screen

- **WHEN** a user switches theme while a diagram is displayed
- **THEN** the diagram is re-rendered legibly for the newly active theme

### Requirement: Invalid diagrams degrade to their source

The system SHALL display a diagram's source text together with an indication that it could not be rendered when its syntax is invalid, and SHALL NOT fail the surrounding document, because document content comes from an arbitrary project and may be malformed or mid-edit.

#### Scenario: A diagram has invalid syntax

- **WHEN** a document contains a `mermaid` fence whose source cannot be rendered as a diagram
- **THEN** the fence's source text is displayed
- **AND** the reader is shown that it could not be rendered as a diagram

#### Scenario: The rest of the document survives

- **WHEN** a document contains an invalid diagram alongside other content
- **THEN** the remainder of the document renders normally

### Requirement: Diagram support is not paid for by documents without diagrams

The system SHALL load diagram rendering support only when a document actually contains a diagram, so documents without diagrams do not carry its cost.

#### Scenario: A document with no diagrams

- **WHEN** a user views a document containing no `mermaid` fences
- **THEN** diagram rendering support is not loaded

#### Scenario: A document with a diagram

- **WHEN** a user views a document containing a `mermaid` fence
- **THEN** diagram rendering support is loaded and the diagram is rendered

### Requirement: Untagged fences remain unaffected by diagram support

The system SHALL continue to render fences that declare no language as plain preformatted text, so hand-drawn ASCII diagrams keep rendering exactly as authored and are never interpreted as diagram source.

#### Scenario: An untagged fence containing an ASCII diagram

- **WHEN** a user views a document containing an untagged fence holding an ASCII diagram
- **THEN** it is displayed as plain preformatted text exactly as authored
- **AND** it is not interpreted as diagram source

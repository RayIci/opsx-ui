## ADDED Requirements

### Requirement: Requirements render as distinct units

The system SHALL recognize a requirement heading in a rendered OpenSpec document and present the requirement as a visually distinct unit, so a reader can scan a specification for its requirements instead of reading it as continuous prose.

#### Scenario: A specification with several requirements

- **WHEN** a user views a document containing multiple requirement headings
- **THEN** each requirement is presented as a distinct unit
- **AND** each requirement's name is displayed

#### Scenario: A requirement's body stays with it

- **WHEN** a requirement heading is followed by its descriptive text and scenarios
- **THEN** that content is presented as belonging to that requirement

### Requirement: Scenarios are set apart from their requirement

The system SHALL present a scenario as a unit subordinate to its requirement, distinct from the requirement's own description, so the obligation and its examples are not read as one block of text.

#### Scenario: A requirement with multiple scenarios

- **WHEN** a user views a requirement that has more than one scenario
- **THEN** each scenario is presented as its own unit, subordinate to the requirement
- **AND** each scenario's name is displayed

### Requirement: WHEN and THEN steps render as a sequence

The system SHALL render a scenario's `WHEN`, `THEN`, and `AND` steps as a readable condition-and-outcome sequence rather than as a plain list of bolded words, so a scenario reads as the behavior it describes.

#### Scenario: A scenario with a condition and an outcome

- **WHEN** a user views a scenario containing WHEN and THEN steps
- **THEN** the steps are displayed as a sequence in their authored order
- **AND** the condition steps are visually distinguishable from the outcome steps

#### Scenario: A scenario with continuation steps

- **WHEN** a scenario contains AND steps following a WHEN or THEN
- **THEN** each AND step is displayed as a continuation of the step it follows

### Requirement: The normative keyword is emphasized

The system SHALL emphasize the normative keyword `SHALL` where it appears in a requirement's text, because it carries the requirement's obligation and is otherwise lost in surrounding prose.

#### Scenario: A requirement states an obligation

- **WHEN** a requirement's text contains the keyword SHALL
- **THEN** that keyword is emphasized within the rendered text
- **AND** the rest of the sentence is unchanged

### Requirement: Delta operations are colored by operation

The system SHALL recognize delta operation groupings (`ADDED`, `MODIFIED`, `REMOVED`, `RENAMED`) in a rendered document and distinguish each by operation, using the same visual vocabulary the diff view uses, so an operation means the same thing everywhere in the app.

#### Scenario: An archived change's delta spec

- **WHEN** a user views a delta document containing ADDED, MODIFIED, and REMOVED groupings
- **THEN** each grouping is visually distinguished by its operation

#### Scenario: Consistency with the diff view

- **WHEN** a user compares an operation shown in a rendered delta document with the same operation shown in the diff view
- **THEN** both use the same visual treatment for that operation

### Requirement: Documents without OpenSpec structure are unaffected

The system SHALL apply OpenSpec semantic rendering only where that structure is present, and SHALL render documents without it as ordinary markdown, so proposals, designs, and arbitrary notes are never distorted by structure they do not have.

#### Scenario: A design document with no requirements

- **WHEN** a user views a document that contains no requirement or scenario headings
- **THEN** it is rendered as ordinary markdown without semantic treatment

#### Scenario: Prose that merely mentions a keyword

- **WHEN** a document's prose contains a word such as "scenario" outside an OpenSpec heading
- **THEN** it is rendered as ordinary prose and is not treated as OpenSpec structure

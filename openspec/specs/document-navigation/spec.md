# document-navigation Specification

## Purpose
Navigating within a long rendered document: stable heading anchors derived from authored text, individually deep-linkable requirements, an outline of the document's structure with a current-position indicator, accurate arrival at a deep link even though documents load asynchronously, and a way to copy a link to any section. This extends `app-navigation`'s addressability principle below the level of a whole document — you can link to a capability, and now to a requirement inside it.

## Requirements

### Requirement: Headings have stable anchors

The system SHALL give every heading in a rendered document an anchor derived from the heading's authored text, and that anchor SHALL remain the same across renders of unchanged content, so links to a section keep working.

#### Scenario: A document is rendered

- **WHEN** a user views a rendered document with headings
- **THEN** each heading has an anchor derived from its text

#### Scenario: The document is re-rendered unchanged

- **WHEN** a document is rendered again without its content changing
- **THEN** each heading keeps the same anchor as before

#### Scenario: Two headings share a name

- **WHEN** a document contains two headings with identical text
- **THEN** each still has a distinct anchor

### Requirement: Requirements are individually deep-linkable

The system SHALL make each requirement in a rendered document individually addressable by its own link, so a single requirement can be referenced directly rather than by pointing at its whole document.

#### Scenario: Linking to one requirement

- **WHEN** a user views a document containing several requirements
- **THEN** each requirement is individually addressable by its own link

#### Scenario: Opening a requirement's link

- **WHEN** a user opens a link that targets a specific requirement
- **THEN** that requirement is shown and identifiable on arrival

### Requirement: Arriving at a deep link is accurate

The system SHALL bring the targeted section into view when a document is opened at a link targeting a heading or requirement, including when the document's content loads after the link is opened.

#### Scenario: Opening a deep link directly

- **WHEN** a user opens a URL targeting a section of a document
- **THEN** the document is displayed scrolled to that section
- **AND** the targeted section is identifiable

#### Scenario: The document loads asynchronously

- **WHEN** a user opens a deep link before the document's content has loaded
- **THEN** the targeted section is brought into view once the content is available

#### Scenario: The target does not exist

- **WHEN** a user opens a link targeting a section that is not present in the document
- **THEN** the document is displayed from its beginning without error

### Requirement: A document outline

The system SHALL present an outline of a rendered document's structure, and SHALL let the user move to a section by selecting it from the outline, so a long document's shape is visible without scrolling it.

#### Scenario: Viewing a long document

- **WHEN** a user views a document with multiple sections
- **THEN** an outline of its sections is presented

#### Scenario: Selecting a section from the outline

- **WHEN** a user selects a section in the outline
- **THEN** the document moves to that section

#### Scenario: A short document

- **WHEN** a user views a document with too little structure to navigate
- **THEN** no outline is presented, rather than an empty or single-entry one

### Requirement: The outline indicates the current position

The system SHALL indicate in the outline which section the user is currently reading, so position within a long document is always apparent.

#### Scenario: Scrolling through a document

- **WHEN** a user scrolls a document that has an outline
- **THEN** the outline indicates the section currently being read

### Requirement: A link to any section can be copied

The system SHALL let the user copy a link to any heading or requirement in a rendered document, so a precise reference can be shared without constructing the URL by hand.

#### Scenario: Copying a link to a requirement

- **WHEN** a user activates the copy-link control on a requirement
- **THEN** a link addressing that requirement is placed on the clipboard
- **AND** opening that link shows that requirement

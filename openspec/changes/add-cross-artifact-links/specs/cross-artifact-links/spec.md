## ADDED Requirements

### Requirement: Known artifacts referenced in a document are navigable

The system SHALL turn a reference to a known capability, active change, or archived change appearing in a rendered document into navigation to that artifact, so cross-references between documents can be followed instead of looked up by hand.

#### Scenario: A specification references another capability

- **WHEN** a user views a document that references a capability present in the project
- **THEN** that reference is navigable to that capability's specification

#### Scenario: Following a reference

- **WHEN** a user follows a reference to a known artifact
- **THEN** the app navigates to that artifact

### Requirement: Only known ids are linked

The system SHALL link a reference only when it exactly matches an id present in the project's live snapshot, and SHALL leave every other reference untouched, so that no text is ever linked to an artifact that does not exist.

#### Scenario: A reference that is not an artifact

- **WHEN** a document references something that is not a known capability or change, such as a file name or a code identifier
- **THEN** it is rendered unchanged and is not navigable

#### Scenario: A partial match

- **WHEN** a document contains text that only partially matches a known artifact's id
- **THEN** it is not linked

#### Scenario: An unknown capability name

- **WHEN** a document names a capability that has no specification in the project
- **THEN** that name is rendered unchanged and is not navigable

### Requirement: References route to the right kind of destination

The system SHALL route a linked reference to the destination appropriate to the kind of artifact it names, so following a reference lands on the artifact itself.

#### Scenario: Referencing a capability

- **WHEN** a user follows a reference to a known capability
- **THEN** the app navigates to that capability's specification

#### Scenario: Referencing an active change

- **WHEN** a user follows a reference to a known active change
- **THEN** the app navigates to that change's drill-in

#### Scenario: Referencing an archived change

- **WHEN** a user follows a reference to a known archived change
- **THEN** the app navigates to that archived change's drill-in

### Requirement: A document does not link to itself

The system SHALL NOT turn a reference into navigation when it names the artifact the user is already viewing, so a document never offers a link to the page it is on.

#### Scenario: A specification naming its own capability

- **WHEN** a user views a capability's specification that mentions that same capability by name
- **THEN** that self-reference is rendered unchanged and is not navigable

### Requirement: Linkability follows the live project state

The system SHALL determine what is linkable from the project's current state, so that references become navigable or stop being navigable as the project changes, without a manual refresh.

#### Scenario: A change is archived while a document is open

- **WHEN** a change is archived while a document referencing it is displayed
- **THEN** references to it resolve to its archived drill-in without user action

#### Scenario: A new capability appears

- **WHEN** a capability's specification is added to the project while a document referencing that capability is displayed
- **THEN** references to it become navigable without user action

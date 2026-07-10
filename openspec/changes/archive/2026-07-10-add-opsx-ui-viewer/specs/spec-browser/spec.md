## ADDED Requirements

### Requirement: Browse specifications
The system SHALL let users browse the project's current specifications by capability.

#### Scenario: Listing capabilities
- **WHEN** a user opens the spec browser
- **THEN** the project's capabilities are listed

#### Scenario: Viewing a capability
- **WHEN** a user selects a capability
- **THEN** the viewer displays that capability's requirements and their scenarios

### Requirement: Drill-down navigation
The system SHALL allow navigation from a change into the specs it affects.

#### Scenario: Navigating from a change to its spec
- **WHEN** a user opens a change that affects a capability
- **THEN** the user can navigate to that capability's current spec

### Requirement: Spec view reflects live state
The system SHALL update the displayed specification automatically when its underlying file changes.

#### Scenario: A spec changes while being viewed
- **WHEN** a specification file changes while it is displayed
- **THEN** the displayed content updates without a manual refresh

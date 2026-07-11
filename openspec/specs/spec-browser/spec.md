# spec-browser Specification

## Purpose
The drill-down view for browsing the project's current specifications — capabilities, their requirements, and scenarios — reachable directly or by navigating from a change to the specs it affects.

## Requirements

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

### Requirement: Markdown rendering of spec content
The system SHALL render a specification's requirements and scenarios as formatted markdown rather than as boxed monospaced text.

#### Scenario: Viewing a capability's requirements
- **WHEN** a user views a capability in the spec browser
- **THEN** its requirements and scenarios are rendered as formatted markdown
- **AND** they are not displayed inside monospaced boxes

# spec-browser Specification

## Purpose
The drill-down view for browsing the project's current specifications — capabilities, their requirements, and scenarios — reachable directly or by navigating from a change to the specs it affects. This capability owns *which* specification is listed and shown; how its document renders is owned by `markdown-rendering`.

## Requirements

### Requirement: Browse specifications
The system SHALL present specifications as a dedicated page with a persistent sidebar listing the project's capabilities and a main pane that displays the selected capability, so users can move between capabilities without leaving the page.

#### Scenario: Listing capabilities
- **WHEN** a user opens the Specs page
- **THEN** the project's capabilities are listed in a persistent sidebar

#### Scenario: Viewing a capability
- **WHEN** a user selects a capability in the sidebar
- **THEN** the main pane displays that capability's specification
- **AND** the sidebar remains visible for further navigation

#### Scenario: Opening the Specs page with no capability selected
- **WHEN** a user opens the Specs page without a specific capability chosen
- **THEN** the sidebar is shown and the main pane prompts the user to select a capability

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

### Requirement: A capability is shown as its full specification document
The system SHALL show a selected capability as its complete specification document as authored on disk — rather than as reconstructed requirement cards or monospaced boxes — leaving how that document renders to `markdown-rendering`.

#### Scenario: Viewing a capability's specification
- **WHEN** a user views a capability on the Specs page
- **THEN** its complete `spec.md` document is shown
- **AND** it is not displayed as reconstructed requirement cards or inside monospaced boxes

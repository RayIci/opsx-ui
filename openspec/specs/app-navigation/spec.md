# app-navigation Specification

## Purpose
The app shell's persistent primary navigation and addressable views: two top-level destinations (Board and Specs) reachable from anywhere, each view and drill-in given its own URL, so users can move between the kanban, specifications, and change drill-ins directly and via the browser address.

## Requirements

### Requirement: Primary navigation between Board and Specs
The system SHALL provide a persistent primary navigation offering two top-level destinations — Board and Specs — reachable from anywhere in the app.

#### Scenario: Switching from the board to specs
- **WHEN** a user on the Board selects the Specs destination in the primary navigation
- **THEN** the Specs page is shown
- **AND** the primary navigation remains visible

#### Scenario: Returning to the board
- **WHEN** a user on the Specs page selects the Board destination
- **THEN** the kanban board is shown

#### Scenario: Default destination
- **WHEN** a user opens the app at its root
- **THEN** the Board is shown as the default destination

### Requirement: Addressable views
The system SHALL give each top-level destination and each drill-in its own URL, so views are directly reachable and reflected in the browser address.

#### Scenario: Navigating updates the URL
- **WHEN** a user moves between the Board, the Specs page, or a drill-in
- **THEN** the browser URL updates to reflect the current view

#### Scenario: Opening a deep link
- **WHEN** a user opens a URL for a specific capability, change, or archived change
- **THEN** the app renders that view directly without first landing on the board

#### Scenario: Browser back navigation
- **WHEN** a user has navigated into a drill-in and presses the browser back button
- **THEN** the previous view is restored

### Requirement: Drill-in destinations for changes and archived changes
The system SHALL treat opening a change's deltas or an archived change as an addressable drill-in reachable from the board.

#### Scenario: Opening a change from the board
- **WHEN** a user selects an active change on the board
- **THEN** the app navigates to that change's drill-in at its own URL

#### Scenario: Opening an archived change
- **WHEN** a user selects an archived change
- **THEN** the app navigates to that archived change's drill-in at its own URL

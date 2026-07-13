## MODIFIED Requirements

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

### Requirement: Markdown rendering of spec content
The system SHALL render a selected capability as its full specification document in formatted markdown — headings, requirements, and scenarios as authored on disk — rather than as reconstructed requirement cards or monospaced boxes.

#### Scenario: Viewing a capability's specification
- **WHEN** a user views a capability on the Specs page
- **THEN** its complete `spec.md` document is rendered as formatted markdown
- **AND** it is not displayed as reconstructed requirement cards or inside monospaced boxes

## ADDED Requirements

### Requirement: Global launchable command
The system SHALL install a global `opsx-ui` executable that, when run, starts a local web server and opens the viewer in the default browser.

#### Scenario: Launch from a project directory
- **WHEN** a user runs `opsx-ui` in a directory containing an `openspec/` root
- **THEN** the server starts on a local port
- **AND** the browser opens to the viewer showing that project's OpenSpec state

#### Scenario: Server port already in use
- **WHEN** the default local port is unavailable at launch
- **THEN** the system selects an available port and opens the browser to it

### Requirement: Current-directory resolution with init fallback
The system SHALL resolve the current working directory as the project when run without flags, and offer to initialize OpenSpec when none is found.

#### Scenario: No OpenSpec in current directory
- **WHEN** a user runs `opsx-ui` in a directory with no `openspec/` root
- **THEN** the viewer offers to initialize OpenSpec in that directory or to open a different project
- **AND** the system does not fail or exit

### Requirement: Global mode project picker
The system SHALL, when run as `opsx-ui -g`, skip current-directory detection and present a project picker instead.

#### Scenario: Launch in global mode
- **WHEN** a user runs `opsx-ui -g`
- **THEN** the viewer does not auto-open the current directory
- **AND** the viewer prompts the user to open an OpenSpec project

### Requirement: Store-aware resolution
The system SHALL support registered OpenSpec stores as project sources.

#### Scenario: Opening a registered store
- **WHEN** the user selects a registered store as the project
- **THEN** the viewer reads that store's OpenSpec state
- **AND** store-scoped reads are performed against the selected store

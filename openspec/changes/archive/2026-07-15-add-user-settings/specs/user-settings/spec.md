## ADDED Requirements

### Requirement: Preferences persist across restarts

The system SHALL persist user preferences to a file in an operating-system-appropriate user configuration directory, so that preferences survive restarting the viewer and are consistent across browsers on the same machine.

#### Scenario: A preference set in one session is present in the next

- **WHEN** a user changes a preference and later restarts the viewer
- **THEN** the previously chosen preference is still in effect

#### Scenario: Config location is OS-appropriate

- **WHEN** the viewer resolves where to store settings
- **THEN** it uses the platform's standard user configuration directory for the application

### Requirement: A dedicated settings page

The system SHALL provide a dedicated settings page at its own URL, reachable from the app shell, where the user can view and change their preferences — rather than a transient overlay — so preferences have a stable destination with room to grow as more settings are added.

#### Scenario: Opening settings

- **WHEN** a user selects the settings control in the app shell
- **THEN** the app navigates to the settings page at its own URL
- **AND** the page shows the current preferences

#### Scenario: Opening the settings page directly

- **WHEN** a user opens the settings page's URL directly
- **THEN** the settings page is rendered without first landing on another view

#### Scenario: Changing a preference

- **WHEN** a user changes a preference on the settings page
- **THEN** the new value is saved and takes effect without requiring a restart

### Requirement: Default artifact tab preference

The system SHALL let the user choose which artifact tab a change drill-in opens on, and SHALL open change drill-ins on that tab when set; when the preference is unset or not a valid artifact tab, the system SHALL use the built-in default (Proposal).

#### Scenario: A default tab is configured

- **WHEN** a user has set the default artifact tab to Tasks and opens a change drill-in
- **THEN** the drill-in opens on the Tasks tab

#### Scenario: No default configured

- **WHEN** a user who has not set a default artifact tab opens a change drill-in
- **THEN** the drill-in opens on the Proposal tab

#### Scenario: Configured default points at an absent artifact

- **WHEN** a user's configured default tab refers to an artifact the opened change does not have
- **THEN** the drill-in opens on the built-in default (Proposal) rather than a disabled tab

### Requirement: Tolerant of missing or malformed settings

The system SHALL treat a missing or malformed settings file as "no preferences set," falling back to built-in defaults, rather than failing to start or erroring.

#### Scenario: No settings file yet

- **WHEN** the viewer starts and no settings file exists
- **THEN** it operates with built-in default preferences and does not error

#### Scenario: Corrupt settings file

- **WHEN** the settings file exists but cannot be parsed as valid settings
- **THEN** the viewer falls back to built-in defaults rather than crashing

### Requirement: Writes are confined to the user config directory

The system SHALL write preferences only within the user configuration directory and SHALL NOT write to any project's `openspec/` directory, preserving the viewer's guarantee that it never mutates OpenSpec project state.

#### Scenario: Saving a preference does not touch project state

- **WHEN** a user saves any preference
- **THEN** only the user configuration file is written
- **AND** no file under any project's `openspec/` directory is created, modified, or removed

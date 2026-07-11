# theming Specification

## Purpose
Light / Dark / System theme selection for the viewer, persisted across sessions, seeded from the OS preference, and applied before first paint to avoid a flash of the wrong theme.

## Requirements

### Requirement: Theme selection
The system SHALL let the user choose between Light, Dark, and System themes from a control in the viewer.

#### Scenario: Choosing an explicit theme
- **WHEN** the user selects Light or Dark
- **THEN** the viewer immediately renders in the chosen theme

#### Scenario: Choosing System
- **WHEN** the user selects System
- **THEN** the viewer follows the operating system's color-scheme preference
- **AND** it updates if the OS preference changes while open

### Requirement: Persisted theme preference
The system SHALL persist the user's theme choice and apply it on subsequent visits without a flash of the wrong theme.

#### Scenario: Returning after choosing a theme
- **WHEN** the user reloads or reopens the viewer after choosing a theme
- **THEN** the previously chosen theme is applied
- **AND** the correct theme is applied before the first paint

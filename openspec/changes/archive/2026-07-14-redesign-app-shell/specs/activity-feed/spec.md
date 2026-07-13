## MODIFIED Requirements

### Requirement: Live activity feed
The system SHALL present a feed of recent OpenSpec activity ordered from most to least recent, available on demand throughout the app as a drawer that is closed by default and opened by the user.

#### Scenario: Viewing recent activity
- **WHEN** a user opens the activity drawer
- **THEN** the drawer lists recent OpenSpec changes in reverse-chronological order

#### Scenario: Drawer closed by default
- **WHEN** the app first loads
- **THEN** the activity drawer is closed and does not occupy the main layout

#### Scenario: Toggling the drawer
- **WHEN** a user activates the activity toggle
- **THEN** the drawer opens
- **AND** activating the toggle again closes it

## ADDED Requirements

### Requirement: Activity drawer state persists
The system SHALL remember whether the activity drawer is open or closed across reloads.

#### Scenario: Reopening the app with the drawer previously open
- **WHEN** a user reloads the app after leaving the activity drawer open
- **THEN** the drawer is open again on load

#### Scenario: Reopening the app with the drawer previously closed
- **WHEN** a user reloads the app after leaving the activity drawer closed
- **THEN** the drawer remains closed on load

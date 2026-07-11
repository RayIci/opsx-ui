## ADDED Requirements

### Requirement: Resilient initial load

The system SHALL distinguish an in-progress initial load from a failed one, and SHALL surface an actionable error state — rather than an indefinite loading indicator — when it cannot reach the viewer server or complete its initial bootstrap.

#### Scenario: Server unreachable at load

- **WHEN** the viewer cannot reach its server or its initial bootstrap request fails
- **THEN** the viewer shows an error state describing that the server could not be reached
- **AND** it does not remain on an indefinite loading indicator

#### Scenario: Retry after a failed load

- **WHEN** the viewer is showing the initial-load error state
- **THEN** the user can retry the initial load without reloading the page
- **AND** a successful retry proceeds to the normal view

#### Scenario: Load succeeds

- **WHEN** the initial bootstrap succeeds
- **THEN** the viewer proceeds to the normal view without showing the error state

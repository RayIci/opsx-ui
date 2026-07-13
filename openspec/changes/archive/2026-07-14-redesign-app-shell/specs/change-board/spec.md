## ADDED Requirements

### Requirement: Board shows only the kanban
The system SHALL present the Board destination as the lifecycle kanban alone, without an embedded specifications listing; browsing specifications is reached through the Specs destination instead.

#### Scenario: Viewing the board
- **WHEN** a user opens the Board destination
- **THEN** only the lifecycle kanban of active and archived changes is shown
- **AND** no specifications listing is embedded in the board

#### Scenario: Reaching specifications
- **WHEN** a user wants to browse specifications
- **THEN** they navigate to the Specs destination rather than scrolling the board

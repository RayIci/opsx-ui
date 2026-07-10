## ADDED Requirements

### Requirement: Change board home view
The system SHALL present, as the default view, a board of the project's active changes.

#### Scenario: Opening a project with active changes
- **WHEN** a project with one or more active changes is opened
- **THEN** the board displays a card for each active change

#### Scenario: Opening a project with no active changes
- **WHEN** a project has no active changes
- **THEN** the board shows an empty state rather than an error

### Requirement: Task progress on change cards
The system SHALL display each change's task-completion progress on its card.

#### Scenario: Change with partially completed tasks
- **WHEN** a change has some completed and some incomplete tasks
- **THEN** its card shows completed-versus-total task progress

### Requirement: Validation health on change cards
The system SHALL indicate each change's validation health on its card.

#### Scenario: A change is valid
- **WHEN** a change passes validation
- **THEN** its card shows a healthy indicator

#### Scenario: A change is invalid
- **WHEN** a change fails validation
- **THEN** its card shows an unhealthy indicator

### Requirement: Board reflects live state
The system SHALL update the board automatically as changes are added, progressed, or removed.

#### Scenario: A new change appears while viewing
- **WHEN** a new change is created in the project while the board is open
- **THEN** a new card appears on the board without a manual refresh

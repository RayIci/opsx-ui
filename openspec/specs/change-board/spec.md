# change-board Specification

## Purpose
The default home view: a lifecycle kanban of the project's active changes, each shown as a card with task-completion progress and validation health, placed in a column derived from its state, and updating live.

## Requirements

### Requirement: Change board home view
The system SHALL present, as the default view, a lifecycle kanban of the project's active changes, in which each active change is placed in a column derived from its state.

#### Scenario: Opening a project with active changes
- **WHEN** a project with one or more active changes is opened
- **THEN** the board displays each active change as a card within a lifecycle column

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

### Requirement: Lifecycle columns
The system SHALL organize changes into ordered lifecycle columns — Proposed, In progress, Ready to archive, and Archived — and SHALL place each change in exactly one column derived from its state.

#### Scenario: A change has no completed tasks
- **WHEN** an active change has zero completed tasks
- **THEN** it appears in the Proposed column

#### Scenario: A change has some completed tasks
- **WHEN** an active change has at least one but not all tasks completed
- **THEN** it appears in the In progress column

#### Scenario: A change has all tasks completed
- **WHEN** an active change has all of its tasks completed
- **THEN** it appears in the Ready to archive column

#### Scenario: An archived change
- **WHEN** a change has been archived
- **THEN** it appears in the Archived column
- **AND** it does not appear in any active column

#### Scenario: An empty column
- **WHEN** a lifecycle column contains no changes
- **THEN** the column remains visible with a placeholder rather than being hidden

### Requirement: Columns are read-only
The system SHALL derive each change's column placement from its state and SHALL NOT let the user move a change between columns, preserving the viewer's read-only nature.

#### Scenario: No drag-to-move interaction
- **WHEN** a user views the kanban
- **THEN** cards cannot be dragged or otherwise moved between columns
- **AND** no board interaction writes to the project's `openspec/`

### Requirement: Per-column change count
The system SHALL display, for each lifecycle column, the number of changes currently in it.

#### Scenario: Column with changes
- **WHEN** a lifecycle column contains one or more changes
- **THEN** its header shows the count of changes in that column

### Requirement: Board reflects live state
The system SHALL update the kanban automatically as changes are added, progressed, or archived, moving each change into the column its current state implies.

#### Scenario: A new change appears while viewing
- **WHEN** a new change is created in the project while the board is open
- **THEN** a new card appears in the Proposed column without a manual refresh

#### Scenario: A change advances while viewing
- **WHEN** a change's task progress advances or it is archived while the board is open
- **THEN** its card moves to the column implied by its new state without a manual refresh

### Requirement: Board shows only the kanban
The system SHALL present the Board destination as the lifecycle kanban alone, without an embedded specifications listing; browsing specifications is reached through the Specs destination instead.

#### Scenario: Viewing the board
- **WHEN** a user opens the Board destination
- **THEN** only the lifecycle kanban of active and archived changes is shown
- **AND** no specifications listing is embedded in the board

#### Scenario: Reaching specifications
- **WHEN** a user wants to browse specifications
- **THEN** they navigate to the Specs destination rather than scrolling the board

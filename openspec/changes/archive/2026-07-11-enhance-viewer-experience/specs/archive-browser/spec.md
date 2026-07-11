## ADDED Requirements

### Requirement: Browse archived changes
The system SHALL present a dedicated view listing changes archived under the project's `openspec/changes/archive/` directory, which the `openspec` CLI cannot enumerate.

#### Scenario: Viewing the archive
- **WHEN** a user opens the Archive view
- **THEN** each archived change is listed with its name and archive date

#### Scenario: Empty archive
- **WHEN** the project has no archived changes
- **THEN** the Archive view shows an empty state rather than an error

### Requirement: Read an archived change
The system SHALL let the user open an archived change and read its artifacts and delta specs, rendered as markdown, in a read-only (frozen) form.

#### Scenario: Opening an archived change
- **WHEN** a user selects an archived change
- **THEN** its proposal, design, tasks, and delta specs are rendered as markdown
- **AND** no editing or re-running actions are offered

### Requirement: New archives appear live
The system SHALL surface a newly archived change in the Archive view without a manual refresh.

#### Scenario: A change is archived while the viewer is open
- **WHEN** a change is moved into `openspec/changes/archive/` while the Archive view is open
- **THEN** the new archived change appears in the list without user action

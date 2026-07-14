# archive-browser Specification

## Purpose
A dedicated, read-only view for browsing changes archived under `openspec/changes/archive/` — which the `openspec` CLI cannot enumerate — reading their artifacts and delta specs as markdown, with newly archived changes appearing live.

## Requirements

### Requirement: Browse archived changes
The system SHALL present a dedicated view listing changes archived under the project's `openspec/changes/archive/` directory, which the `openspec` CLI cannot enumerate.

#### Scenario: Viewing the archive
- **WHEN** a user opens the Archive view
- **THEN** each archived change is listed with its name and archive date

#### Scenario: Empty archive
- **WHEN** the project has no archived changes
- **THEN** the Archive view shows an empty state rather than an error

### Requirement: Read an archived change
The system SHALL let the user open an archived change and read its artifacts and delta specs in a read-only (frozen) form, navigated through the artifact navigation — one artifact at a time — the same way an active change is read, rather than as a single stacked scroll.

#### Scenario: Opening an archived change
- **WHEN** a user selects an archived change
- **THEN** its Proposal, Design, Tasks, and Spec changes are presented through the artifact navigation, one artifact at a time
- **AND** no editing or re-running actions are offered

#### Scenario: Archived change with a missing artifact
- **WHEN** a user opens an archived change that lacks an optional artifact, such as `design.md`, or that has no delta specs
- **THEN** that artifact's destination is shown as disabled rather than hidden, consistent with an active change

### Requirement: New archives appear live
The system SHALL surface a newly archived change in the Archive view without a manual refresh.

#### Scenario: A change is archived while the viewer is open
- **WHEN** a change is moved into `openspec/changes/archive/` while the Archive view is open
- **THEN** the new archived change appears in the list without user action

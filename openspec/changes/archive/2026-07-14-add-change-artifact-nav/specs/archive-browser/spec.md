## MODIFIED Requirements

### Requirement: Read an archived change
The system SHALL let the user open an archived change and read its artifacts and delta specs in a read-only (frozen) form, navigated through the artifact navigation — one artifact at a time — the same way an active change is read, rather than as a single stacked scroll.

#### Scenario: Opening an archived change
- **WHEN** a user selects an archived change
- **THEN** its Proposal, Design, Tasks, and Spec changes are presented through the artifact navigation, one artifact at a time
- **AND** no editing or re-running actions are offered

#### Scenario: Archived change with a missing artifact
- **WHEN** a user opens an archived change that lacks an optional artifact, such as `design.md`, or that has no delta specs
- **THEN** that artifact's destination is shown as disabled rather than hidden, consistent with an active change

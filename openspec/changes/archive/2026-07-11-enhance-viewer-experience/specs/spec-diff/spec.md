## ADDED Requirements

### Requirement: View mode selection
The system SHALL let the user switch the diff between three view modes — current spec only, proposed changes only, and side-by-side — via a control on the diff view.

#### Scenario: Switching to current-only
- **WHEN** the user selects the "Current" view mode
- **THEN** only the current spec's requirements are shown, full width

#### Scenario: Switching to proposed-only
- **WHEN** the user selects the "Proposed" view mode
- **THEN** only the change's proposed deltas are shown, full width
- **AND** all delta operations (added, modified, and removed) are included, not only additions

#### Scenario: Default mode
- **WHEN** the diff view is first opened for a change
- **THEN** it opens in side-by-side mode

## MODIFIED Requirements

### Requirement: Side-by-side current-versus-proposed view
The system SHALL provide a side-by-side view mode that presents a change's proposed spec deltas beside the current specification, and SHALL use it as the default mode.

#### Scenario: Viewing a change that modifies a spec
- **WHEN** a user opens the diff view for a change that affects a capability
- **THEN** the current spec's requirements are shown on one side
- **AND** the change's proposed deltas are shown on the other side

### Requirement: Deltas grouped and colored by operation
The system SHALL group proposed deltas by operation and visually distinguish ADDED, MODIFIED, and REMOVED, rendering their content as markdown rather than as boxed monospaced cards.

#### Scenario: A change adds, modifies, and removes requirements
- **WHEN** a change contains ADDED, MODIFIED, and REMOVED deltas
- **THEN** each delta is grouped under its operation
- **AND** each operation is given a distinct visual accent

#### Scenario: Delta content reads as a document
- **WHEN** a delta's requirement and scenarios are displayed
- **THEN** their text is rendered as formatted markdown, not inside monospaced boxes

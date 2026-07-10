# spec-diff Specification

## Purpose
The side-by-side view that shows a change's proposed spec deltas beside the current specification, grouped and colored by operation (ADDED / MODIFIED / REMOVED), updating live.

## Requirements

### Requirement: Side-by-side current-versus-proposed view
The system SHALL present a change's proposed spec deltas beside the current specification, side by side.

#### Scenario: Viewing a change that modifies a spec
- **WHEN** a user opens the diff view for a change that affects a capability
- **THEN** the current spec's requirements are shown on one side
- **AND** the change's proposed deltas are shown on the other side

### Requirement: Deltas grouped and colored by operation
The system SHALL group proposed deltas by operation and visually distinguish ADDED, MODIFIED, and REMOVED.

#### Scenario: A change adds, modifies, and removes requirements
- **WHEN** a change contains ADDED, MODIFIED, and REMOVED deltas
- **THEN** each delta is grouped under its operation
- **AND** each operation is given a distinct visual treatment

### Requirement: Diff reflects live state
The system SHALL update the diff view automatically when the change's delta or the current spec changes.

#### Scenario: A delta changes while the diff is open
- **WHEN** a change's delta file or the affected spec changes while the diff is displayed
- **THEN** the side-by-side view updates without a manual refresh

### Requirement: Empty and partial delta handling
The system SHALL render a diff view without error when a change has no deltas for a given spec.

#### Scenario: Change has no deltas for the selected spec
- **WHEN** a user opens the diff for a change that does not alter the selected spec
- **THEN** the proposed side shows an empty state rather than an error

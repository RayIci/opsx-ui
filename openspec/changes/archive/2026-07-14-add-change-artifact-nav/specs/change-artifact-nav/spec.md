## ADDED Requirements

### Requirement: Unified artifact navigation on a change drill-in

The system SHALL present a change's artifacts — Proposal, Design, Tasks, and Spec changes — as a set of switchable navigation destinations, showing one artifact at a time on its own surface rather than combining them, so each artifact is read uncluttered and the others remain one switch away.

#### Scenario: Navigating between artifacts

- **WHEN** a user on a change drill-in selects a different artifact in the navigation
- **THEN** the selected artifact is shown on its own
- **AND** the other artifacts remain reachable through the same navigation

#### Scenario: Full artifact set is offered

- **WHEN** a user opens a change drill-in
- **THEN** the navigation offers Proposal, Design, Tasks, and Spec changes as destinations

### Requirement: Proposal and Design are readable

The system SHALL render a change's `proposal.md` and `design.md` as read-only formatted markdown when selected in the artifact navigation, so users can read why a change exists and how it is designed without opening files directly.

#### Scenario: Reading the proposal

- **WHEN** a user selects the Proposal destination for a change that has a `proposal.md`
- **THEN** the proposal is displayed as formatted markdown

#### Scenario: Reading the design

- **WHEN** a user selects the Design destination for a change that has a `design.md`
- **THEN** the design is displayed as formatted markdown

### Requirement: Absent artifacts are shown as disabled destinations

The system SHALL show a navigation destination for every artifact in the set, and SHALL present destinations whose artifact is absent — an optional `design.md`, or Spec changes when the change has no deltas — as disabled (non-selectable) rather than hiding them, so the navigation reflects what a change could have while making clear what it currently has.

#### Scenario: Change without a design document

- **WHEN** a user opens a change drill-in for a change that has no `design.md`
- **THEN** the Design destination is shown as disabled
- **AND** it cannot be selected

#### Scenario: Change with no spec deltas

- **WHEN** a user opens a change drill-in for a change that proposes no spec deltas
- **THEN** the Spec changes destination is shown as disabled

#### Scenario: Present artifacts stay selectable

- **WHEN** a change has a given artifact present
- **THEN** that artifact's destination is enabled and selectable

### Requirement: Proposal is the default destination

The system SHALL open a change drill-in on the Proposal destination by default, so a user first sees why the change exists, with the other artifacts one switch away.

#### Scenario: Opening a change drill-in

- **WHEN** a user opens a change drill-in
- **THEN** the Proposal is shown first

### Requirement: Live and archived changes are navigated identically

The system SHALL use the same artifact navigation — the same destinations, labels, order, and disabled-when-absent behavior — for both active changes and archived changes, so a change is read the same way whether it is live or archived.

#### Scenario: Archived change uses the artifact navigation

- **WHEN** a user opens an archived change
- **THEN** its artifacts are presented through the same artifact navigation as an active change, one artifact at a time

#### Scenario: Consistent destinations across live and archived

- **WHEN** a user compares an active change drill-in with an archived change drill-in
- **THEN** both present the same artifact destinations in the same order with the same disabled-when-absent behavior

### Requirement: README is not a navigation destination

The system SHALL exclude any `README.md` found in a change directory from the artifact navigation, because it is not part of OpenSpec's artifact set and is not consistently present.

#### Scenario: Archived change contains a README

- **WHEN** a user opens an archived change whose directory contains a `README.md`
- **THEN** no navigation destination is offered for that `README.md`

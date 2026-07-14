# change-tasks Specification

## Purpose
Reading an active change's task list on its drill-in: the checklist from the change's `tasks.md` rendered as read-only markdown, presented as a distinct, switchable view alongside the proposed spec deltas, with graceful handling when no tasks exist.

## Requirements

### Requirement: Task list on the change drill-in

The system SHALL render an active change's task list on that change's drill-in, sourced from the change's `tasks.md`, so users can read which tasks are done and which remain without leaving the viewer or opening the file directly.

#### Scenario: Change with completed and incomplete tasks

- **WHEN** a user opens the drill-in for an active change whose `tasks.md` contains both completed (`- [x]`) and incomplete (`- [ ]`) task lines
- **THEN** every task line is displayed with its completion state shown (checked for completed, unchecked for incomplete)
- **AND** the task text is displayed for each task

#### Scenario: Grouped tasks preserve their sections

- **WHEN** a change's `tasks.md` organizes tasks under section headers
- **THEN** the rendered task list preserves those section groupings and their order

### Requirement: Task list is read-only

The system SHALL present the task list for reading only and SHALL NOT provide any control that changes task state from the UI, consistent with the viewer's read-only guarantee.

#### Scenario: User cannot toggle a task from the UI

- **WHEN** a user views the task list on a change drill-in
- **THEN** no task's completion state can be modified through the interface

### Requirement: Tasks are a distinct, switchable view on the drill-in

The system SHALL present the task list as its own view on the change drill-in, switchable with the proposed spec deltas, rather than combining both on screen at once, so each is read on an uncluttered surface.

#### Scenario: Switching between tasks and spec changes

- **WHEN** a user on a change drill-in switches between the tasks view and the spec-changes view
- **THEN** the selected view is shown on its own
- **AND** the other view remains reachable through the same switch

#### Scenario: Task view is the default

- **WHEN** a user opens a change drill-in
- **THEN** the tasks view is shown first, with the spec-changes view one switch away

### Requirement: Graceful handling of absent tasks

The system SHALL render the change drill-in without error when the change has no `tasks.md` or the file contains no task lines, indicating the absence rather than failing.

#### Scenario: Change has no tasks

- **WHEN** a user opens the drill-in for a change that has no `tasks.md` or whose `tasks.md` contains no task lines
- **THEN** the drill-in renders without error
- **AND** the spec-delta view remains available

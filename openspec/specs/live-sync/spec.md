# live-sync Specification

## Purpose
The read-only ingestion and live-update engine: reads OpenSpec state into typed view-models through a single source abstraction, watches the `openspec/` tree, and pushes fresh state to connected clients without a manual refresh.

## Requirements

### Requirement: Read-only ingestion
The system SHALL read OpenSpec state without modifying it, and SHALL NOT open any write path into a project's `openspec/` directory.

#### Scenario: Viewing never mutates state
- **WHEN** a user browses any view in the viewer
- **THEN** no file under the project's `openspec/` is created, edited, or deleted by the viewer

### Requirement: Typed view-models behind a source port
The system SHALL expose OpenSpec state to the UI as typed view-models produced through a single source abstraction, not as raw CLI text.

#### Scenario: State is served as structured data
- **WHEN** the UI requests project state
- **THEN** it receives structured view-models for changes, specs, deltas, status, and validation
- **AND** the concrete source of that data (CLI today) is hidden behind the abstraction

### Requirement: Live auto-update on file changes
The system SHALL watch the resolved `openspec/` tree and push updated state to connected clients automatically, without a manual refresh.

#### Scenario: An agent edits an OpenSpec file
- **WHEN** a file under the watched `openspec/` tree is created, modified, or deleted
- **THEN** the server re-reads the affected state
- **AND** connected browsers receive and render the updated state without user action

#### Scenario: Rapid successive edits
- **WHEN** many OpenSpec files change in quick succession
- **THEN** the system coalesces the burst
- **AND** clients converge on the final state without redundant flicker

### Requirement: Resilient watching
The system SHALL provide a manual refresh path as a fallback when filesystem watching is unavailable or unreliable.

#### Scenario: Watching is unreliable on the platform
- **WHEN** filesystem change events are not delivered reliably
- **THEN** the user can trigger a manual refresh that re-reads current state

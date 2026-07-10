# activity-feed Specification

## Purpose
A live, reverse-chronological feed of recent OpenSpec activity shown alongside the change board, so a user can watch what agents change on disk as it happens.

## Requirements

### Requirement: Live activity feed
The system SHALL present a feed of recent OpenSpec activity ordered from most to least recent, visible alongside the change board.

#### Scenario: Viewing recent activity
- **WHEN** the viewer is open
- **THEN** the activity feed lists recent OpenSpec changes in reverse-chronological order

### Requirement: Feed updates in real time
The system SHALL append new activity entries automatically as OpenSpec files change.

#### Scenario: A file changes while the feed is open
- **WHEN** an OpenSpec file is created, modified, or deleted
- **THEN** a corresponding entry appears at the top of the feed without a manual refresh

### Requirement: Activity entry detail
The system SHALL describe each activity entry with enough context to identify what changed.

#### Scenario: Reading an activity entry
- **WHEN** a user reads an entry in the feed
- **THEN** the entry identifies the affected change or spec and the nature of the change

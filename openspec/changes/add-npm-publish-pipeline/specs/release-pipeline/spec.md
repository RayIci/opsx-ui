## ADDED Requirements

### Requirement: Release is triggered by a version tag
The system SHALL publish to npm when a version tag (of the form `vX.Y.Z`) is pushed, and SHALL NOT publish on ordinary pushes or pull-request merges.

#### Scenario: Version tag pushed
- **WHEN** a `vX.Y.Z` tag is pushed
- **THEN** the release pipeline runs

#### Scenario: Merge to main without a tag
- **WHEN** a pull request is merged into `main` and no version tag is pushed
- **THEN** no release is attempted

### Requirement: Release tag corresponds to a main commit
The system SHALL release only from a tag whose commit is part of `main`'s history.

#### Scenario: Tag on a main commit
- **WHEN** the tagged commit is reachable from `main`
- **THEN** the release pipeline proceeds

#### Scenario: Tag on a commit not in main
- **WHEN** the tagged commit is not part of `main`'s history
- **THEN** the release pipeline does not publish

### Requirement: Checks pass before releasing
The system SHALL run the full check suite — formatting, linting, types, tests, and build — as part of the release and SHALL publish only if all checks pass.

#### Scenario: A check fails during release
- **WHEN** any check fails while releasing
- **THEN** nothing is published

#### Scenario: All checks pass during release
- **WHEN** every check passes
- **THEN** the release proceeds to publish

### Requirement: Tag and package version agree
The system SHALL verify that the pushed tag matches the package's declared `version` before publishing, and SHALL fail without publishing on a mismatch.

#### Scenario: Tag matches package version
- **WHEN** the pushed tag's version equals `package.json`'s `version`
- **THEN** the release proceeds to publish

#### Scenario: Tag does not match package version
- **WHEN** the pushed tag's version differs from `package.json`'s `version`
- **THEN** the release fails and nothing is published

### Requirement: Freshly built, authenticated, attributable publish
The system SHALL publish freshly built output, authenticated with a repository secret, with public access and build provenance; and publish credentials SHALL be reachable only by the release job, not by pull-request checks.

#### Scenario: Missing credentials
- **WHEN** the npm authentication token is not configured
- **THEN** the publish fails rather than publishing anonymously or silently succeeding

#### Scenario: Successful authenticated publish
- **WHEN** the token is configured and a release publishes
- **THEN** the package is published with freshly built contents, public access, and provenance attesting the build source

#### Scenario: Publishing locally
- **WHEN** a maintainer runs `npm publish` locally
- **THEN** a build runs automatically before the package contents are assembled

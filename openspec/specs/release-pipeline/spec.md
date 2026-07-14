# release-pipeline Specification

## Purpose
Tag-triggered publishing to npm: pushing a version tag re-runs the full checks gate, verifies the tag matches the package's declared version and that the tagged commit is on `main`, then publishes freshly built output with public access and build provenance. Authentication is by the CI provider's short-lived workload identity (trusted publishing), so no long-lived publish credential exists, and the ability to publish is never available to pull-request runs.

## Requirements

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

### Requirement: Freshly built, attributable publish without a long-lived credential
The system SHALL publish freshly built output with public access and build provenance, authenticating through the CI provider's short-lived workload identity rather than a long-lived publish token held in the repository; and the ability to publish SHALL be available only to the release job, never to pull-request checks.

#### Scenario: The release workflow is not an authorized publisher
- **WHEN** the registry does not recognize the release workflow as authorized to publish the package
- **THEN** the publish fails rather than publishing anonymously or silently succeeding

#### Scenario: Successful publish
- **WHEN** an authorized release publishes
- **THEN** the package is published with freshly built contents, public access, and provenance attesting the build source

#### Scenario: Publishing locally
- **WHEN** a maintainer runs `npm publish` locally
- **THEN** a build runs automatically before the package contents are assembled

### Requirement: The package declares the repository it is built from
The system SHALL declare the package's source repository in its manifest, matching the repository the release is built from, because provenance is verified against that declaration and an absent or mismatched one causes the registry to reject the publish.

#### Scenario: Repository is not declared, or does not match
- **WHEN** a release is attempted for a package whose declared source repository is absent or differs from the repository the build ran in
- **THEN** the publish is rejected rather than released without verifiable provenance

#### Scenario: Repository declaration matches
- **WHEN** the declared source repository matches the repository the release is built from
- **THEN** provenance is verified and the package is published

### Requirement: The release toolchain supports the publishing method
The system SHALL run the publish with tooling new enough to authenticate by workload identity, so a release cannot fail merely because the runner's default package manager predates the mechanism.

#### Scenario: The runner's default tooling is too old
- **WHEN** the release runs on an environment whose default package manager cannot authenticate by workload identity
- **THEN** the release uses a version that can, rather than failing or falling back to an unauthenticated publish

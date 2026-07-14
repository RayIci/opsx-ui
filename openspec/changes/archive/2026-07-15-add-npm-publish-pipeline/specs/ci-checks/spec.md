## ADDED Requirements

### Requirement: Checks run on pull requests to main
The system SHALL run automated checks on every pull request targeting `main`, and re-run them when the pull request is updated.

#### Scenario: Pull request opened against main
- **WHEN** a pull request targeting `main` is opened
- **THEN** the checks pipeline runs for that pull request

#### Scenario: Pull request updated
- **WHEN** new commits are pushed to an open pull request targeting `main`
- **THEN** the checks pipeline runs again against the updated commits

### Requirement: Checks cover formatting, linting, types, tests, and build
The system SHALL verify formatting, linting, type-correctness, tests, and a successful build, and SHALL report failure if any of these do not pass.

#### Scenario: A check fails
- **WHEN** formatting, linting, type-checking, tests, or the build fails
- **THEN** the checks pipeline reports failure

#### Scenario: All checks pass
- **WHEN** formatting, linting, type-checking, tests, and the build all succeed
- **THEN** the checks pipeline reports success

### Requirement: Main is updated only through pull requests
The system SHALL require changes to `main` to arrive via pull request and SHALL disallow direct pushes to `main`.

#### Scenario: Direct push to main
- **WHEN** someone attempts to push commits directly to `main`
- **THEN** the push is rejected

#### Scenario: Merging a pull request
- **WHEN** a pull request targeting `main` is merged
- **THEN** its commits become part of `main`

### Requirement: Failing checks block merging
The system SHALL prevent a pull request from merging into `main` while its required checks are failing or have not completed.

#### Scenario: Checks failing
- **WHEN** a pull request's required checks are failing
- **THEN** merging the pull request is blocked

#### Scenario: Checks passing
- **WHEN** a pull request's required checks have all passed
- **THEN** merging the pull request is permitted

### Requirement: Pull-request checks cannot publish
Because the repository is public and anyone may open a pull request, the system SHALL run pull-request checks without the ability to publish — neither holding publish credentials nor able to obtain a publishing identity — so that a contribution can never release the package or exfiltrate the means to do so.

#### Scenario: Pull request from a fork
- **WHEN** the checks pipeline runs for a pull request from a forked repository
- **THEN** it runs with no publish credentials and no ability to assume a publishing identity

#### Scenario: A pull request attempts to publish
- **WHEN** a pull request's code attempts to publish the package
- **THEN** it cannot authenticate to the registry and no release occurs

## Why

`opsx-ui` is a publishable CLI package (`bin`, `files: ["dist"]`, public name) in a public repository, but there is no CI at all: nothing verifies a change before it lands on `main`, and publishing is a manual, error-prone `npm publish` from someone's machine. We want two things: every change to `main` to be verified through a pull request that is blocked unless it passes checks, and releases to npm to happen automatically — and only — when a version tag is pushed, after those same checks pass again.

## What Changes

- Add a **reusable checks workflow** (typecheck, lint, formatting check, tests, build) used by both the PR and release pipelines so the gate is defined once.
- Add a **PR checks pipeline** (`on: pull_request` to `main`) that runs the checks and is the required status check that blocks merging when anything fails.
- Add a **release pipeline** triggered by pushing a version tag (`v*`). It re-runs the full checks, verifies the tag matches `package.json`'s `version` and that the tagged commit is on `main`, then publishes to npm.
- **Protect `main`**: direct pushes are disallowed — changes arrive only via pull request, and the PR checks must pass before merge. (Branch protection / ruleset — a repository setting configured as a setup step.)
- **Keep secrets secret on a public repo**: PR checks run with `pull_request` (read-only token, no access to secrets — never `pull_request_target`), so fork contributions can never read release credentials. `NPM_TOKEN` is exposed only to the tag-triggered release job, optionally behind a protected deployment environment.
- Publish with an `NPM_TOKEN` automation secret, public access, and build provenance; add a `prepublishOnly` build so no publish (CI or local) ever ships stale output.

## Capabilities

### New Capabilities
- `ci-checks`: automated verification (types, lint, formatting, tests, build) that runs on pull requests to `main` and blocks merges that don't pass, with `main` reachable only through pull requests.
- `release-pipeline`: tag-triggered publishing to npm that re-runs the checks and validates the tag before releasing, keeping publish credentials isolated from pull-request runs.

### Modified Capabilities

## Impact

- New files: `.github/workflows/checks.yml` (reusable), `.github/workflows/pr.yml`, `.github/workflows/release.yml`.
- `package.json`: add a `prepublishOnly` script; `version` becomes the release source of truth, asserted against the pushed tag.
- Repository settings: a branch-protection rule / ruleset on `main` (require PR, require the PR checks status). New required secret: `NPM_TOKEN` (npm automation token), optionally scoped to a protected `npm-publish` environment.
- No application/runtime code changes; this is build/release tooling and repo governance only.

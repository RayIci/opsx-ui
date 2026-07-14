## Context

`opsx-ui` builds to `dist/` (Vite web bundle + `tsc` server) and ships as a CLI (`bin: opsx-ui`); `package.json` has `files: ["dist"]` and is not `private`, so it is publish-ready. There is no CI (`.github/` does not exist) and no `prepublishOnly` hook. The repo and the package are both **public**, and the GitHub remote is `RayIci/opsx-ui`. The maintainer wants: `main` changed only via pull request, PRs blocked unless checks pass, and npm releases triggered by pushing a version tag — with those same checks re-run first, and publish secrets never exposed to pull-request runs.

Existing scripts to reuse as the gate: `typecheck`, `lint`, `format:check`, `test`, `build`.

## Goals / Non-Goals

**Goals:**
- One gate definition (types, lint, formatting, tests, build) reused by both PR and release pipelines.
- PRs to `main` blocked until the gate passes; `main` unpushable directly.
- Releases only on version tags, gated by the checks and a tag/version match.
- On a public repo, keep `NPM_TOKEN` unreachable from pull-request (incl. fork) runs.

**Non-Goals:**
- Automatic version bumping / changelog / semantic-release (maintainer bumps `version` and pushes the tag).
- Canary/pre-release channels, multi-OS/Node matrices, multi-registry publishing.

## Decisions

### Reusable checks workflow called by both pipelines
`checks.yml` is a `workflow_call` reusable workflow that runs `npm ci` → `typecheck` → `lint` → `format:check` → `test` → `build`. `pr.yml` (`on: pull_request` → `main`) calls it; `release.yml` (`on: push: tags: 'v*'`) calls it as a prerequisite job before publishing. Defining the gate once guarantees "PR checks" and "release checks" can never drift.

*Alternative considered:* a composite action or duplicated steps in each workflow — rejected because it invites drift between the PR gate and the release gate.

### PR pipeline uses `pull_request`, never `pull_request_target`
The public-repo secret-safety requirement hinges on this. `on: pull_request` runs fork PRs with a read-only `GITHUB_TOKEN` and **no** access to repository secrets, so a malicious PR cannot exfiltrate `NPM_TOKEN`. `pull_request_target` (which does expose secrets and the base repo context) is deliberately avoided. The checks job needs no secrets at all.

### Release trigger: version tag, with tag↔version and tag↔main guards
`release.yml` triggers on `push` of tags matching `v*`. Instead of the earlier `npm view` version guard, the tag *is* the release intent. Two guard steps protect correctness:
1. **Tag matches `package.json` version** — parse `${GITHUB_REF_NAME#v}` and assert it equals the `version` field; fail otherwise.
2. **Tagged commit is on `main`** — assert the tag's commit is reachable from `origin/main` (`git merge-base --is-ancestor`); skip/fail publish otherwise, satisfying "release only from a main commit."

*Alternative considered:* release on GitHub Releases (`on: release`) — equivalent, but tag-push is the maintainer's stated trigger and needs no extra Release object.

### Secret isolation + provenance in the release job only
`actions/setup-node` with `registry-url: https://registry.npmjs.org` writes an auth-configured `.npmrc`; `NODE_AUTH_TOKEN` is set from the `NPM_TOKEN` secret **only** in the release job. Publish runs `npm publish --provenance --access public`, so the release job declares `permissions: { contents: read, id-token: write }` for OIDC provenance. Optionally the publish job targets a protected `npm-publish` GitHub Environment (required reviewers) for a human gate before the token is used. PR checks declare `permissions: { contents: read }` and reference no secrets.

### `prepublishOnly` build for defense in depth
Add `"prepublishOnly": "npm run build"` so any publish — CI or a maintainer's local `npm publish` — rebuilds `dist/` first and can never ship stale output. The release workflow also builds explicitly as part of the gate; the extra build is cheap.

### Branch protection is repository configuration, not a workflow
"`main` only via PR" and "failing checks block merge" are enforced by a branch-protection rule / ruleset on `main` (require a pull request, require the PR checks status check, disallow direct pushes). This lives in repo settings, so it is a documented setup task (with `gh api` commands provided), not a file the pipeline can self-apply. The required status check name must match the PR workflow's job.

## Risks / Trade-offs

- **[Public repo → secret exfiltration via PR]** → Enforced by `pull_request` (no secret access) and never `pull_request_target`; release secrets live only in the tag-triggered job, optionally behind an environment with required reviewers.
- **[Tag pushed without bumping `version`, or vice-versa]** → The tag↔version assertion fails the release loudly instead of publishing a mismatched artifact.
- **[Tag created off a side branch]** → The tag↔main ancestor check prevents releasing code that never went through the PR gate.
- **[Required status check name drift]** → Branch protection references the PR job by name; document that renaming the job requires updating the protection rule, or the gate silently stops blocking.
- **[Provenance/OIDC friction]** → `--provenance` + `id-token: write` can be dropped without touching the rest of the pipeline if it ever blocks a release.

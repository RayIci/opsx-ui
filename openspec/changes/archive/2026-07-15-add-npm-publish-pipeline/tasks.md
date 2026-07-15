## 1. Package publish safety

- [x] 1.1 Add `"prepublishOnly": "npm run build"` to `package.json` scripts
- [x] 1.2 Confirm `files`, `bin`, and `version` in `package.json` are correct for a public release

## 2. Reusable checks workflow

- [x] 2.1 Create `.github/workflows/checks.yml` as a `workflow_call` reusable workflow with `permissions: { contents: read }` and no secrets
- [x] 2.2 Add steps: `actions/checkout` → `actions/setup-node` (modern Node, npm cache) → `npm ci` → `npm run typecheck` → `npm run lint` → `npm run format:check` → `npm test` → `npm run build`

## 3. PR checks pipeline

- [x] 3.1 Create `.github/workflows/pr.yml` triggered on `pull_request` targeting `main` (not `pull_request_target`)
- [x] 3.2 Have it call `checks.yml` via `uses: ./.github/workflows/checks.yml`; give the job a stable name to reference in branch protection

## 4. Release pipeline

- [x] 4.1 Create `.github/workflows/release.yml` triggered on `push` of tags matching `v*`
- [x] 4.2 Add a checks job that calls `checks.yml`, so the release re-runs the full gate first
- [x] 4.3 Add a publish job that `needs` the checks job, with `permissions: { contents: read, id-token: write }` and `actions/setup-node` using `registry-url: https://registry.npmjs.org`
- [x] 4.4 Guard step: assert the tag version (`${GITHUB_REF_NAME#v}`) equals `package.json`'s `version`; fail on mismatch
- [x] 4.5 Guard step: assert the tagged commit is an ancestor of `origin/main`; do not publish otherwise
- [x] 4.6 Publish step: `npm publish --provenance --access public` — **implemented with npm trusted publishing (OIDC) instead of `NODE_AUTH_TOKEN`/`NPM_TOKEN`: the job authenticates by short-lived workload identity, so no long-lived secret exists. Scoped to the protected `npm-publish` environment (no longer optional), and installs a current npm first because Node 22's npm 10.x predates trusted publishing (needs ≥ 11.5.1).**

## 5. Repository governance & credentials

- [x] 5.1 ~~Add the npm automation token as the `NPM_TOKEN` repository secret~~ — **obsolete: superseded by trusted publishing, which needs no secret. The equivalent user action is configuring a trusted publisher on the npm package (linking it to `RayIci/opsx-ui` + `release.yml`) and creating the protected `npm-publish` environment. Evidence a publisher is configured: the failed release reached npm's provenance check rather than being rejected as unauthenticated.**
- [ ] 5.2 Configure branch protection / ruleset on `main` — **STILL OUTSTANDING (verified 2026-07-15: `gh api repos/RayIci/opsx-ui/branches/main/protection` → 404 "Branch not protected"). Until this is set, PR checks run but a failing check does not block merge, and `main` accepts direct pushes.**
- [x] 5.3 Verify the required status check name in branch protection matches the PR workflow job name → it is **`checks / verify`** (`pr.yml` job `checks` calling `checks.yml` job `verify`)

## 6. Verification

- [x] 6.1 Validate all workflow YAML (syntax + `actionlint` if available) and confirm gate commands match `package.json` scripts
- [x] 6.2 Dry-run the package with `npm publish --dry-run` (or `npm pack`) to confirm only `dist/` ships and `prepublishOnly` builds first
- [ ] 6.3 Confirm checks run on a PR and that a failing check blocks merge — **PARTIALLY DONE: checks demonstrably run on real PRs (several `checks / verify` runs, both passing and failing, on PRs #3–#5). The blocking half cannot hold until 5.2 is configured, and a direct push to `main` is currently NOT rejected.**
- [ ] 6.4 Push a matching `vX.Y.Z` tag and confirm the release publishes — **ATTEMPTED AND FAILING. `v0.2.0` was tagged and the Release workflow ran twice (runs 29375006606, 29376386314): the checks gate, tag↔version guard and tag↔main guard all passed, and the publish then failed at npm with `422 … Failed to validate repository information: package.json "repository.url" is ""`. npm's latest remains 0.1.0. Root-caused: `--provenance` verifies the manifest's repository against the building repo, and `main`'s `package.json` declares none. Fixed on `dev` by commit `d6cc25f`; the fix must reach `main` and the tag be re-cut before a release can succeed.**

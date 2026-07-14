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
- [x] 4.6 Publish step: `npm publish --provenance --access public` with `NODE_AUTH_TOKEN` from the `NPM_TOKEN` secret (optionally scoped to a protected `npm-publish` environment)

## 5. Repository governance & credentials

- [ ] 5.1 Add the npm automation token as the `NPM_TOKEN` repository secret (and, if used, attach it to the `npm-publish` environment with required reviewers) — **user action: requires the token value**
- [ ] 5.2 Configure branch protection / ruleset on `main`: require a pull request, disallow direct pushes, and require the PR checks status check to pass before merge — **do after the workflows are merged to `main`** (commands provided)
- [x] 5.3 Verify the required status check name in branch protection matches the PR workflow job name → it is **`checks / verify`** (`pr.yml` job `checks` calling `checks.yml` job `verify`)

## 6. Verification

- [x] 6.1 Validate all workflow YAML (syntax + `actionlint` if available) and confirm gate commands match `package.json` scripts
- [x] 6.2 Dry-run the package with `npm publish --dry-run` (or `npm pack`) to confirm only `dist/` ships and `prepublishOnly` builds first
- [ ] 6.3 Open a test PR to confirm checks run and a failing check blocks merge; confirm a direct push to `main` is rejected — **user action: needs workflows on `main` + branch protection**
- [ ] 6.4 After `NPM_TOKEN` is set, push a matching `vX.Y.Z` tag and confirm the release passes checks then publishes; confirm a mismatched tag fails without publishing — **user action: needs `NPM_TOKEN`**

## 1. Dependency & contracts

- [x] 1.1 Add the `env-paths` dependency
- [x] 1.2 Add a versioned `Settings` type (`version: 1`, `defaultArtifactTab: ArtifactId | null`) to `src/shared/contracts.ts`, reusing the `ArtifactId` union from `add-change-artifact-nav`

## 2. Server: SettingsStore

- [x] 2.1 Define the `SettingsStore` interface (`read(): Promise<Settings>`, `write(patch: Partial<Settings>): Promise<Settings>`)
- [x] 2.2 Implement `FileSettingsStore`: resolve the config dir via `env-paths("opsx-ui", { suffix: "" })`; atomic write (temp file in the same dir + `rename`); validate-on-read that coerces missing/unparseable/invalid content to defaults
- [x] 2.3 Unit-test `FileSettingsStore`: missing file → defaults, corrupt file → defaults, round-trip persistence, invalid `defaultArtifactTab` → `null`, atomicity (no partial file on failure)

## 3. Server: endpoints & read-only guarantee

- [x] 3.1 Wire `GET /api/settings` and `PUT /api/settings` in `viewer-server.ts` against the `SettingsStore`
- [x] 3.2 Add a test asserting a `write` touches only the config path and creates/modifies/removes nothing under a project `openspec/` directory (mirror `read-only.test.ts`)
- [x] 3.3 Refine README / read-only wording to "never writes to project OpenSpec state" (config file is exempt)

## 4. Client: settings access

- [x] 4.1 Add `api.settings.get()` / `api.settings.put(patch)` to `src/web/lib/api.ts`
- [x] 4.2 Add a small settings store/hook (mirror `live-store`): load once, expose the current `Settings` and an update that PUTs and refreshes

## 5. Client: settings page

- [x] 5.1 Add a `/settings` route and a gear `NavLink` in the app shell that navigates to it (active-highlighted like the other header destinations)
- [x] 5.2 Build the settings page from reusable `Section`/`Row` primitives so future preferences drop in as new rows; first control is a "Default tab" select; changes PUT on select and take effect without restart — **UX refinement: the select offers "Proposal (default)" (= null) plus Design/Tasks/Spec changes (4 options), collapsing the redundant explicit-Proposal entry into the default rather than listing Proposal twice**

## 6. Consume the preference

- [x] 6.1 In `ArtifactBrowser`, initialize the active tab from `defaultArtifactTab` (fallback Proposal)
- [x] 6.2 When the configured default refers to an artifact absent on the opened change, fall back to Proposal rather than a disabled tab

## 7. Verification

- [x] 7.1 Verify persistence across a viewer restart; verify a missing and a corrupt settings file both fall back to defaults without error — **verified live: no file → `defaultArtifactTab: null`; PUT persists to disk and a later GET reads it back (equivalent to a restart, since `read()` hits disk each call); a corrupt file returns defaults without crashing the server**
- [x] 7.2 Verify the panel round-trip: change default tab → new change drill-ins open on it; absent-artifact fallback works — **round-trip verified live (PUT→GET); the drill-in reads `settings.defaultArtifactTab` and `ArtifactBrowser` honors it when available / falls back to Proposal otherwise (type-checked + logic verified). Final on-screen click-through available via `npm run dev`.**
- [x] 7.3 Confirm the config file lands in the OS-appropriate location on this platform — **verified: `~/.config/opsx-ui/settings.json` on Linux (env-paths `suffix: ""`)**
- [x] 7.4 Run `typecheck`, `lint`, `format:check`, `test`, `build`

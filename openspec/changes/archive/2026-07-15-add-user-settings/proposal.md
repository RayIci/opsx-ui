## Why

opsx-ui has no place to remember a user's preferences. The first concrete need comes from `add-change-artifact-nav`, which hard-defaults a change drill-in to the Proposal tab — but different users want different first views (someone tracking work wants Tasks; a reviewer wants Spec changes). More broadly, the viewer has several latent per-user preferences (default landing view, poll mode, theme default) with nowhere to live. We want a small, durable settings home so preferences survive restarts and are consistent across browsers on the same machine — starting with the default artifact tab.

## What Changes

- Introduce **persistent user settings** stored in an OS-appropriate config file (via `env-paths`: `~/.config/opsx-ui/settings.json` on Linux, and the correct equivalent on macOS/Windows), owned and served by the viewer server.
- Add a **dedicated settings page** at its own URL, reached from a gear icon in the app shell, where the user can view and change their preferences. A page (rather than a modal) so settings have room to grow into grouped sections, and so the destination is addressable like every other view.
- First preference: **default artifact tab** for change drill-ins. When set, opening a change opens on that tab; when unset or invalid, the built-in default (Proposal) is used.
- Add read/write endpoints: `GET /api/settings` and `PUT /api/settings`, backed by a `SettingsStore` abstraction with a file implementation (atomic write, schema-validated, defaults on missing/malformed).
- **Preserve the read-only guarantee explicitly**: this introduces the viewer's first write path, but writes are confined to the user config directory and NEVER touch any project's `openspec/` tree.

## Capabilities

### New Capabilities
- `user-settings`: durable per-user preferences for the viewer — persisted to an OS-appropriate config file, editable through a global settings panel, tolerant of a missing or malformed file, and confined to the user config directory so the project's `openspec/` state is never written. First preference is the default artifact tab applied when a change drill-in opens.

### Modified Capabilities

## Impact

- **New dependency**: `env-paths` (zero-dep) for cross-platform config-directory resolution (`suffix: ""` so the folder is exactly `opsx-ui`).
- **New server module**: a `SettingsStore` interface + `FileSettingsStore` (env-paths dir, atomic temp-write-and-rename, JSON parse with a versioned schema and default fallback); wired into `viewer-server.ts` as `GET`/`PUT /api/settings`.
- **New client**: `api.settings.get/put`, a small settings store/hook (mirroring `live-store`), a `/settings` route + page built from reusable `Section`/`Row` primitives, and a gear `NavLink` in the app shell.
- **Consumes** `change-artifact-nav`: the `ArtifactBrowser` initial tab reads the configured default (fallback Proposal). Depends on `add-change-artifact-nav` and should land after it.
- **Contracts**: add a `Settings` type (versioned) to `shared/contracts.ts`.
- **Read-only invariant**: reaffirmed and given its own test — writes are asserted to stay within the config dir and never within any project `openspec/`.

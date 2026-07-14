## Context

opsx-ui is a server + browser app whose defining invariant is that it never writes to any project's `openspec/` directory. It currently has **no persistence of any kind** — every preference (theme is client-only, view state is ephemeral) lives in the browser or in memory. `add-change-artifact-nav` introduces a hard-coded default drill-in tab (Proposal); this change makes that default a real, durable user preference and, in doing so, establishes the viewer's first write path. The write path must be introduced without weakening the read-only guarantee, which is specifically about *project* state, not the user's own machine config.

## Goals / Non-Goals

**Goals:**
- Durable, cross-platform user preferences in an OS-appropriate config file.
- A global settings panel to view/edit preferences, effective without restart.
- First preference — default artifact tab — consumed by `ArtifactBrowser`.
- Keep the read-only-on-project guarantee provably intact.
- A settings design that cleanly accommodates future preferences.

**Non-Goals:**
- Multi-user / synced / cloud settings — this is a local, single-machine tool.
- Per-project settings — preferences are global to the user for now.
- Migrating existing client-only theme state into the file (can follow later).
- Any settings beyond the default artifact tab in this change (the store is built to grow, but only one preference ships).

## Decisions

### File-backed settings via `env-paths`, not localStorage
Preferences persist to a JSON file in the platform config dir resolved by `env-paths("opsx-ui", { suffix: "" })` (`~/.config/opsx-ui/settings.json` on Linux; `~/Library/Preferences/opsx-ui` on macOS; `%APPDATA%\opsx-ui\Config` on Windows). Chosen over browser `localStorage` because settings should survive browser resets, be consistent across browsers on the same machine, and form a real home that future preferences (default landing view, poll mode, theme) can join. `env-paths` is a tiny zero-dep library that already encodes every platform's convention, so we do not hand-roll per-OS path logic.

*Alternative considered:* `localStorage` — simpler and backend-free, but per-browser, lost on clear, and unable to grow into shared settings. Rejected given the explicit intent to build a settings *home*.

*Alternative considered:* the higher-level `conf` package — ergonomic but more than needed; a thin `FileSettingsStore` over `env-paths` keeps dependencies minimal and the behavior explicit.

### `SettingsStore` interface + `FileSettingsStore` implementation (DIP/SRP)
The server depends on an interface, not the file:

```
interface SettingsStore {
  read(): Promise<Settings>;              // always returns valid settings (defaults on missing/bad)
  write(patch: Partial<Settings>): Promise<Settings>;  // merge, validate, persist, return result
}
```

`FileSettingsStore` owns exactly one responsibility: reading/writing the config file safely. It performs an **atomic write** (write to a temp file in the same dir, then `rename`) so a crash mid-write can never corrupt settings, and it **validates on read**, coercing a missing/unparseable/invalid file to defaults. Because the server codes against the interface, tests use an in-memory store and the file impl is swappable.

*Alternative considered:* read/write the file inline in the route handlers — rejected; it scatters file, path, validation, and atomicity concerns across HTTP code and defeats testing.

### Versioned, self-defaulting settings schema
`Settings` carries a `version` field and validates every field on read:

```
interface Settings {
  version: 1;
  defaultArtifactTab: ArtifactId | null;  // null = use built-in default
}
```

Unknown or out-of-range values are coerced to their default (e.g. an unrecognized `defaultArtifactTab` → `null`), so a forward/older file or a hand-edit never breaks the app. `version` gives an explicit seam for future migrations. This directly backs the spec's "tolerant of missing or malformed settings" requirement.

### Two focused endpoints; the store is the only writer
`GET /api/settings` → current `Settings`; `PUT /api/settings` → applies a partial and returns the merged result. Only `FileSettingsStore.write` ever touches disk, and it targets only the config dir. This is the entire write surface of the application, and it is deliberately small and auditable.

### Read-only guarantee is scoped and tested
The invariant "never write to a project's `openspec/`" is unchanged: the config dir is outside every project. To keep this honest as the first write path lands, add a test asserting a `write` touches only the config path and creates/modifies nothing under a project `openspec/` — mirroring the existing `read-only.test.ts` discipline. The proposal and README language is refined to say "never writes to project OpenSpec state," not "never writes anything."

### Client: a small settings store + a dedicated settings page (SRP, mirrors existing patterns)
`api.settings.get/put` join `api.ts`; a lightweight settings store/hook mirrors `live-store` (load once, expose value + an update that PUTs and refreshes). The app shell's gear icon is a `NavLink` to a **dedicated `/settings` page**, not a modal: settings are expected to grow (default landing view, poll mode, theme), and a page gives them room to become grouped sections without a redesign. It also makes settings addressable and back/forward-navigable, consistent with this app's rule that every destination has its own URL — a transient overlay would be the one view you cannot link to. The page is built from `Section` + `Row` primitives so a new preference is a few lines, not a layout change. Its first control is a "Default tab" select; `ArtifactBrowser`'s initial tab reads this value, falling back to Proposal — and, per spec, falling back to Proposal when the configured tab is absent on the opened change (never landing on a disabled tab).

*Alternative considered:* a gear-icon modal dialog — rejected. It suits one or two controls, but a modal is a dead end for a surface intended to accumulate settings, it isn't linkable, and it traps focus over content it has nothing to do with.

## Risks / Trade-offs

- **[First write path in a read-only viewer]** perception and safety. → Confined to the config dir, single writer (`FileSettingsStore`), atomic, and covered by a read-only-on-project test; docs clarify the guarantee is about project state.
- **[Config file corruption / partial write]** → Atomic temp-write-and-rename plus validate-on-read means the worst case is falling back to defaults, never a crash.
- **[Cross-platform path/permission differences]** → Delegated to `env-paths`; if the dir is unwritable, `write` surfaces an error to the panel and reads still return defaults, so the viewer stays usable.
- **[Coupling to `change-artifact-nav`]** the default-tab preference only means something once the nav exists. → Sequenced after `add-change-artifact-nav`; the `user-settings` spec owns the preference and its effect so it stays independently valid, and the consumption point is a single line in `ArtifactBrowser`.
- **[Concurrent viewers writing the same file]** last-write-wins. → Acceptable for a local single-user tool; atomic writes keep the file always-valid even if a value is clobbered.

## Migration Plan

1. Add `env-paths`; add versioned `Settings` (+ reuse `ArtifactId`) to `shared/contracts.ts`.
2. Implement `SettingsStore` + `FileSettingsStore` (env-paths dir, atomic write, validate-on-read defaults).
3. Wire `GET`/`PUT /api/settings`; add the read-only-on-project test.
4. Add `api.settings.*` and the client settings store/hook.
5. Add the gear icon + settings dialog with the Default-tab select.
6. Consume the preference in `ArtifactBrowser`'s initial tab (fallback Proposal; skip absent tabs).
7. Rollback: delete endpoints/UI and the dependency; the config file is inert if unused, so no data migration is needed.

## Open Questions

- When the user has multiple viewers open, should a `PUT` broadcast the new settings over the existing WebSocket so other tabs update live, or is load-on-open sufficient? Leaning "load-on-open" for this change; live broadcast can follow if needed.

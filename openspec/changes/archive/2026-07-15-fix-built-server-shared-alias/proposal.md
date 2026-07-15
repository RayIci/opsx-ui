## Why

The viewer works in development because `tsx` and Vite understand TypeScript path aliases, but the built CLI fails under plain Node because emitted server imports still reference `@shared/*`. Users who run `npm run build && npm run start` or install the package globally currently get `ERR_MODULE_NOT_FOUND` instead of a working viewer.

## What Changes

- Ensure the production server entrypoint can resolve shared contracts after `npm run build`.
- Keep development and production import behavior aligned so `npm run dev`, `npm run start`, and the installed `opsx-ui` command exercise the same module graph.
- Add targeted verification that catches unresolved runtime aliases in built output.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `viewer-cli`: Clarify that the built or globally installed `opsx-ui` executable must start successfully under Node without relying on development-only path alias resolution.

## Impact

- Affected code: server/CLI TypeScript imports, build configuration or package runtime resolution, and any tests/checks that exercise built CLI startup.
- Affected commands: `npm run build`, `npm run start`, and the globally installed `opsx-ui` package command.
- No expected public API or UI changes.

## Context

The project has two different runtime environments:

- The web app is bundled by Vite, which understands the `@shared` alias from `vite.config.ts`.
- The CLI/server is compiled by `tsc -p tsconfig.node.json` and then executed directly by Node from `dist/`.

`tsconfig.node.json` defines `@shared/*` in `compilerOptions.paths`, which is enough for TypeScript and `tsx` development resolution. Plain `tsc` does not rewrite those aliases in emitted JavaScript, so built files such as `dist/core/filesystem-source.js` still import `@shared/contracts.js`. Node treats that as a package import and fails with `ERR_MODULE_NOT_FOUND`.

## Goals / Non-Goals

**Goals:**

- Make built CLI/server JavaScript directly executable by Node after `npm run build`.
- Keep the installed `opsx-ui` package command behavior aligned with `npm run start`.
- Preserve the existing Vite/web alias setup where it is safely bundled.
- Add validation that fails if built server output still contains unresolved `@shared` runtime imports.

**Non-Goals:**

- Rework the web build, routing, or UI behavior.
- Change the public CLI flags or viewer API.
- Introduce a broader module aliasing convention for the whole repository.

## Decisions

### Use relative imports for Node-emitted shared contracts

Node-side source files under `src/cli`, `src/server`, and `src/core` should import shared runtime values and types via relative ESM paths such as `../shared/contracts.js`, matching the relative layout emitted to `dist/`.

Rationale:

- It works natively in both TypeScript `NodeNext` mode and plain Node ESM after emit.
- It avoids adding a post-build rewriting step or extra production-sensitive tooling.
- It keeps the fix local to the Node-emitted code that actually runs unbundled.

Alternatives considered:

- Add `tsc-alias` after `tsc`: preserves aliases but adds another build dependency and another step that must stay synchronized with TypeScript output.
- Use Node package `"imports"` with `#shared/*`: native at runtime, but requires changing source imports and coordinating TypeScript, Node, and possibly Vite resolution rules.
- Bundle the server: would also solve aliases, but is a larger build-pipeline change than the issue requires.

### Keep web imports unchanged

Web-only files can continue importing `@shared/contracts` because Vite bundles them and already has a matching alias. The runtime failure is specific to unbundled Node output.

### Validate emitted runtime imports

Implementation should include a targeted check after building that imports representative built server modules with Node or otherwise detects unresolved `@shared` imports in `dist` server code. This should catch regressions even when development mode still works.

## Risks / Trade-offs

- Relative imports are less aesthetically uniform than aliases -> Keep the change scoped to Node-emitted files only and leave bundled web imports untouched.
- Type-only imports can still appear harmless in source -> TypeScript erases type-only imports, but mixed imports that include runtime values must be checked in emitted JavaScript.
- A smoke test that starts the CLI can hang if not managed carefully -> Prefer importing non-starting built modules for alias validation, or run the CLI under a controlled background process with explicit teardown.

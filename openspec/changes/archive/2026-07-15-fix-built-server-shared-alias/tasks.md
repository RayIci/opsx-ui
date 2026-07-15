## 1. Runtime Import Fix

- [x] 1.1 Find every `@shared/*` import in Node-emitted source under `src/cli`, `src/server`, and `src/core`.
- [x] 1.2 Replace Node-emitted shared imports with runtime-valid relative ESM imports that point to `src/shared` and emit correctly to `dist/shared`.
- [x] 1.3 Leave web-only `@shared` imports unchanged because Vite bundles and resolves them.

## 2. Regression Coverage

- [x] 2.1 Add or document a targeted built-output smoke check that fails if server/CLI `dist` files retain unresolved `@shared/*` runtime imports.
- [x] 2.2 Ensure the smoke check imports representative built server modules without starting a long-running server process, or manages CLI startup with explicit teardown.

## 3. Validation

- [x] 3.1 Run `npm run typecheck` to confirm the relative imports satisfy TypeScript `NodeNext` resolution.
- [x] 3.2 Run `npm run build` and confirm emitted server/CLI JavaScript no longer contains unresolved `@shared/*` imports.
- [x] 3.3 Confirm built runtime startup succeeds via `npm run start -- --no-open` or an equivalent controlled `node dist/...` smoke test.

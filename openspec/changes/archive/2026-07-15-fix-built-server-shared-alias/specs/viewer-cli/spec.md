## MODIFIED Requirements

### Requirement: Global launchable command
The system SHALL install a global `opsx-ui` executable that, when run from built package output under plain Node, starts a local web server and opens the viewer in the default browser without relying on development-only TypeScript or Vite path alias resolution.

#### Scenario: Launch from a project directory
- **WHEN** a user runs `opsx-ui` in a directory containing an `openspec/` root
- **THEN** the server starts on a local port
- **AND** the browser opens to the viewer showing that project's OpenSpec state

#### Scenario: Server port already in use
- **WHEN** the default local port is unavailable at launch
- **THEN** the system selects an available port and opens the browser to it

#### Scenario: Built CLI resolves shared runtime modules
- **WHEN** the package has been built and the CLI/server JavaScript is executed from `dist/` by Node
- **THEN** all shared runtime modules used by the CLI/server resolve successfully
- **AND** launch does not fail with `ERR_MODULE_NOT_FOUND` for a development-only alias such as `@shared/*`

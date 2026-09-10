# Phase 01 — Runnable foundations and CI

## Ownership and entry

Owner: Backend/platform developer; mobile/admin developers in parallel.

Entry: Phase 00 draft accepted for development; blocking decisions recorded.

## Status

| Status | Owner | Branch / PR | Updated |
|---|---|---|---|
| Not started | Backend/platform developer; mobile/admin developers in parallel | — | 2026-09-09 |

`Not started` → `In progress` → `Blocked` / `In review` → `Completed`. Mark this phase Completed only when every exit-acceptance box below is ticked. Update the [dashboard](../README.md) in the same pull request.

## Work packages

| ID | Work package | Status | Branch / PR |
|---|---|---|---|
| P01-01 | Audit existing scaffold | Not started | — |
| P01-02 | Backend shell | Not started | — |
| P01-03 | Local database/migrations | Not started | — |
| P01-04 | UI shells | Not started | — |
| P01-05 | Mock AI | Not started | — |
| P01-06 | CI gates | Not started | — |

Each work package is described in full below. Change a row's status as the work moves, and reflect the phase-level roll-up on the [dashboard](../README.md).

### P01-01 — Audit existing scaffold

Keep services/ai and prototype-archive paths from merged PR #1. Do not reintroduce checked-in environments, node_modules, media recordings or model checkpoints.

### P01-02 — Backend shell

Create app factory, typed settings, health routes, dependency injection, request ID middleware, structured error handler and SQLAlchemy session lifecycle. No authentication bypass in a remotely accessible build.

### P01-03 — Local database/migrations

Use a disposable local PostgreSQL instance for development, not the shared LXC database. Introduce reviewed Alembic migrations from reference SQL and stable seed IDs. Verify an empty database can be built.

### P01-04 — UI shells

Create Expo TypeScript routes and Vite TypeScript admin shell. Introduce generated API types, auth adapter, environment parsing, error views and accessible design tokens.

### P01-05 — Mock AI

Implement deterministic v1 responses for fixture scenarios; label simulated evidence. Enable mock mode only for tests/demo datasets. Provide unavailable/timeout/malformed scenarios.

### P01-06 — CI gates

Run format/lint/typecheck, unit tests, schema/contract checks and integration tests against fresh PostgreSQL. Add critical E2E as features arrive. Make required checks branch-protection policy through authorized repository administration.

## Required outputs

- Runnable app shells
- Initial reviewed migrations and fixtures
- Documented local startup commands
- Required CI workflow and mock evaluator

## Exit acceptance

- [ ] Fresh clone plus documented configuration reaches backend readiness.
- [ ] Invalid settings fail startup without printing secrets.
- [ ] AI unavailable does not make backend process liveness fail.
- [ ] Generated API types and backend OpenAPI diff are checked in CI.

## Handoff and cautions

Foundation milestone is a demonstrable local environment, not just folders. Current repository scaffold only partially satisfies this phase.

Review the shared [decision ledger](../decisions-and-open-items.md), [integration rules](../../../contracts/shared/integration-rules.md), and [test strategy](../../testing/test-strategy.md) before closing this phase. A task is complete only when its behavior, tests and documentation agree.

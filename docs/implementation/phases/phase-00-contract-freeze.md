# Phase 00 — Close decisions and freeze integration contracts

## Ownership and entry

Owner: Product owner + backend lead + AI owner.

Entry: Existing monorepo PR #1 and the planning documents under docs/implementation.

## Work packages

### P00-01 — Review decision ledger

Confirm O01–O12 or record alternatives. Treat age bands, reward cutoffs and time budgets as proposals. Collect Home Lab/Firebase/device inputs without putting secrets in Git.

### P00-02 — Agree data ownership

Walk through every table and field. Confirm best-only means one retained result per child/exercise, while non-result aggregate counters are permitted. Confirm deletion/backups limitations.

### P00-03 — Freeze AI contract

AI owner checks supported MSA targets, multipart encoding, version fields, unscorable errors and score calibration responsibility. A real model need not run to approve interface semantics.

### P00-04 — Freeze application contract

Mobile/admin/backend owners review payloads, errors, revisions, idempotency, media delivery and bilingual UI requirements. Use synthetic examples to agree comparison behavior.

### P00-05 — Seed acceptance scenarios

Choose a reviewed example exercise for each of the four levels, plus first score, worse retry, improvement, outage, stale content and deletion during scoring.

### P00-06 — Approve implementation order

Assign 2–3 developers to foundation/API, mobile, and admin/testing. AI owner works separately. Agree a weekly integration review and tag demo milestones.

## Required outputs

- Approved ADRs for blocking decisions
- OpenAPI/DDL review with explicit design version
- Seed exercise manifest and annotated four-level map
- Backlog tickets with owners and acceptance tests

## Exit acceptance

- [ ] Backend and AI owners independently explain identical request/response semantics.
- [ ] No score or threshold is trusted from the mobile app.
- [ ] Record-limit decision is explicit, not silently imposed.
- [ ] All four levels remain and old level numbering is not mixed into new content.

## Handoff and cautions

Move approved contract snapshots to the existing contracts directories through a PR. Do not start by rebuilding the monorepo.

Review the shared [decision ledger](../decisions-and-open-items.md), [integration rules](../../../contracts/shared/integration-rules.md), and [test strategy](../../testing/test-strategy.md) before closing this phase. A task is complete only when its behavior, tests and documentation agree.

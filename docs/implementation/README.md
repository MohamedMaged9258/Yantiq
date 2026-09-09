# Yantiq implementation dashboard
**Status: Phase 00 in progress** • Updated 2026-09-09 • Planning documentation v1.0.0-design

The starting point for every developer. It tracks where the project stands; the phase files
hold the detailed task checklists, and the API definitions stay in `contracts/`.

**Update this file in the same pull request that changes phase or task state.** Mark a phase
Completed only when every exit-acceptance box in its own file is ticked.

Statuses, used consistently everywhere: `Not started` → `In progress` → `Blocked` / `In review` → `Completed`.

## Current phase

**Phase 00 — Close decisions and freeze integration contracts.**
Owner: Product owner + backend lead + AI owner.

The objective is to turn the proposed contracts in `contracts/` into frozen ones: resolve the
twelve open items below, reconcile the AI response shape with baseline §9.3, and agree a seed
set of acceptance scenarios. No application code should be written against these contracts
until the phase closes — this is a blueprint, not an implemented system, and nothing has been
deployed, benchmarked or run against a real model.

Phase 00 closes when all four exit-acceptance boxes in
[phase-00-contract-freeze.md](phases/phase-00-contract-freeze.md) are ticked.

## Phase overview

| Phase | Focus | Status | Work packages | Exit criteria | Prerequisite | Plan |
| --- | --- | --- | --- | --- | --- | --- |
| 00 | Resolve open decisions; approve contracts and acceptance examples | **In progress** | 0 of 6 | 0 of 4 | Current owner decisions | [phase-00](phases/phase-00-contract-freeze.md) |
| 01 | Runnable backend/admin/mobile shells and mock AI; CI | Not started | 0 of 6 | 0 of 4 | Contract draft | [phase-01](phases/phase-01-runtime-foundation.md) |
| 02 | Guardian identity, child lifecycle, curriculum/media and usable admin | Not started | 0 of 7 | 0 of 5 | Phase 01 | [phase-02](phases/phase-02-identity-curriculum-admin.md) |
| 03 | Bilingual phone/tablet learning flow and offline browsing | Not started | 0 of 7 | 0 of 5 | Phase 02 APIs | [phase-03](phases/phase-03-mobile-learning.md) |
| 04 | Transactional best-only scoring, progression, dashboards and rewards | Not started | 0 of 6 | 0 of 5 | Mock contract, phases 02–03 | [phase-04](phases/phase-04-progress-rewards.md) |
| 05 | Real AI adaptation and MSA evaluation evidence | Not started | 0 of 7 | 0 of 5 | Can begin alongside phases 01–04 | [phase-05](phases/phase-05-ai-adaptation.md) |
| 06 | Private integration, privacy/security, backups and recovery | Not started | 0 of 7 | 0 of 5 | End-to-end mock slice | [phase-06](phases/phase-06-integration-operations.md) |
| 07 | Android release candidate, device evaluation and graduation handoff | Not started | 0 of 6 | 0 of 4 | Phase 06 and real-AI gate | [phase-07](phases/phase-07-validation-handoff.md) |

Phase 01 repository reorganization is already substantially complete; do not repeat it. Build
runtime foundations next. iOS follows the Android acceptance gate.

## Active tasks

In-flight work only. Add a row when work starts; remove it once the work package reads
Completed in its phase file. The full 51-package list lives in the phase files, not here.

| Task | Phase | Owner (role) | Status | Branch / PR | Note |
| --- | --- | --- | --- | --- | --- |
| P00-01 | 00 | Product owner + backend lead + AI owner | In progress | — | Confirm or replace O01–O12 in the [decision ledger](decisions-and-open-items.md) |
| P00-03 | 00 | Separate AI owner | **Blocked** | — | Blocked on the baseline §9.3 divergence and O03 (score calibration ownership) |
| P00-04 | 00 | Backend + mobile + admin developers | In progress | — | Review payloads, errors, revisions, idempotency and media delivery against the drafted OpenAPI |

## Blockers and decisions

Unresolved questions preventing progress. The proposals and their reasoning are in the
[decision ledger](decisions-and-open-items.md); this table records only what each one blocks.
Decisions are `Open` or `Resolved` — the task statuses above do not apply to them.

| ID | Question | Blocks | Owner | Status |
| --- | --- | --- | --- | --- |
| **B-01** | AI response shape: the drafted OpenAPI uses `alignment[].op` and four error counters; authoritative baseline §9.3 uses `alignment[].operation` and three. One of them has to give. | P00-03, P00-04, all of Phase 05 | AI owner + backend lead | **Open** |
| [O01](decisions-and-open-items.md) | Resource envelope for audio — bounded upload size and processing budget | P03-05, P02-06 | Owner + AI | Open |
| [O02](decisions-and-open-items.md) | End-to-end scoring timeout, tuned from laptop benchmarks | P04-06, P05-05 | Backend + AI | Open |
| [O03](decisions-and-open-items.md) | Score range, calibrated confidence, and who owns score mapping | P00-03, P05-03 | AI + owner | Open |
| [O04](decisions-and-open-items.md) | Age groups and preset avatars | P02-01, first migration | Owner | Open |
| [O05](decisions-and-open-items.md) | What may coexist with best-only retention | P04-02, P04-05 | Owner | Open |
| [O06](decisions-and-open-items.md) | Star thresholds and badge rule keys | P04-04 | Owner | Open |
| [O07](decisions-and-open-items.md) | Guardian consent for processing children's speech | P02-01, and any real child data | Owner | Open |
| [O08](decisions-and-open-items.md) | Administrator provisioning and admin UI language | P02-05 | Owner | Open |
| [O09](decisions-and-open-items.md) | One active evaluation per child; idempotency window | P04-02, P04-06 | Backend | Open |
| [O10](decisions-and-open-items.md) | What a content correction does to an existing best score | P02-07, P04-02 | Owner + AI | Open |
| [O11](decisions-and-open-items.md) | Deleted data inside backups within their retention window | P06-04 | Owner | Open |
| [O12](decisions-and-open-items.md) | Size and editorial ownership of the curriculum seed | P00-05 | Owner + education/AI reviewer | Open |

Practical inputs still missing — laptop GPU/VRAM and OS, Home Lab hostname and Tailscale
setup, PostgreSQL version, Firebase project configuration, app identifiers, backup
destination, Android device matrix — are listed at the end of the
[decision ledger](decisions-and-open-items.md). Do not block schema drafting on them; use
configuration placeholders.

## Next steps

In execution order:

1. **Resolve B-01 and O03** — decide the AI response field names and who owns score calibration. Everything in Phase 05 and both contract freezes waits on this.
2. **P00-03 and P00-04** — freeze the AI and application contracts. Backend and AI owners must independently describe identical request/response semantics before either is frozen.
3. **P00-05** — choose a reviewed example exercise for each of the four levels, plus the first-score, worse-retry, improvement, outage, stale-content and deletion-during-scoring scenarios.
4. **P00-06** — assign developers to foundation/API, mobile, and admin/testing; agree a weekly integration review.
5. **Phase 01** — backend shell (P01-02), local database and migrations (P01-03), then CI gates (P01-06). Target the first thin mock-backed journey: guardian sign-in → child → lesson → submit → best comparison → guardian progress.

## Completion evidence

Only what is finished and checkable.

| What | Evidence | Date |
| --- | --- | --- |
| Monorepo foundation and repository cleanup | PR #1 merged as `2052a33` | 2026-09-09 |
| Planning documentation relocated into the repository | Plans under `docs/implementation/` and each component's `docs/`; contracts under `contracts/` | 2026-09-09 |
| Drafted contracts are internally consistent | `python contracts/tools/validate-contracts.py` → PASS, 2 OpenAPI documents, 8 fixtures, 31 SQL statements parsed | 2026-09-09 |

**None of this is evidence that anything works.** No application test, deployment, database
migration, GPU benchmark or real-model evaluation has been run. No Firebase project, Tailscale
network, Home Lab database or child recording has been touched. Passing schema validation
establishes structural consistency, nothing more. See the
[planning validation report](../testing/planning-export-validation.md) for the full list of
checks actually run.

## Baseline divergence

The proposed OpenAPI currently differs from the authoritative [`docs/phase-0-baseline.md`](../phase-0-baseline.md) §9.3 by using `alignment[].op` and the counters `matches`, `substitutions`, `insertions`, and `deletions`. Until resolved during the Phase 00 contract freeze, implementations must follow the baseline fields `alignment[].operation` and `error_counts.substitutions`, `omissions`, and `insertions`. The exported contract must not be treated as implementation-ready.

## Reading order

1. [Decision baseline and open items](decisions-and-open-items.md).
2. [Architecture and ownership](architecture-and-ownership.md).
3. [Phase guides](phases/phase-00-contract-freeze.md), then phases 01–07.
4. [Database design](../database/database-design.md) and [reference SQL](../database/reference-schema.sql).
5. [API operation map](../api/operation-map.md), [integration rules](../../contracts/shared/integration-rules.md), [application OpenAPI](../../contracts/application-api/openapi.design.json), [AI OpenAPI](../../contracts/ai-api/openapi.json).
6. Component plans for [backend](../../services/backend/docs/implementation-plan.md), [mobile](../../apps/mobile/docs/implementation-plan.md), [admin](../../apps/admin/docs/implementation-plan.md), and [AI](../../services/ai/docs/integration-plan.md).
7. [Testing](../testing/test-strategy.md), [operations](../operations/home-lab-runbook.md), and [delivery backlog](../delivery/backlog-and-handoff.md).

OpenAPI files are JSON, which can be imported into compatible API documentation and client-generation tools. SQL is a proposed reference design: convert it into reviewed Alembic migrations; do not paste it into an existing production database.

## Contract authority

- Approved product choices: `docs/implementation/decisions-and-open-items.md`.
- Proposed wire fields/status codes: the two OpenAPI files — but see the baseline divergence above; §9.3 of the baseline wins until Phase 00 says otherwise.
- Persistence invariants: `docs/database/database-design.md` and `docs/database/reference-schema.sql`.
- Race conditions, retries and cross-component semantics: `contracts/shared/integration-rules.md`.
- Synthetic payloads: `contracts/application-api/examples/` and `contracts/ai-api/examples/`, sequenced by `contracts/shared/integration-cases.json`; never evidence of model quality.
- Once backend implementation exists, generate its OpenAPI from Pydantic/FastAPI and check it against the approved contract in CI. Do not maintain two drifting sources of truth.

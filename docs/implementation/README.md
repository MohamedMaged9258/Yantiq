# Yantiq implementation plan
Version: 1.0.0-design • 9 September 2026 • English planning documentation

## Start here

This is an implementation blueprint, not an implemented or deployed application. It translates the owner's decisions into proposed, connected contracts. The owner and separate AI developer should review the flagged decisions before contract v1 is frozen.

Prepared against commit `2052a33d73ebecc41aa31c8daab3260d337654d1` (merged monorepo-foundation PR #1). The mobile, admin, backend, contracts and infrastructure directories are scaffolds. Existing AI code does not yet implement the proposed v1 evaluation contract. No component was implemented, deployed or benchmarked to produce this plan.

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

## Delivery sequence

| Phase | Outcome | Prerequisite |
| --- | --- | --- |
| 00 | Resolve open decisions; approve contracts and acceptance examples | Current owner decisions |
| 01 | Runnable backend/admin/mobile shells and mock AI; CI | Contract draft |
| 02 | Guardian identity, child lifecycle, curriculum/media and usable admin | Phase 01 |
| 03 | Bilingual phone/tablet learning flow and offline browsing | Phase 02 APIs |
| 04 | Transactional best-only scoring, progression, dashboards and rewards | Mock contract, phases 02–03 |
| 05 | Real AI adaptation and MSA evaluation evidence | Can begin alongside phases 01–04 |
| 06 | Private integration, privacy/security, backups and recovery | End-to-end mock slice |
| 07 | Android release candidate, device evaluation and graduation handoff | Phase 06 and real-AI gate |

Phase 01 repository reorganization is already substantially complete; do not repeat it. Build runtime foundations next. iOS follows the Android acceptance gate.

## Contract authority

- Approved product choices: `docs/implementation/decisions-and-open-items.md`.
- Proposed wire fields/status codes: the two OpenAPI files — but see the baseline divergence above; §9.3 of the baseline wins until Phase 00 says otherwise.
- Persistence invariants: `docs/database/database-design.md` and `docs/database/reference-schema.sql`.
- Race conditions, retries and cross-component semantics: `contracts/shared/integration-rules.md`.
- Synthetic payloads: `contracts/application-api/examples/` and `contracts/ai-api/examples/`, sequenced by `contracts/shared/integration-cases.json`; never evidence of model quality.
- Once backend implementation exists, generate its OpenAPI from Pydantic/FastAPI and check it against the approved contract in CI. Do not maintain two drifting sources of truth.

## Immediate next step

Open a reviewed contract-first PR, suggested branch `feat/contracts-v1`: reconcile these draft schemas, invariants, fixtures and open-decision log with baseline §9.3. Have backend/mobile and AI owners agree on the same request and response. Then implement one thin mock-backed journey: guardian sign-in → child → lesson → submit → best comparison → guardian progress.

No deployment, GitHub write, database migration, GPU benchmark or application test was performed while preparing this plan. See the [planning validation report](../testing/planning-export-validation.md) for the checks actually run.

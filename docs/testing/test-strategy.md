# Testing and acceptance strategy

## Test pyramid and merge gates

| Layer | Required checks | Execution target |
| --- | --- | --- |
| Static | Formatting, lint, TS/Python type checks, secret scan, contract drift | Every PR |
| Unit | Scoring comparison, threshold rules, progression, stars, aggregate math, localization/error mapping | Every PR |
| Contract | OpenAPI validation, request/response schema conformance, AI/app evidence equality, fixtures, negative payloads | Every PR |
| Integration | Real disposable PostgreSQL migrations, ownership, BYTEA, transactions, race conditions, purge jobs | Every PR |
| Critical E2E | Guardian→child→lesson→mock score→comparison→dashboard; admin edits; delete/restore | Merge gate when relevant feature exists |
| Real AI | MSA target coverage, held-out quality/calibration and hardware benchmarks | AI change/release gate |
| Device/UI | Arabic/English, phone/tablet, audio permissions/interruption/accessibility | Android release gate; repeat for iOS |

Tests must not use actual children's data by default. Use synthetic identities/audio and clearly marked mocks. Do not run tests against the Home Lab production database.

## Contract fixtures

contracts/application-api/examples includes four sequential successful application responses, two errors and a synthetic catalog; contracts/ai-api/examples holds the AI evidence response; contracts/shared/integration-cases.json sequences them and lists the additional error cases. Their deliberately injected scores test state integration, not model quality. Identical sample phonemes with varying mock scores are intentional; real score mapping must be independently specified and validated.

Install contracts/tools/requirements-validation.txt into an isolated Python environment and run the contract checker from the repository root:

```bash
python contracts/tools/validate-contracts.py
```

It runs an OpenAPI 3.1 validator, JSON Schema fixture validation and a PostgreSQL syntax parser. It does not execute SQL, exercise a running service or compile generated clients. Add actual migration, client-compilation and live integration tests in the implementation environment.

## Critical cases

| ID | Setup/action | Expected assertion |
| --- | --- | --- |
| T01 | Expired/wrong-project Firebase token | 401; no guardian/child write |
| T02 | Guardian A requests B's child | 404 for read/update/evaluate/delete/restore |
| T03 | Non-admin writes curriculum | 403 regardless of frontend role |
| T04 | Scores 70,60,80,80 with pass=75 | Bests 70,70,80,80; counts 1–4; comparisons first/lower/improved/equal |
| T05 | Same key replayed after commit | 409 ALREADY_PROCESSED; no second counter/reward |
| T06 | Same key with altered audio/revision | 409 IDEMPOTENCY_KEY_REUSED |
| T07 | Two concurrent evaluations for one child | One processing claim; other 409; no race |
| T08 | AI silence/unsupported target | 422; no score, count, best or reward write |
| T09 | AI unavailable/invalid response/timeout | 503/502/504; cleanup; no fabricated score |
| T10 | Delete child while AI runs | Finalization fenced; no resurrection |
| T11 | Delete then restore while AI runs | Lifecycle version mismatch still rejects old work |
| T12 | Raise pass score on completed lesson | Completion/stars preserved |
| T13 | Lower threshold without new attempt | No retroactive auto-completion |
| T14 | Edit target during inference | 409 STALE_EXERCISE; no old-target progress |
| T15 | Edit only threshold during inference | Evaluate pinned threshold; record pinned revision |
| T16 | New scoring_version | No misleading numeric comparison to old best |
| T17 | Admin stale If-Match | 412; no overwrite/catalog-version increment |
| T18 | Media spoofed MIME/hash mismatch | Reject; no unvalidated bytes exposed |
| T19 | Purge at seven-day boundary | Child and dependent state removed; tombstone exists |
| T20 | Restore backup predating child purge | Apply external ledger before reopening traffic |
| T21 | App offline with cache | Browse lessons; cannot score/queue audio |
| T22 | Arabic and English phone/tablet | Readable RTL/LTR, diacritics, focus and touch targets |
| T23 | Network drops after successful commit | Refresh sees saved progress; no duplicate submission |
| T24 | Crash leaves temp audio/processing receipt | Startup cleanup and deadline fencing work |
| T25 | Capture logs across tests | No token/audio/nickname/speech/individual score payloads |

Use two independent connections and deterministic barriers for transaction races; a single sequential test is not concurrency evidence. Inject clock for seven-day/24-hour schedules; do not wait real days. Add property-based tests for monotonic best/completion/rewards where practical.

## Acceptance metrics

Choose performance/quality thresholds after hardware/data review. Measure full upload→result latency separately from AI inference-only time; warm and cold starts separately. Track false pass/false reject by representative target/age/device/noise group. Do not substitute mocked timings for real measurements.

Privacy/security tests must verify behavior, not just documented intentions. Inspect database/logs/temp directories after failures and restore. Manual usability evaluation with children requires approved guardian consent and relevant institutional process.

## Definition of done

A feature's route/schema, implementation, database migration, UI behavior, tests and runbook agree. All required CI checks pass, unauthorized access cases are covered, no secret/audio artifact is committed, and reviewer can reproduce the result from documented setup. Report skipped tests and reasons; never claim “all tests pass” for unimplemented services.

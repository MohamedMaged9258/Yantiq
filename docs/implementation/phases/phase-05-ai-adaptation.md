# Phase 05 — Real AI contract, MSA coverage and calibration

## Ownership and entry

Owner: Separate AI owner; backend contract reviewer.

Entry: Can run alongside phases 01–04; real hardware needed only for inference validation.

## Work packages

### P05-01 — Capability audit

Existing comparison endpoint is not v1. Audit target phonemization, alif/hamza/shadda/tanween/diacritics, letter variants and word/sentence coverage. Record unsupported targets as explicit errors, not zero scores.

### P05-02 — Adapter

Implement private /v1/evaluations, service authentication, bounded temporary storage/decoder execution, typed response and correlation. Do not accept child or guardian identity fields.

### P05-03 — Metric/scoring

Current SequenceMatcher alignment is not guaranteed minimum edit distance. Define/review alignment algorithm and normalization; implement score mapping with scoring_version and calibrated confidence or null.

### P05-04 — Evaluation data

Use representative consented general-MSA child speech and held-out speakers where available. Analyze age, target, accent, noise and recording device strata; recitation-trained performance alone is insufficient.

### P05-05 — Hardware and latency

Record GPU model/VRAM, OS, CUDA/runtime, model checkpoint/license, warm/cold timings, memory, upload/decode and concurrent-load behavior. Tune timeout/limits only from actual measurements.

### P05-06 — Quality gate

Review false passes/false rejects with qualified educational/Arabic reviewers; choose measurable target quality and sample size before claiming success. No clinical diagnosis or treatment efficacy claim.

### P05-07 — Contract conformance

Run same fixtures/schema tests as backend, distinguish mode=real, expose safe readiness without filesystem paths. Version every model and scoring change.

## Required outputs

- V1-compatible AI container/API
- MSA capability matrix including unsupported targets
- Reproducible benchmark and calibration report
- Approved checkpoint/runtime record

## Exit acceptance

- [ ] AI response never contains pass/fail or user identities.
- [ ] Silence/undecodable/unsupported target returns typed unscorable errors.
- [ ] No request audio is retained on success, error, timeout or process recovery.
- [ ] Real-model scores are not assumed compatible across scoring_version changes.
- [ ] Representative four-level targets pass capability tests.

## Handoff and cautions

Do not block UI/backend work waiting for the GPU. Do block real-scoring release until this phase supplies evidence and the owner signs off.

Review the shared [decision ledger](../decisions-and-open-items.md), [integration rules](../../../contracts/shared/integration-rules.md), and [test strategy](../../testing/test-strategy.md) before closing this phase. A task is complete only when its behavior, tests and documentation agree.

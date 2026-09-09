# Phase 07 — Android acceptance, delivery and later iOS

## Ownership and entry

Owner: Owner + all developers + AI/education reviewer.

Entry: Phase 06 security/restore checks; phase 05 real-scoring gate.

## Status

| Status | Owner | Branch / PR | Updated |
|---|---|---|---|
| Not started | Owner + all developers + AI/education reviewer | — | 2026-09-09 |

`Not started` → `In progress` → `Blocked` / `In review` → `Completed`. Mark this phase Completed only when every exit-acceptance box below is ticked. Update the [dashboard](../README.md) in the same pull request.

## Work packages

| ID | Work package | Status | Branch / PR |
|---|---|---|---|
| P07-01 | Acceptance matrix | Not started | — |
| P07-02 | Controlled usability | Not started | — |
| P07-03 | Quality/performance report | Not started | — |
| P07-04 | Release candidate | Not started | — |
| P07-05 | Handoff | Not started | — |
| P07-06 | iOS follow-up | Not started | — |

Each work package is described in full below. Change a row's status as the work moves, and reflect the phase-level roll-up on the [dashboard](../README.md).

### P07-01 — Acceptance matrix

Run critical journeys across Arabic/English and representative Android phone/tablet dimensions. Test permissions, interruption, accessibility, poor connectivity and guardian isolation.

### P07-02 — Controlled usability

Follow approved guardian consent/institutional review for child participation. Evaluate whether instructions, animation, feedback and retries are understandable; do not collect audio for research by default.

### P07-03 — Quality/performance report

Separate measured inference quality from mock demos. Report test sample, uncertainty, unsupported targets, model version and warm/cold latency.

### P07-04 — Release candidate

Freeze contract/migration versions, validate seed curriculum, build signed Android artifact through configured credentials, record tag/digests and complete smoke/rollback checklist.

### P07-05 — Handoff

Document local startup, admin provisioning, migrations, backups, restore, AI startup, limits, dependency licenses and known issues. Deliver evidence of tests actually run.

### P07-06 — iOS follow-up

Confirm access to macOS/signing/test devices, adapt recorder permissions/audio formats and Google sign-in, rerun RTL/tablet and lifecycle tests. Do not mark iOS supported solely because Expo is cross-platform.

## Required outputs

- Android release candidate and tagged source
- Acceptance and usability reports
- Graduation architecture/demo materials
- Known-issues list and operator/developer handoff

## Exit acceptance

- [ ] No blocking security/privacy regression; all required CI checks pass.
- [ ] Real speech quality meets predeclared acceptance criteria or release is explicitly mock/demo-only.
- [ ] Owner can operate admin, deploy a tag and restore backup using handoff alone.
- [ ] Credentials, recordings, weights and private child data are absent from repository/release artifacts.

## Handoff and cautions

December 2026 is an indicative target. Estimate dates after team capacity and the AI capability audit; do not disguise an unvalidated model as completed product functionality.

Review the shared [decision ledger](../decisions-and-open-items.md), [integration rules](../../../contracts/shared/integration-rules.md), and [test strategy](../../testing/test-strategy.md) before closing this phase. A task is complete only when its behavior, tests and documentation agree.

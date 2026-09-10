# Phase 04 — Transactional best results, progression and guardian insight

## Ownership and entry

Owner: Backend developer with mobile/admin collaboration.

Entry: Phase 02 domain state and phase 03 submission UX; deterministic mock.

## Status

| Status | Owner | Branch / PR | Updated |
|---|---|---|---|
| Not started | Backend developer with mobile/admin collaboration | — | 2026-09-09 |

`Not started` → `In progress` → `Blocked` / `In review` → `Completed`. Mark this phase Completed only when every exit-acceptance box below is ticked. Update the [dashboard](../README.md) in the same pull request.

## Work packages

| ID | Work package | Status | Branch / PR |
|---|---|---|---|
| P04-01 | Orchestration endpoint | Not started | — |
| P04-02 | Best transaction | Not started | — |
| P04-03 | Guided progression | Not started | — |
| P04-04 | Stars and badges | Not started | — |
| P04-05 | Aggregates | Not started | — |
| P04-06 | Concurrency/failure | Not started | — |

Each work package is described in full below. Change a row's status as the work moves, and reflect the phase-level roll-up on the [dashboard](../README.md).

### P04-01 — Orchestration endpoint

Authenticate and validate child, consent, prerequisite, revision and multipart file. Claim idempotency receipt before inference; correlate AI response and reject invalid schema/non-finite scores.

### P04-02 — Best transaction

Lock child and progress, check deletion/lifecycle version, compare compatible current score to old best, replace only on improvement or new assessment context. Build current-versus-previous-best response before discarding losing evidence.

### P04-03 — Guided progression

Exercise pass uses pinned threshold; lesson completion requires all current required exercises when newly evaluated. Completed lessons remain completed after edits. New unlocks derive from configured order.

### P04-04 — Stars and badges

Implement owner-approved deterministic rules. Retained stars and badge awards are monotonic and unique; tie/lower/replayed results cannot duplicate rewards.

### P04-05 — Aggregates

Successful evaluations increment attempt count, UTC daily counts and sound confusion aggregates. Do not insert an individual attempt-result table or store losing score in logs/receipts.

### P04-06 — Concurrency/failure

Test duplicate requests, same-child parallel submissions, lost response after commit, target edit while inference runs, AI outage and delete/restore fencing.

## Required outputs

- Real backend orchestration against mock AI
- Best-only storage and aggregates
- Guardian dashboard and reward rules
- Transaction and concurrency integration tests

## Exit acceptance

- [ ] First result has previous_best=null.
- [ ] Scores 70,60,80 retain only 80; counters are 3; comparisons are null,70,70.
- [ ] Same idempotency key affects progress once.
- [ ] Delete during inference cannot resurrect a child or create a best result.
- [ ] Changing pass score never revokes completion.

## Handoff and cautions

At this milestone the entire application can be demonstrated without the NVIDIA laptop, but all speech outcomes remain explicitly simulated.

Review the shared [decision ledger](../decisions-and-open-items.md), [integration rules](../../../contracts/shared/integration-rules.md), and [test strategy](../../testing/test-strategy.md) before closing this phase. A task is complete only when its behavior, tests and documentation agree.

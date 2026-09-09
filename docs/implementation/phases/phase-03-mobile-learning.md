# Phase 03 — Android learning experience with bilingual tablet support

## Ownership and entry

Owner: Mobile developer; backend supports integration.

Entry: Phase 02 identity, catalog and media APIs; mock evaluation endpoint can be under development.

## Status

| Status | Owner | Branch / PR | Updated |
|---|---|---|---|
| Not started | Mobile developer; backend supports integration | — | 2026-09-09 |

`Not started` → `In progress` → `Blocked` / `In review` → `Completed`. Mark this phase Completed only when every exit-acceptance box below is ticked. Update the [dashboard](../README.md) in the same pull request.

## Work packages

| ID | Work package | Status | Branch / PR |
|---|---|---|---|
| P03-01 | Navigation and identity | Not started | — |
| P03-02 | Localization/layout | Not started | — |
| P03-03 | Caching | Not started | — |
| P03-04 | Offline behavior | Not started | — |
| P03-05 | Recorder | Not started | — |
| P03-06 | Waiting/results | Not started | — |
| P03-07 | Guardian views | Not started | — |

Each work package is described in full below. Change a row's status as the work moves, and reflect the phase-level roll-up on the [dashboard](../README.md).

### P03-01 — Navigation and identity

Guardian sign-in → consent → child selector → level/stage/lesson → exercise. Add guardian-area gate as UX protection; do not confuse it with server authorization.

### P03-02 — Localization/layout

Arabic RTL and English LTR UI shipped together. Keep MSA lesson content Arabic in both interfaces. Use logical spacing, readable diacritics, screen-reader labels and phone/tablet adaptive layouts.

### P03-03 — Caching

Cache published metadata and persistent reference media with catalog version and SHA-256/ETag. Partition child progress cache by account/profile. Sign-out clears private state and cancels in-flight work.

### P03-04 — Offline behavior

Cached lesson/media browsing works with offline banner. Scoring is disabled offline; no recording queue. Reconnect refreshes catalog and completion before submitting.

### P03-05 — Recorder

Implement permission-denied/retry flow, manual stop and accessible recording indicator. Explicitly implement approved O01 envelope only after owner decision. Use device-supported capture and backend normalization path.

### P03-06 — Waiting/results

Animate waiting within approved budget, support cancellation, send Idempotency-Key, handle stable error codes and comparison against previous_best. Never keep audio for automatic retry.

### P03-07 — Guardian views

Best result details, counts, difficult sounds from aggregates and activity totals. Avoid showing a historical score chart because that history is not retained.

## Required outputs

- Android phone and tablet flows
- English/Arabic translation catalog
- Offline cache and recording cleanup
- Accessible error and comparison screens

## Exit acceptance

- [ ] Both interface directions are exercised on phone/tablet; Arabic diacritics remain readable.
- [ ] A worse retry shows current score and previous best while retained best is unchanged.
- [ ] No recording survives timeout, navigation away, sign-out or completed submission.
- [ ] A stale cached exercise cannot be evaluated with old expected text.
- [ ] Mock scores are clearly marked simulated.

## Handoff and cautions

Use prototype-archive only for inspiration; do not copy its old stack, five-level logic, reward economy or fake scoring assumptions.

Review the shared [decision ledger](../decisions-and-open-items.md), [integration rules](../../../contracts/shared/integration-rules.md), and [test strategy](../../testing/test-strategy.md) before closing this phase. A task is complete only when its behavior, tests and documentation agree.

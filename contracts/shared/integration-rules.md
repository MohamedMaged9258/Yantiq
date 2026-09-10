# Integration rules: shared behavior beyond field schemas

## Wire conventions and versioning

Application base prefix: /api/v1. Private AI endpoint: /v1/evaluations. UTF-8 JSON, multipart binary uploads, UTC RFC3339 timestamps, UUID identifiers, finite numbers only. Success returns documented schema; failures use Error {code,message,request_id,retryable}. Human-readable message is for diagnostics; clients localize code, not arbitrary server text.

The supplied OpenAPI documents are DESIGN contracts. Schema version 1.0.0 is distinct from model_version (checkpoint/runtime provenance) and scoring_version (comparable score semantics). Fields documented as nullable are explicitly null, not omitted. Client decoders should tolerate future additive response fields; server request validation rejects unknown fields to prevent trusting unsupported input. Coordinated additive changes update the frozen schema snapshot and generated clients before rollout.

Firebase Bearer token goes only to application API. A different server-to-server Bearer token goes to AI. Never forward Firebase tokens to AI. Do not put secrets or IDs into URLs used in third-party analytics.

## Submission contract

Mobile POST /api/v1/children/{child_id}/exercises/{exercise_id}/evaluate:
- Authorization: Bearer Firebase ID token.
- Idempotency-Key: freshly generated UUID for one intentional submission.
- Multipart fields: audio (binary), exercise_revision_id (UUID).
- No expected_text, score, threshold, guardian_id or child nickname in form fields.

Backend calls private AI POST /v1/evaluations with audio, opaque request_id, expected_text, exercise_type and language=ar-MSA loaded from the pinned revision. AI response request_id MUST match the call. Backend validates schema_version, scoring_version, supported mode, ranges, alignment invariants and duration before accepting it.

For the initial adapter, propose accepting WAV PCM and Android/iOS-compatible M4A/AAC inputs; exact allowlist depends on actual recorder output and decoder tests. Sniff content, do not trust filename or declared MIME. Normalize server-side to the model's required mono PCM/sample rate, currently 16 kHz in the existing pipeline; verify against selected checkpoint. Persistent reference audio may have a separate content allowlist. No approved duration/size cap is implied by this proposal: O01 is an explicit implementation gate.

## Algorithm: one successful evaluation

1. Verify token/project, current guardian consent, child ownership, non-deleted lifecycle and exercise availability/unlock. Reject malformed/stale revisions before contacting AI.
2. Compute a keyed fingerprint over child/exercise/revision and audio digest; persist only fingerprint in metadata receipt. Do not log raw digest/audio. Claim unique guardian/key and one processing receipt per child. Set processing_deadline and expires_at.
3. Pin exercise revision, assessment_key and child lifecycle_version. Release DB transaction before network inference. Never hold a row lock across the AI call.
4. Await AI under end-to-end deadline. Refuse unknown schema/scoring semantics, wrong request_id, invalid score or unscorable result.
5. Start short finalization transaction. Lock child, exercise, progress, receipt in fixed order. Check child is active and lifecycle_version unchanged, receipt still processing and deadline unexpired, and current assessment_key matches pinned one.
6. Read compatible previous best BEFORE mutation. Determine passed = current score >= pinned pass_score. Update best if no compatible best or strictly higher; ties keep old best. Update valid-attempt aggregates, durable completion, monotonic stars and unique badges. Mark receipt completed in the same transaction.
7. Return current evidence, previous_best, comparison/delta and authoritative progress/rewards. Discard current evidence after response if not retained as best.
8. Cleanup audio in a finally-equivalent path on mobile/backend/AI. Startup janitors remove abandoned temporary files; their retention ceiling must be bounded by the approved processing/cleanup budget.

The request can fail after AI work but before commit; no score should then be treated as saved. A transport disconnect after commit cannot roll back durable progress. On reconnect refresh progress; do not tell the child a response timeout proves nothing was saved.

## Best-only examples

| Before best | Current | Comparison | Stored best | Delta |
| --- | --- | --- | --- | --- |
| none | 70 | first | 70 | null |
| 70, compatible | 60 | below_best | 70 | -10 |
| 70, compatible | 80 | improved | 80 | +10 |
| 80, compatible | 80 | equal | 80 | 0 |
| older incompatible scoring context | 75 | new_context | 75 | null |

previous_best is the full prior retained result only when compatible. Never use a fabricated zero for the first attempt. Returning the previous best does not create a second historical database record. Child UI may show a simple arrow/encouragement; guardian UI can show phoneme detail. Any retained losing-result payload, analytics event containing a score, or result cache violates best-only retention.

## Retry and idempotency

| Receipt state | Same key and same fingerprint | Effect |
| --- | --- | --- |
| Processing | 409 EVALUATION_IN_PROGRESS | No second AI call; wait/reconcile |
| Completed | 409 ALREADY_PROCESSED | Refresh progress/dashboard; do not return a stored losing response |
| Failed | 409 PREVIOUS_SUBMISSION_FAILED | User must record again and intentionally submit new key |
| Same key, different fingerprint | 409 IDEMPOTENCY_KEY_REUSED | Client bug; never silently accept |
| Expired and removed | Key is no longer deduplicated | Clients must never intentionally reuse old keys |

Receipts expire after proposed 24 hours; processing deadlines are much shorter. Sweeper transitions expired processing receipts to failed before deleting them at retention expiry. Worker checks receipt state/deadline at commit to fence late results. Exactly-once effects apply to accepted keys during the retention window, not to arbitrary repeats forever.

One active request per child avoids multiple tabs/devices racing scores; different children can score concurrently subject to AI capacity. On an ambiguous lost response, mobile may reconcile using progress without re-uploading audio. No automatic rerecord/resubmit or persisted audio retry queue. Cancel before finalization when cancellation can be observed; once committed, preserve results even if client navigated away.

## Publication and ordering

All successful admin saves are immediately current; there is no draft workflow. GET resource returns ETag; PUT requires If-Match. Backend rejects stale editor save with 412 and does not merge silently. A global catalog version changes in the same commit; mobile revalidates before scoring and on reconnect.

Active lessons are ordered by level.position → stage.position → lesson.position; active exercises by position within lesson. First lesson is unlocked. Each later lesson requires all previous active lessons completed; within a lesson, earlier required exercises must be completed. Optional exercises do not block progression. A lesson with zero active required exercises must not be published as a learnable lesson. Archiving removes content from the active sequence; it does not erase historical completion flags.

Changes to target text, type or language rotate assessment_key and invalidate old best/phoneme detail for current content. Presentation and threshold-only edits preserve it. Backend rejects a submission stale at arrival. If a target changes during inference, finalization returns 409 STALE_EXERCISE with no progress mutation. If only threshold/presentation changed, use pinned threshold and record its revision. Already-completed lessons/exercises and awards remain completed.

## Proposed reward semantics (O06)

Stars belong to exercises, not individual attempts. On a newly passing valid attempt, candidate stars are 1, or 2 when current score >= max(pinned pass score,85), or 3 when current score >= max(pinned pass score,95). Store max(previous stars,candidate stars); a non-passing attempt cannot grant new stars. Total stars is their sum. Existing completion/stars survive publication or scoring-context changes.

FIRST_COMPLETION is awarded after the first completed lesson (rule_value=1); TEN_COMPLETIONS after ten completed lessons (rule_value=10); LEVEL_COMPLETED uses rule_value as level position 1–4 and requires all currently active lessons in that level complete. Seed one stable badge ID per intended award, such as level_1_complete. Administrator edits cannot create arbitrary rule types; validate rule_value according to rule_key. Award only from successful progress transactions and keep a unique child/badge pair. Existing awards survive later rule edits. These cutoffs and rules require owner approval under O06.

## Errors and UI behavior

| HTTP / code | Meaning | Mobile/admin behavior |
| --- | --- | --- |
| 400 MALFORMED_REQUEST | Invalid form/header | Fix client request; no auto retry |
| 401 UNAUTHENTICATED | Missing/expired/invalid identity | Refresh Firebase token once or sign in |
| 403 CONSENT_REQUIRED / FORBIDDEN | Consent missing or role denied | Consent flow or deny access |
| 404 NOT_FOUND | Missing, foreign-owned or hidden child/resource | Return to safe list; avoid ownership leaks |
| 409 STALE_EXERCISE | Target/revision changed | Refresh lesson; rerecord only when ready |
| 409 EVALUATION_IN_PROGRESS | Active evaluation exists | Wait/reconcile; do not submit again |
| 409 ALREADY_PROCESSED | Previously committed key | Refresh best/progress |
| 409 IDEMPOTENCY_KEY_REUSED | Same key, different input | Report client issue |
| 409 PREVIOUS_SUBMISSION_FAILED | Key terminally failed | New intentional recording/new key |
| 409 MEDIA_IN_USE / POSITION_CONFLICT | Admin reference/order conflict | Explain and resolve edit |
| 412 PRECONDITION_FAILED | Stale editor ETag | Reload, compare and edit again |
| 413 PAYLOAD_TOO_LARGE | Approved resource envelope exceeded | Delete temp recording; show approved limit |
| 415 UNSUPPORTED_MEDIA_TYPE | Unsupported/false MIME | Fix capture/asset format |
| 422 SILENCE / AUDIO_UNSCORABLE / TARGET_UNSUPPORTED / VALIDATION_ERROR | No valid assessment or invalid input | Friendly retry guidance; no zero score/count |
| 429 RATE_LIMITED / AI_BUSY | Capacity protection | Retry-After when known; no retained audio |
| 502 AI_INVALID_RESPONSE | Malformed/mismatched AI data | No score/progress; operator alert |
| 503 AI_UNAVAILABLE | Laptop/service not ready | Delete audio; retry later |
| 504 EVALUATION_TIMEOUT | Deadline elapsed | Delete audio; reconcile if outcome uncertain |

AI's 401 is an internal service-auth failure, not a guardian token failure; backend maps it to 503 AI_UNAVAILABLE and alerts. AI malformed 200 → 502. Backend must not expose AI stack traces, paths or service tokens. Public error messages contain no child identity or raw speech.

## UI consistency and accessibility

All feedback text is localized from stable codes. Arabic content remains Arabic under English UI; use proper direction for phonemes/numbers. Avoid negative labels for children. Show mode=mock visibly in demo environments, and never infer pass/fail in a client from a local threshold cache. Backend-supplied progress is authoritative.

## Cache and deletion

Catalog/reference media can persist locally for offline browsing; temporary child audio and immediate losing results cannot. Best/progress caches are private to signed-in account and selected child; purge on sign-out/delete and refresh on reconnect. The server cannot erase an offline device instantly; describe this limitation accurately. Reference media URLs are authenticated endpoints, not Firebase Storage URLs or Base64 fields.

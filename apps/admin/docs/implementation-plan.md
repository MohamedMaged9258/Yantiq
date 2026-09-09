# React/Vite administration portal plan

## Purpose and boundaries

The portal exists from phase 02 and administers learning content, not child accounts. One server-enforced Administrator role. No direct PostgreSQL access, public role escalation, raw-recording viewer, arbitrary code rules or bulk child-data export.

Proposed admin interface language is English, with Arabic and English content editors; owner should confirm O08. The mobile interface remains bilingual from first release.

## Screens

1. Firebase sign-in and explicit access-denied state.
2. Four-level content navigator with stage/lesson ordering.
3. Lesson editor with bilingual title/instructions and active status.
4. Exercise editor for Arabic expected_text, type, pass score, required flag, media and ordering.
5. Reference media upload/list/preview/usage errors.
6. Seeded badge text/rule settings using fixed rule keys.
7. Simple service-status/error panel; no public infrastructure secrets.

Level identities/order remain fixed; level titles can be edited. Stages/lessons/exercises are archived via active=false, not hard deleted. Unpublishing a parent hides its descendants. Warn that changes apply immediately; no draft/publish buttons that imply unavailable workflow.

## Editing protocol

GET resource → retain ETag → edit locally → validate → PUT complete input with If-Match → replace cached entity/ETag and invalidate catalog query. Handle 412 by showing local unsaved changes next to refreshed content; require intentional resubmission, never auto-overwrite.

Expected text/type changes display warning: future scoring uses new target and incompatible best evidence is invalidated, while completion/stars remain. Pass-score changes explain “future attempts only; completed lessons stay completed.”

## Validation

Require bilingual labels/instructions where schema requires them, Arabic target text and supported evaluation type, 0–100 pass score, correct parent and unique position, compatible reference media kind and active required content. AI capability restrictions must be visible: do not publish targets the real evaluator declares unsupported for a real release. Server repeats all checks; frontend validation is convenience only.

Uploads are binary multipart, never Base64 embedded in JSON. Preview uses authenticated backend content route; upload credentials and tokens do not appear in public URLs. A referenced asset cannot be deleted until usage has been resolved under revision retention rules.

## Acceptance

A non-admin receives 403 for every administrative route. Cross-tab stale edits cannot overwrite. Updating content changes catalog version in same transaction. No user recordings or private child dashboards are exposed by portal. Audit records capture actor/resource/version/action without payload copies. Browser tests cover create stage/lesson/exercise, upload reference audio, immediate update, conflict resolution and archive.

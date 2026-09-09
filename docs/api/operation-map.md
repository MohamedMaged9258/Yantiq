# API operation map

This is a readable index of the machine-readable [application](../../contracts/application-api/openapi.design.json) and [AI](../../contracts/ai-api/openapi.json) contracts. Request/response field definitions remain authoritative in those files. All application /api routes require Firebase Bearer authorization; every /admin route additionally requires server-held Administrator role. Child routes enforce guardian ownership.

## Identity and profiles

Current policy: GET `/api/v1/consent-policy` (`getConsentPolicy`). The guardian response includes required_consent_version and consent_required; clients use these server decisions to show the reviewed bilingual policy before accepting its version.

| Method | Path | Operation ID |
| --- | --- | --- |
| GET | `/api/v1/me` | getMe |
| PUT | `/api/v1/me/consent` | acceptConsent |
| GET | `/api/v1/avatars` | listAvatars |
| GET | `/api/v1/children` | listChildren |
| POST | `/api/v1/children` | createChild |
| GET | `/api/v1/children/{child_id}` | getChild |
| PUT | `/api/v1/children/{child_id}` | updateChild |
| DELETE | `/api/v1/children/{child_id}` | deleteChild |
| POST | `/api/v1/children/{child_id}/restore` | restoreChild |
| GET | `/api/v1/media/{media_id}` | getMedia |
| POST | `/api/v1/admin/media` | uploadMedia |
| GET | `/api/v1/admin/media/{media_id}` | getAdminMedia |
| DELETE | `/api/v1/admin/media/{media_id}` | deleteUnusedMedia |
| GET | `/api/v1/admin/media/{media_id}/content` | getAdminMediaContent |

## Learning and results

| Method | Path | Operation ID |
| --- | --- | --- |
| GET | `/api/v1/catalog` | getCatalog |
| GET | `/api/v1/children/{child_id}/progress` | getProgress |
| GET | `/api/v1/children/{child_id}/dashboard` | getDashboard |
| POST | `/api/v1/children/{child_id}/exercises/{exercise_id}/evaluate` | evaluateExercise |
| GET | `/api/v1/badges` | getBadgeCatalog |

## Administration

| Method | Path | Operation ID |
| --- | --- | --- |
| GET | `/api/v1/admin/catalog` | getAdminCatalog |
| GET | `/api/v1/admin/levels/{level_id}` | getAdminLevel |
| PUT | `/api/v1/admin/levels/{level_id}` | updateLevel |
| POST | `/api/v1/admin/stages` | createStage |
| GET | `/api/v1/admin/stages/{stage_id}` | getAdminStage |
| PUT | `/api/v1/admin/stages/{stage_id}` | updateStage |
| POST | `/api/v1/admin/lessons` | createLesson |
| GET | `/api/v1/admin/lessons/{lesson_id}` | getAdminLesson |
| PUT | `/api/v1/admin/lessons/{lesson_id}` | updateLesson |
| POST | `/api/v1/admin/exercises` | createExercise |
| GET | `/api/v1/admin/exercises/{exercise_id}` | getAdminExercise |
| PUT | `/api/v1/admin/exercises/{exercise_id}` | updateExercise |
| GET | `/api/v1/admin/badges` | listBadges |
| GET | `/api/v1/admin/badges/{badge_id}` | getAdminBadge |
| PUT | `/api/v1/admin/badges/{badge_id}` | updateBadge |

## Health

| Method | Path | Operation ID |
| --- | --- | --- |
| GET | `/health/live` | getLiveness |
| GET | `/health/ready` | getReadiness |

## Private AI

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | /health/live | Service token | Process liveness |
| GET | /health/ready | Service token | Model/device readiness |
| POST | /v1/evaluations | Service token | Multipart audio plus trusted target → EvaluationEvidence |

## Existing endpoint migration

| Existing AI behavior | Proposed v1 requirement |
| --- | --- |
| /compare phoneme comparison | Add /v1/evaluations adapter; keep old route internal only if migration needs it |
| predicted_phonemes | recognized_phonemes in frozen v1 response |
| PER/counts without final score | AI-owned calibrated pronunciation_score, scoring_version and nullable confidence |
| Implementation-specific alignment | Typed ordered alignment with indices and explicit operation semantics |
| No app result/progression | Backend produces EvaluationOutcome with passed/comparison/progress |

Never map the existing endpoint to a fabricated 0–100 score in the mobile client. Legacy and v1 schemas are not interchangeable. Error/status semantics, idempotency and publication races are specified in [integration rules](../../contracts/shared/integration-rules.md).

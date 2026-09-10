# FastAPI backend implementation plan

## Modules

Use app/{api,core,domain,adapters,db,jobs}. Domain modules: identity, consent, children, curriculum, media, evaluation, progress, rewards and deletion. Routes call services; services enforce business invariants; repositories perform scoped queries. Use request-scoped SQLAlchemy sessions and Alembic migrations. Pydantic models define wire validation; export OpenAPI and compare with approved contract in CI.

## Configuration

DATABASE_URL (server secret), FIREBASE_PROJECT_ID, credential source for Firebase Admin SDK, AI_BASE_URL, AI_SERVICE_TOKEN (secret), EVALUATOR_MODE, ENVIRONMENT, CORS_ALLOWED_ORIGINS, EVALUATION_TIMEOUT_SECONDS, temporary-audio directory/quota, upload resource settings after O01, LOG_LEVEL. Validate required values on startup. Frontends receive only public Firebase configuration and backend URL, never service-account credentials or DB/AI secrets.

Use separate migration and runtime DB accounts. DB credentials must use PostgreSQL driver-compatible URL encoding. Do not copy credentials from the LXC into frontend environment files.

## Identity and authorization

Serve the reviewed bilingual consent policy from versioned backend configuration at GET /api/v1/consent-policy. GET /me returns required_consent_version and consent_required, derived from configured current version versus guardian_consents. PUT /me/consent accepts only the current version; old-version acceptance returns 422 VALIDATION_ERROR so the UI refreshes policy. Do not invent legal wording in code or let the frontend decide whether consent is current.

GET /me bootstraps guardian by verified UID with conflict-safe upsert. Consent is idempotent per policy. Child ownership checks are shared across read, update, evaluate, delete and restore. API role decisions read server state; Firebase sign-in alone never grants administrator. Provision initial administrator through an operator-only reviewed CLI/SQL migration procedure requiring explicit identity verification, not public HTTP endpoint.

Deleted child list is owner-only and minimal, for recovery. Active-child API and scoring hide deleted records. Restore increments lifecycle_version just like deletion, so previously started work cannot become valid again after restore.

## Evaluation implementation

Implement the algorithm in contracts/shared/integration-rules.md. HTTP AI client uses bounded connect/read/total deadlines, certificate validation and pooled connections. Avoid blocking inference/decode work on the FastAPI event loop. Stream/spool under approved bounds rather than reading unbounded request bodies into memory. Cancel subprocesses on timeout; close uploads, terminate decode children, delete temporary files.

Validate alignment token indices and counts as well as JSON types. Do not compute pronunciation_score as an undocumented 100*(1-PER) fallback. Backend's only scoring-like responsibilities are threshold comparison, aggregate math and deterministic rewards.

## Persistence and jobs

Short transactions for create/update/finalize; no DB transaction held during network inference. Jobs: receipt timeout/expiry sweeper, child purge, temporary-file janitor, old revision/media eligibility maintenance, audit retention. Each job must be idempotent, lock-safe and observable, and run with a controlled single scheduler or DB-based leasing. A background task tied only to a request process is insufficient for seven-day deletion guarantees.

## Media

BYTEA adapter separates metadata projection from payload reads. Validate signatures and allowlist, record digest/length, deliver Content-Type, ETag and safe cache headers. Initial small reference files do not require range streaming; large-video storage is out of scope. Set reviewed admin asset limits independently of child's recording envelope.

## Completion and dashboard

Compute traversal from active curriculum. Preserve completed_at and stars across edits. Return authoritative next_exercise_id only among unlocked available exercises. Avoid N+1 queries by fetching child progress and current curriculum in batches. Dashboard reports aggregate evidence and counts, not a diagnostic assessment.

## Acceptance and implementation order

1. Health/settings/error envelope and disposable migrations.
2. Identity/consent/ownership tests, then curriculum/admin/media.
3. Evaluation with fixtures and transactional best-only updates.
4. Aggregates, lifecycle jobs and restore fencing.
5. Real AI adapter, bounded performance and deployment checks.

Log event code, opaque request ID, route template, latency and status; no authorization header, form body, nickname, expected/recognized speech or score. Tests explicitly search captured logs for forbidden content.

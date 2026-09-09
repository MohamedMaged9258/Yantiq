# Backlog, ownership and handoff

## Suggested contributor split

Developer A: backend, schema/migrations and Home Lab operations. Developer B: mobile, localization, recorder/cache and device E2E. Developer C if available: admin, shared frontend client tooling and test automation. With two developers, A and B share admin work after identity/catalog APIs stabilize. AI owner is separate and owns model/API conformance and quality evidence.

All parties review shared contracts. A component owner may not change a shared field or scoring meaning unilaterally. Weekly integration demo should use one tagged contract snapshot, not different local assumptions.

## First implementation PRs

| PR | Work | Depends on | Acceptance |
| --- | --- | --- | --- |
| 02 | Contracts v1 draft, fixtures, decision ADRs and DB design | Existing monorepo PR #1 | Owner/backend/AI review; no fabricated approvals |
| 03 | Backend shell, settings, errors, migrations and local test DB | 02 | Fresh boot/migration and CI checks |
| 04 | Mock evaluator with success/failure cases | 02 | AI schema conformance; visibly simulated |
| 05 | Firebase guardian/consent/child lifecycle | 03 | Ownership and delete/restore tests |
| 06 | Curriculum/media APIs and seed four levels | 03 | Metadata/blob separation; revision tests |
| 07 | Admin portal editing and private role provisioning | 05–06 | ETag conflicts and unauthorized writes tested |
| 08 | Expo sign-in/profile/catalog bilingual shells | 05–06 | Android phone/tablet browse flow |
| 09 | Evaluation transaction, best-only/aggregates/rewards | 04–06 | T04–T17 and race tests |
| 10 | Recorder/results/offline cache/guardian dashboard | 08–09 | End-to-end mock journey |
| 11 | Real AI v1 adapter and evidence report | 02 + AI owner work | Capability/calibration/conformance gates |
| 12 | Home Lab private release, backups/purge/restore | 07–11 | Security and restore drills |
| 13 | Android release candidate and handoff | 12 | Device/acceptance suite; known issues disclosed |

Numbers after current PR #1 are suggested work order, not reservations of GitHub PR identifiers. Split large PRs into reviewable slices; do not wait to merge all of a phase at once.

## Ticket template

Title and owner; phase and dependency; approved decision IDs; affected API operation/schema; affected table/migration; UI states; security/privacy impact; success/failure acceptance; automated tests; rollout/rollback note. A task involving a contract change must identify both producer and consumer reviewers.

## Example first vertical slice

Use one mock exercise in level 1, then expand:
- Admin creates a reviewed lesson/exercise through API.
- Guardian signs in and accepts policy; creates child.
- Android app fetches catalog/progress and displays exercise.
- App submits synthetic/test recording with revision and key.
- Mock AI returns evidence; backend applies threshold and commits one best.
- App shows comparison; guardian sees updated aggregate count.
- Repeat lower/higher/duplicate/outage cases and inspect persistence.

Only after this slice works should the team multiply screens/curriculum content. This is implementation sequencing, not a reduction of the approved four-level scope.

## Milestone evidence

M1 foundation: startup/CI/migration logs. M2 admin+identity: permission and publication tests. M3 application demo: video/test of bilingual mock flow. M4 AI readiness: real metrics and limitations. M5 operational readiness: private network and restore report. M6 release: signed Android artifact, version manifest, acceptance matrix and operator handoff.

December 2026 remains the earlier target. Estimate effort from the tickets and actual weekly capacity before assigning calendar dates. AI quality and missing representative data are the most important schedule risks; repository scaffolding completion is not model readiness.

## Source placement after review

Copy phase/architecture/testing/runbook documents under docs; SQL becomes an implementation reference under docs until converted to Alembic; OpenAPI and fixtures go in existing contracts/application-api and contracts/ai-api. Keep generated TypeScript clients in a deliberate shared package or component-generated directory and check drift. No additional copy of prototype runtime or model checkpoints is needed.

## Handoff checklist

- Contract versions and generated clients recorded.
- All four levels seeded with reviewed content and supported targets.
- Environment setup uses placeholders and secure credential instructions.
- Administrator provisioning, child deletion and backup restore rehearsed.
- Mock versus real behavior unmistakable.
- GPU/runtime/model/scoring versions documented.
- Android limitations and iOS follow-up explicit.
- Known issues, unsupported sounds/targets and unrun tests disclosed.

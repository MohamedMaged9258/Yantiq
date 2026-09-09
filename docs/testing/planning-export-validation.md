# Planning validation report
Date: 9 September 2026. Planning documentation version: 1.0.0-design.

A dated record of the checks run against these planning documents before they were relocated into this repository, not a claim about the running system.

## Completed checks

| Check | Result | Practical meaning |
| --- | --- | --- |
| OpenAPI 3.1 standards validation | PASS, both documents | Application and AI definitions are valid under the validator used |
| Application / AI operation inventory | 37 / 3 operations | Includes identity/consent, children, catalog/media, results, admin and health |
| JSON Schema payload validation | PASS, eight payload examples | API examples conform, including UUID/date/range/nullability checks |
| Portable structural/invariant suite | PASS, 3,222 checks at final content check | Local refs, cross-service evidence schemas, comparison/counter examples, negative payloads and links |
| Four-level synthetic catalog | PASS | Hierarchy references and linked exercise/revision/assessment IDs agree |
| PostgreSQL syntax parsing | PASS, 31 statements | DDL is parseable PostgreSQL syntax; 20 proposed tables |
| Markdown references | PASS, 45 local links at final content check | Referenced files resolved at the time of the check |
| Reference sources | Inspected repository commit and official docs listed | Source and proposed design are distinguished |

Validators used: jsonschema 4.26.0, openapi-spec-validator 0.9.0, pglast 8.4. The standards checker and its pinned requirements are kept in the repository as `contracts/tools/validate-contracts.py` and `contracts/tools/requirements-validation.txt`, and it is the reproducible check. The portable standard-library checker that produced the structural/invariant row was tied to the original flat export layout and was not relocated, so that row is a historical record rather than something you can re-run here.

## Not performed

No SQL was executed against PostgreSQL; table constraints, transactions, query performance, migrations and restores still require integration tests. No generated TypeScript client was compiled. No backend/mobile/admin runtime was implemented or deployed. No Firebase project, Tailscale network, Home Lab database, NVIDIA laptop, child recording or real model was accessed for live testing. No GitHub files, branches or pull requests were changed while preparing this plan.

Passing schema validation establishes structural consistency, not working service connectivity, educational suitability, model accuracy or legal compliance. These are explicit phase gates.

## Review required before implementation

Resolve owner decisions O01–O12, especially audio resource envelope, score calibration/comparability, aggregate retention, reward rules and deletion-versus-backup semantics. The phase guides explain ownership, dependencies, deliverables and acceptance for that review.

The SQL remains a proposed reference, to be converted into reviewed Alembic migrations. All example scores and curriculum entries are synthetic and labeled mock.

# References and traceability

## Repository baseline

Repository: https://github.com/MohamedMaged9258/Yantiq
Inspected remote main commit: 2052a33d73ebecc41aa31c8daab3260d337654d1.

Relevant repository sources:
- docs/phase-0-baseline.md — previous planning decisions, not proof of implementation.
- docs/product-overview.md and docs/architecture/diagrams.md — four-level/current stack direction.
- apps/mobile/README.md, apps/admin/README.md, services/backend/README.md — component scaffolds.
- services/ai/src/quran_muaalem/msa/api.py — existing endpoint/recording path.
- services/ai/src/quran_muaalem/msa/compare.py — existing alignment/count behavior.
- services/ai/src/quran_muaalem/msa/phonemize.py — target token mapping limitations.
- services/ai/pyproject.toml and runtime documents — environment considerations.
- CLAUDE.md — repository architecture/workflow guidance.

Source permalink pattern: https://github.com/MohamedMaged9258/Yantiq/blob/2052a33d73ebecc41aa31c8daab3260d337654d1/docs/phase-0-baseline.md

This plan also uses the owner's explicit choices in the provided conversation. Proposed detailed fields, retention coordination and implementation mechanisms are labeled as design, not misattributed to repository code or earlier approvals.

## Official technical references checked for this plan

- OpenAPI 3.1.0 specification: https://spec.openapis.org/oas/v3.1.0.html
- PostgreSQL binary data types: https://www.postgresql.org/docs/current/datatype-binary.html
- Firebase Admin ID-token verification: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- FastAPI OpenAPI generation/customization: https://fastapi.tiangolo.com/how-to/extending-openapi/

These support the schema format, BYTEA storage choice, custom-backend authentication pattern and generated-contract workflow. They do not validate this proposed database, model accuracy, legal compliance, host capacity or cost. Recheck platform/library/device compatibility when implementing pinned versions.

## Decision-to-artifact matrix

| Owner decision | Main implementation artifact |
| --- | --- |
| Four levels, guided sequence | Phase 02; database hierarchy; integration ordering |
| Firebase guardian, child profiles | Phase 02; backend/mobile plans; guardian/children schemas |
| Separate AI and backend | Architecture; private AI OpenAPI; AI plan |
| Best-only and comparison | Integration rules; EvaluationOutcome; exercise_progress |
| Guardian activity/difficult sounds | Dashboard schema; daily_activity/phoneme_aggregates; O05 |
| BYTEA persistent media | Database DDL; media API; backup runbook |
| Immediate edits | Admin ETag protocol; revision/assessment semantics |
| Delete after seven days | Lifecycle version; purge job; backup tombstone process |
| Manual recording stop, no approved limit | O01; recorder/resource-envelope gate |
| Android/Arabic/English/tablets | Mobile plan; phase 03 and device test matrix |
| Local development/Tailscale/Home Lab | Phase 01/06; operations runbook |
| Automated tests/manual tagged release | Test strategy; phase 06/07; delivery backlog |

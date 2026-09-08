# `services/backend` — Yantiq application backend

**Status: not scaffolded yet.** Placeholder for Phase 1 backlog items 5–8.

Python + FastAPI service. The only component both clients talk to.

Defined by [`docs/phase-0-baseline.md`](../../docs/phase-0-baseline.md) §5.3, §9.1, and §10.

## What lives here

- Firebase ID-token verification (behind an interface, with a local test verifier).
- Identity mapping: Firebase `uid` → guardian record.
- Guardian ownership and administrator-role authorization.
- Curriculum, content revisions, and the published manifest.
- Media upload/streaming from PostgreSQL `BYTEA`, behind a `MediaStorage` abstraction.
- Progression rules, pass thresholds, stars, badges, and progress aggregates.
- The AI adapter (`AI_PROVIDER=mock` during development, `remote` against the real service).

## Owns the decisions the AI service does not

The AI service returns evaluation data only. **This service** decides `passed`, applies
the configurable threshold, awards stars, advances progression, persists aggregates, and
selects the child-friendly message key. See §9.1 and §9.4 of the baseline.

## Stack

FastAPI, SQLAlchemy 2.x-style ORM, Alembic migrations, Pydantic validation.
REST under `/api/v1`; OpenAPI is the authoritative client-facing specification.

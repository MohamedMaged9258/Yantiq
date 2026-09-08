# `infra/compose` — local and Home Lab Docker Compose

**Status: not authored yet.** Placeholder for Phase 1 backlog item 6.

Compose files for local development and the Home Lab deployment.

Defined by [`docs/phase-0-baseline.md`](../../docs/phase-0-baseline.md) §14.

## Expected contents

- A PostgreSQL development service (production PostgreSQL runs in the existing LXC).
- The FastAPI backend container.
- Environment wiring via `.env` files that are **never** committed — commit `.env.example`
  templates instead.

## Portability rules (§14.2)

- All environment-specific values come from environment variables.
- Containers hold no persistent application state.
- Alembic owns schema migrations.
- Every deployed service exposes health endpoints.
- Docker restart policies cover recoverable container failures.

The AI service is **not** part of the application Compose stack — it runs separately on the
NVIDIA laptop and is reached privately over Tailscale.

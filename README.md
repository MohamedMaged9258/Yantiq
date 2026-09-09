# Yantiq

A bilingual, AI-assisted early Arabic reading tutor for children aged 4–7. Children listen,
repeat, receive encouraging pronunciation feedback, earn stars and badges, and progress
through a guided four-level curriculum in Modern Standard Arabic. Guardians manage child
profiles and review progress; an administrator manages the curriculum.

Graduation project, targeting a working delivery by December 2026.

> **[`docs/phase-0-baseline.md`](docs/phase-0-baseline.md) is the authoritative technical
> baseline.** Where any document, diagram, or piece of code conflicts with it, the baseline
> wins until that file is corrected. Read it before starting work.

## Implementation progress

Start here: [Implementation dashboard](docs/implementation/README.md)

It tracks the current phase and its objective, the status of phases 00-07, active tasks with
their owners and branches, the open decisions blocking progress, and what has actually been
finished. Update it in the same pull request that changes phase or task state.

## Repository layout

```
Yantiq/
  apps/
    mobile/            Expo React Native app (guardian + child)      — not scaffolded yet
    admin/             React + Vite administrator portal            — not scaffolded yet
  services/
    backend/           FastAPI application backend                  — not scaffolded yet
    ai/                MSA pronunciation service (fine-tuned model) — working
  contracts/
    application-api/   Proposed client-facing OpenAPI + fixtures    — design, not frozen
    ai-api/            Proposed backend↔AI contract + fixtures      — design, not frozen
    shared/            Integration rules and the scenario manifest  — design, not frozen
    tools/             Contract validator and pinned requirements
  infra/
    compose/           Docker Compose for local + Home Lab          — not authored yet
    scripts/           Backup, deploy, and maintenance scripts      — not authored yet
  docs/                Baseline, product overview, diagrams, the implementation plan, ADRs, reports
  prototype-archive/   The original UI mock — reference only, never shipped

Each component also carries a `docs/` directory holding the plan that governs it —
`apps/mobile/docs/implementation-plan.md`, `services/ai/docs/integration-plan.md`, and so on.
```

Each directory has a `README.md` explaining what belongs in it and which baseline section
defines it.

## Architecture in one paragraph

The mobile app and the admin portal are the only two clients, and they call **only** the
application backend — never PostgreSQL and never the AI service. Guardians and
administrators authenticate against **Firebase Authentication**; the client sends the
resulting Firebase ID token as a bearer, and FastAPI verifies it server-side. The backend
owns curriculum, progress, thresholds, stars, badges and progression, and stores everything
in PostgreSQL (including small lesson media as `BYTEA`). For a pronunciation attempt the
backend forwards de-identified audio to the AI service over Tailscale; **the AI service
returns evaluation data only and never a pass/fail** — the backend applies the configured
threshold and decides. During development an `AI_PROVIDER=mock` adapter stands in for the
real service.

See [`docs/architecture/diagrams.md`](docs/architecture/diagrams.md) for the full set of 17
diagrams.

## Component status and setup

### `services/ai` — working

The only component that currently runs. Requires `uv`, **Python 3.13**, and `ffmpeg` on
`PATH` for compressed audio formats.

```bash
cd services/ai
uv sync -p 3.13 --extra engine --extra ui
uv run -p 3.13 quran-muaalem-msa-api    # port 8010
uv run -p 3.13 quran-muaalem-msa-ui     # port 7870 (start the API first)
```

Pin the interpreter: `librosa` pulls in `numba`, which caps at Python `<3.14`, so a sync on
3.14 fails for every extra even though `pyproject.toml` declares `>=3.11,<3.15`.

Run everything from `services/ai` — its paths resolve against the current working
directory. Full detail in [`services/ai/README.md`](services/ai/README.md).

Note that its current endpoints (`/health`, `/transcribe`, `/align`, `/compare`, `/debug`)
are **not** yet the `POST /v1/evaluations` contract the backend will call. Closing that gap
is Phase 5.

### `services/backend`, `apps/mobile`, `apps/admin` — not scaffolded

Phase 1 backlog items 5–10. Their READMEs describe the intended shape and constraints, and
each has an `implementation-plan.md` under its `docs/` directory.

## Ground rules

These come from the baseline and are worth knowing before writing any code.

- **Nothing but the backend decides pass/fail.** Not the app, not the AI service (§9.1).
- **Never commit secrets, weights, checkpoints, or datasets.** Commit a `.env.example`
  instead; `checkpoints/` and `datasets/` are gitignored (§13, §15.3).
- **Minimal child data.** Nickname, age group, and a preset avatar — no exact date of birth,
  no photograph. No child data or audio in logs, ever (§6.2, §13).
- **Raw audio is deleted after evaluation**, and also after evaluation failure (§9.5).
- **No personal data reaches the AI service** — only a non-identifying `request_id` (§9.2).
- **Only the best result is retained** per child and exercise, plus aggregates. Individual
  attempt history is discarded by design (§7.2).
- **Arabic and English, RTL and LTR** are checked on every screen (§5.1).

## Contributing

- `main` is protected. Work on short-lived feature branches and open a pull request.
- Automated linting, type checks, and tests must pass before merge (§15.2, §16.1).
- A feature is done only when it meets the Definition of Done in baseline §20 — which
  includes reversible migrations, updated API schemas, verified Arabic/English states, and
  updated environment examples.
- Semantic release tags (`v0.1.0`); deployment to the Home Lab is manual and tagged.

## Documentation

Start at [`docs/README.md`](docs/README.md).

| Document | Purpose |
|---|---|
| [`docs/phase-0-baseline.md`](docs/phase-0-baseline.md) | The approved baseline and roadmap — authoritative |
| [`docs/product-overview.md`](docs/product-overview.md) | Product definition, scope, success criteria, risks |
| [`docs/architecture/diagrams.md`](docs/architecture/diagrams.md) | The 17 required software diagrams |
| [`docs/implementation/README.md`](docs/implementation/README.md) | The phased implementation plan and decision ledger — **proposed**, not approved |
| [`docs/api/README.md`](docs/api/README.md) | API conventions and privacy constraints |
| [`docs/api/operation-map.md`](docs/api/operation-map.md) | Readable index of every proposed operation and its authorization rule |
| [`docs/database/database-design.md`](docs/database/database-design.md) | Proposed persistence design and reference DDL |
| [`docs/testing/README.md`](docs/testing/README.md) | Test strategy and performance targets |
| [`docs/operations/home-lab-runbook.md`](docs/operations/home-lab-runbook.md) | Home Lab deployment and recovery runbook |
| [`docs/decisions/`](docs/decisions/) | Architecture decision records |

The implementation plan is a **design proposal awaiting the Phase 00 contract freeze**.
Where it conflicts with the baseline — it currently does, on the AI response field names —
the baseline wins. The divergence is recorded at the top of
[`docs/implementation/README.md`](docs/implementation/README.md).

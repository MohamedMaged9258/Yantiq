# CLAUDE.md

Guidance for Claude Code when working anywhere in the Yantiq monorepo.

`services/ai/CLAUDE.md` covers that subtree in much greater depth and auto-loads for work
under it. This file covers everything else.

## Read this first

[`docs/phase-0-baseline.md`](docs/phase-0-baseline.md) is the **authoritative** technical
baseline. Where any document, diagram, prototype, or comment conflicts with it, the baseline
wins and the other file is a bug. Section references written as §N throughout the repo point
into that document.

## Layout and ownership

| Path | What it is | Status |
|---|---|---|
| `apps/mobile` | Expo React Native app — guardian and child | Not scaffolded |
| `apps/admin` | React + Vite administrator portal | Not scaffolded |
| `services/backend` | FastAPI application backend | Not scaffolded |
| `services/ai` | MSA pronunciation service | **Working** |
| `contracts/` | OpenAPI / JSON Schema contracts and mock fixtures | Not authored |
| `infra/` | Docker Compose and operational scripts | Not authored |
| `docs/` | Baseline, product overview, diagrams, ADRs, reports | Current |
| `prototype-archive/` | The original UI mock | Reference only — never ship from it |

Most of this repository is a skeleton. When a task touches a component that is "not
scaffolded", say so rather than inventing files that imply it exists.

## Invariants that are easy to violate

- **`services/ai` must be run with `cwd = services/ai`.** Its paths (`checkpoints/`,
  `datasets/`, manifest audio paths) resolve against the current working directory, not the
  package. Running from the repo root silently looks in the wrong place.
- **Only the backend decides pass/fail** — never the mobile app, never the AI service (§9.1).
  If you find scoring logic drifting into a client or into `services/ai`, that is a defect.
- **No personal data crosses into `services/ai`** — only a non-identifying `request_id`
  (§9.2).
- **No child data and no audio in logs** (§13).
- **Never commit** secrets, model weights, checkpoints, datasets, `node_modules`, or build
  output. Commit `.env.example` templates instead. The `.gitignore` covers all of these;
  this repository previously had 2,589 `node_modules` files and a `.env` tracked because the
  ignore rules were added after the files, so check `git status` before staging broadly.
- **Do not rename `services/ai/checkpoints/`.** `src/quran_muaalem/data/msa_dataset.py` uses
  that literal directory name as its "local path vs HuggingFace repo id" heuristic.

## Conventions

- Backend: Python, FastAPI, SQLAlchemy 2.x-style ORM, Alembic, Pydantic. REST under
  `/api/v1`. Health endpoints at `/health/live` and `/health/ready`.
- Clients: TypeScript. Mobile is Expo React Native; admin is React + Vite.
- Provider-neutral interfaces for authentication (`TokenVerifier`), media storage
  (`MediaStorage`), and AI evaluation (`AIEvaluator`) — so Firebase, PostgreSQL media, and
  the AI service can each be swapped without touching curriculum logic (§14.2).
- Curriculum hierarchy is `Level → Stage → Lesson → Exercise`, with exactly **four** levels
  (§3). Anything mentioning five levels is stale.
- All user-facing strings go through centralized translation keys, Arabic and English, with
  RTL and LTR verified.

## Git workflow

- `main` is protected; work on short-lived feature branches and open a pull request.
- Keep pure file moves in their own commit, separate from content edits, so git rename
  detection stays clean and long-lived branches can still merge across a restructure.
- Do not commit or push unless asked.

## When documentation and code disagree

Trust the code, and fix the prose in the same change. If something is planned rather than
built, say so explicitly in the document rather than describing it in the present tense.

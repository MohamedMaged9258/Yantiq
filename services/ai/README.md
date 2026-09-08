# `services/ai` — Yantiq MSA pronunciation service

An independently deployable Python service that turns a child's recording into phoneme-level
evaluation data. It adapts a pre-trained Quranic phoneme model to **Modern Standard Arabic**
(35 phoneme classes instead of the upstream 43) and serves it over FastAPI.

Defined by [`../../docs/phase-0-baseline.md`](../../docs/phase-0-baseline.md) §5.4 and §9.

> **This service does not decide whether a child passed.** It returns measurements —
> phonemes, alignment, error counts, error rate. Pass/fail, thresholds, stars, progression
> and child-facing wording all belong to `services/backend` (§9.1). Keeping that line clean
> is the single most important constraint on anything added here.

## Provenance and licence

This tree began as [`obadx/quran-muaalem`](https://github.com/obadx/quran-muaalem) (MIT) and
was stripped down to the MSA layer. The upstream serving stack is gone on purpose; what
remains of upstream is the `Wav2Vec2BertForMultilevelCTC` model class that MSA builds on.

`LICENSE` is the upstream MIT licence and must stay. The original bilingual project READMEs
are preserved for attribution at [`docs/upstream-README.md`](docs/upstream-README.md) and
[`docs/upstream-README_EN.md`](docs/upstream-README_EN.md).

## Quick start

All commands assume **`cwd = services/ai`**. Nearly every path in this service resolves
against the current working directory, so running from elsewhere silently looks for
`checkpoints/` and `datasets/` in the wrong place. `uv` is the package manager; the
project's Python launcher is `python3.14`.

```bash
# Serving (API + Gradio UI)
python3.14 -m uv sync --extra engine --extra ui

# Training extras
python3.14 -m uv sync --extra training

# Test extras
python3.14 -m uv sync --extra test
```

Run the stack in two terminals, API first:

```bash
python3.14 -m uv run quran-muaalem-msa-api   # port 8010
python3.14 -m uv run quran-muaalem-msa-ui    # port 7870, talks to the API over HTTP
```

Tests:

```bash
python3.14 -m uv run pytest
python3.14 -m uv run pytest --skip-slow   # skips model-loading tests
```

`tests/` currently holds only `conftest.py`, which defines the `--skip-slow` flag and the
`slow` marker. There are no test modules yet.

## Current HTTP surface

Implemented in [`src/quran_muaalem/msa/api.py`](src/quran_muaalem/msa/api.py). No router
prefix — these sit at the server root.

| Method | Path | Request | Returns |
|---|---|---|---|
| `GET` | `/health` | — | `status`, `model_path`, `device` |
| `POST` | `/transcribe` | multipart `audio` | `phonemes` (space-separated) |
| `POST` | `/align` | multipart `audio` | `phonemes` + per-phoneme `alignments` with start/end/confidence |
| `POST` | `/compare` | multipart `audio` + form `expected_text` | `alignments`, expected/predicted phonemes, edit `ops`, match/substitution/insertion/deletion counts, `phoneme_error_rate` |
| `POST` | `/debug` | multipart `audio` | `blank_ratio` and top-3 phonemes for the first frames |

### Gap against the approved contract

**None of these is the contract the backend will call.** §9.2 specifies
`POST /v1/evaluations` taking `audio`, `request_id`, `expected_text`, `exercise_type` and
`language`, and returning `schema_version`, `model_version`, `pronunciation_score`,
`confidence`, `phoneme_error_rate`, `alignment`, `error_counts` and `feedback_codes`.

`/compare` is the closest: it already produces the alignment, edit operations, counts and
phoneme error rate. Missing are `pronunciation_score`, `confidence`, `model_version`,
`feedback_codes`, and the `request_id` correlation field. Closing the gap is Phase 5 work —
see [`../../contracts/ai-api/README.md`](../../contracts/ai-api/README.md).

Until then the backend develops against `AI_PROVIDER=mock` (§9.6).

## Configuration

`MSASettings` ([`src/quran_muaalem/msa/settings.py`](src/quran_muaalem/msa/settings.py))
reads `MSA_`-prefixed environment variables.

| Variable | Default | Notes |
|---|---|---|
| `MSA_MODEL_PATH` | `checkpoints/msa_model_v1/best_model` | Relative to cwd |
| `MSA_DEVICE` | `cuda` | `cpu` or `cuda`; falls back to cpu automatically |
| `MSA_SAMPLE_RATE` | `16000` | Do not change without retraining |
| `MSA_API_HOST` / `MSA_API_PORT` | `0.0.0.0` / `8010` | |
| `MSA_API_URL` | `http://127.0.0.1:8010` | Where the UI looks for the API |
| `MSA_UI_HOST` / `MSA_UI_PORT` | `0.0.0.0` / `7870` | |

**A `.env` file here is not read automatically.** `MSASettings` sets no `env_file` and
nothing calls `load_dotenv()`, so the values must be exported into the environment. See
[`.env.example`](.env.example) — it documents the variables and this caveat. Note the
consequence: the effective device default is `cuda`, not whatever a `.env` says.

## Runtime dependencies

- **`ffmpeg` on `PATH`** for compressed uploads (mp3, m4a, webm, opus). WAV, FLAC and OGG
  decode through librosa/libsndfile without it. This matters if the service is containerized.
- First run downloads `obadx/muaalem-model-v3_2` (~660 MB) into the HuggingFace cache.
- The adapted checkpoint is ~2.3 GB on disk and ~3 GB in RAM at float32.

## Directories that are never committed

`checkpoints/` and `datasets/` are gitignored, along with weight file extensions. They are
generated locally — see [`TRAINING.md`](TRAINING.md).

Do **not** rename `checkpoints/`: `src/quran_muaalem/data/msa_dataset.py` keys its "is this
a local path or a HuggingFace repo id?" heuristic off that literal directory name, and
renaming it routes local paths to the Hub and produces a misleading 401.

## Further reading

| Topic | Document |
|---|---|
| Architecture, the 35-token MSA inventory, head-resize procedure | [`MODEL.md`](MODEL.md) |
| Dataset download, extraction, manifest preparation | [`DATASET.md`](DATASET.md) |
| Fine-tuning pipeline | [`TRAINING.md`](TRAINING.md) |
| Install and serve | [`RUNNING.md`](RUNNING.md) |
| Working notes, past debugging decisions, environment gotchas | [`CLAUDE.md`](CLAUDE.md) |

These four guides predate the strip-down to MSA-only, so parts still describe removed
upstream services. Trust the code over the prose, and fix the doc while you are there.

# `contracts/ai-api` — versioned AI evaluation contract

**Status: proposed design, not implemented.**

The OpenAPI / JSON Schema definition of the private contract between
`services/backend` and `services/ai`, plus mock fixtures.

| File | What it is |
|---|---|
| [`openapi.json`](openapi.json) | The **proposed** backend↔AI contract, awaiting the Phase 00 contract freeze |
| [`examples/ai-success.mock.json`](examples/ai-success.mock.json) | A synthetic successful evaluation response |

**Field names here diverge from baseline §9.3** (`alignment[].op` and four error counters,
versus the baseline's `alignment[].operation` and three). The baseline wins until Phase 00
resolves it — see [`docs/implementation/README.md`](../../docs/implementation/README.md).

Defined by [`docs/phase-0-baseline.md`](../../docs/phase-0-baseline.md) §9.2 and §9.3.

## Target endpoint

`POST /v1/evaluations` — multipart: `audio`, `request_id`, `expected_text`,
`exercise_type` (`letter` | `word` | `sentence`), `language` (`ar-MSA`).

Response carries `schema_version`, `model_version`, `pronunciation_score`, `confidence`,
`phoneme_error_rate`, expected/recognized phonemes, `alignment`, `error_counts`, and
`feedback_codes`.

## Two rules this contract exists to enforce

1. **No `passed`.** Pass thresholds are configurable curriculum rules owned by the
   backend, so the AI response must not contain a final pass/fail value.
2. **No personal data.** No guardian id, child id, nickname, or Firebase uid crosses this
   boundary — only a non-identifying `request_id`.

## Gap against the current implementation

`services/ai` today exposes `/health`, `/transcribe`, `/align`, `/compare`, and `/debug` —
none of which is `/v1/evaluations`. `/compare` is the closest and returns the alignment and
phoneme-error-rate pieces, but not `pronunciation_score`, `confidence`, `model_version`, or
`feedback_codes`. Closing that gap is Phase 5 work; the mock fixtures here unblock the
backend and mobile streams in the meantime.

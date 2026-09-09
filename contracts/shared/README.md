# `contracts/shared` — cross-service rules and scenarios

What neither OpenAPI document can express on its own: the semantics both sides of a call
have to agree on.

| File | What it is |
|---|---|
| [`integration-rules.md`](integration-rules.md) | Race conditions, retries, idempotency, timeout and failure behaviour, and the personal-best comparison algorithm |
| [`integration-cases.json`](integration-cases.json) | Sequences the four `contracts/application-api/examples/application-*.mock.json` fixtures into a first → lower → improved → equal comparison scenario, with the expected best score and attempt count after each step, plus the error cases that must not mutate progress |

Step file paths in `integration-cases.json` are relative to the repository root. The scores
in those fixtures are deliberately injected mock values chosen to exercise state
transitions; identical sample phonemes across them are intentional and say nothing about
score calibration.

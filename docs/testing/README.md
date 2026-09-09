# Testing strategy

Derived from [`../phase-0-baseline.md`](../phase-0-baseline.md) §16.

| Document | What it is |
|---|---|
| This README | The digest of baseline §16 — the merge-blocking suites and the targets they gate |
| [`test-strategy.md`](test-strategy.md) | The expanded strategy from the implementation plan: contract fixtures, the numbered critical cases, and how to run the contract validator. **Proposed**, and subordinate to the baseline |
| [`planning-export-validation.md`](planning-export-validation.md) | A dated record of the checks run against the planning documents themselves. Not a claim about the running system |

## Merge-blocking suites

| Suite | Covers |
|---|---|
| **Unit** | Progression rules, pass thresholds, star rules, badge rules, deletion timing, provider adapters, data validation |
| **Backend integration** | PostgreSQL migrations and repositories, the Firebase verifier abstraction, media streaming, ownership rules, the AI adapter contract, immediate content revisions |
| **Mobile / admin** | State management, RTL/LTR layout, form validation, offline curriculum behaviour, result rendering |
| **Critical end-to-end** | Guardian login, child creation, curriculum sync, lesson completion, mock pronunciation evaluation, personal-best update, admin content update, seven-day deletion |

## Cases that are easy to forget

- A threshold change must **not** un-complete an already-completed lesson; the new
  threshold applies only to future attempts (§3, §11).
- Cross-guardian access must fail: guardian A can never reach guardian B's child (§6.2).
- Only the best derived result is retained — assert that individual attempt rows are
  discarded after aggregates update (§7.2).
- Raw audio is deleted after evaluation **and** after evaluation failure (§9.5).
- No guardian id, child id, nickname, or Firebase uid reaches the AI service (§9.2).
- Mock evaluation results are flagged internally and must not pollute real analytics (§9.6).

## AI validation (§16.2)

The AI stream maintains a separate versioned evaluation set aligned with the product
domain: MSA letters, words, and short sentences; child speech where consent and lawful use
are established; correct pronunciations and realistic error cases; speakers held out of
training; per-level and per-phoneme metrics.

**Quranic-recitation validation alone is not sufficient** to claim general child-MSA
performance.

## Provisional performance targets (§16.3)

- Non-AI backend API median response under 500 ms on the Home Lab.
- A valid AI response for at least 90% of supported test recordings when the model service
  is healthy.
- AI evaluation median at or below 5 s; 2 s is a stretch target.
- End-to-end evaluation hard timeout: 15 s.
- No loss of best-score or progress data during integration tests.
- Critical flows pass on supported Android phone and tablet layouts, in Arabic and English.

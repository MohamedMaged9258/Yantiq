# Yantiq documentation

## Reading order

1. **[`phase-0-baseline.md`](phase-0-baseline.md)** — the approved technical baseline and
   implementation roadmap. **This document is authoritative.** Where any other document,
   diagram, or prototype conflicts with it, it wins until that file is corrected.
2. **[`product-overview.md`](product-overview.md)** — what Yantiq is, who it is for, scope,
   success criteria, risks, and deliverables.
3. **[`architecture/diagrams.md`](architecture/diagrams.md)** — the 17 software diagrams
   required as a project deliverable.
4. **[`implementation/README.md`](implementation/README.md)** — the phased implementation
   plan, decision ledger, and the contracts it proposes. **Proposed, not approved:** where
   it conflicts with the baseline, the baseline wins until Phase 00 says otherwise.

## Directory map

| Path | Contents |
|---|---|
| `phase-0-baseline.md` | The approved baseline (was `Yantiq_Phase_0_Technical_Baseline_and_Roadmap.md` at the repo root) |
| `product-overview.md` | Product/scope documentation (was `Yantiq Documentation.md`) |
| `architecture/` | System diagrams (was `DIAGRAMS.md`) |
| `decisions/` | Architecture decision records |
| `api/` | API conventions, privacy constraints, and the operation map |
| `testing/` | Test strategy and coverage expectations |
| `implementation/` | The phased implementation plan, decision ledger, and per-phase guides |
| `database/` | Proposed persistence design and reference DDL — not executed migrations |
| `delivery/` | Backlog and graduation handoff |
| `operations/` | Home Lab runbook |
| `reports/` | Academic deliverables (presentation, report) |

Component-level documentation lives with its component: `services/ai/README.md`,
`services/backend/README.md`, `apps/mobile/README.md`, `apps/admin/README.md`,
`prototype-archive/README.md`.

## Keeping documents honest

Phase 0 §12 states the rule this repository follows: when prose and code disagree, trust
the code and fix the prose in the same change. If a document describes something that is
planned rather than built, say so explicitly in that document.

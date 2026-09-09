# `apps/mobile` — Yantiq mobile app

**Status: not scaffolded yet.** Placeholder for Phase 1 backlog item 9.

Expo React Native + TypeScript app for guardians and children. Android is the first
milestone; iOS compatibility is retained from the start.

Defined by [`docs/phase-0-baseline.md`](../../docs/phase-0-baseline.md) §5.1 and §4.1.

## What lives here

- Guardian onboarding, consent, and child-profile selection.
- The four-level learning experience (`Level → Stage → Lesson → Exercise`).
- Audio capture for pronunciation exercises and reference-audio playback.
- Offline browsing of previously cached lessons (scoring stays online).
- Arabic/English translation keys with RTL/LTR layout support.
- Responsive phone and tablet layouts.

## Rules

- This app calls **only** the application backend (`services/backend`). It never talks to
  PostgreSQL or the AI service directly.
- Authentication is Firebase (Google or email/password). The app obtains a Firebase ID
  token and sends it as a bearer token; the backend verifies it.
- **The app never computes a score, a pass/fail, or a star count.** It renders whatever
  the backend returns. See §9.1 of the baseline.

## Reference material

`prototype-archive/` holds the original UI mock. Read its README first — the design
tokens and Arabic content tables are worth reusing; the scoring logic is not.


## The plan for this component

[`docs/implementation-plan.md`](docs/implementation-plan.md) is the detailed build plan —
work packages, dependencies, and acceptance. It is a **proposal** awaiting the Phase 00
contract freeze, so where it conflicts with
[`../../docs/phase-0-baseline.md`](../../docs/phase-0-baseline.md), the baseline wins. See
the divergence note in [`../../docs/implementation/README.md`](../../docs/implementation/README.md).

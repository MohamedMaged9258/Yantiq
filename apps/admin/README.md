# `apps/admin` — Yantiq administrator portal

**Status: not scaffolded yet.** Placeholder for Phase 1 backlog item 10.

React + Vite + TypeScript portal for curriculum and media administration.

Defined by [`docs/phase-0-baseline.md`](../../docs/phase-0-baseline.md) §5.2 and §11.

## What lives here

- Level / stage / lesson / exercise authoring, including ordering and bilingual labels.
- Ground-truth text, reference media upload, pass thresholds, and reward values.
- Badge rules.
- System-health view.

## Rules

- One `ADMIN` role initially. There is **no public administrator registration**.
- Administrators sign in through the same Firebase project; the backend grants access only
  to a privately provisioned administrator UID/role.
- A client-side admin screen is **not** an authorization control — every admin endpoint
  re-checks the role server-side (§6.3).
- Every save increments the relevant content revision automatically, so connected mobile
  clients pick the change up on their next synchronization.
- Published content that children already reference is archived, not deleted.

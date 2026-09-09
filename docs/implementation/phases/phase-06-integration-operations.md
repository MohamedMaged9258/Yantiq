# Phase 06 — Private end-to-end integration and recovery

## Ownership and entry

Owner: Backend/platform owner; all developers verify.

Entry: End-to-end mock journey; phase 05 needed for real integration.

## Status

| Status | Owner | Branch / PR | Updated |
|---|---|---|---|
| Not started | Backend/platform owner; all developers verify | — | 2026-09-09 |

`Not started` → `In progress` → `Blocked` / `In review` → `Completed`. Mark this phase Completed only when every exit-acceptance box below is ticked. Update the [dashboard](../README.md) in the same pull request.

## Work packages

| ID | Work package | Status | Branch / PR |
|---|---|---|---|
| P06-01 | Private networking | Not started | — |
| P06-02 | Deployment | Not started | — |
| P06-03 | Secrets/auth | Not started | — |
| P06-04 | Retention/backup | Not started | — |
| P06-05 | Monitoring | Not started | — |
| P06-06 | Failure drills | Not started | — |
| P06-07 | Release rollback | Not started | — |

Each work package is described in full below. Change a row's status as the work moves, and reflect the phase-level roll-up on the [dashboard](../README.md).

### P06-01 — Private networking

Configure approved Tailscale identities/grants and private HTTPS origins. Permit mobile/admin→backend, backend→AI and backend→PostgreSQL only as required. Verify negative network access tests.

### P06-02 — Deployment

Build component images from an approved tag with immutable digests; run migrations as a separate one-shot operation; manually approve Home Lab release. Do not mount the entire repository or personal home into containers.

### P06-03 — Secrets/auth

Keep server Firebase credentials, DB password and AI token outside Git/images. Restrict admin provisioning, CORS, rate limits and upload validation. Use least-privilege DB runtime versus migration accounts.

### P06-04 — Retention/backup

Schedule weekly encrypted PostgreSQL backups including BYTEA; expire at 30 days only after successful backup/recovery verification. Test seven-day purge and tombstone reapplication on restore.

### P06-05 — Monitoring

Expose separate liveness/readiness, structured redacted logs and uptime checks from a tailnet-capable monitor. Alert on backup failure, storage growth, purge lag and AI timeout rate.

### P06-06 — Failure drills

AI laptop off, network drop, expired Firebase token, full database disk, migration failure, broken media, duplicate response, device backgrounding and restored deleted profile.

### P06-07 — Release rollback

Revert application image only when schema remains compatible. Never automatically run destructive down migrations. Establish restore procedure and approved downtime notice.

## Required outputs

- Home Lab runbook with actual non-secret hostnames
- Tagged staging/demo deployment
- Restore drill report and access-control checks
- Measured SLO/timeout settings

## Exit acceptance

- [ ] Only intended tailnet participants reach services; app authorization still rejects wrong guardians.
- [ ] Unhealthy AI disables scoring but catalog/profile browsing remains usable.
- [ ] Backup restores schema, data and BYTEA into an isolated database.
- [ ] Restore does not reintroduce purged child data.
- [ ] Logs contain no tokens, audio, nicknames or expected/recognized child speech.

## Handoff and cautions

Weekly backups permit up to roughly seven days of data loss; confirm acceptability. Redundancy and tighter recovery objectives are later scope, not implied by monitoring.

Review the shared [decision ledger](../decisions-and-open-items.md), [integration rules](../../../contracts/shared/integration-rules.md), and [test strategy](../../testing/test-strategy.md) before closing this phase. A task is complete only when its behavior, tests and documentation agree.

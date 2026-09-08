# `infra/scripts` — operational scripts

**Status: not authored yet.** Placeholder.

Deployment, backup, and maintenance scripts for the Home Lab.

Defined by [`docs/phase-0-baseline.md`](../../docs/phase-0-baseline.md) §14.3.

## Expected contents

- PostgreSQL backup (weekly, 30-day retention, encrypted) and restore rehearsal.
  Backups include lesson media, because media is stored in PostgreSQL as `BYTEA`.
- Tagged-release deployment to the Home Lab.
- Uptime/health probes for the backend, its database dependency, and the AI dependency.

Note: training and inference scripts for the AI service live with that service
(`services/ai/run_msa.sh`), not here.

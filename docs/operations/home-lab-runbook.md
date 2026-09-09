# Home Lab deployment and operations plan

## Initial topology

Home Lab: backend Docker container and admin static frontend behind private HTTPS; existing PostgreSQL LXC reachable only from approved backend/backup identities. Personal NVIDIA laptop: separate AI service later. Test phones/tablets and developers use Tailscale. Firebase is the only required externally hosted application service initially.

The AI laptop may be off. Backend readiness should depend on its own required database, not require AI to remain available for browsing/profile/admin features. Scoring clearly reports unavailability. Mock mode is for isolated local/demo data and must be visible.

## Environment matrix

| Setting | Mobile | Admin | Backend | AI |
| --- | --- | --- | --- | --- |
| Public backend origin | EXPO_PUBLIC_API_BASE_URL | VITE_API_BASE_URL | Own HTTPS origin | Not needed |
| Firebase public project/client configuration | Required | Required | Project ID for verification | Never |
| Firebase Admin credential | Never | Never | Server secret/configured credential source | Never |
| PostgreSQL connection URL | Never | Never | Server secret, private host | Never |
| AI private base URL | Never | Never | AI_BASE_URL | Listening address |
| AI service token | Never | Never | Server secret | Server secret |
| Evaluation mode | Display returned mode | Display operational state | Explicit mock/real config | Explicit mock/real config |
| Timeout/resource limits | Approved UI behavior | Upload limits | Approved enforced values | Approved enforced values |

EXPO_PUBLIC_* and VITE_* are client-visible build configuration. Never place a secret there. .env.example contains placeholders only. Replace example.invalid addresses after setup; no address in this document is live.

## Network/access checklist

- Register only approved devices/users in Tailscale and restrict grants/ACLs to required routes and service ports.
- Use verified private HTTPS for application and AI endpoints; configure certificate renewal.
- Permit admin browser origin in backend CORS, not wildcard origins with credentials.
- Do not expose PostgreSQL or AI through a public router port-forward.
- Firewall LXC/database independently of app authentication.
- Restrict admin role to privately provisioned approved Firebase UID.
- Keep uptime monitor inside an authorized network path; public probes cannot prove private endpoint availability.
- Test deny rules with an unauthorized tailnet user/device, not just happy-path access.

Exact Tailscale configuration must be reviewed against the installed version and account capabilities during implementation; no executable network policy is applied by this plan.

## Local development

Use local disposable PostgreSQL and mock AI; do not let developer tests point at the Home Lab shared DB by default. Test identity adapters may accept in-memory principals only inside test dependency injection. A test verifier must never be selected in a network-accessible release. If adopting Firebase emulators, explicitly separate emulator configuration from live authentication and verify real Google/email sign-in before release.

## Manual tagged deployment

1. Verify merged required CI checks and owner-approved release tag.
2. Record commit, contract versions, migration head, backend/admin/mobile versions and AI model/scoring version.
3. Build reproducible images with pinned dependencies and immutable digest. Store secrets outside images.
4. Confirm recent verified backup, disk headroom and rollback compatibility.
5. Put affected write flows into maintenance if migration requires it. Run migration once using operator/migration role.
6. Start backend and admin release; inspect safe readiness, logs and catalog/media/identity smoke tests.
7. Switch to real AI only when its readiness and contract checks pass; never silently fall back to fake scores.
8. Test one designated synthetic/demo account journey, then reopen traffic and monitor.
9. Record outcome and operator in release log.

This is a checklist, not a runnable deployment script. Actual hosts, volume paths and secret sources must be filled and reviewed before commands are authored.

## Backup policy and recovery

Weekly PostgreSQL logical backup including all BYTEA media; encrypted destination on separate storage from the database host; 30-day retention. Backup encryption key must not be stored only inside the backed-up database. Verify integrity and periodic isolated restores. A failed new backup must not trigger deletion of the last known-good copy.

Recovery point objective is approximately up to seven days of changes under the chosen weekly policy. Recovery time objective is unmeasured until a restore drill; proposal: establish a measured target during phase 06 rather than invent one.

Restore procedure:
1. Isolate a new database and keep app traffic disabled.
2. Restore using a compatible PostgreSQL toolchain and validate schema/migration version.
3. Apply latest deletion tombstone ledger from storage independent of the restored snapshot.
4. Purge any child now beyond its seven-day deadline; remove orphan private state.
5. Fail/expire stale processing receipts; ensure old work cannot commit.
6. Verify counts, media hashes, constraints and known synthetic accounts.
7. Point a restricted backend at restored data for smoke tests.
8. Obtain operator/owner approval, switch traffic, observe and document.

A seven-day live purge does not erase earlier encrypted backups immediately. They expire under 30-day policy. The restore ledger is a security requirement to avoid resurrecting deleted children; protect it and retain it beyond all affected backup snapshots.

## Audio cleanup

Use narrowly scoped temporary paths, bounded quotas, request-finally cleanup and startup janitors. Do not mount child-audio paths into backup volumes. Avoid audio in traces/crash dumps/request logs. Secure overwrite of every physical storage block is not promised; use storage encryption and minimal lifetime. Mobile cannot guarantee remote deletion from a permanently offline device; clear private cache on next session/reconnect.

## Monitoring and alerts

Liveness: process responds. Readiness: backend database ready; AI model/device ready separately. Structured fields: UTC time, severity, event_code, opaque request_id, service/version, route template, duration and status. Do not log Firebase tokens, service credentials, child nickname, expected/recognized speech, recordings or individual scores.

Initial alerts: backend down, database connectivity error, storage nearing agreed threshold, backup overdue/failed, purge lag beyond schedule, temporary-file growth, sustained AI unavailable/timeout and rejected malformed AI payload. Redact before sending logs anywhere external. Uptime alone is not backup verification or evaluation-quality monitoring.

## Incidents and rollback

AI off: keep non-scoring app features; show retry later. DB down: readiness fails; do not accept “saved” progress. Bad release: revert immutable application image only if schema is compatible. Bad migration/data loss: isolate and follow reviewed restore procedure; never blindly run down migrations or overwrite live DB. Suspected credential leak: revoke/rotate affected credential, preserve redacted audit evidence, assess impacted identities and notify through an approved process.

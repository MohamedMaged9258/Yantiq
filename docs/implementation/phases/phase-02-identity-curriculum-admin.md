# Phase 02 — Identity, child lifecycle and curriculum administration

## Ownership and entry

Owner: Backend + admin developers.

Entry: Phase 01 runtime and test database.

## Work packages

### P02-01 — Guardian bootstrap

Verify Firebase tokens, create or return guardian by provider UID atomically, capture versioned consent, implement Google/email-password UI and account recovery. Backend roles are not supplied by clients.

### P02-02 — Child ownership

Implement nickname/age/avatar create/list/edit with one guardian. Derive guardian from token, reject cross-account access as 404, enforce preset avatars and prohibit upload photos.

### P02-03 — Lifecycle

Soft-delete immediately, fence in-flight evaluations, expose deleted list/restore only to owner for seven days. Purge job removes child and dependents, writes/reconciles deletion tombstones.

### P02-04 — Curriculum APIs

Implement four immutable level positions and editable stages/lessons/exercises. Validate hierarchy, ordering and references. Hide unservable/archived exercises and use prerequisite traversal rules.

### P02-05 — Admin editing

Build authenticated table/editor/media views, exact Arabic/English content fields and ETag/If-Match concurrency handling. Changes become current on successful save; show impact warning for target edits.

### P02-06 — Binary reference media

Upload multipart bytes to PostgreSQL, validate type/signature/size, serve authenticated content and ETag. Avoid loading all blobs in catalog queries; prevent deletion while referenced.

### P02-07 — Revision model

Write an immutable exercise revision for every relevant edit; rotate assessment_key only for changed evaluation target/type/language. Bump catalog version in same transaction. Preserve completed lessons.

## Required outputs

- Working guardian and administrator sign-in
- Child CRUD/delete/restore flows
- Seed curriculum covering levels 1–4
- Admin publication and media screens

## Exit acceptance

- [ ] A guardian cannot access another guardian's child or media outside the allowed catalog.
- [ ] A non-admin cannot write curriculum even after changing frontend code.
- [ ] Concurrent admin saves yield 412 rather than overwrite silently.
- [ ] Curriculum response never contains media BYTEA or child data.
- [ ] Purge and restore tests use a fake clock and cover the exact seven-day boundary.

## Handoff and cautions

Ship a usable admin portal now, not after mobile completion. Seed data must be editorially reviewed, not scraped from the archived prototype.

Review the shared [decision ledger](../decisions-and-open-items.md), [integration rules](../../../contracts/shared/integration-rules.md), and [test strategy](../../testing/test-strategy.md) before closing this phase. A task is complete only when its behavior, tests and documentation agree.

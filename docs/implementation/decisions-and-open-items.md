# Decisions and open items

## Approved baseline

| Area | Decision |
| --- | --- |
| Audience and speech | Ages 4–7; general Modern Standard Arabic; recitation data supporting only |
| Curriculum | Four levels: basic letter sounds; letter forms/positions/diacritics; words; short sentences/guided reading |
| Hierarchy | Level → stage → lesson → exercise |
| Mobile | React Native, Expo, TypeScript; Android first, then iOS; Arabic and English together; phones and tablets |
| Identity | Firebase Google and email/password for guardians; no child login; one guardian per child |
| Child profile | Nickname, age group and preset avatar |
| Backend | Separate FastAPI service; PostgreSQL in existing Home Lab LXC |
| Admin | React + Vite + TypeScript; portal from the start; one Administrator role |
| Hosting | Backend Docker on Home Lab; AI on separate personal NVIDIA laptop later; Tailscale access |
| Development | Local environments; monorepo; 2–3 application developers; separate AI owner |
| Media | Persistent reference media in PostgreSQL BYTEA |
| Offline | Browse cached lessons; evaluation online only; no offline audio submission queue |
| Progress | Guided sequence; configurable pass score; preserve completion when thresholds change |
| Results | Child-friendly feedback, guardian details; compare current attempt with previous best |
| Retention | Persist best result only; no individual losing-attempt history |
| Dashboard | Progress, attempt counts, difficult sounds and activity |
| Rewards | Stars, badges and encouragement |
| Publication | Admin changes apply immediately |
| Child deletion | Hide immediately; live-system purge after seven days |
| Recording | Child stops manually, without an approved time limit |
| Failure | Animated scoring wait with timeout; unavailable AI means delete recording and retry later |
| Delivery | Feature branches/PRs; automated unit, integration and critical E2E gates; manual tagged deployment |
| Operations | Weekly database backup, 30-day retention; health checks, structured logs and uptime monitor |

Firebase authentication remains usable if hosting later moves. No hosting migration or switch of identity provider is included in the initial build.

## Proposed implementation choices — not earlier approvals

These defaults make the draft concrete. Confirm them in phase 00; update all linked schemas, tests and migrations together if changed.

| ID | Proposal and reason | Gate / owner |
| --- | --- | --- |
| O01 | Resource envelope for audio. Discuss a bounded upload size and processing budget; 60 seconds / 5 MiB are discussion examples, NOT approved limits. Manual stop/no UX timer remains the owner's choice. Truly unlimited resource consumption cannot be safely promised. | Owner + AI; before recorder/upload implementation is finalized |
| O02 | Initial scoring timeout 30 seconds end-to-end, shorter AI call budget within it; tune from laptop benchmarks. Never a quality or performance claim. | Backend + AI; before real integration |
| O03 | Score 0–100, nullable calibrated confidence, scoring_version and model_version; AI owns evidence/score, backend owns pass/fail. Score mapping and threshold calibration need evaluation data. | AI + owner; freeze v1 |
| O04 | Age groups `4_5` and `6_7`; preset avatars seeded, no photograph uploads. | Owner; before initial migration |
| O05 | Best-only can coexist with attempt counters, daily aggregates and per-sound aggregate counts, but not historical score trends. Count successful valid evaluations, not outages/rejected audio. | Owner; phase 00 |
| O06 | Stars: 1 for completed, 2 at ≥ max(pass score,85), 3 at ≥ max(pass score,95); monotonic awards. Badges from fixed backend rule keys. | Owner; phase 04 |
| O07 | Explicit guardian consent for processing children's speech; versioned consent recorded. Separate future research opt-in is outside v1; no training retention now. | Owner; before collecting real child data |
| O08 | Admin sign-in also Firebase, administrator permission privately provisioned in PostgreSQL; never self-selected. Admin UI English initially, Arabic content supported; mobile is bilingual regardless. | Owner; phase 02 |
| O09 | One active evaluation per child; idempotency metadata 24 hours; serialize writes and avoid duplicate rewards. | Backend; phase 00 |
| O10 | Content corrections keep completion but invalidate a best score if its evaluated target changes. Comparison only within same assessment_key and scoring_version. | Owner + AI; phase 00 |
| O11 | Backups can contain deleted data until their 30-day expiry; recovery must reapply deletion tombstones. Seven-day purge means live system, not instantaneous backup erasure. | Owner; privacy review |
| O12 | Proposed small curriculum seed: all four levels represented, a few reviewed exercises per level; final breadth and evaluator validation cohort determined by team capacity. | Owner + education/AI reviewer |

Unresolved practical inputs: laptop GPU/VRAM and OS; Home Lab hostname/Tailscale access setup; PostgreSQL version and available storage; Firebase project and authorized sign-in configuration; exact app identifiers; seed curriculum/editorial owner; backup destination separate from the database host; Android device matrix; guardian-consent wording and applicable institutional review.

Do not block schema drafting on infrastructure names. Use configuration placeholders, not invented credentials or public endpoints. Real child testing and a real-scoring release are gated on the relevant decisions.

## Corrections to earlier planning

A fixed recording cap must not be described as approved. Confidence is nullable until calibrated. Aggregate activity is not a retained sequence of score results. The removed old fourth curriculum level is not resurrected: current level 4 is sentences. “AI implemented” means only existing comparison code, not validated child-MSA scoring. December 2026 is a planning target, not a guaranteed schedule.

## Change control

Record decisions as ADRs with date, owner, status and affected contracts/tests. Product choices require owner approval; model semantics require AI owner review. Breaking API changes create a new major API path. Additive response changes require compatible clients and schema changes; freeze snapshots per release tag.

# Yantiq — Product Overview (V3.0)

## Working Title

Yantiq: AI-Based Early Arabic Reading Tutor with Pronunciation Correction

> **Status.** V3.0 aligns this document with
> [`phase-0-baseline.md`](phase-0-baseline.md), which is the authoritative technical
> baseline. Section references written as §N point into that document. Where the two
> disagree, the baseline wins and this document is the bug.
>
> **What changed from V2.6.** The curriculum is four levels, not five, and now has an
> `Exercise` tier. Authentication is Firebase, and the backend verifies rather than issues
> tokens. The AI service no longer decides correctness — it measures, and the backend
> judges. An administrator portal is in scope from the start rather than deferred as a
> "website version". Section 17, which listed open points, is closed: those decisions were
> made in Phase 0.

---

## 1. Project Idea Summary

Early Arabic literacy, particularly among preschool-aged children, faces significant
challenges due to limited access to interactive and personalized learning tools, especially
for pronunciation development. Children living in non-Arabic environments often lack
consistent exposure to correct Arabic speech, while existing solutions typically rely on
static content with minimal real-time feedback.

Additionally, most available applications do not provide stepwise progression aligned with
early literacy development, nor do they effectively integrate speaking, listening, and
reading skills in a unified learning experience. The absence of adaptive learning paths and
progress monitoring further limits the effectiveness of these tools for both learners and
guardians.

---

## 2. Project Problem Statement

Early Arabic literacy, particularly among preschool-aged children, faces significant
challenges due to limited access to interactive and personalized learning tools, especially
for pronunciation development. Children living in non-Arabic environments often lack
consistent exposure to correct Arabic speech, which negatively impacts their ability to
develop accurate reading and speaking skills.

Most existing solutions rely on static content and do not provide real-time pronunciation
feedback, making it difficult for children to correct mistakes and improve effectively.
Additionally, many platforms do not follow a structured, stepwise progression aligned with
early literacy development, nor do they integrate listening, speaking, and reading in a
unified learning experience.

Furthermore, the lack of adaptive learning paths and progress monitoring tools limits the
ability of guardians to support the child's learning journey, reducing overall engagement
and learning outcomes.

These limitations highlight the need for an intelligent, interactive, and adaptive solution
that supports early Arabic literacy through real-time feedback and structured learning
progression.

---

## 3. Target Users

- **Child (primary):** ages 4–7. Completes lessons and pronunciation exercises. Has no
  account of their own.
- **Guardian:** authenticates, creates and selects child profiles, grants consent, and
  reviews progress.
- **Administrator:** manages curriculum, media, thresholds, badges, and published content
  through the web portal.

Teacher and school accounts are **deferred** (§2.3), as is sharing one child profile
between multiple guardians.

---

## 4. Project Vision

Build an AI-powered, engaging, adaptive Arabic learning platform for children worldwide.

---

## 5. Project Objectives

- Provide a structured, stepwise Arabic reading journey from letter recognition to sentence
  reading.
- Enable real-time pronunciation feedback using a fine-tuned Arabic speech model adapted
  from Quranic speech/recitation recognition to Modern Standard Arabic. The model produces
  phoneme-level evaluation data; the backend turns that into a pass/fail result against a
  configurable threshold.
- Support audio-first learning through listening and speaking exercises.
- Deliver a guided learning experience that adapts through rule-based retry support and
  simpler fallback tasks.
- Provide progress tracking through a guardian dashboard.
- Give an administrator full control of the curriculum, thresholds, and rewards without a
  code change.
- Ensure alignment with early Arabic literacy learning principles.

---

## 6. Core Features

- Hybrid learning model (educational + gamified).
- **Four learning levels**, each divided into stages (§3).

### Curriculum structure

The hierarchy is `Level → Stage → Lesson → Exercise`:

| Level | Learning focus | Example progression |
|---|---|---|
| 1 | Letter recognition and basic sounds | Identify, hear, and repeat individual letters |
| 2 | Letter forms, positions, sounds, and diacritics | Initial/medial/final forms and short vowels |
| 3 | Words | Simple words progressing to harder words through ordered stages |
| 4 | Short sentences and guided reading | Listen, read, repeat, and pronounce short sentences |

- **Levels** define the four major learning steps.
- **Stages** divide each level into manageable groups.
- **Lessons** are short learning sessions.
- **Exercises** define individual listening, recognition, or pronunciation tasks. An exercise
  carries its own expected text, reference media, pass threshold, and reward value, all
  administrator-configured.

### Learning approach

- Audio-first learning, with a primary focus on listening and speaking.
- Visual support for letter and word recognition.
- Stepwise progression: letters → words → sentences.
- Real-time pronunciation feedback: the fine-tuned model compares the child's speech against
  the exercise's predefined ground truth, and the backend applies the configured threshold.
- Guided learning path with light adaptation — retry support and simpler fallback exercises
  selected by rule from the existing curriculum.

### Gamification (MVP choices)

- Stars and badges.
- Level and stage unlock system.
- Personal-best comparison and celebration on a new best.
- No child-to-child competition and no public leaderboard (§2.3).
- ⚠ Daily streak mechanics — deferred.
- ⚠ Custom avatars beyond the preset set — deferred.

---

## 7. AI Components

### Fine-tuned Arabic speech model

- Use an existing Quranic Arabic speech/recitation model as the base model.
- Fine-tune it on Modern Standard Arabic content aligned with the project scope.
- Process the child's spoken input and produce a phoneme sequence.
- Align that sequence against the phonemized ground truth for the target letter, word, or
  sentence.
- Return phoneme-level evaluation data: pronunciation score, confidence, phoneme error
  rate, alignment, error counts, feedback codes, and the model version.

### What the AI service does *not* do

It does **not** return a pass/fail value, award stars, or produce child-facing wording.
Pass thresholds are configurable curriculum rules owned by the administrator and applied by
the backend (§9.1). This split exists so a threshold can change without redeploying or
recalibrating the model, and so the same evaluation data can drive both simple child
feedback and detailed guardian feedback.

It also receives **no personal data** — no guardian id, child id, nickname, or Firebase
uid. Only a non-identifying correlation `request_id` crosses that boundary (§9.2).

### Training domain caveat

Modern Standard Arabic is the product domain. Quranic recitation data may support
pretraining or augmentation, but it is not the sole final training domain, and
Quranic-recitation validation alone is not sufficient to claim general child-MSA
performance (§5.4, §16.2).

### Future AI feature

- ⚠ Audio AI companion (voice-based assistant) — deferred.

---

## 8. Feedback System

- Guided feedback: show the mistake and the correction.
- Encouraging tone and positive reinforcement.
- Feedback shown to the **child** is simple and supportive.
- More detailed difficult-sound information is shown to the **guardian**.
- Child-facing wording is selected by the backend as a translation key and localized by the
  client — the app never composes scoring language of its own.

---

## 9. Cybersecurity Scope

- HTTPS for all client-to-backend communication; Tailscale-only access during Home Lab
  testing.
- PostgreSQL and the AI service are never publicly exposed.
- Firebase ID token verification on every protected request.
- Server-side guardian-ownership and administrator-role authorization.
- Explicit guardian consent before creating or using a child profile.
- Microphone permission requested in context, before the first recording.
- Minimal child data collection; raw child audio deleted after scoring or failure.
- No child data or audio in application logs. Structured logs carry request IDs and internal
  UUIDs only.
- Rate limits on authentication-sensitive and evaluation endpoints; strict upload type and
  size checks; restricted CORS origins for the admin portal.
- Secrets stored outside Git; dependency and secret scanning in continuous integration.
- Account and profile deletion with controlled cascading purge.

---

## 10. User Journey

### First-time experience

An adult assists the child in creating the account and setting up the initial profile:

- Guardian signs in with Google or email/password through Firebase.
- Guardian grants consent for child use.
- Guardian creates a child profile.

### Onboarding and profile design

**Guardian:**

- Firebase account (Google or email/password), with email verification where applicable.
- Consent record: type, version, timestamp, and withdrawal state.

**Child profile:** nickname, age group, and a preset avatar — nothing more. No exact date of
birth, no photograph, and no unnecessary identity information (§6.2). Children do not have
accounts; a guardian selects a profile after authenticating, and every child operation is
authorized against that guardian's ownership.

### Initial placement

The starting level is determined from age group and reported prior Arabic exposure, with the
option of a short placement check if the assigned level is too easy. Placement never skips
past Level 2 — Levels 3 and 4 are reached through progression.

### Daily usage flow

Open app → select child profile → sync curriculum if online → continue the last lesson →
complete a short exercise → receive reward → unlock the next stage. Short lessons are the
preferred format.

Previously downloaded lessons remain browsable offline. Pronunciation recording and scoring
are disabled offline with a clear connection-required message.

### Level progression logic

Progression rules are evaluated by the backend, using the pass threshold configured on each
exercise. A later threshold change does **not** un-complete an already-completed lesson; the
new value applies only to future attempts.

### Failure handling

- Early failures: encouragement, a hint, and replay of the reference audio.
- Repeated difficulty: route the child to a simpler exercise **within the existing
  curriculum**. This is rule-based in the initial release, not dynamically generated by AI.

### Speaking interaction flow

1. The app presents the target letter, word, or sentence and plays the reference audio.
2. The expected answer is stored as the exercise's ground truth, authored by the
   administrator.
3. The child starts recording, speaks, and stops manually. There is no countdown; the only
   limits are a technical cap of 60 seconds and 5 MB.
4. The app uploads the recording to the backend with the guardian's Firebase ID token.
5. The backend verifies the token, confirms ownership, validates the upload, and forwards
   de-identified audio to the AI service with a generated `request_id`.
6. The AI service returns phoneme alignment and evaluation data.
7. **The backend** applies the exercise threshold, compares against the child's personal
   best, awards stars and badges, updates aggregates, deletes the raw audio, and returns the
   result.
8. The app renders that result with animation and encouragement.

If the AI service fails or times out (15 s initially), the audio is deleted, nothing is
queued, and the child receives a friendly retry-later result.

---

## 11. Technical Scope

### Personalization approach

Fixed learning path with light adaptation through retry support and simpler fallback tasks.
Advanced dynamic AI personalization is a future phase.

### Platform strategy

- Mobile application as the primary platform for guardians and children: Expo React Native
  and TypeScript, Android first, iOS compatibility retained from the start.
- **An administrator web portal is in scope from the beginning** (React + Vite +
  TypeScript). This replaces V2.6's position that a website version was future work.
- Responsive phone and tablet layouts; Arabic and English interfaces with RTL/LTR support.

### AI deployment strategy

The fine-tuned model runs as an independently deployable Python service. Initially it runs
on a separate NVIDIA laptop, reached privately from the backend over Tailscale. During
application development an `AI_PROVIDER=mock` adapter conforming to the same versioned
contract stands in for it, so mobile and backend work is not blocked on GPU availability.

### System architecture

**1. Client layer**

- Mobile app: child learning and guardian-supported onboarding, lesson interaction, audio
  capture and playback, offline lesson cache, rewards and progress display.
- Administrator portal: curriculum, media, thresholds, reward values, and badge rules.
- Both clients call **only** the application backend. Neither touches PostgreSQL or the AI
  service directly.

**2. Identity provider**

Firebase Authentication, used by both guardians and administrators.

**3. Application backend**

Python and FastAPI. Owns identity mapping, authorization, curriculum, content revisions,
media APIs, progress, scoring rules, pass/fail, rewards, and the AI adapter. REST under
`/api/v1`; the generated OpenAPI document is the authoritative client specification.

**4. AI service layer**

A separate Python service handling audio normalization, model inference, phoneme alignment,
and pronunciation scoring. Kept modular so the model can be replaced or improved without
redesigning the system.

**5. Data layer**

PostgreSQL, running in the existing LXC. Stores guardian accounts, child profiles, the
curriculum hierarchy, progress and reward data, and small lesson media as `BYTEA` (never
Base64) behind a `MediaStorage` abstraction so assets can later move to an object store.

**6. Security layer**

Cross-cutting: token verification, ownership and role checks, input validation, upload
limits, rate limiting, and structured logging that excludes child data and audio.

### Data retention

Individual historical attempt results are **not** retained. For each child and exercise the
system keeps the best score, the best derived evaluation needed for guardian feedback, the
total attempt count, the last-attempt timestamp, completion state, stars awarded, and
aggregated difficult-phoneme statistics. Once a new result has been compared and aggregates
updated, the individual result is discarded and the raw audio deleted.

A deleted child profile is hidden immediately, then permanently purged with its dependent
data after a seven-day recovery window.

### Authentication model

- Guardians sign in through Firebase using Google or email/password.
- The client obtains a Firebase ID token and sends it as a bearer token.
- **FastAPI verifies the token server-side.** The backend does not issue login tokens of its
  own — this replaces V2.6's unspecified "token-based auth".
- The Firebase `uid` is stored as the guardian's external identity key; application data
  lives in PostgreSQL, not Firebase.
- Children have no accounts. A guardian selects a child profile after authenticating.
- Administrators use the same Firebase project; the backend grants access only to a
  privately provisioned administrator UID/role and re-checks it on every admin endpoint.

### Offline behaviour

The backend exposes the current content revision and a published manifest. The app compares
local and current revision numbers when online and downloads changed metadata and media using
checksums. Previously downloaded lessons remain viewable offline; pronunciation scoring
requires a connection.

### Project complexity level

The team will deliver a working mobile learning application connected to a backend, plus an
administrator portal. The MVP includes guardian onboarding and child profile creation, the
four-level Arabic learning flow, visual and audio learning activities, the fine-tuned speech
model for pronunciation evaluation, guided and encouraging feedback, gamification through
stars/badges and unlocks, a guardian dashboard, and basic security and privacy protections.

Deferred to later phases: fully dynamic AI personalization, handwriting analysis, a full AI
voice companion, teacher and school accounts, a public leaderboard, and queued or offline
pronunciation scoring.

---

## 12. Success Criteria

### 1. Functional success

- Child profile can be created and saved successfully.
- User can complete at least one full learning level.
- Speech evaluation returns a result for ≥ 90% of attempts when the model service is healthy.
- Progress and scores are stored and retrieved without data loss.
- An administrator can author a complete sample lesson and see it reach a connected app on
  its next synchronization.

### 2. AI performance success

- The fine-tuned model produces usable phoneme recognition on child input in ≥ 80% of test
  cases.
- Alignment against the predefined ground truth succeeds in ≥ 90% of valid test cases.
- The system, backend threshold included, classifies pronunciation correctly in ≥ 80% of
  test cases.
- Metrics are reported against a product-aligned MSA validation set with held-out speakers,
  reported per level and per phoneme — not against Quranic recitation alone.

### 3. User experience success

- Child can complete a lesson without external help in ≥ 80% of test sessions.
- Average lesson completion time: 2–5 minutes.
- Feedback is clear and understandable, validated through user testing.
- Critical flows pass on supported Android phone and tablet layouts, in both Arabic and
  English.

### 4. System performance

- Backend non-AI API median response below 500 ms on the Home Lab.
- AI evaluation median at or below 5 seconds, with 2 seconds as a stretch target, and a
  15-second end-to-end hard timeout.
- Backend APIs respond successfully in ≥ 95% of requests.
- App maintains stable performance with minimal crashes during testing.

### 5. Security success

- Only authenticated guardian accounts can access system features.
- Cross-guardian access attempts are correctly rejected.
- Child data is securely stored and never exposed; no child data or audio appears in logs.
- All API endpoints require authentication, authorization, and validation.

### 6. User testing validation

- Conduct testing with real users or simulated child scenarios.
- Collect feedback on usability, clarity, and engagement.
- Validate that users can follow the learning flow without confusion.

---

## 13. Constraints and Assumptions

### Constraints

- Limited project time and resources.
- Dependence on available AI models and on the capacity of the NVIDIA laptop used for
  inference.
- Home Lab infrastructure: a Docker host, an existing PostgreSQL LXC, and Tailscale for
  private access. Public production hosting is out of scope for this delivery.
- Mobile platform development constraints (performance, device compatibility).

### Assumptions

- The selected Quranic Arabic speech model can be fine-tuned effectively on Modern Standard
  Arabic content and reaches acceptable accuracy after adaptation.
- Children have basic guidance from a guardian during onboarding.
- Internet connectivity is available for pronunciation scoring; lesson browsing tolerates
  its absence.
- Firebase Authentication remains available as the only required external application
  service.

---

## 14. Team Roles

Phase 0 §17 defines three owners for a 2–3 developer team. The responsibilities below map to
that allocation.

### Backend / admin owner

- Define and maintain the overall system architecture and the API contract.
- Implement FastAPI, PostgreSQL schema and Alembic migrations, and Firebase token
  verification behind a provider-neutral interface.
- Own curriculum, content revisions, media APIs, progression rules, thresholds, stars, and
  badges — that is, everything that decides pass/fail.
- Build the administrator portal.
- Own Docker deployment, Tailscale access, backups, and health monitoring.

### Mobile owner

- Build the Expo React Native app.
- Own the bilingual and RTL/LTR design system and responsive phone/tablet layouts.
- Implement audio capture and playback, the offline lesson cache, and curriculum
  synchronization.
- Build the guardian and child experience, rendering backend results without inventing
  scoring rules.

### AI owner

- Own dataset strategy, training, and evaluation for the MSA domain.
- Maintain a separate versioned evaluation set aligned with the product domain.
- Implement and package the inference service and the versioned `/v1/evaluations` contract.
- Own model artifacts and GPU packaging.
- **Not** responsible for pass thresholds or reward tuning — those are curriculum
  configuration owned by the backend and the administrator.

### Shared across all contributors

API-contract review, integration testing, security and privacy review, documentation, and
demonstrations.

---

## 15. Risks

### 1. AI accuracy risk

The fine-tuned model may face accuracy limitations when moving from Quranic recitation-style
speech to children's Modern Standard Arabic pronunciation, especially given age, accent,
background noise, unclear speech, or limited training data.

**Mitigation:** use a well-established Quranic Arabic speech model as the base; fine-tune on
MSA content aligned with the project scope; limit MVP scope to basic letters, words, and
simple sentences; calibrate the score and per-level default thresholds against a
product-aligned validation set rather than assuming them.

### 2. Integration complexity

Difficulty integrating the mobile app, admin portal, backend, and AI service.

**Mitigation:** modular architecture with a versioned AI contract and a mock adapter, so the
clients and backend can be built and tested before real inference exists; clear ownership;
incremental integration and testing.

### 3. Performance issues

Slow AI responses may affect user experience.

**Mitigation:** optimize request handling, limit audio payload size, set an explicit
15-second end-to-end timeout with a friendly retry-later path, and benchmark real inference
on the selected hardware rather than assuming the 2-second target.

### 4. Time constraints

Risk of not completing all features within the timeline.

**Mitigation:** focus on MVP features; keep the deferred list explicit; run the mobile, backend,
and AI streams in parallel as set out in the Phase 0 roadmap.

### 5. Security and privacy risks

Potential exposure of sensitive child data.

**Mitigation:** authentication and server-side authorization on every request; minimal child
data collection; raw audio deleted after evaluation; no child data or audio in logs;
de-identified payloads to the AI service; threat modeling and security testing.

### 6. Dependency on external tools

Risk related to availability, training limitations, or deployment constraints of the selected
speech model, and on Firebase as an external service.

**Mitigation:** keep the AI service behind a provider-neutral interface so the model can be
replaced without redesigning the system; the same applies to authentication and media
storage; host inference internally so no third-party inference API is on the critical path.

---

## 16. Deliverables

### 1. Software deliverables

- Mobile application (MVP), Expo React Native.
- **Administrator portal**, React + Vite.
- Backend system with APIs for identity, child profiles, curriculum, media, progress, and
  evaluation.
- AI service exposing the versioned evaluation contract, plus a mock adapter.
- PostgreSQL database containing user data, progress, and learning content including media.

### 2. Documentation deliverables

- This document and [`phase-0-baseline.md`](phase-0-baseline.md).
- System architecture and the full diagram set
  ([`architecture/diagrams.md`](architecture/diagrams.md)).
- API documentation, generated from FastAPI's OpenAPI output.
- AI integration documentation: the base model, the adaptation performed, input/output flow,
  alignment and scoring method, the responsibility split with the backend, and the contract
  version.

### 3. Testing and evaluation deliverables

- Test cases and results for core features across unit, integration, and end-to-end suites.
- AI performance evaluation against a product-aligned MSA validation set, reported per level
  and per phoneme.
- User testing report.

### 4. Security deliverables

- Authentication and authorization design.
- Basic threat model (STRIDE over the DFD).
- Security measures documentation covering data protection, API security, retention, and
  deletion.

### 5. Presentation deliverables

- Final presentation slides, live demo, and an explanation of architecture and technical
  decisions.

### 6. Future work documentation

- Planned enhancements: AI companion, advanced personalization, teacher accounts,
  handwriting analysis, iOS release, public hosting migration.
- Identified limitations, documented honestly.

---

## 17. Remaining Validation Items

The open points listed in V2.6 — age group, level breakdown, dashboard, gamification scope,
cybersecurity scope, AI hosting, and account/profile fields — were all decided in Phase 0
and are reflected above.

What remains are implementation validations, not unresolved architecture choices. They are
tracked in [`phase-0-baseline.md`](phase-0-baseline.md) §21:

- Calibrate the score formula produced by the AI service.
- Establish per-level default pass thresholds using validation data.
- Benchmark real inference on the selected NVIDIA laptop.
- Validate the 60-second / 5 MB emergency audio limits against actual mobile formats.
- Finalize guardian consent and privacy-policy wording before real child testing.
- Confirm the exact supported Android OS and device matrix.
- Determine the future public-hosting provider only when migration is required.

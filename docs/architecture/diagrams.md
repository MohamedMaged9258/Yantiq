# Yantiq — Software Diagrams (V2.0)

This document lists **all software diagrams** required for the Yantiq graduation project.

It is derived from [`../phase-0-baseline.md`](../phase-0-baseline.md), which is the
authoritative technical baseline. Section references below (§) point into that document.
Where a diagram and the baseline disagree, the baseline wins and the diagram is a bug.

Each diagram includes its purpose, what it must show, and a Mermaid draft that can be
refined into a final deliverable.

> **What changed from V1.0.** V1.0 was drawn from the V2.6 project documentation and the
> UI prototype, both of which predate the baseline. Three errors ran through most of its
> diagrams and are corrected throughout V2.0:
>
> 1. **Stack.** Node.js/Express, Prisma, and PWA framing are replaced by FastAPI,
>    SQLAlchemy + Alembic, and Expo React Native. The admin portal, Firebase
>    Authentication, and Tailscale now appear as first-class nodes.
> 2. **Authentication.** The backend does not issue login tokens. Firebase authenticates
>    the guardian; the backend *verifies* the resulting Firebase ID token (§6.1).
> 3. **Responsibility split.** The AI service returns evaluation data only. `passed`,
>    thresholds, stars, progression, and child-facing wording belong to the backend (§9.1).
>
> The curriculum is also four levels, not five, and the hierarchy now carries an
> **Exercise** tier: `Level → Stage → Lesson → Exercise` (§3).

---

## Diagram Index

| # | Diagram | Type | Category | Status |
|---|---------|------|----------|--------|
| 1 | [System Architecture Diagram](#1-system-architecture-diagram) | Architecture | Structural | Draft below |
| 2 | [Component Diagram](#2-component-diagram) | UML Component | Structural | Draft below |
| 3 | [Deployment Diagram](#3-deployment-diagram) | UML Deployment | Structural | Draft below |
| 4 | [Use Case Diagram](#4-use-case-diagram) | UML Use Case | Behavioral | Draft below |
| 5 | [Entity-Relationship Diagram (ERD)](#5-entity-relationship-diagram-erd) | ERD | Data | Draft below |
| 6 | [Sequence Diagram — Pronunciation Evaluation](#6-sequence-diagram--pronunciation-evaluation) | UML Sequence | Behavioral | Draft below |
| 7 | [Sequence Diagram — Onboarding & Authentication](#7-sequence-diagram--onboarding--authentication) | UML Sequence | Behavioral | Draft below |
| 8 | [Activity Diagram — Daily Usage Flow](#8-activity-diagram--daily-usage-flow) | UML Activity | Behavioral | Draft below |
| 9 | [Activity Diagram — Failure Handling & Level Progression](#9-activity-diagram--failure-handling--level-progression) | UML Activity | Behavioral | Draft below |
| 10 | [Flowchart — Initial Placement Logic](#10-flowchart--initial-placement-logic) | Flowchart | Behavioral | Draft below |
| 11 | [State Diagram — Exercise / Lesson / Stage Lifecycle](#11-state-diagram--exercise--lesson--stage-lifecycle) | UML State Machine | Behavioral | Draft below |
| 12 | [Data Flow Diagram (Level 0 & 1)](#12-data-flow-diagram-level-0--1) | DFD | Data | Draft below |
| 13 | [AI Model Architecture Diagram](#13-ai-model-architecture-diagram) | Architecture | AI | Draft below |
| 14 | [AI Inference & Evaluation Pipeline](#14-ai-inference--evaluation-pipeline) | Pipeline / Flowchart | AI | Draft below |
| 15 | [Security & Authentication Flow Diagram](#15-security--authentication-flow-diagram) | Flowchart | Security | Draft below |
| 16 | [Class Diagram — Core Domain Model](#16-class-diagram--core-domain-model) | UML Class | Structural | Draft below |
| 17 | [Screen Navigation Map (UI Flow)](#17-screen-navigation-map-ui-flow) | Navigation / Sitemap | UI/UX | Draft below |

---

## A. Structural / Architecture Diagrams

### 1. System Architecture Diagram

**Purpose:** Required documentation deliverable. Shows the service boundaries defined in
§4.1: two clients, one application backend, a separate AI service, PostgreSQL, Firebase
Authentication, and the cross-cutting security layer.

```mermaid
flowchart TB
    subgraph SEC["Security layer — cross-cutting: token verification, ownership checks, validation, rate limits, structured logging"]
        subgraph CLIENTS["1. Client layer"]
            APP["Mobile app — Expo React Native<br/>lessons, audio capture/playback,<br/>offline cache, rewards display"]
            ADMIN["Admin portal — React + Vite<br/>curriculum, media, thresholds,<br/>rewards, badges"]
        end

        subgraph IDP["2. Identity provider"]
            FB["Firebase Authentication<br/>Google + email/password"]
        end

        subgraph BACKEND["3. Application backend — FastAPI"]
            API["REST API /api/v1<br/>me, children, curriculum,<br/>progress, media, admin"]
            LOGIC["Domain logic<br/>pass/fail, thresholds, stars, badges,<br/>progression, content revisions"]
            ADAPT["AI adapter<br/>mock | remote"]
        end

        subgraph AI["4. AI service — separate Python service"]
            PRE["Audio normalization<br/>decode to 16 kHz mono"]
            MODEL["Fine-tuned Wav2Vec2-BERT<br/>multi-level CTC, MSA"]
            EVAL["Phoneme alignment<br/>+ pronunciation score + confidence"]
        end

        subgraph DB["5. Data layer"]
            PG[("PostgreSQL<br/>guardian - child_profile - level - stage - lesson -<br/>exercise - media_asset - content_revision -<br/>progress - aggregates - badges")]
        end
    end

    APP -- "Firebase ID token as bearer, HTTPS" --> API
    ADMIN -- "Firebase ID token as bearer, HTTPS" --> API
    APP -- "guardian sign-in" --> FB
    ADMIN -- "administrator sign-in" --> FB
    API -- "verify ID token server-side" --> FB
    API --> LOGIC
    LOGIC --> ADAPT
    ADAPT -- "audio + expected_text + request_id<br/>no personal data" --> PRE
    PRE --> MODEL --> EVAL
    EVAL -- "score, confidence, alignment,<br/>error counts — no pass/fail" --> ADAPT
    LOGIC <--> PG
```

> **Read the two labelled edges carefully — they are what V1.0 got wrong.** The client
> sends a *Firebase ID token*, not a backend-issued JWT (§6.1). The AI service returns
> evaluation data *without* `passed`; the backend derives it (§9.1, §9.3).

---

### 2. Component Diagram

**Purpose:** Internal modules of each component and the interfaces between them.

```mermaid
flowchart LR
    subgraph Mobile["Mobile app — apps/mobile, Expo RN"]
        MNAV["navigation"]
        MAUTH["auth — Firebase SDK"]
        MCUR["curriculum + offline cache"]
        MREC["audio recorder"]
        MREW["rewards / progress UI"]
        MAPI["api client — attaches ID token"]
    end

    subgraph Admin["Admin portal — apps/admin, React + Vite"]
        ACUR["curriculum editor"]
        AMEDIA["media manager"]
        ABADGE["badge + threshold config"]
        AAPI["api client — attaches ID token"]
    end

    subgraph Backend["Application backend — services/backend, FastAPI"]
        RAUTH["auth dependency<br/>TokenVerifier interface"]
        RCHILD["children router"]
        RCUR["curriculum + manifest router"]
        RMEDIA["media router — MediaStorage"]
        REVAL["evaluation router"]
        RADMIN["admin router — role-gated"]
        SPROG["progression + rewards service"]
        SREV["content revision service"]
        AIAD["AIEvaluator interface<br/>mock | remote"]
        REPO["SQLAlchemy repositories"]
    end

    subgraph AIService["AI service — services/ai"]
        FAPI["msa/api.py — FastAPI"]
        INF["msa/inference.py"]
        PHON["msa/phonemize.py"]
        CMP["msa/compare.py"]
    end

    FBASE["Firebase Authentication"]
    PGDB[("PostgreSQL")]

    MAUTH --> FBASE
    ACUR & AMEDIA & ABADGE --> AAPI
    MNAV --> MAUTH & MCUR & MREC & MREW
    MCUR & MREC & MREW --> MAPI
    MAPI --> RAUTH
    AAPI --> RAUTH
    RAUTH -- "verify ID token" --> FBASE
    RAUTH --> RCHILD & RCUR & RMEDIA & REVAL & RADMIN
    RADMIN --> SREV
    REVAL --> SPROG
    SPROG --> AIAD
    AIAD -- "POST /v1/evaluations" --> FAPI
    FAPI --> INF
    FAPI --> PHON --> CMP
    INF --> CMP
    RCHILD & RCUR & RMEDIA & SPROG & SREV --> REPO --> PGDB
```

> `TokenVerifier`, `MediaStorage`, and `AIEvaluator` are the three provider-neutral
> interfaces required by §5.3 and §14.2. They exist so that Firebase, PostgreSQL-backed
> media, and the AI service can each be replaced without touching curriculum or progress
> logic.

---

### 3. Deployment Diagram

**Purpose:** Runtime topology — where each component actually runs during Home Lab
testing (§14.1).

```mermaid
flowchart TB
    subgraph Devices["Test devices, joined to the Tailnet"]
        MAPP["Yantiq mobile app<br/>Expo React Native — Android first"]
        BROW["Browser to admin portal<br/>React + Vite static build"]
    end

    subgraph Cloud["External service"]
        FBAUTH["Firebase Authentication"]
    end

    subgraph HomeLab["Home Lab"]
        subgraph Docker["Docker host"]
            BE["Application backend<br/>FastAPI container"]
        end
        subgraph LXC["PostgreSQL LXC"]
            RDB[("PostgreSQL<br/>+ lesson media as BYTEA")]
        end
    end

    subgraph AIHost["NVIDIA laptop"]
        AISRV["AI service<br/>FastAPI + fine-tuned MSA weights<br/>+ librosa / ffmpeg decoding"]
    end

    TS{{"Tailscale private network"}}

    MAPP -- "guardian sign-in" --> FBAUTH
    BROW -- "administrator sign-in" --> FBAUTH
    MAPP -- "HTTPS + Firebase ID token" --> TS
    BROW -- "HTTPS + Firebase ID token" --> TS
    TS --> BE
    BE -- "verify ID token, HTTPS" --> FBAUTH
    BE -- "private database connection" --> RDB
    BE -- "private versioned API" --> TS
    TS -- "POST /v1/evaluations" --> AISRV
```

> Neither PostgreSQL nor the AI service is publicly exposed (§13). During development the
> backend runs with `AI_PROVIDER=mock` and the NVIDIA-laptop node is simply absent —
> nothing else in the topology changes (§9.6).
>
> The same images can later move to AWS or Google Cloud, and Firebase Authentication can
> stay in use regardless of where application hosting ends up (§14.2).

---

## B. Behavioral Diagrams

### 4. Use Case Diagram

**Purpose:** Captures the actors (Child, Guardian, Administrator, AI Service) and the MVP
use cases from §2.2, §11, and §12.

```mermaid
flowchart LR
    GUARDIAN(["Guardian"])
    CHILD(["Child"])
    ADMINISTRATOR(["Administrator"])
    AISYS(["AI Service<br/>(supporting actor)"])

    subgraph System["Yantiq"]
        UC1(["Sign in with Google or email/password"])
        UC2(["Give consent for child use"])
        UC3(["Create / update / delete / restore child profile"])
        UC4(["Select a child profile"])
        UC5(["Review progress dashboard"])

        UC6(["Browse levels, stages and lessons"])
        UC7(["Play reference audio"])
        UC8(["Complete a listening or recognition exercise"])
        UC9(["Record a pronunciation attempt"])
        UC10(["Receive feedback, stars and badges"])
        UC11(["Browse previously cached lessons offline"])

        UC12(["Manage levels, stages, lessons and exercises"])
        UC13(["Upload and manage lesson media"])
        UC14(["Configure pass thresholds and reward values"])
        UC15(["Configure badge rules"])
        UC16(["View system health"])

        UC17(["Produce phoneme alignment and pronunciation score"])
        UC18(["Determine pass/fail, stars and progression"])
    end

    GUARDIAN --> UC1 & UC2 & UC3 & UC4 & UC5
    CHILD --> UC6 & UC7 & UC8 & UC9 & UC10 & UC11
    ADMINISTRATOR --> UC1 & UC12 & UC13 & UC14 & UC15 & UC16
    UC9 -.-> UC17
    AISYS --> UC17
    UC17 -.-> UC18
```

> **UC17 vs UC18 is the point of this diagram.** The AI service produces the measurement;
> the backend makes the judgement (§9.1). V1.0 gave "evaluate pronunciation correctness"
> to the AI actor, which is exactly the mistake the baseline forbids.
>
> Children have no accounts of their own — every child use case is authorized against the
> signed-in guardian's ownership of that profile (§6.2).

---

### 5. Entity-Relationship Diagram (ERD)

**Purpose:** Database design, built directly from the entity list in §7.1 and the
retention rules in §7.2.

```mermaid
erDiagram
    GUARDIAN ||--o{ GUARDIAN_CONSENT : "records"
    GUARDIAN ||--o{ CHILD_PROFILE : "owns"
    CHILD_PROFILE ||--o{ CHILD_EXERCISE_PROGRESS : "tracks"
    CHILD_PROFILE ||--o{ CHILD_LEVEL_PROGRESS : "tracks"
    CHILD_PROFILE ||--o{ CHILD_PHONEME_AGGREGATE : "summarizes"
    CHILD_PROFILE ||--o{ CHILD_BADGE : "earns"
    BADGE ||--o{ CHILD_BADGE : "awarded as"
    LEVEL ||--o{ STAGE : "contains"
    STAGE ||--o{ LESSON : "contains"
    LESSON ||--o{ EXERCISE : "contains"
    EXERCISE ||--o{ CHILD_EXERCISE_PROGRESS : "measured by"
    MEDIA_ASSET ||--o{ EXERCISE : "referenced by"

    GUARDIAN {
        uuid id PK
        string firebase_uid UK "external identity key"
        string email
        string preferred_language "ar | en"
        datetime created_at
        datetime deleted_at "null unless purging"
    }
    GUARDIAN_CONSENT {
        uuid id PK
        uuid guardian_id FK
        string consent_type
        string version
        datetime granted_at
        datetime withdrawn_at
    }
    CHILD_PROFILE {
        uuid id PK
        uuid guardian_id FK
        string nickname
        string age_group "no exact date of birth"
        string preset_avatar
        string status "active | hidden"
        datetime hidden_at
        datetime purge_after "hidden_at + 7 days"
    }
    LEVEL {
        uuid id PK
        int ordinal "1..4"
        string name_ar
        string name_en
        string learning_focus
    }
    STAGE {
        uuid id PK
        uuid level_id FK
        int ordinal
        string name_ar
        string name_en
    }
    LESSON {
        uuid id PK
        uuid stage_id FK
        int ordinal
        string title_ar
        string title_en
        bool is_archived
    }
    EXERCISE {
        uuid id PK
        uuid lesson_id FK
        int ordinal
        string exercise_type "letter | word | sentence"
        string expected_text "ground truth, Arabic"
        uuid reference_audio_id FK
        uuid image_id FK
        float pass_threshold "configurable per exercise"
        int star_reward
        bool is_archived
    }
    MEDIA_ASSET {
        uuid id PK
        string mime_type
        string original_filename
        int byte_size "limit starts at 5 MB"
        string sha256
        bytea payload "never base64"
        datetime created_at
        datetime updated_at
    }
    CONTENT_REVISION {
        uuid id PK
        int revision "incremented on every admin save"
        string scope
        datetime created_at
    }
    CHILD_EXERCISE_PROGRESS {
        uuid id PK
        uuid child_id FK
        uuid exercise_id FK
        float best_score
        json best_derived_evaluation
        int total_attempts
        datetime last_attempt_at
        bool completed
        int stars_awarded
    }
    CHILD_LEVEL_PROGRESS {
        uuid id PK
        uuid child_id FK
        uuid level_id FK
        uuid stage_id FK
        bool unlocked
        bool completed
        datetime completed_at
    }
    CHILD_PHONEME_AGGREGATE {
        uuid id PK
        uuid child_id FK
        string phoneme
        int error_count
        int observation_count
        datetime updated_at
    }
    BADGE {
        uuid id PK
        string code UK
        string name_ar
        string name_en
        string description_ar
        string description_en
        json rule
    }
    CHILD_BADGE {
        uuid child_id FK
        uuid badge_id FK
        datetime earned_at
    }
```

> **There is deliberately no attempt-history table.** §7.2 retains only the best score,
> the best derived evaluation, the attempt count, the last-attempt timestamp, completion
> state, stars, and phoneme aggregates. Once a new result has been compared against the
> stored best and the aggregates updated, the individual result is discarded and the raw
> audio is deleted.
>
> Also deliberately absent: `streakDays` / `longestStreak` (streak pressure mechanics are
> deferred by §2.3), and any exact date of birth or child photograph (§6.2).
>
> `CONTENT_REVISION` stands alone rather than joining to a parent — it is the
> monotonically increasing counter mobile clients compare against to decide whether to
> resynchronize (§8.2).

---

### 6. Sequence Diagram — Pronunciation Evaluation

**Purpose:** The core AI interaction (§9). This diagram is where the responsibility split
has to be unambiguous.

```mermaid
sequenceDiagram
    actor Child
    participant App as Mobile app
    participant BE as Backend (FastAPI)
    participant DB as PostgreSQL
    participant AI as AI service

    App->>Child: Show target + play reference audio
    Child->>App: Starts recording, speaks, stops manually
    Note over App: No countdown. Technical cap only:<br/>60 s and 5 MB (§9.5)
    App->>BE: POST /api/v1/children/{child_id}/exercises/{exercise_id}/evaluate<br/>multipart audio + Firebase ID token
    BE->>BE: Verify ID token, confirm guardian owns child,<br/>validate upload type and size
    BE->>DB: Load exercise expected_text, type and pass_threshold
    BE->>BE: Generate non-identifying request_id
    BE->>AI: POST /v1/evaluations<br/>audio, request_id, expected_text,<br/>exercise_type, language=ar-MSA
    Note over BE,AI: No guardian id, child id, nickname<br/>or Firebase uid crosses this boundary (§9.2)
    AI->>AI: Normalize to 16 kHz mono, run inference,<br/>align phonemes, compute score
    AI-->>BE: score, confidence, phoneme_error_rate,<br/>alignment, error_counts, feedback_codes,<br/>model_version — no pass/fail
    BE->>BE: Apply threshold, compare with personal best,<br/>award stars and badges, pick message key
    BE->>DB: Update best result, attempt count,<br/>phoneme aggregates, completion state
    BE->>BE: Delete raw audio
    BE-->>App: score, best_score, improvement,<br/>is_new_personal_best, passed,<br/>stars_awarded, badge_awarded, feedback
    App->>Child: Render the backend result — animation, stars, encouragement
```

**Failure path (§9.5):** the backend-to-AI timeout is 15 s initially. On timeout or error
the audio is deleted, nothing is queued on the device or the backend, and the child gets a
friendly retry-later result.

---

### 7. Sequence Diagram — Onboarding & Authentication

**Purpose:** Guardian-driven first-time experience (§6.1, §6.2). **The backend never
issues a login token.**

```mermaid
sequenceDiagram
    actor Guardian
    participant App as Mobile app
    participant FB as Firebase Authentication
    participant BE as Backend (FastAPI)
    participant DB as PostgreSQL

    Guardian->>App: Choose Google or email/password sign-in
    App->>FB: Firebase SDK sign-in
    FB-->>App: Firebase ID token (and uid)
    Note over FB: Firebase also owns email verification<br/>where applicable (§2.2)
    App->>BE: GET /api/v1/me with bearer ID token
    BE->>FB: Verify ID token server-side
    FB-->>BE: Verified claims including uid
    BE->>DB: Find or create guardian by firebase_uid
    DB-->>BE: Guardian record
    BE-->>App: Guardian profile and preferences

    Guardian->>App: Give consent for child use
    App->>BE: Record consent (type, version, timestamp)
    BE->>DB: Insert guardian_consent

    Guardian->>App: Create child profile (nickname, age group, preset avatar)
    App->>BE: POST /api/v1/children
    BE->>DB: Insert child_profile under this guardian
    BE-->>App: Child profile
    Guardian->>App: Select the child profile and hand over the device
    Note over App: Children have no accounts. Every child<br/>request is authorized against the<br/>guardian's ownership (§6.2)
```

> Administrators use the **same** Firebase project. The backend grants admin access only
> to a privately provisioned UID/role, and re-checks that role on every `/api/v1/admin/...`
> request. A client-side admin screen is not an authorization control (§6.3).

---

### 8. Activity Diagram — Daily Usage Flow

**Purpose:** The daily loop: open app → continue lesson → exercise → reward → unlock.

```mermaid
flowchart TD
    A([Open app]) --> B{Guardian signed in?}
    B -- No --> C[Firebase sign-in] --> D
    B -- Yes --> D[Select child profile]
    D --> E[Sync curriculum if online<br/>compare local vs current content revision]
    E --> F[Continue last lesson or pick next stage]
    F --> G[Exercise: listen, recognize or pronounce]
    G --> H{Online?}
    H -- No --> I[Pronunciation disabled<br/>connection-required message<br/>cached lessons remain browsable]
    I --> F
    H -- Yes --> J[Backend evaluates the attempt<br/>and applies the configured threshold]
    J --> K{Backend says passed?}
    K -- Yes --> L[Backend awards stars, badges<br/>and updates aggregates]
    L --> M{Lesson and stage complete?}
    M -- Yes --> N[Backend unlocks next stage or level]
    M -- No --> F
    K -- No --> O[Failure handling — see Diagram 9]
    O --> F
    N --> P([End session — progress already persisted])
```

> Every decision diamond here is evaluated **server-side**. The app renders outcomes; it
> does not compute them (§9.1).

---

### 9. Activity Diagram — Failure Handling & Level Progression

**Purpose:** The encouragement-first failure approach (§12) and rule-based progression.

```mermaid
flowchart TD
    A([Attempt evaluated by backend]) --> B{Score >= exercise threshold?}
    B -- Yes --> C[Record best score, award stars]
    C --> C2{New personal best?}
    C2 -- Yes --> C3[Celebration]
    C2 -- No --> C4[Show comparison with personal best]
    C3 & C4 --> D{Stage progression rules met?}
    D -- Yes --> E([Unlock next stage or level])
    D -- No --> F([Continue remaining exercises])
    B -- No --> G{Consecutive failures on this exercise}
    G -- "early failures" --> H[Encouragement + hint<br/>+ replay reference audio]
    H --> I([Allow retry])
    G -- "repeated difficulty" --> J[Route to a simpler existing exercise<br/>rule-based, not AI-generated]
    J --> I
```

> Two constraints from the baseline: the simpler fallback is **selected from the existing
> curriculum by a rule**, not generated by the AI (§12); and a later threshold change never
> un-completes an already-completed lesson — it applies only to future attempts (§3).

---

### 10. Flowchart — Initial Placement Logic

**Purpose:** Choosing a child's starting point in the four-level curriculum.

```mermaid
flowchart TD
    A([Child profile created]) --> B[Read age group]
    B --> C{Prior Arabic exposure<br/>reported by guardian}
    C -- "none" --> D[Start at Level 1<br/>letter recognition and basic sounds]
    C -- "some" --> E[Start at Level 1 or 2<br/>by age group]
    C -- "familiar" --> F[Start at Level 2<br/>forms, positions and diacritics]
    D & E & F --> G[Begin first lesson]
    G --> H{Guardian reports the level is too easy?}
    H -- Yes --> I[Offer a short placement check]
    I --> J[Backend re-assigns the starting level]
    H -- No --> K([Continue the assigned path])
    J --> K
```

> Placement never skips past Level 2 — Levels 3 and 4 (words, then short sentences) are
> reached through progression, not assignment (§3).

---

### 11. State Diagram — Exercise / Lesson / Stage Lifecycle

**Purpose:** The unlock and completion states that drive gamification and progression.
V1.0 modelled only stage and lesson; the Exercise tier needs its own lifecycle.

**Exercise:**

```mermaid
stateDiagram-v2
    [*] --> NotAttempted
    NotAttempted --> Attempted: first attempt evaluated
    Attempted --> Attempted: retry, hint, or simpler fallback
    Attempted --> Completed: score >= configured threshold
    Completed --> Completed: replay improves personal best
    note right of Completed
        Stays Completed if an administrator
        later raises the threshold (§3).
        The new value applies to future
        attempts only.
    end note
```

**Lesson and stage:**

```mermaid
stateDiagram-v2
    [*] --> Locked
    Locked --> Unlocked: previous stage progression rules met
    Unlocked --> InProgress: child starts a lesson
    InProgress --> InProgress: exercises attempted and retried
    InProgress --> Completed: all required exercises completed
    Completed --> Mastered: full stars across the stage
    Completed --> InProgress: replay for more stars
    Mastered --> [*]
```

---

## C. Data Diagrams

### 12. Data Flow Diagram (Level 0 & 1)

**Purpose:** How data moves through the system — the basis for both the report and the
STRIDE threat model.

**Level 0 (context):**

```mermaid
flowchart LR
    P(["Guardian"]) -- "sign-in, consent, child profile" --> S((Yantiq system))
    C(["Child"]) -- "voice input, answers" --> S
    AD(["Administrator"]) -- "curriculum, media, thresholds" --> S
    S -- "feedback, rewards, lessons" --> C
    S -- "progress reports" --> P
    S -- "content revision" --> AD
    S <-- "identity verification" --> FB(["Firebase Authentication"])
    S -- "audio + expected text, de-identified" --> AI(["AI service"])
    AI -- "evaluation data" --> S
```

**Level 1:**

```mermaid
flowchart LR
    CHILD(["Child"]) -- "audio" --> P1["1.0 Capture and<br/>upload audio"]
    FBE(["Firebase Authentication"]) -- "verified uid" --> P0["0.0 Verify token and<br/>check ownership"]
    P1 --> P0
    P0 -- "audio + exercise_id" --> P2["2.0 Request evaluation"]
    GT[("D1: Curriculum<br/>levels, stages, lessons,<br/>exercises, expected text,<br/>thresholds, media")] --> P2
    P2 -- "audio + expected_text<br/>+ request_id only" --> AISVC(["AI service"])
    AISVC -- "score, alignment,<br/>error counts" --> P3["3.0 Apply thresholds,<br/>stars and progression"]
    GT --> P3
    P3 --> PR[("D2: Progress, aggregates,<br/>badges — best result only")]
    P3 -- "feedback + stars" --> CHILD
    P3 -- "delete raw audio" --> X["audio discarded"]
    PR --> P4["4.0 Progress reporting"]
    P4 -- "dashboard data" --> PARENT(["Guardian"])
    ADMINA(["Administrator"]) --> P5["5.0 Author content"]
    P5 --> GT
    P5 --> REV[("D3: Content revision")]
    REV --> P6["6.0 Publish manifest"]
    P6 -- "manifest + checksums" --> CHILD
```

> Two trust boundaries matter for the threat model: **P0** (nothing proceeds without a
> verified Firebase uid and a confirmed guardian-owns-child check) and the **P2 → AI
> service** edge (de-identified payload only, and the audio is destroyed on both sides once
> evaluation finishes).

---

## D. AI Diagrams

### 13. AI Model Architecture Diagram

**Purpose:** Required for AI integration documentation. Based on
[`../../services/ai/MODEL.md`](../../services/ai/MODEL.md) — a Wav2Vec2-BERT encoder with
multi-level CTC heads, adapted from Quranic recitation to MSA.

```mermaid
flowchart TB
    A["Audio waveform<br/>16 kHz, mono"] --> B["Feature extractor<br/>160-dim mel-style features, ~10 ms/frame"]
    B --> C["Wav2Vec2-BERT encoder<br/>pre-trained on 53k h multilingual speech, frozen"]
    C -- "hidden states (batch, time, 1024)" --> D["Dropout + ModuleDict of heads<br/>level_to_lm_head"]
    D --> E1["Phonemes head — Linear, 35 MSA classes"]
    D --> E2["Tajweed head — Linear"]
    D --> E3["Sifat head — Linear"]
    E1 --> F["CTC decoding"]
    F --> G["Phoneme sequence"]

    style E2 stroke-dasharray: 5 5
    style E3 stroke-dasharray: 5 5
```

> Dashed heads are Quranic-specific heads inherited from the base model
> (`obadx/muaalem-model-v3_2`); the MSA fine-tune resizes and trains the phoneme head only
> (43 → 35 classes) and keeps the encoder frozen.
>
> **Scope caveat from §5.4:** Quranic recitation data may support pretraining or
> augmentation, but Modern Standard Arabic is the product domain, and Quranic-recitation
> validation alone is not sufficient to claim child-MSA performance (§16.2).

---

### 14. AI Inference & Evaluation Pipeline

**Purpose:** The end-to-end flow inside the AI service
([`../../services/ai/src/quran_muaalem/msa/`](../../services/ai/src/quran_muaalem/msa/)).

```mermaid
flowchart LR
    A["Upload<br/>wav / flac / ogg / mp3 / m4a / webm"] --> B["api.py<br/>decode via libsndfile,<br/>ffmpeg fallback, to 16 kHz mono f32"]
    B --> C["inference.py<br/>forward pass, CTC decode, alignment"]
    C -- "recognized phonemes<br/>+ per-phoneme confidence" --> E["compare.py"]
    D["expected_text from the exercise"] --> P["phonemize.py<br/>text to expected phonemes"]
    P -- "expected phonemes" --> E
    E --> F["Alignment and diff<br/>match / substitution / omission / insertion"]
    F --> G["pronunciation_score, confidence,<br/>phoneme_error_rate, error_counts,<br/>feedback_codes, model_version"]
    G --> H["JSON response — schema_version 1.0<br/>NO passed value"]
    H --> BE(["Backend applies the threshold<br/>and decides pass/fail"])
```

> **Implementation gap, stated honestly.** The service today exposes `/health`,
> `/transcribe`, `/align`, `/compare` and `/debug`. `/compare` already produces the
> alignment, edit operations, counts and phoneme error rate; it does **not** yet produce
> `pronunciation_score`, `confidence`, `model_version` or `feedback_codes`, and there is no
> `/v1/evaluations` route. Closing that gap is Phase 5 work — see
> [`../../contracts/ai-api/README.md`](../../contracts/ai-api/README.md).

---

## E. Security Diagrams

### 15. Security & Authentication Flow Diagram

**Purpose:** Security deliverable — authentication, authorization, and protection of child
data across all layers (§13).

```mermaid
flowchart TD
    A([Guardian or administrator]) --> B["Sign in with Firebase<br/>Google or email/password"]
    B --> C{Firebase authenticates}
    C -- No --> B
    C -- Yes --> D["Firebase issues an ID token<br/>(the backend issues nothing)"]
    D --> E["Client attaches the ID token<br/>as a bearer on every request"]
    E --> F{"Backend: verify ID token<br/>against Firebase, server-side"}
    F -- Invalid or expired --> G([401 rejected])
    F -- Valid --> H{"Authorization:<br/>guardian owns this child?<br/>admin role for /admin routes?"}
    H -- No --> I([403 rejected])
    H -- Yes --> J["Validation and abuse controls<br/>upload type and size, 60 s / 5 MB audio cap,<br/>rate limits on auth-sensitive and evaluation routes"]
    J --> K["Domain logic and database access<br/>minimal child data, restricted CORS for the portal"]
    K --> L["Structured JSON logs<br/>request IDs and internal UUIDs only<br/>no child data, no audio"]
    K -. "de-identified payload over Tailscale<br/>no guardian id, child id, nickname or uid" .-> M["AI service"]
    M -. "raw audio deleted after evaluation<br/>or after failure" .-> N([Audio destroyed])
    E -. "HTTPS everywhere; Tailscale-only during Home Lab testing" .-> F
```

> A companion **STRIDE threat model** over DFD Level 1 (Diagram 12) is part of the security
> deliverables and derives directly from that diagram's two trust boundaries.
>
> Deletion is also a security control: a deleted child profile is hidden immediately, then
> permanently purged with its dependent progress and reward data after seven days (§7.3).

---

## F. Supporting Diagrams

### 16. Class Diagram — Core Domain Model

**Purpose:** Object-oriented view of the backend domain, complementing the ERD.

```mermaid
classDiagram
    class Guardian {
        +UUID id
        +string firebaseUid
        +string email
        +string preferredLanguage
        +ChildProfile[] children
        +GuardianConsent[] consents
    }
    class ChildProfile {
        +UUID id
        +string nickname
        +string ageGroup
        +string presetAvatar
        +ProfileStatus status
        +DateTime purgeAfter
    }
    class Level {
        +int ordinal
        +string nameAr
        +string nameEn
        +Stage[] stages
    }
    class Stage {
        +int ordinal
        +Lesson[] lessons
    }
    class Lesson {
        +int ordinal
        +string titleAr
        +string titleEn
        +bool isArchived
        +Exercise[] exercises
    }
    class Exercise {
        +int ordinal
        +ExerciseType type
        +string expectedText
        +UUID referenceAudioId
        +float passThreshold
        +int starReward
    }
    class ChildExerciseProgress {
        +float bestScore
        +int totalAttempts
        +DateTime lastAttemptAt
        +bool completed
        +int starsAwarded
    }
    class ChildPhonemeAggregate {
        +string phoneme
        +int errorCount
        +int observationCount
    }
    class Badge {
        +string code
        +Object rule
    }
    class MediaAsset {
        +string mimeType
        +int byteSize
        +string sha256
    }
    class ContentRevision {
        +int revision
        +DateTime createdAt
    }

    class AIEvaluation {
        <<AI service output>>
        +string schemaVersion
        +string modelVersion
        +float pronunciationScore
        +float confidence
        +float phonemeErrorRate
        +Alignment[] alignment
        +ErrorCounts errorCounts
        +string[] feedbackCodes
    }
    class ExerciseResult {
        <<backend output>>
        +float score
        +float bestScore
        +float improvement
        +bool isNewPersonalBest
        +bool passed
        +int starsAwarded
        +Badge badgeAwarded
        +string messageKey
        +string[] difficultSounds
    }

    Guardian "1" --> "*" ChildProfile
    ChildProfile "1" --> "*" ChildExerciseProgress
    ChildProfile "1" --> "*" ChildPhonemeAggregate
    ChildProfile "1" --> "*" Badge : earns
    Level "1" --> "*" Stage
    Stage "1" --> "*" Lesson
    Lesson "1" --> "*" Exercise
    Exercise "1" --> "*" ChildExerciseProgress
    Exercise --> MediaAsset : references
    AIEvaluation ..> ExerciseResult : input to
    ExerciseResult ..> ChildExerciseProgress : updates
```

> **`AIEvaluation` and `ExerciseResult` are two different classes on purpose.** The AI
> service produces the first; the backend combines it with the exercise threshold and the
> stored personal best to produce the second (§9.3, §9.4). V1.0 collapsed both into a single
> `PronunciationResult` carrying `passed` and a human-readable `feedback` string "produced
> by AI" — that class does not exist in this design.
>
> `messageKey` is a translation key, not a sentence: child-facing wording is chosen by the
> backend and localized by the client.

---

### 17. Screen Navigation Map (UI Flow)

**Purpose:** UI/UX deliverable. Two separate applications, two separate maps.

**Mobile app (`apps/mobile`):**

```mermaid
flowchart LR
    SPLASH["Splash / language choice"] --> SIGNIN["Guardian sign-in<br/>Google or email/password"]
    SIGNIN --> CONSENT["Consent"]
    CONSENT --> PROFILES["Child profiles"]
    SIGNIN --> PROFILES
    PROFILES --> CREATE["Create child profile"]
    CREATE --> PLACE["Placement"]
    PLACE --> HOME["Home / continue learning"]
    PROFILES --> HOME
    HOME --> LEVELS["Level map — 4 levels"]
    LEVELS --> STAGES["Stage list"]
    STAGES --> LESSON["Lesson"]
    LESSON --> EX["Exercise<br/>listen / recognize / pronounce"]
    EX --> REC["Record and score<br/>animated scoring screen"]
    REC --> RESULT["Result — stars, personal best"]
    RESULT --> LESSON
    HOME --> BADGES["Badges"]
    HOME --> DASH["Guardian dashboard<br/>progress, activity, difficult sounds"]
    HOME --> SETTINGS["Settings — language, profiles"]
    SETTINGS --> PRIVACY["Privacy and consent"]
    SETTINGS --> DELETE["Delete profile<br/>7-day recovery window"]
```

**Admin portal (`apps/admin`) — a separate application, not a screen inside the mobile app:**

```mermaid
flowchart LR
    ASIGNIN["Administrator sign-in<br/>same Firebase project, provisioned role"] --> ADASH["Curriculum overview"]
    ADASH --> ALEVEL["Levels"]
    ALEVEL --> ASTAGE["Stages"]
    ASTAGE --> ALESSON["Lessons"]
    ALESSON --> AEX["Exercises<br/>expected text, threshold, rewards"]
    AEX --> AMEDIA["Media library — upload, replace"]
    ADASH --> ABADGE["Badges"]
    ADASH --> AHEALTH["System health"]
```

> Every screen is built and tested in both Arabic and English, with RTL and LTR layouts,
> on phone and tablet breakpoints (§5.1, §16.3).

---

## Deliverable Mapping

| Deliverable | Diagrams |
|---|---|
| System architecture diagram | 1, 2, 3 |
| API documentation support | 6, 7 (request/response flows) |
| AI integration documentation | 13, 14, 6 |
| Authentication and authorization design | 15, 7 |
| Basic threat model | 12 (DFD as STRIDE basis), 15 |
| Database design | 5, 16 |
| User testing and UX documentation | 17, 8, 9, 10 |
| Final presentation | 1, 4, 6, 13 (recommended core set) |

---

*Derived from [`../phase-0-baseline.md`](../phase-0-baseline.md) and the AI service code in
`services/ai/`. Diagrams are Mermaid drafts — refine in draw.io or PlantUML for the final
report where formal UML notation is required.*

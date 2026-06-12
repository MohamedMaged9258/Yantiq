# Yantiq — Software Diagrams (V1.0)

This document lists **all software diagrams** required for the Yantiq graduation project, based on the project documentation (V2.6) and the working prototype (`Prototype/`) and AI model stack (`Model/`).

Each diagram includes: its purpose, what it must show, and a Mermaid draft that can be refined into a final deliverable.

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
| 11 | [State Diagram — Stage / Lesson Lifecycle](#11-state-diagram--stage--lesson-lifecycle) | UML State Machine | Behavioral | Draft below |
| 12 | [Data Flow Diagram (Level 0 & 1)](#12-data-flow-diagram-level-0--1) | DFD | Data | Draft below |
| 13 | [AI Model Architecture Diagram](#13-ai-model-architecture-diagram) | Architecture | AI | Draft below |
| 14 | [AI Inference & Evaluation Pipeline](#14-ai-inference--evaluation-pipeline) | Pipeline / Flowchart | AI | Draft below |
| 15 | [Security & Authentication Flow Diagram](#15-security--authentication-flow-diagram) | Flowchart | Security | Draft below |
| 16 | [Class Diagram — Core Domain Model](#16-class-diagram--core-domain-model) | UML Class | Structural | Draft below |
| 17 | [Screen Navigation Map (UI Flow)](#17-screen-navigation-map-ui-flow) | Navigation / Sitemap | UI/UX | Draft below |

---

## A. Structural / Architecture Diagrams

### 1. System Architecture Diagram

**Purpose:** Required documentation deliverable (§16.2). Shows the five layers defined in §11 of the project documentation: Mobile App, Main Backend, AI Service Layer, Database, and the cross-cutting Security Layer.

```mermaid
flowchart TB
    subgraph SEC["🛡 Security Layer (cross-cutting: auth, validation, encryption, logging)"]
        subgraph MOBILE["1. Mobile Application Layer"]
            APP["Mobile App<br/>(lessons, audio recording/playback,<br/>rewards, progress display)"]
        end

        subgraph BACKEND["2. Main Backend Server"]
            API["REST API<br/>(auth, children, levels, progress,<br/>sessions, badges)"]
            LOGIC["Core Logic<br/>(lesson progression, scoring records,<br/>rewards, placement)"]
        end

        subgraph AI["3. AI Service Layer (FastAPI)"]
            PRE["Audio Preprocessing<br/>(decode, resample 16 kHz mono)"]
            MODEL["Fine-tuned Wav2Vec2-BERT<br/>Multi-Level CTC (MSA)"]
            EVAL["Ground-Truth Comparison<br/>+ Correctness Scoring + Feedback"]
        end

        subgraph DB["4. Database Layer (Relational)"]
            PG[("Users · Children · Levels · Stages ·<br/>Lessons · Progress · Sessions · Badges")]
        end
    end

    APP -- "HTTPS + JWT" --> API
    API --> LOGIC
    LOGIC -- "audio + ground truth" --> PRE
    PRE --> MODEL --> EVAL
    EVAL -- "score, passed, feedback" --> LOGIC
    LOGIC <--> PG
```

---

### 2. Component Diagram

**Purpose:** Shows internal modules of each layer and their interfaces, mapped to the actual prototype code.

```mermaid
flowchart LR
    subgraph Client["Client (Prototype/client)"]
        ROUTER["router.js"]
        AUTHM["auth.js"]
        DASH["dashboard.js"]
        PRON["pronunciation.js"]
        QUIZ["quiz.js"]
        PROG["progress.js"]
        REW["rewards.js / badges.js"]
        APIC["api.js (API client layer)"]
        STORE["storage.js (local state)"]
    end

    subgraph Backend["Backend (planned — mocked in prototype)"]
        AUTHS["Auth Service"]
        CHILD["Children Service"]
        LESSON["Levels/Lessons Service"]
        PROGS["Progress Service"]
        SESS["Sessions Service"]
        BADGE["Badges Service"]
    end

    subgraph AIService["AI Service (Model/src/quran_muaalem/msa)"]
        FAPI["api.py (FastAPI)"]
        INF["inference.py"]
        PHON["phonemize.py (text → phonemes)"]
        CMP["compare.py (ground-truth comparison)"]
    end

    ROUTER --> AUTHM & DASH & PRON & QUIZ
    AUTHM & DASH & PRON & QUIZ & PROG & REW --> APIC
    APIC --> AUTHS & CHILD & LESSON & PROGS & SESS & BADGE
    PROGS --> FAPI
    FAPI --> INF
    FAPI --> PHON --> CMP
    INF --> CMP
```

---

### 3. Deployment Diagram

**Purpose:** Shows physical/runtime topology — where each component runs (§11, AI Deployment Strategy: AI service hosted internally or on a controlled server).

```mermaid
flowchart TB
    subgraph Device["📱 Child / Guardian Device"]
        MAPP["Mobile App (PWA / mobile client)"]
    end

    subgraph AppServer["☁️ Application Server"]
        BE["Backend API (Node.js / Express)"]
    end

    subgraph DBServer["🗄 Database Server"]
        RDB[("Relational DB (PostgreSQL via Prisma)")]
    end

    subgraph AIHost["🖥 AI Host (university infra / GPU server)"]
        AISRV["FastAPI MSA Service<br/>+ fine-tuned model weights<br/>+ ffmpeg/librosa audio decoding"]
    end

    MAPP -- "HTTPS / REST + JWT" --> BE
    BE -- "SQL (TLS)" --> RDB
    BE -- "HTTP multipart (audio upload)" --> AISRV
```

---

## B. Behavioral Diagrams

### 4. Use Case Diagram

**Purpose:** Captures actors (Child, Parent/Guardian, Admin, AI Service) and the MVP use cases from §6, §10, and the prototype pages.

```mermaid
flowchart LR
    CHILD(["👧 Child"])
    PARENT(["👤 Parent / Guardian"])
    ADMIN(["🛠 Admin"])
    AISYS(["🤖 AI Speech Service"])

    subgraph Yantiq["Yantiq System"]
        UC1(["Register & verify account"])
        UC2(["Create child profile"])
        UC3(["Take placement test"])
        UC4(["Complete lesson (listen & repeat)"])
        UC5(["Record pronunciation attempt"])
        UC6(["Receive feedback & score"])
        UC7(["Take quiz"])
        UC8(["Earn stars / badges / unlock levels"])
        UC9(["View progress dashboard"])
        UC10(["Manage settings & consent"])
        UC11(["Manage content (levels/lessons)"])
        UC12(["Evaluate pronunciation correctness"])
    end

    PARENT --> UC1 & UC2 & UC3 & UC9 & UC10
    CHILD --> UC4 & UC5 & UC6 & UC7 & UC8
    ADMIN --> UC11
    UC5 --> UC12
    AISYS --> UC12
```

> Note: Mermaid has no native use-case notation; for the final report this can be redrawn in draw.io / PlantUML with proper oval notation.

---

### 5. Entity-Relationship Diagram (ERD)

**Purpose:** Database Layer design (§11.4), derived from `Prototype/shared/types/index.js`.

```mermaid
erDiagram
    USER ||--o{ CHILD : "has"
    CHILD ||--o{ PROGRESS : "tracks"
    CHILD ||--o{ SESSION : "performs"
    CHILD ||--o{ CHILD_BADGE : "earns"
    BADGE ||--o{ CHILD_BADGE : "awarded as"
    LEVEL ||--o{ STAGE : "contains"
    STAGE ||--o{ LESSON : "contains"
    STAGE ||--o{ PROGRESS : "measured by"
    LESSON ||--o{ SESSION : "attempted in"

    USER {
        string id PK
        string email
        string firstName
        string lastName
        string phone
        enum role "PARENT | ADMIN"
        boolean isVerified
        datetime createdAt
    }
    CHILD {
        string id PK
        string parentId FK
        string name
        string nickname
        int age
        string avatar
        enum arabicExposure "NONE | SOME | FAMILIAR"
        int totalStars
        int totalLessons
        int streakDays
        int longestStreak
        date lastActiveDate
    }
    LEVEL {
        string id PK
        int number
        string nameEn
        string nameAr
        string description
        int totalStages
    }
    STAGE {
        string id PK
        string levelId FK
        int number
        string nameEn
        string nameAr
        string[] letters
    }
    LESSON {
        string id PK
        string stageId FK
        int number
        enum type "PRONUNCIATION | QUIZ | LISTENING | REVIEW | WORD"
        string letterAr
        string wordAr
        json tashkeelForms
        json quizContent
        int xpReward
    }
    PROGRESS {
        string id PK
        string childId FK
        string stageId FK
        int stars "0-3"
        boolean completed
        datetime completedAt
        float bestAccuracy
        int totalAttempts
    }
    SESSION {
        string id PK
        string childId FK
        string lessonId FK
        float score
        float accuracyPct
        int durationSeconds
        int attempts
        boolean completed
        int starsEarned
        int xpEarned
        string aiFeedback
        datetime startedAt
        datetime completedAt
    }
    BADGE {
        string id PK
        string name
        string description
        string icon
        enum category "SPEAKING | STREAK | COMPLETION | SPEED | ACCURACY | SPECIAL"
        json requirement
    }
    CHILD_BADGE {
        string childId FK
        string badgeId FK
        datetime earnedAt
    }
```

---

### 6. Sequence Diagram — Pronunciation Evaluation

**Purpose:** The core AI interaction (§10, Speaking Interaction Flow). Must demonstrate the ≤ 2 s response-time target end to end.

```mermaid
sequenceDiagram
    actor Child
    participant App as Mobile App
    participant BE as Backend API
    participant AI as AI Service (FastAPI)
    participant DB as Database

    App->>Child: Present target (letter/word/sentence) + play reference audio
    Child->>App: Speaks / repeats target
    App->>App: Record audio (mic)
    App->>BE: POST /attempts {audio, lessonId} (JWT)
    BE->>DB: Fetch ground truth for lesson
    BE->>AI: POST /evaluate {audio, ground_truth_text}
    AI->>AI: Decode + resample audio (16 kHz mono)
    AI->>AI: Wav2Vec2-BERT inference → phoneme sequence
    AI->>AI: Phonemize ground truth, compare sequences
    AI-->>BE: {score, passed, errorType, feedback}
    BE->>DB: Save Session (score, accuracy, attempts)
    BE->>DB: Update Progress, stars, XP, streak
    BE-->>App: PronunciationResult
    App->>Child: Guided + encouraging feedback (stars, animation)
```

---

### 7. Sequence Diagram — Onboarding & Authentication

**Purpose:** Guardian-driven first-time experience (§10) and the authentication model (guardian account, child profile under it).

```mermaid
sequenceDiagram
    actor Parent
    participant App as Mobile App
    participant BE as Backend API
    participant Mail as Email Service
    participant DB as Database

    Parent->>App: Register (email, password, consent)
    App->>BE: POST /auth/register
    BE->>DB: Create User (role=PARENT, isVerified=false)
    BE->>Mail: Send verification email
    Parent->>App: Open verification link
    App->>BE: POST /auth/verify-email {token}
    BE->>DB: Set isVerified=true
    App->>BE: POST /auth/login
    BE-->>App: accessToken + refreshToken (JWT)
    Parent->>App: Create child profile (name, age, exposure)
    App->>BE: POST /children
    BE->>DB: Create Child under guardian
    App->>BE: POST /children/:id/placement
    BE-->>App: Initial level assigned
    App->>Parent: Hand device to child → start first lesson
```

---

### 8. Activity Diagram — Daily Usage Flow

**Purpose:** The §10 Daily Usage Flow: open app → continue lesson → short activity → reward → unlock.

```mermaid
flowchart TD
    A([Open app]) --> B{Logged in?}
    B -- No --> C[Guardian login] --> D
    B -- Yes --> D[Load child profile & progress]
    D --> E[Continue last lesson / pick next stage]
    E --> F[Short lesson activity<br/>listen → repeat → evaluate]
    F --> G{Passed criteria?}
    G -- Yes --> H[Award stars / XP / badges]
    H --> I{Stage complete?}
    I -- Yes --> J[Unlock next stage/level]
    I -- No --> E
    G -- No --> K[Failure handling<br/>see Diagram 9]
    K --> E
    J --> L([End session — progress saved])
```

---

### 9. Activity Diagram — Failure Handling & Level Progression

**Purpose:** The hybrid failure approach (§10): first failures → hint + retry; persistent failure → simpler fallback task. Plus must-pass progression.

```mermaid
flowchart TD
    A([Attempt evaluated]) --> B{Correct?}
    B -- Yes --> C[Record score, award stars]
    C --> D{Must-pass criteria met<br/>for stage?}
    D -- Yes --> E([Unlock next stage / level])
    D -- No --> F([Continue remaining lessons])
    B -- No --> G{Failure count}
    G -- "1st–2nd failure" --> H[Show hint + play reference audio]
    H --> I([Allow retry])
    G -- "3rd+ failure" --> J[Provide simpler version of task<br/>e.g. isolated letter instead of word]
    J --> I
```

---

### 10. Flowchart — Initial Placement Logic

**Purpose:** §10 Initial Placement Logic: level from age + Arabic exposure, optional placement test.

```mermaid
flowchart TD
    A([Child profile created]) --> B[Read age + Arabic exposure level]
    B --> C{Exposure}
    C -- NONE --> D[Start at Level 1<br/>letter recognition]
    C -- SOME --> E[Start at Level 1–2<br/>based on age]
    C -- FAMILIAR --> F[Start at Level 2+<br/>based on age]
    D & E & F --> G[Begin first lesson]
    G --> H{Level feels too easy?}
    H -- Yes --> I[Offer placement test]
    I --> J[Re-assign level from test result]
    H -- No --> K([Continue assigned path])
    J --> K
```

---

### 11. State Diagram — Stage / Lesson Lifecycle

**Purpose:** Models the unlock/progress/completion states that drive gamification and progression.

```mermaid
stateDiagram-v2
    [*] --> Locked
    Locked --> Unlocked: previous stage passed
    Unlocked --> InProgress: child starts lesson
    InProgress --> InProgress: retry / hint / fallback task
    InProgress --> Completed: must-pass criteria met
    Completed --> Mastered: 3 stars / best accuracy
    Completed --> InProgress: replay for more stars
    Mastered --> [*]
```

---

## C. Data Diagrams

### 12. Data Flow Diagram (Level 0 & 1)

**Purpose:** Shows how data moves through the system — useful for both the report and the security threat model.

**Level 0 (context):**

```mermaid
flowchart LR
    P(["Parent/Guardian"]) -- "account data, consent" --> S((Yantiq System))
    C(["Child"]) -- "voice input, answers" --> S
    S -- "feedback, rewards, lessons" --> C
    S -- "progress reports" --> P
```

**Level 1:**

```mermaid
flowchart LR
    CHILD(["Child"]) -- "audio" --> P1["1.0 Capture &<br/>upload audio"]
    P1 -- "audio + lessonId" --> P2["2.0 Speech<br/>evaluation"]
    GT[("D1: Lesson content<br/>+ ground truth")] --> P2
    P2 -- "score, feedback" --> P3["3.0 Scoring &<br/>rewards"]
    P3 --> PR[("D2: Progress,<br/>sessions, badges")]
    P3 -- "feedback + stars" --> CHILD
    PR --> P4["4.0 Progress<br/>reporting"]
    P4 -- "dashboard data" --> PARENT(["Parent"])
```

---

## D. AI Diagrams

### 13. AI Model Architecture Diagram

**Purpose:** Required for AI integration documentation (§16.2). Based on `Model/MODEL.md` — Wav2Vec2-BERT encoder with multi-level CTC heads, adapted from Quranic recitation to MSA.

```mermaid
flowchart TB
    A["Audio waveform<br/>16 kHz, mono"] --> B["Feature extractor<br/>160-dim mel-style features (~10 ms/frame)"]
    B --> C["Wav2Vec2-BERT Encoder<br/>(pre-trained, 53k h multilingual speech)"]
    C -- "hidden states (batch, time, 1024)" --> D["Dropout + ModuleDict of heads<br/>(level_to_lm_head)"]
    D --> E1["Phonemes head (Linear)"]
    D --> E2["Tajweed head (Linear)*"]
    D --> E3["Sifat head (Linear)*"]
    E1 --> F["CTC decoding"]
    F --> G["Phoneme sequence<br/>e.g. د َ ر َ س"]

    style E2 stroke-dasharray: 5 5
    style E3 stroke-dasharray: 5 5
```

> \* Quranic-specific heads from the base model (`obadx/muaalem-model-v3_2`); the MSA fine-tune focuses on the phoneme level.

---

### 14. AI Inference & Evaluation Pipeline

**Purpose:** End-to-end flow inside the AI Service (`Model/src/quran_muaalem/msa/`): decoding, inference, phonemization, comparison, scoring.

```mermaid
flowchart LR
    A["Upload<br/>(wav/mp3/m4a/webm…)"] --> B["api.py<br/>decode via libsndfile,<br/>ffmpeg fallback → 16 kHz mono f32"]
    B --> C["inference.py<br/>model forward pass → CTC decode"]
    C -- "predicted phonemes" --> E["compare.py"]
    D["Ground truth text"] --> P["phonemize.py<br/>text → expected phonemes"]
    P -- "expected phonemes" --> E
    E --> F["Alignment & diff<br/>(per-phoneme errors)"]
    F --> G["Correctness score (0–100)<br/>passed / failed + error type"]
    G --> H["JSON response<br/>{score, passed, feedback}"]
```

---

## E. Security Diagrams

### 15. Security & Authentication Flow Diagram

**Purpose:** Security deliverable (§16.4) — authentication/authorization design and protection of child data across all layers.

```mermaid
flowchart TD
    A([Guardian]) --> B[Login / Register<br/>+ email verification]
    B --> C{Credentials valid?}
    C -- No --> B
    C -- Yes --> D["Issue JWT access token<br/>+ refresh token"]
    D --> E["Mobile app stores token<br/>attaches to every request"]
    E --> F{"Backend middleware:<br/>verify JWT, role, ownership<br/>(child belongs to guardian?)"}
    F -- Invalid --> G([401 / 403 rejected])
    F -- Valid --> H["Input validation & sanitization<br/>(payload size limits for audio)"]
    H --> I["Service logic + DB access<br/>(child data encrypted at rest)"]
    I --> J["Audit logging & monitoring<br/>(suspicious activity)"]
    E -. "HTTPS / TLS everywhere" .-> F
    I -. "Backend ↔ AI service:<br/>internal network / service token" .-> K["AI Service"]
```

> A companion **threat model diagram** (STRIDE over DFD Level 1, Diagram 12) is part of the security deliverables and can be derived directly from the DFD.

---

## F. Supporting Diagrams

### 16. Class Diagram — Core Domain Model

**Purpose:** Object-oriented view of the backend domain (complements the ERD), from `shared/types/index.js`.

```mermaid
classDiagram
    class User {
        +string id
        +string email
        +Role role
        +bool isVerified
        +Child[] children
    }
    class Child {
        +string id
        +string name
        +int age
        +ArabicExposure arabicExposure
        +int totalStars
        +int streakDays
    }
    class Level {
        +int number
        +string nameAr
        +Stage[] stages
    }
    class Stage {
        +int number
        +string[] letters
        +bool isUnlocked
        +Lesson[] lessons
    }
    class Lesson {
        +LessonType type
        +string letterAr
        +TashkeelForm[] tashkeelForms
        +int xpReward
    }
    class Progress {
        +int stars
        +bool completed
        +float bestAccuracy
    }
    class Session {
        +float score
        +float accuracyPct
        +int starsEarned
        +string aiFeedback
    }
    class PronunciationResult {
        +int score
        +bool passed
        +string feedback
        +string errorType
    }
    class Badge {
        +BadgeCategory category
        +Object requirement
    }

    User "1" --> "*" Child
    Child "1" --> "*" Progress
    Child "1" --> "*" Session
    Child "1" --> "*" Badge : earns
    Level "1" --> "*" Stage
    Stage "1" --> "*" Lesson
    Stage "1" --> "*" Progress
    Lesson "1" --> "*" Session
    Session ..> PronunciationResult : produced by AI
```

---

### 17. Screen Navigation Map (UI Flow)

**Purpose:** UI/UX deliverable mapping all prototype screens (`Prototype/client/src/pages/`) and their navigation paths.

```mermaid
flowchart LR
    LOGIN["login.html"] --> REG["register.html"]
    LOGIN --> RESET["reset-password.html"]
    REG --> VERIFY["verify-email.html"]
    VERIFY --> PLACE["placement.html"]
    LOGIN --> APP["app.html<br/>(home / level map)"]
    PLACE --> APP
    APP --> LESSON["lesson.html<br/>(letter lesson)"]
    APP --> WORD["word-lesson.html"]
    LESSON --> PRON["pronunciation.html<br/>(record & evaluate)"]
    WORD --> PRON
    PRON --> RESULT["result.html<br/>(score + stars)"]
    APP --> QUIZ["quiz.html"] --> RESULT
    RESULT --> APP
    APP --> BADGES["badges.html"]
    APP --> DASH["dashboard.html<br/>(parent view)"]
    APP --> SETTINGS["settings.html"]
    SETTINGS --> PRIVACY["privacy.html"]
    LOGIN -.-> ADMIN["admin.html<br/>(content management)"]
```

---

## Deliverable Mapping

How these diagrams map to the documentation deliverables in §16 of the project documentation:

| Deliverable (§16) | Diagrams |
|---|---|
| System architecture diagram | 1, 2, 3 |
| API documentation support | 6, 7 (request/response flows) |
| AI integration documentation | 13, 14, 6 |
| Authentication & authorization design | 15, 7 |
| Basic threat model | 12 (DFD as STRIDE basis), 15 |
| Database design | 5, 16 |
| User testing / UX documentation | 17, 8, 9, 10 |
| Final presentation | 1, 4, 6, 13 (recommended core set) |

---

*Generated from: `Yantiq Documentation.md` (V2.6), `Prototype/` (client pages, shared types, mock API), and `Model/` (MODEL.md, MSA service code). Diagrams are Mermaid drafts — refine in draw.io / PlantUML for the final report where formal UML notation is required.*
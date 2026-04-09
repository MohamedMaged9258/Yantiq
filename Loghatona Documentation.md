# Graduation Project Documentation (V2.2)

**Flag Legend**
- ✔ Confirmed choice
- ⚠ To be discussed later
- 🔷 To be discussed in detail later

## Working Title
- Loghatona (لغتنا)

---

## 1. Project Idea Summary
- A mobile application that helps children learn Arabic speaking and writing using AI.
- The application targets children directly as the primary users.
- Future enhancement: parent/teacher dashboard for monitoring progress. ⚠ (To be discussed later)
- The app will support both:
  - Non-native Arabic learners (living abroad)
  - Native Arabic speakers (starting at higher levels)
- The learning journey will be structured into 5 progressive levels, each containing multiple stages.
- Level 1 will focus on:
  - Letter pronunciation first
  - Then letter writing

---

## 2. Project Problem Statement
- Children living in non-Arabic environments lack exposure to Arabic.
- Existing solutions lack engagement and personalization.
- Limited use of AI in current Arabic learning tools.
- Native children lack structured, gamified reinforcement systems.

---

## 3. Target Users
- Primary: Children
- Secondary: Parents & Teachers ⚠ (To be expanded later)

---

## 4. Project Vision
- Build an AI-powered, engaging, adaptive Arabic learning platform for children worldwide.

---

## 5. Project Objectives
- Structured Arabic learning journey (basic → advanced)
- Develop speaking and writing skills
- Use AI for personalized feedback
- Combine education + gamification

---

## 6. Core Features
- Hybrid learning model (Educational + Gamified)
- 5 learning levels with multiple stages

### Level 1 Example
- Stage 1: Letter pronunciation (visual + audio)
- Stage 2: Letter writing (tracing)

### Learning Approach
- Visual + Audio (primary)
- Speaking practice (AI-based)
- Writing practice
- Adaptation based on age ⚠ (To be refined later)

### Gamification (MVP Choices)
- ✔ Stars / Badges
- ✔ Level Unlock System
- ⚠ Daily streaks (future consideration)
- ⚠ Avatars (future consideration)

---

## 7. AI Components

### Speech Recognition (Chosen)
- ✔ Detect correct/incorrect pronunciation
- ✔ Detect specific pronunciation mistakes (Advanced – Option B)
- ✔ Provide guided + encouraging feedback

### Handwriting Recognition (Chosen – Basic Scope)
- ✔ Detect correct vs incorrect letter shape
- ⚠ Advanced analysis (stroke order, alignment) – future phase

### Future AI Feature
- ⚠ Audio AI companion (voice-based assistant)

---

## 8. Feedback System (Chosen)
- ✔ Guided feedback (show mistake + correction)
- ✔ Encouraging tone (positive reinforcement)

---

## 9. Cybersecurity Scope (Initial – To Be Refined)
- ✔ User data protection (especially children data)
- ✔ Authentication (parent/guardian accounts)
- ✔ Secure AI APIs and backend
- ✔ Prevent misuse or fake inputs
- ✔ Privacy considerations (child-safe design)
- ⚠ Final scope definition pending

---

## 10. User Journey

### First-Time Experience
- An adult will assist the child in creating the account and setting up the initial profile.
- Initial setup includes:
  - Parent basic information (MVP)
  - Child profile creation
- Additional user information and setup details 🔷 (To be discussed in detail later)

### Onboarding & Profile Design

#### Parent / Guardian (MVP)
- ✔ Basic parent information (e.g., email or phone for account creation)
- ✔ Consent for child usage
- ⚠ Detailed authentication methods (to be refined later)

#### Child Profile (MVP)
- ✔ First name / nickname
- ✔ Age
- ✔ Arabic exposure level
- ✔ Current level

#### Initial Placement Logic (Chosen)

- ✔ Initial level determined based on:
- Age
- Arabic exposure level
- ✔ Option to take placement test if level is too easy

---

### Daily Usage Flow
- Open app
- Continue last lesson
- Complete a short lesson/activity
- Get reward (stars / badges)
- Unlock next stage
- Preferred format: short lessons

### Level Progression Logic
- ✔ Must-pass criteria before moving to the next stage/level

### Failure Handling
- Hybrid approach:
  - First failures: show hint and allow retry
  - If failure continues: provide a simpler version of the task

### Speaking Interaction Flow
- App plays the correct pronunciation
- Child repeats the sound/word
- AI evaluates pronunciation
- App provides guided + encouraging feedback
- Add pronunciation scoring ✔

---

## 11. Technical Scope
### Personalization Approach
- ✔ Option A: fixed learning path with light adaptation
- ✔ Small adaptation through retry support and simpler fallback tasks
- ⚠ Advanced dynamic AI personalization – future phase

### Platform Strategy
- Mobile application as the primary platform
- Mobile app + backend architecture
- ⚠ Website version – future enhancement

### AI Deployment Strategy
- Mainly internally hosted AI models
- AI services may run on controlled internal servers

### System Architecture

#### 1. Mobile Application Layer
- Main interface for child learning and guardian-supported onboarding
- Handles account setup support, lesson interaction, audio playback, handwriting input, rewards, and progress display

#### 2. Main Backend Server
- Responsible for core application logic
- Manages guardian accounts, child profiles, lesson progression, scoring records, rewards, and progress tracking
- Communicates with the AI service layer and returns results to the mobile app

#### 3. Separate AI Service Layer
- Chosen as a modular architecture decision
- Handles pronunciation evaluation
- Handles handwriting recognition
<!-- - Generates AI-based scoring and feedback -->
- Supports future AI extensions without tightly coupling them to the main backend
<!-- - Matches the project well because AI models may be hosted internally on university infrastructure -->

#### 4. Database Layer
- Relational database chosen
- Stores guardian account data
- Stores child profiles
- Stores lesson structure, levels, stages, and activities
- Stores performance results, rewards, and progress history
- Supports structured relationships and consistent querying across the system

#### 5. Security Layer
- Security applied across all layers
- Authentication and authorization
- Protection of child-related data
- Secure communication between app, backend, and AI services
- Input validation and abuse prevention
- Logging and monitoring for suspicious activity

### Authentication Model
- Guardian login/account
- Child profile exists under guardian account

### Project Complexity Level
<!-- - The project will aim for a balanced scope that demonstrates strong technical value without overloading the team with high-risk features. -->
- The team will implement a working mobile learning application connected to a backend.
- The MVP will include:
  - User onboarding for parent/guardian and child profile creation
  - Multi-level Arabic learning flow with short lessons
  - Visual + audio learning activities
  - Speech recognition for pronunciation evaluation
  - Basic handwriting recognition for letter-shape validation
  - Guided and encouraging feedback
  - Gamification through stars/badges and level unlocks
  - Basic security and privacy protections for user data
- The project will avoid very advanced features in the first version, such as:
  - Fully dynamic AI personalization
  - Advanced handwriting analysis (stroke order/alignment)
  - Full AI voice companion
  - Full parent/teacher dashboard
  - Multi-platform expansion such as website support
- This means the team will focus on delivering a complete, functional, and testable core product first, while keeping advanced enhancements for later phases.

---

## 12. Success Criteria
- TBD

---

## 13. Constraints and Assumptions
- TBD

---

## 14. Team Roles
### Technical Manager & Backend/AI Integration Lead (You)
- Define overall system architecture (mobile, backend, AI services, database, security)
- Design backend structure, APIs, and data flow
- Lead implementation of critical backend components
- Own AI integration strategy (how speech and handwriting services connect to backend)
- Review code across all modules to ensure consistency and quality
- Coordinate between team members and manage technical decisions
- Ensure alignment between product requirements and technical implementation

### Speech Processing & AI Integration Engineer
- Integrate speech recognition models/APIs for Arabic pronunciation
- Implement audio input/output pipeline (recording, preprocessing, playback)
- Develop pronunciation evaluation logic (correct/incorrect + error detection)
- Tune scoring thresholds and feedback behavior
- Collaborate with backend to expose speech evaluation results via APIs

### Handwriting Recognition Engineer
- Integrate handwriting recognition solution for Arabic letters
- Handle drawing input from mobile (touch input → usable format)
- Implement validation logic for letter shapes (correct vs incorrect)
- Support preprocessing (image cleaning, normalization if needed)
- Work with backend to deliver structured evaluation results and feedback

### Mobile Application Engineer
- Develop the mobile application (UI/UX) using chosen framework
- Implement learning flow (levels, stages, lessons)
- Integrate visual, audio, and interaction components
- Connect mobile app to backend APIs (authentication, lessons, scoring, progress)
- Implement gamification features (stars/badges, level unlocking)
- Ensure smooth and child-friendly user experience

### Security & Privacy Engineer (Cybersecurity)
- Design and implement authentication system (guardian accounts)
- Secure communication between mobile app, backend, and AI services (e.g., token-based auth)
- Define and enforce data protection mechanisms for child data
- Implement input validation and abuse prevention mechanisms
- Perform basic threat modeling (identify potential risks and vulnerabilities)
- Conduct basic security testing and ensure compliance with safe data practices

---

## 15. Risks
- TBD

---

## 16. Deliverables
- TBD

---

## 17. Open Points (To Be Discussed)
- ⚠ Final age group
- ⚠ Full level breakdown
- ⚠ Parent/teacher dashboard
- ⚠ Advanced AI features
- ⚠ Gamification expansion
- ⚠ Cybersecurity final scope
- ⚠ Final AI hosting infrastructure details
- 🔷 Detailed account setup information
- 🔷 Detailed child profile fields and onboarding inputs


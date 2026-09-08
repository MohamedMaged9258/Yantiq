# Graduation Project Documentation (V2.6)

## Working Title
- Yantiq: AI-Based Early Arabic Reading Tutor with Pronunciation Correction

---

## 1. Project Idea Summary
  Early Arabic literacy, particularly among preschool-aged children, faces significant challenges due to limited access to interactive and personalized learning tools, especially for pronunciation development. Children living in non-Arabic environments often lack consistent exposure to correct Arabic speech, while existing solutions typically rely on static content with minimal real-time feedback.

  Additionally, most available applications do not provide stepwise progression aligned with early literacy development, nor do they effectively integrate speaking, listening, and reading skills in a unified learning experience. The absence of adaptive learning paths and progress monitoring further limits the effectiveness of these tools for both learners and guardians.

---

## 2. Project Problem Statement

Early Arabic literacy, particularly among preschool-aged children, faces significant challenges due to limited access to interactive and personalized learning tools, especially for pronunciation development. Children living in non-Arabic environments often lack consistent exposure to correct Arabic speech, which negatively impacts their ability to develop accurate reading and speaking skills.

Most existing solutions rely on static content and do not provide real-time pronunciation feedback, making it difficult for children to correct mistakes and improve effectively. Additionally, many platforms do not follow a structured, stepwise progression aligned with early literacy development, nor do they integrate listening, speaking, and reading in a unified learning experience.

Furthermore, the lack of adaptive learning paths and progress monitoring tools limits the ability of parents and teachers to support the child’s learning journey, reducing overall engagement and learning outcomes.

These limitations highlight the need for an intelligent, interactive, and adaptive solution that supports early Arabic literacy through real-time feedback and structured learning progression.

---

## 3. Target Users
- Primary: Children
- Secondary: Parents & Teachers

---

## 4. Project Vision
- Build an AI-powered, engaging, adaptive Arabic learning platform for children worldwide.

---

## 5. Project Objectives
- Provide a structured, stepwise Arabic reading journey from letter recognition to sentence reading
- Enable real-time pronunciation feedback using a fine-tuned Arabic speech model adapted from Quranic speech/recitation recognition to Modern Standard Arabic, with correctness evaluation based on comparison against predefined ground truth
- Support audio-first learning through listening and speaking exercises
- Deliver a personalized learning experience based on child progress
- Provide progress tracking through a parent/teacher dashboard
- Ensure alignment with early Arabic literacy learning principles

---

## 6. Core Features
- Hybrid learning model (Educational + Gamified)
- 5 learning levels with multiple stages

### Learning Approach
- Audio-first learning (primary focus on listening and speaking)
- Visual support for letter and word recognition
- Stepwise progression (letters → words → sentences)
- Real-time pronunciation feedback using a fine-tuned Arabic speech model that transcribes the child’s input and evaluates correctness by comparing it with the expected ground truth
- Adaptive learning path based on user progress ⚠ (to be refined later)

### Gamification (MVP Choices)
- Stars / Badges
- Level Unlock System
- ⚠ Daily streaks (future consideration)
- ⚠ Avatars (future consideration)

---

## 7. AI Components

### Fine-Tuned Arabic Speech Model
- Use an existing Quranic Arabic speech/recitation model as the base model
- Fine-tune and train the model on Modern Standard Arabic content aligned with the project scope
- Process the child’s spoken input and generate a transcription
- Compare the generated transcription with the predefined ground truth for the target letter, word, or sentence
- Evaluate pronunciation correctness based on the comparison result
- Return correctness status, score, and feedback indicators to the application
- Support guided and encouraging feedback for the child

### Future AI Feature
- ⚠ Audio AI companion (voice-based assistant)

---

## 8. Feedback System
- Guided feedback (show mistake + correction)
- Encouraging tone (positive reinforcement)

---

## 9. Cybersecurity Scope (Initial – To Be Refined)
- User data protection (especially children data)
- Authentication (parent/guardian accounts)
- Secure AI APIs and backend
- Prevent misuse or fake inputs
- Privacy considerations (child-safe design)
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
- Basic parent information (e.g., email or phone for account creation)
- Consent for child usage
- ⚠ Detailed authentication methods (to be refined later)

#### Child Profile (MVP)
- First name / nickname
- Age
- Arabic exposure level
- Current level

#### Initial Placement Logic (Chosen)

- Initial level determined based on:
- Age
- Arabic exposure level
- Option to take placement test if level is too easy

---

### Daily Usage Flow
- Open app
- Continue last lesson
- Complete a short lesson/activity
- Get reward (stars / badges)
- Unlock next stage
- Preferred format: short lessons

### Level Progression Logic
- Must-pass criteria before moving to the next stage/level

### Failure Handling
- Hybrid approach:
  - First failures: show hint and allow retry
  - If failure continues: provide a simpler version of the task

### Speaking Interaction Flow
- App presents the target letter, word, or sentence
- The expected answer is stored as predefined ground truth
- Child listens and repeats the target content
- The fine-tuned Arabic speech model processes the child’s voice input
- The model generates a transcription of the spoken input
- The system compares the generated transcription with the predefined ground truth
- Correctness score and pronunciation result are generated
- App provides real-time, guided, and encouraging feedback
- Score is recorded and used for progress tracking

---

## 11. Technical Scope
### Personalization Approach
- Option A: fixed learning path with light adaptation
- Small adaptation through retry support and simpler fallback tasks
- ⚠ Advanced dynamic AI personalization – future phase

### Platform Strategy
- Mobile application as the primary platform
- Mobile app + backend architecture
- ⚠ Website version – future enhancement

### AI Deployment Strategy
- The project will use a fine-tuned Arabic speech model adapted from a Quranic speech/recitation model to Modern Standard Arabic
- The model will run as part of a separate AI service layer responsible for inference, transcription, and correctness evaluation
- Depending on available infrastructure, the AI service may be hosted internally or deployed through a controlled server environment

### System Architecture

#### 1. Mobile Application Layer
- Main interface for child learning and guardian-supported onboarding
- Handles account setup support, lesson interaction, audio playback, rewards, and progress display

#### 2. Main Backend Server
- Responsible for core application logic
- Manages guardian accounts, child profiles, lesson progression, scoring records, rewards, and progress tracking
- Communicates with the AI service layer and returns results to the mobile app

#### 3. Separate AI Service Layer
- Chosen as a modular architecture decision
- Handles audio preprocessing, fine-tuned model inference, speech transcription, ground truth comparison, pronunciation correctness evaluation, scoring, and feedback result generation
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
  - Fine-tuned Arabic speech model for transcription and pronunciation correctness evaluation
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

### 1. Functional Success
- Child profile can be created and saved successfully
- User can complete at least one full learning level
- Speech evaluation returns a result for ≥ 90% of attempts
- Progress and scores are stored and retrieved without data loss

### 2. AI Performance Success
- The fine-tuned Arabic speech model correctly transcribes child input in ≥ 80% of test cases
- The system correctly compares the generated transcription with the predefined ground truth in ≥ 90% of valid test cases
- The system accurately classifies pronunciation as correct/incorrect in ≥ 80% of test cases
- Real-time feedback is delivered within the target response time of ≤ 2 seconds on average

### 3. User Experience Success
- Child can complete a lesson without external help in ≥ 80% of test sessions
- Average lesson completion time: 2–5 minutes
- Feedback is clear and understandable (validated through user testing)

### 4. System Performance
- Average response time for AI evaluation ≤ 2 seconds
- App maintains stable performance with minimal crashes during testing
- Backend APIs respond successfully in ≥ 95% of requests

### 5. Security Success
- Only authenticated guardian accounts can access system features
- Child data is securely stored and not exposed
- All API endpoints require authentication and validation

### 6. User Testing Validation
- Conduct testing with real users or simulated child scenarios
- Collect feedback on usability, clarity, and engagement
- Validate that users can follow the learning flow without confusion

---

## 13. Constraints and Assumptions

### Constraints
- Limited project time and resources
- Dependence on available AI models and APIs
- Possible limitations of university infrastructure for hosting AI services
- Mobile platform development constraints (performance, device compatibility)

### Assumptions
- The selected Quranic Arabic speech model can be fine-tuned effectively on Modern Standard Arabic content and can provide acceptable transcription and correctness evaluation accuracy after adaptation
- Users (children) will have basic guidance from a guardian during onboarding
- Internet connectivity is available for accessing backend and AI services

---

## 14. Team Roles
### Technical Manager & Backend/AI Integration Lead (You)
- Define overall system architecture (mobile, backend, AI services, database, security)
- Design backend structure, APIs, and data flow
- Lead implementation of critical backend components
- Own AI integration strategy, including how the fine-tuned speech model connects to the backend and supports scoring and feedback
- Review code across all modules to ensure consistency and quality
- Coordinate between team members and manage technical decisions
- Ensure alignment between product requirements and technical implementation

### Speech Processing & AI Integration Engineer
- Adapt, fine-tune, train, integrate, and test the selected Quranic Arabic speech model for Modern Standard Arabic transcription and pronunciation correctness evaluation
- Implement audio input/output pipeline (recording, preprocessing, playback)
- Develop the ground truth comparison logic used for correctness evaluation
- Tune scoring thresholds and feedback behavior
- Collaborate with backend to expose speech evaluation results via APIs

### Mobile Application Engineer (UI/UX & Interaction)
- Develop the mobile application interface (UI/UX)
- Design child-friendly screens and interactions
- Implement lesson flow (levels, stages, lessons)
- Integrate visual and audio components
- Implement gamification features (stars/badges, level unlocking)
- Ensure smooth and engaging user experience

### Mobile Application Engineer (Backend Integration & Logic)
- Connect mobile app to backend APIs (authentication, lessons, scoring, progress)
- Handle data flow between mobile app and backend
- Implement client-side logic for lessons and progression
- Manage API error handling and response processing
- Support testing and debugging of mobile-backend integration

### Security & Privacy Engineer (Cybersecurity)
- Design and implement authentication system (guardian accounts)
- Secure communication between mobile app, backend, and AI services (e.g., token-based auth)
- Define and enforce data protection mechanisms for child data
- Implement input validation and abuse prevention mechanisms
- Perform basic threat modeling (identify potential risks and vulnerabilities)
- Conduct basic security testing and ensure compliance with safe data practices

---

## 15. Risks

### 1. AI Accuracy Risk
- The fine-tuned model may face accuracy limitations when moving from Quranic recitation-style speech to children’s Modern Standard Arabic pronunciation, especially due to age, accent, background noise, unclear speech, or limited training data
- Mitigation:
  - Use a well-established Quranic Arabic speech model as the base model
  - Fine-tune and train the model on Modern Standard Arabic content aligned with the project scope
  - Limit MVP scope to basic letters, words, and simple sentences
  - Tune thresholds, ground truth comparison logic, and feedback behavior

### 2. Integration Complexity
- Difficulty integrating mobile app, backend, and AI services
- Mitigation:
  - Use modular architecture (already defined)
  - Assign clear ownership (backend, AI, mobile)
  - Perform incremental integration and testing

### 3. Performance Issues
- Slow response from AI services may affect user experience
- Mitigation:
  - Optimize request handling
  - Use efficient APIs
  - Limit payload size (audio/image processing)

### 4. Time Constraints
- Risk of not completing all features within timeline
- Mitigation:
  - Focus on MVP features only
  - Defer advanced features (already defined in scope)
  - Maintain clear task distribution

### 5. Security Risks
- Potential exposure of sensitive child data
- Mitigation:
  - Implement authentication and access control
  - Secure API communication
  - Follow basic data protection practices

### 6. Dependency on External Tools
- Risk related to availability, training limitations, or deployment constraints of the selected speech model
- Mitigation:
  - Keep fallback options (alternative models/APIs)
  - Consider internal hosting or controlled server deployment where possible
  - Maintain a modular AI service layer so the model can be replaced or improved without redesigning the full system

---

## 16. Deliverables

### 1. Software Deliverables
- Fully functional mobile application (MVP)
- Backend system with APIs for user management, lessons, and progress tracking
- Integrated AI services for:
  - Fine-tuned Arabic speech transcription and pronunciation correctness evaluation
- Database containing user data, progress, and learning content

### 2. Documentation Deliverables
- Project documentation (this document)
- System architecture diagram
- API documentation (endpoints, request/response formats)
- AI integration documentation covering the selected existing model, modifications/adaptation performed, input/output flow, transcription behavior, correctness evaluation method, ground truth comparison, scoring logic, and integration with backend APIs

### 3. Testing & Evaluation Deliverables
- Test cases and results for core features
- AI performance evaluation results for transcription accuracy, ground truth comparison, and pronunciation correctness classification
- User testing report (feedback, observations, improvements)

### 4. Security Deliverables
- Authentication and authorization design
- Basic threat model
- Security measures documentation (data protection, API security)

### 5. Presentation Deliverables
- Final presentation slides
- Live demo of the application
- Explanation of system architecture and technical decisions

### 6. Future Work Documentation
- List of planned enhancements (AI companion, advanced personalization, dashboard, etc.)
- Identified limitations and proposed improvements

---

## 17. Open Points (To Be Discussed)
- ⚠ Final age group
- ⚠ Full level breakdown
- ⚠ Parent/teacher dashboard
- ⚠ Advanced AI features
- ⚠ Gamification expansion
- ⚠ Cybersecurity final scope
- ⚠ Final AI hosting infrastructure details
- ⚠ Curriculum alignment details (mapping levels to literacy standards)
- 🔷 Detailed account setup information
- 🔷 Detailed child profile fields and onboarding inputs


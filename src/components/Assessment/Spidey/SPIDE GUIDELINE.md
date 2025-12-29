# Spidey Assessment Frontend Implementation Guide

**Audience:** Frontend Team Lead & FE Engineers
**Stack:** Vite + React (TypeScript preferred)
**Author Voice:** CTO, MyDeepTech

---

## 1. Purpose of This Frontend

This frontend is **not a normal annotation UI**. It is a **high-stakes assessment interface** designed to:

* Enforce strict rules automatically
* Prevent careless submissions
* Surface only elite, high-discipline candidates

The UI must **actively block bad behavior**, not just collect answers.

If the UI allows a user to submit an invalid task, the frontend has failed.

---

## 2. Core Frontend Philosophy

Frontend responsibilities go beyond presentation:

1. **Guardrails first** – prevent invalid submissions
2. **Explicit expectations** – no ambiguity for candidates
3. **Progressive disclosure** – reveal stages only when unlocked
4. **Zero trust** – never assume candidate compliance

The frontend is a **quality gate**, not a form.

---

## 3. Assessment Flow (High-Level)

The frontend must support a **4-stage gated assessment flow**:

1. Stage 1 – Guideline Comprehension (Quiz)
2. Stage 2 – Mini Task Design
3. Stage 3 – Golden Solution + Rubrics
4. Stage 4 – Integrity Trap

Each stage:

* Is locked by default
* Unlocks only if backend validates the previous stage

---

## 4. Authentication & Candidate State

### Requirements

* Each candidate has a unique assessment session
* Session state must persist across refreshes
* Stage progress must be server-authoritative

### Frontend Implementation

* JWT-based auth or signed session token
* `/me/assessment-status` endpoint polled on load
* UI renders stages based on backend state only

🚫 Never trust local state to unlock stages.

---

## 5. Stage 1 – Guideline Comprehension UI

### UI Requirements

* Timed quiz (countdown visible)
* Mix of MCQs and short-text answers
* One-question-per-screen (prevents skimming)

### Validation Rules (Frontend)

* Prevent skipping questions
* Auto-submit on timer expiry
* Highlight unanswered questions before submit

### UX Goal

Make it obvious this is **not a casual test**.

---

## 6. Stage 2 – Mini Task Design UI

### Core UI Components

* File viewer (read-only reference files)
* Prompt editor (markdown-supported)
* Domain selector (dropdown, backend-driven)
* Failure explanation text area

### Critical Frontend Constraints

* Disable submission unless:

  * Prompt length > minimum threshold
  * Failure explanation is non-empty
  * Domain is selected

🚫 Do not allow text-only submission without required sections.

---

## 7. Stage 3 – File-Based Submission UI

### Required Upload Components

* Golden solution file uploader
* Rubric uploader OR structured rubric builder

### Hard Frontend Enforcement

* Block forbidden file types (e.g. `.xlsx`)
* Enforce minimum file size
* Enforce max file size (<30MB)
* Require at least one output file

### UX Pattern

Show **inline validation errors before submit**, not after.

---

## 8. Stage 4 – Integrity Trap UI

### Design Principle

This stage must look **normal**, not suspicious.

### Implementation

* Present prompt normally
* Do NOT warn about traps
* Allow text response

Backend will judge integrity.

---

## 9. File Handling Strategy

### Frontend Must:

* Validate MIME type
* Validate extension
* Show file metadata (name, size, type)
* Prevent drag-drop of forbidden formats

### Never:

* Rename files automatically
* Modify user-uploaded content

---

## 10. Frontend ↔ Backend Contract

Frontend consumes backend as the **source of truth**.

### Mandatory Endpoints

* `GET /assessment/status`
* `POST /assessment/stage-1/submit`
* `POST /assessment/stage-2/submit`
* `POST /assessment/stage-3/submit`
* `POST /assessment/stage-4/submit`

Frontend must:

* Display backend validation errors verbatim
* Never override backend decisions

---

## 11. Logging & Telemetry (Frontend)

Track:

* Time spent per stage
* Failed submission attempts
* File upload retries

These metrics help detect risky candidates.

---

## 12. Final Frontend Success Criteria

The frontend succeeds if:

* Most users feel the test is "hard"
* Invalid submissions are impossible
* Backend receives clean, structured data only

If candidates complain, that’s expected.

This is a **filter**, not a funnel.

---

**End of Frontend Guide**

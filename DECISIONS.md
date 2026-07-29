# DECISIONS.md — Engineering Decisions & Architectural Trade-offs

This document outlines key technical decisions, failure handling mechanisms, and trade-offs made for the Flam Frontend Internship Assignment.

---

## 1. Track Choice & Rationale

**Chosen Assignment**: **Frontend Internship Assignment — Structured AI Interactive Tool Suite**

### Why Frontend over Backend (QueueCTL)?
1. **Direct Alignment with Flam's Core Product Capabilities**: Building a web-based AI feature engine that turns unpredictable AI output into stateful UI components directly demonstrates full-stack React + AI engineering skills.
2. **Interactive Proof of Resilience**: The assignment emphasizes: *"Handling failure well is what separates people who've built AI features from those who haven't."* A web application allows live demonstration of schema normalization, auto-repair, and error recovery via an interactive stress-testing panel.
3. **Comprehensive Coverage**: Instead of building just one single module, this submission provides **all 3 required problem domains** (Study Assistant, Recipe Builder, Trip Planner) with mode switching, refinement loops, and state persistence.

---

## 2. Handling Unpredictable & Bad AI Outputs

### The Challenge
LLMs can return markdown code blocks (````json ... ````), truncated string responses due to token limits, trailing commas, unquoted object keys, or schemas missing critical properties.

### Our 3-Layer Resilience Strategy

```
[Raw Gemini Response]
        │
        ▼
Layer 1: JSON Repair Heuristics (`repairAndParseJSON`)
  - Strip markdown wrappers
  - Locate outermost `{ ... }` boundaries
  - Regex repair trailing commas & unquoted keys
        │
        ▼
Layer 2: Schema Normalization & Fallbacks (`normalizeGeneratedContent`)
  - Verify every expected field (e.g. `flashcards`, `steps`, `stops`)
  - Enforce correct types (Numbers, Arrays, Booleans)
  - Inject smart default structures if fields are absent
        │
        ▼
Layer 3: UI Error Boundary & Retry Controls
  - If parsing fails completely, display friendly error card
  - Prevent application crash
  - Provide instant "Retry" action
```

---

## 3. API Key Security & Full-Stack Proxy Architecture

### Decision
Never call LLM APIs directly from client-side browser code.

### Implementation
- The client sends requests to `/api/generate`.
- The Express server (`server.ts`) reads `process.env.GEMINI_API_KEY` and calls the `@google/genai` SDK server-side.
- The client bundle contains zero API keys or secrets.

---

## 4. Race Condition & Stale Response Mitigation

### The Problem
If a user rapidly submits two prompts or refinements, a slower initial response could resolve *after* a faster second response, overwriting the user's view with stale state.

### Our Solution
We maintain a `requestCounterRef` on the client:
- Each network call increments `requestId`.
- When the fetch promise resolves, `if (requestId !== requestCounterRef.current)` holds, the response is discarded.
- Only the latest request updates state.

---

## 5. Iterative Refinement Loop Strategy

### Decision
Instead of regenerating the entire object from scratch when a user requests an update (e.g., *"Make questions harder"* or *"Make recipe vegan"*), we pass the existing `currentContent` JSON along with the `refinementPrompt` to the backend.

### Benefits
- Preserves context and existing structure.
- Allows targeted modifications without altering unrelated fields.

---

## 6. Live Interview Stress Testing Panel

### Purpose
During live review, interviewers often ask: *"How does your app handle bad data?"*

To make this effortless during evaluation, we added a dedicated **Stress Test Panel** (`Bug` icon in header). It allows interviewers to toggle simulated failure modes live:
- **Malformed JSON**: Returns broken syntax JSON.
- **Wrong Schema**: Returns unexpected keys.
- **Empty Output**: Returns empty string.
- **500 Server Error**: Returns server error.
- **High Latency**: Simulates a 6-second slow connection.

In all cases, the application handles the failure gracefully without crashing!

# Flam AI Studio — Frontend Internship Assignment Submission

An interactive, AI-powered structured UI generator built with **React**, **TypeScript**, **Express**, and the **Gemini API** (`@google/genai`).

This application takes free-form text input (notes, ingredients, travel descriptions), prompts Gemini for structured JSON responses with explicit schema validation, auto-repairs malformed LLM outputs, and renders interactive, stateful tool suites (Study Assistant, Recipe Builder, and Trip Planner).

---

## 🚀 Key Features

### 1. 🎓 Study Assistant Tool
- **Interactive 3D Flip Flashcards**: Flip cards to reveal answers, mark cards as "Mastered", shuffle deck, and navigate via keyboard or buttons.
- **Interactive Quiz Engine**: Multiple choice questions with immediate option validation, detailed explanations, score tracking, and an explicit **Re-test Wrong Answers** mode.

### 2. 🍳 Fridge-to-Recipe Tool
- **Scalable Serving Multiplier**: Adjust servings (e.g. 2p → 4p → 8p) to dynamically recalculate ingredient quantities live.
- **Interactive Step Checklist**: Checkable cooking steps with embedded timers and chef tips.
- **Ingredient Substitution Cards**: View smart ingredient swaps for pantry flexibility.

### 3. 🗺️ Trip Planner Tool
- **Day-by-Day Collapsible Itinerary**: Expand or collapse days with category badges (Sightseeing, Food, Activity).
- **Interactive Stop Reordering & Management**: Reorder stops up/down, delete stops, or add custom stops on the fly.

### 4. 🛡️ Resilient AI Failure Handling & Live Stress Test Mode
- **JSON Repair Engine**: Auto-cleans markdown code blocks, strips trailing commas, fixes unquoted keys, and normalizes missing fields against strong TypeScript schemas.
- **Race Condition Prevention**: Request sequence counter ensures stale slow responses never overwrite newer ones.
- **Live Stress Test Panel**: Includes an interview debug drawer to inject malformed JSON, schema errors, empty outputs, 500 errors, or high latency to verify zero-crash resilience live!

### 5. 🔄 Iterative Refinement Loop & State Persistence
- **Refinement Input**: Apply follow-up prompts (e.g. *"Make questions harder"*, *"Make recipe vegan"*) to edit existing state in-place.
- **LocalStorage History**: Auto-saves sessions with quick load and export JSON capabilities.

---

## 🛠️ Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (animations), Lucide Icons.
- **Backend / Proxy**: Express.js server running in Node environment with Vite dev middleware.
- **AI Model**: `@google/genai` (Gemini 3.6 Flash) with `responseMimeType: "application/json"` and strict `responseSchema`.
- **Key Security**: API keys (`GEMINI_API_KEY`) are kept strictly server-side inside `server.ts` and never exposed to the client browser bundle.

---

## ⚙️ Local Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file or export `GEMINI_API_KEY`:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 3. Start Development Server
```bash
npm run dev
```
The application will run on **`http://localhost:3000`**.

### 4. Production Build & Start
```bash
npm run build
npm start
```

---

## 🤖 AI Usage Declaration

- **AI Assistants Used**: Used for scaffolding code structure, writing TypeScript interfaces, and crafting Tailwind layout utilities.
- **Original Architecture**: The JSON repair heuristic (`repairAndParseJSON`), schema normalizers (`normalizeStudyData`, `normalizeRecipeData`, `normalizeTripData`), request sequence counters, and interview stress testing framework were authored specifically for this assignment.

---

## ⏱️ Time Spent & Known Limitations

- **Time Spent**: ~5.5 hours total (architecture, JSON repair logic, 3 tool suites, stress test panel, and docs).
- **Known Limitations**:
  - The offline mode relies on simulated data or cached sessions; full generation requires an active Gemini API key.
  - Image generation for recipes/travel is handled via vector icons and badge layouts rather than multi-modal image model calls to minimize API latency.

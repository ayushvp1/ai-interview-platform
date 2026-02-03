# AI Interview Platform - Design & Workflow Documentation

This document outlines the technical architecture, design decisions, and core workflows of the AI Interview Platform.

## 🏗 System Architecture

The application is built using **Next.js (App Router)** as a full-stack framework.

### Layer Breakdown:
- **Frontend (React/TypeScript):** Responsive UI built with Tailwind CSS and Lucide icons.
- **API Layer (Next.js API Routes):** Handles AI communication, interview logging, and evaluation processing.
- **Storage Layer (Hybrid):**
  - **Local Session:** `localStorage` is used to maintain state during an active interview.
  - **Persistent History:** Server-side JSON files stored in `/interview_logs`.
- **AI Intelligence:** Powered by **LiteRouter** (routing to Google Gemini-Free) for both chat and technical evaluation.
- **Computer Vision:** `face-api.js` runs in the browser for real-time facial expression and eye contact tracking.

---

## 🔄 Core Workflows

### 1. Interview Flow
The interview logic is designed to simulate a real human interaction:
1. **The Handshake:** AI initializes with a context-specific system prompt based on the chosen interview type (Technical, HR, Managerial).
2. **Question Loop:** The system cycles through 5 dynamic questions.
3. **The Pivot:** After the 5th answer, the AI shifts from asking to answering: *"Do you have any questions for me?"*.
4. **Natural Closure:** The interview only ends when the user confirms they have no more questions or asks the AI to finish.

### 2. Evaluation Workflow
Instead of evaluating every single message (which is expensive and slow), the system performs **Post-Interview Analysis**:
1. Full chat history + video metrics are sent to `/api/evaluate`.
2. A large-context AI model analyzes the entire transcript against specific parameters (Communication, Technical Accuracy, etc.).
3. The result is a structured JSON report which is saved to the server and displayed in a rich UI.

---

## 🎨 Design Decisions

### **1. Why JSON Logs instead of a Database?**
- **Simplicity:** Eliminates the need for setting up a SQL or NoSQL database for local use/prototyping.
- **Portability:** The entire project state can be moved by simply copying the folder.
- **Human Readable:** Developers can inspect logs directly as text files.

### **2. LiteRouter vs Direct Gemini**
- **Stability:** LiteRouter provides a reliable abstraction layer that manages rate limits and service tiers automatically.
- **Flexibility:** Allows switching underlying models (e.g., from Gemini to Claude or GPT-4) with a single-line configuration change in the backend.

### **3. Real-time Video Analysis**
- **Client-Side Processing:** Facial landmark detection happens on the user's GPU/CPU via `face-api.js`. This ensures zero latency and maintains privacy (video frames are never sent to the server).
- **Metric Weighting:**
  - **Engagement:** Weighted 70% toward Eye Contact to mirror professional interview standards.
  - **Sliding Window:** Metrics use the most recent 10 frames to ensure the live UI feels "alive" and responsive to current behavior.

### **4. Speech Recognition Selection**
- **Confidence Over First Result:** The platform requests multiple alternatives from the Web Speech API and selects the one with the highest confidence score, significantly reducing transcription errors during technical jargon.

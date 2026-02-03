# AI Interview Platform - Setup & Handoff Guide

This project is a Next.js-powered AI Mock Interview Platform featuring Text, Voice, and Video modes with real-time body language analysis.

## 🚀 How to Setup (For New Users)

If you have received this project as a ZIP file, follow these steps to get it running:

### 1. Extract and Install
Extract the ZIP file and open the folder in your terminal.
```bash
npm install
```

### 2. Configure API Keys
The project requires an API key from **LiteRouter**.
1. Create a file named `.env.local` in the root directory.
2. Copy the contents from `.env.example` into `.env.local`.
3. Add your own API key:
   - `LITEROUTER_API_KEY`: Get from [LiteRouter](https://literouter.com/)

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 How to ZIP for Distribution
When sharing this project, **DO NOT** include the following folders to keep the file size small and secure:
- `node_modules/` (The user will run `npm install`)
- `.next/` (Build artifacts)
- `interview_logs/` (Your personal interview history)
- `.env.local` (Your private API keys)

**Recommended Zip Command (if using CLI):**
`zip -r project.zip . -x "node_modules/*" ".next/*" "interview_logs/*" ".env.local"`

---

## 🛠 Tech Stack
- **Frontend:** Next.js, Tailwind CSS, Lucide Icons, Shadcn UI
- **AI/ML:** LiteRouter (Gemini-2.0-Flash / Gemini-Free), face-api.js (for Video metrics)
- **Audio:** Web Speech API

---

## 📖 Additional Documentation
For more detailed information on the technical architecture, design decisions, and core workflows, see:
- [DESIGN_DOC.md](file:///c:/Users/ayush/OneDrive/Desktop/ai_interview_platform/DESIGN_DOC.md)

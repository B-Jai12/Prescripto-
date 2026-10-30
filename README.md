# Prescripto 💊 — AI-Powered Prescription Parsing & Patient Assistant

Prescripto is a full-stack, AI-powered healthcare platform that turns doctor handwritten paper prescriptions into clear, digital, structured medical records with personalized diet, safety warnings, medication schedules, and multilingual instructions (English, Hindi, Telugu) in seconds.

---

## ✨ Key Features

- **🩺 Multimodal Vision Digitization**: Powered by **Google Gemini 2.5 Flash** to decipher doctors' cursive handwriting, medicine dosages, frequency codes (`1-0-1`, `a.c.`, `p.c.`), and durations.
- **📸 Smart Camera Preprocessing**: Automatically handles mobile phone camera EXIF rotation, boosts ink contrast, and scales resolution for maximum OCR accuracy.
- **🌐 Multilingual Instructions**: Automatically produces instructions in **English**, **Hindi (हिन्दी)**, and **Telugu (తెలుగు)**.
- **⚠️ Drug Interactions & Safety Analysis**: Proactively detects risky drug combinations, generates tailored diet/nutrition rules, and flags required lifestyle adjustments.
- **💬 Nurse Lipi (24/7 AI Clinical Assistant)**: Instant conversational nurse assistant powered by high-speed Groq LLMs with automatic Gemini fallback.
- **⚡ Dual Deployment Architecture**:
  - **Vercel Serverless (Native 1-Click)**: Fully functional Next.js App Router API routes (`/api/parse-prescription`, `/api/chat`, `/api/health`) — no external Python daemon needed!
  - **FastAPI Backend (Standalone)**: High-performance Python backend with Uvicorn for custom servers, Docker, or Render.
- **🔒 Privacy & Client Caching**: Client-side localStorage saves prescription history with zero database setup required.

---

## 🚀 Live Deployment to Vercel

Prescripto is built to deploy seamlessly to [Vercel](https://vercel.com):

1. **Import Repository**: Import your GitHub repository (`Prescripto-`) on [Vercel](https://vercel.com/new).
2. **Configure Root Directory (Crucial)**:
   - In the project configuration (or **Settings** > **General** > **Root Directory** if already imported):
   - Set **Root Directory** to `frontend` and click **Save**.
   - *(Vercel will automatically detect Next.js with zero configuration needed).*
3. **Environment Variables**: Add the following under **Project Settings** > **Environment Variables**:
   ```ini
   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. **Deploy / Redeploy**: Click **Deploy** (or **Redeploy** without build cache). Vercel builds the Next.js application with full serverless prescription extraction (`/api/parse-prescription`), conversational AI (`/api/chat`), and health check (`/api/health`) out of the box!

---

## 🛠️ Local Development

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: v3.10+ (for FastAPI backend)

### 1. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend Setup (FastAPI - Optional)
```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```
Backend runs at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Optional. URL of dedicated backend (e.g. `http://localhost:8000` or Render URL). If left empty, uses Next.js serverless routes on Vercel. |
| `GEMINI_API_KEY` | Google Gemini API key for vision extraction & chat fallback. |
| `GROQ_API_KEY` | Groq API key for low-latency conversational Nurse AI. |
| `NEXT_PUBLIC_FIREBASE_*` | Optional Firebase configuration for account authentication. Mock mode is active if left empty. |

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key. |
| `GROQ_API_KEY` | Groq API key. |
| `PORT` | Server port (default: 8000). |
| `ENVIRONMENT` | `dev` or `production`. |

---

## 📁 Repository Structure

```
Prescripto-/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── parse-prescription/route.js # Next.js serverless prescription extraction
│   │   │   │   ├── chat/route.js               # Next.js serverless Nurse Lipi assistant
│   │   │   │   └── health/route.js             # Health check endpoint
│   │   │   ├── app/page.jsx                    # Dashboard & extraction interface
│   │   │   ├── history/page.jsx                # Saved prescription history
│   │   │   ├── account/page.jsx                # User account settings
│   │   │   └── page.jsx                        # Landing page
│   │   ├── components/                         # UI cards, camera upload, interactive chat
│   │   └── lib/firebase.js                     # Firebase auth & mock fallback
│   ├── next.config.ts                          # Next.js config & API rewrites
│   └── package.json                            # Frontend dependencies & scripts
├── backend/
│   ├── services/
│   │   ├── nlp.py                              # Gemini 2.5 Flash extraction & fallback chain
│   │   ├── ocr.py                              # EXIF auto-rotation & image optimization
│   │   ├── chat.py                             # Nurse Lipi Groq/Gemini assistant
│   │   ├── translate.py                        # Hindi & Telugu translation handling
│   │   └── security.py                         # Encryption utilities
│   ├── main.py                                 # FastAPI application
│   ├── requirements.txt                        # Backend dependencies
│   └── test_vision.py                          # Vision extraction test script
├── test_prescription.png                       # Sample medical prescription image
└── README.md
```

---

## 📄 License
MIT License. Created by [Jaideep Botla](https://github.com/B-Jai12).


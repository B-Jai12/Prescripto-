# LipiRx - Complete System Documentation
## AI-Powered Prescription Parsing and Patient Assistant

> **Author**: Manoj Kumar Adepu
> **Contact**: adepumanojkumar96@gmail.com
> **GitHub**: [manojkumar-96622](https://github.com/manojkumar-96622)
> **Version**: LipiRx Engine v2.5
> **Last Updated**: June 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement and Motivation](#2-problem-statement-and-motivation)
3. [System Architecture](#3-system-architecture)
4. [Directory and File Structure](#4-directory-and-file-structure)
5. [Backend — FastAPI Server](#5-backend--fastapi-server)
6. [Frontend — Next.js Web Application](#6-frontend--nextjs-web-application)
7. [Frontend Components Deep Dive](#7-frontend-components-deep-dive)
8. [Firebase Integration](#8-firebase-integration)
9. [Data Models and JSON Schemas](#9-data-models-and-json-schemas)
10. [API Reference](#10-api-reference)
11. [AI Pipeline Deep Dive](#11-ai-pipeline-deep-dive)
12. [Translation Engine Deep Dive](#12-translation-engine-deep-dive)
13. [Security Architecture](#13-security-architecture)
14. [Use Case Analysis](#14-use-case-analysis)
15. [Database Design MySQL Proposed](#15-database-design-mysql-proposed)
16. [Software and Hardware Requirements](#16-software-and-hardware-requirements)
17. [Environment Configuration](#17-environment-configuration)
18. [Development Setup and Running Locally](#18-development-setup-and-running-locally)
19. [Literature Survey](#19-literature-survey)
20. [Existing vs Proposed System Comparison](#20-existing-vs-proposed-system-comparison)

---

## 1. Project Overview

**LipiRx** is a full-stack, AI-powered healthcare web application that bridges the gap between medical practitioners and patients. Its primary goal is to make paper prescriptions fully digital, understandable, and actionable — in multiple regional Indian languages — in under 60 seconds.

A patient uploads an image of a handwritten or printed prescription. LipiRx:

1. **Preprocesses** the image via Pillow (contrast boost, resize, RGB normalization)
2. **Extracts** fully structured medical data using Google Gemini multimodal AI with a Pydantic-enforced JSON schema
3. **Translates** medication instructions into **Hindi** and **Telugu** in parallel using ThreadPoolExecutor
4. **Generates** a safety analysis: drug-drug interactions and per-medicine side-effect profiles
5. **Creates** a personalized wellness plan — condition-deduced diet and exercise recommendations
6. **Enables** natural-language conversation with **Nurse Lipi** (Groq + Llama-3.3-70b-versatile) for 24/7 prescription-specific Q&A in 3 languages
7. **Exports** a downloadable A4 PDF report via jsPDF

---

## 2. Problem Statement and Motivation

### 2.1 The Existing Problem

| Issue | Real-World Impact |
|---|---|
| **Illegible handwriting** | Pharmacists and patients misread drug names, causing adverse reactions |
| **Verbal-only instructions** | Patients forget dosage rules (before/after meals, frequency) by the time they get home |
| **English-only prescriptions** | Non-English speakers cannot read or understand their own prescriptions |
| **No Drug Interaction Check** | Patients combining prescriptions from multiple doctors risk dangerous combinations |
| **No 24/7 Support** | Simple questions require expensive doctor visits or long waiting times |
| **Memory Decay** | Even literate patients forget pharmacist verbal explanations within 24 hours |
| **No Cost Transparency** | Patients do not know the market price or cheaper alternatives |

### 2.2 The LipiRx Solution

- Uses **Gemini Vision** instead of local OCR — handles cursive handwriting without crashing on 512 MB RAM hosting
- Runs translations **in parallel using ThreadPoolExecutor** — reducing O(n*2) serial calls to O(1)
- Injects the **exact prescription JSON as context** into Llama-3 with strict system instructions to prevent hallucination
- Generates automatic **drug interaction warnings** and **condition-deduced wellness plans**
- Provides **multi-pharmacy price comparison** (Netmeds, Tata 1mg, Apollo)
- Provides a **downloadable PDF** for offline reference
- Offers an **offline mock Firebase mode** for development without live credentials

---

## 3. System Architecture

LipiRx uses a decoupled client-server architecture with four layers.

### 3.1 ASCII Architecture Overview

`
LAYER 1: CLIENT (Next.js + React, Port 3000)
  ┌────────────────────────────────────────────────────────────┐
  │  Landing / (Hyperspeed WebGL background)                   │
  │  Login /login  (GridScan WebGL + BorderGlow card)          │
  │  Dashboard /app (Upload + 5-tab Results + LipiChat)        │
  │  Account /account (Firestore profile management)           │
  │  History /history (Past prescription retrieval)            │
  │  Help /help (FAQ accordion)                                │
  └────────────────────────┬───────────────────────────────────┘
                           │ HTTP REST (POST multipart, POST JSON, GET)
                           ▼
LAYER 2: SERVER (FastAPI + Uvicorn, Port 8000)
  ┌────────────────────────────────────────────────────────────┐
  │  main.py — Routes, CORS, Request validation                │
  │    ├── POST /parse-prescription → ocr → nlp → translate    │
  │    ├── POST /chat               → chat.py (Groq/Llama-3)   │
  │    └── GET  /                   → health check             │
  │                                                            │
  │  services/ocr.py       (Pillow: RGB, contrast, resize)     │
  │  services/nlp.py       (Gemini + Pydantic schema)          │
  │  services/translate.py (ThreadPoolExecutor + GoogleTrans)  │
  │  services/chat.py      (Groq API + context injection)      │
  │  services/security.py  (Fernet AES-256 encrypt/decrypt)    │
  └──────────────────────────┬─────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
LAYER 3: EXTERNAL SERVICES
  Google Gemini API    Groq API              Firebase
  gemini-2.5-flash     llama-3.3-70b         Auth + Firestore
  gemini-1.5-flash     versatile
  gemini-1.5-pro

LAYER 4: DATABASE (Proposed — MySQL 8.0)
  users / prescriptions / medicines / wellness_plans
  chat_sessions / chat_messages
`

### 3.2 Architecture Diagram (Mermaid)

`mermaid
graph TD
    subgraph Frontend [Client — Next.js / React Port 3000]
        UI[Dashboard and Upload Card]
        Chat[LipiChat Component]
        PDF[jsPDF Report Generator]
        AuthClient[Firebase Auth Guard]
        Landing[Landing / HeroSection Hyperspeed]
    end
    subgraph Backend [Server — FastAPI Port 8000]
        API[FastAPI App main.py]
        Preprocess[Image Preprocessor ocr.py Pillow]
        NLPService[NLP Engine services/nlp.py]
        ChatService[Chat Engine services/chat.py]
        TransService[Translation ThreadPool services/translate.py]
        SecService[AES-256 Encryption services/security.py]
    end
    subgraph External [External Services]
        Gemini[Google Gemini API gemini-2.5-flash to 1.5-pro fallback]
        Groq[Groq API Llama 3.3 70B Versatile]
        FirebaseAuth[Firebase Auth Provider]
        FirestoreDB[Firestore Database profiles collection]
        DeepTrans[deep-translator Google Translate wrapper]
    end
    subgraph Database [Database Layer Proposed]
        MySQL[(MySQL 8.0 Relational DB)]
    end

    UI -->|1. POST image multipart| API
    UI -->|7. Render summary| UI
    UI -->|8. Download PDF| PDF
    AuthClient <-->|Sign Up Login onAuthStateChanged| FirebaseAuth
    AuthClient <-->|getDoc setDoc updateDoc| FirestoreDB
    API -->|2. RGB contrast boost resize| Preprocess
    Preprocess -->|3. Clean PNG bytes| NLPService
    NLPService <-->|4. Extraction prompt + schema| Gemini
    NLPService -->|5. Extracted JSON| TransService
    TransService <-->|6. Parallel te + hi translations| DeepTrans
    API <-->|Save and Fetch history| MySQL
    Chat -->|POST message + prescription context| API
    API --> ChatService
    ChatService <-->|LLM context injection| Groq
    ChatService -->|Contextual reply in selected language| Chat

    classDef frontend fill:#1e1e30,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef backend fill:#112233,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef external fill:#2c1b4d,stroke:#a855f7,stroke-width:2px,color:#fff;
    classDef db fill:#2c3e50,stroke:#f59e0b,stroke-width:2px,color:#fff;
    class UI,Chat,PDF,AuthClient,Landing frontend;
    class API,Preprocess,NLPService,ChatService,TransService,SecService backend;
    class Gemini,Groq,FirebaseAuth,FirestoreDB,DeepTrans external;
    class MySQL db;
`

---

## 4. Directory and File Structure

`
LipiRx/
├── .gitignore
├── System_Documentation.md         ← This document
│
├── backend/                        ← FastAPI Python server
│   ├── .env                        ← API keys: GEMINI, GROQ, ENCRYPTION
│   ├── main.py                     ← App entry, all routes, CORS middleware
│   ├── requirements.txt            ← Python pip dependencies
│   ├── list_models.py              ← Dev: list available Gemini models
│   ├── test_key.py                 ← Dev: test AES key generation
│   ├── test_models.py              ← Dev: test Gemini model availability
│   ├── test_pro.py                 ← Dev: test Gemini Pro endpoint
│   ├── test_vision.py              ← Dev: test Gemini vision image upload
│   ├── log.txt                     ← Server runtime logs (auto-generated)
│   └── services/
│       ├── nlp.py                  ← Gemini multimodal AI + Pydantic schema
│       ├── ocr.py                  ← Pillow image preprocessor
│       ├── translate.py            ← ThreadPoolExecutor parallel translations
│       ├── chat.py                 ← Groq API + Nurse Lipi persona
│       └── security.py            ← Fernet AES-256 encrypt/decrypt
│
├── frontend/                       ← Next.js 16 React web application
│   ├── package.json                ← Node.js dependencies and scripts
│   ├── next.config.ts              ← Next.js configuration
│   ├── tsconfig.json               ← TypeScript configuration
│   ├── eslint.config.mjs           ← ESLint linting rules
│   ├── postcss.config.mjs          ← PostCSS / Tailwind CSS config
│   ├── .env.local                  ← Firebase credentials (NEXT_PUBLIC_*)
│   └── src/
│       ├── app/                    ← Next.js App Router (file-based routing)
│       │   ├── layout.jsx          ← Root HTML layout
│       │   ├── page.jsx            ← Route / Landing page
│       │   ├── globals.css         ← Global CSS reset and Inter font
│       │   ├── icon.png            ← App favicon
│       │   ├── app/page.jsx        ← Route /app Main dashboard
│       │   ├── login/page.jsx      ← Route /login Login form
│       │   ├── signup/page.jsx     ← Route /signup Registration form
│       │   ├── account/page.jsx    ← Route /account Profile settings
│       │   ├── history/page.jsx    ← Route /history Prescription history
│       │   ├── help/page.jsx       ← Route /help FAQ and help center
│       │   └── contact/page.jsx    ← Route /contact Contact page
│       ├── components/             ← Shared React components
│       │   ├── UploadCard.jsx      ← Drag-and-drop prescription upload
│       │   ├── LipiChat.jsx        ← Floating Nurse Lipi chatbot widget
│       │   ├── PatientSummaryCard.jsx ← Full prescription results display
│       │   ├── LoadingState.jsx    ← AI analysis progress animation
│       │   ├── BrandBadge.jsx      ← LipiRx brand logo component
│       │   ├── BorderGlow.jsx/.css ← Mouse-reactive glowing border card
│       │   ├── ElectricBorder.jsx/.css ← CSS electric animated border
│       │   ├── GridScan.jsx/.css   ← Three.js WebGL scanning grid
│       │   ├── Hyperspeed.jsx/.css ← Three.js WebGL highway animation
│       │   ├── DecryptedText.jsx   ← Scrambling character reveal animation
│       │   ├── ClickSpark.jsx      ← Canvas click-spark animation
│       │   └── landing/
│       │       ├── HeroSection.jsx ← Landing hero with Hyperspeed + CTAs
│       │       ├── FeaturesSection.jsx ← Feature cards (currently unused)
│       │       ├── HowItWorksSection.jsx ← Step guide (currently unused)
│       │       ├── CTASection.jsx  ← Call-to-action section (unused)
│       │       └── Footer.jsx      ← Site footer (currently unused)
│       ├── lib/
│       │   └── firebase.js         ← Firebase client: real + mock mode
│       └── data/                   ← Static data files
`

---

## 5. Backend — FastAPI Server

### 5.1 main.py — Application Entry Point

**Location**: ackend/main.py
**Purpose**: Initializes FastAPI, registers CORS middleware, defines all HTTP route handlers, and starts Uvicorn ASGI server.

#### Initialization

`python
app = FastAPI(title=LipiRx AI Analysis Engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[*],       # All origins — restrict in production
    allow_credentials=True,
    allow_methods=[*],
    allow_headers=[*],
)
`

#### Pydantic Request Model for Chat

`python
class ChatRequest(BaseModel):
    message: str | None = None              # User question
    context: Dict[str, Any] | None = None  # Full prescription JSON as context
    language: str | None = English       # English | Hindi | Telugu
`

#### Route Table

| Method | Path | Description |
|---|---|---|
| GET | / | Health check: returns engine status |
| GET | /chat | Chat service availability |
| POST | /chat | Send message to Nurse Lipi AI |
| POST | /chat/ | Alias (trailing slash) |
| POST | /parse-prescription | Upload and analyze prescription image |

#### /parse-prescription Execution Pipeline

`
1. Validate file content type (jpeg/png/webp/heic/heif)
2. ocr.extract_text(image_bytes)      → raw_text (stub, always ")
3. nlp.extract_entities(image_bytes) → structured_json (Gemini AI)
4. if languages != en:
 translate.add_translations(json) → enriched_json with te/hi fields
5. Return JSON response
`

**Query Parameters**:
- languages (default en,te,hi):
 - en = English only, fastest (~30s)
 - en,te,hi = All three languages (~60s)

**Response Shape**:
`json
{
 raw_text: ,
 result: { ...PrescriptionExtraction... },
 engine: LipiRx-Flash-1.5,
 privacy: AES-256 Vaulted,
 languages: en,te,hi
}
`

#### Server Startup

`python
port = int(os.environ.get(PORT, 8000))
reload = os.environ.get(ENVIRONMENT, dev).lower() == dev
uvicorn.run(main:app, host=0.0.0.0, port=port, reload=reload)
`

---

### 5.2 services/nlp.py — AI Extraction Engine

**Location**: ackend/services/nlp.py
**Purpose**: Core intelligence. Uses Gemini multimodal API to extract a validated structured JSON from a prescription image.

#### Gemini Model Fallback Chain

`python
MODEL_FALLBACK_CHAIN = [
 'gemini-2.5-flash', # PRIMARY: fastest, cheapest
 'gemini-1.5-flash', # FALLBACK 1
 'gemini-1.5-pro', # FALLBACK 2: most capable
]
`

Each model is tried up to 3 times with exponential backoff: 2s → 4s → 8s on HTTP 503 / UNAVAILABLE errors.

#### Pydantic Schemas

**Medicine (per medication)**:

| Field | Type | Description |
|---|---|---|
| name | str | Brand name e.g. Amoxicillin |
| dosage | Optional[str] | Strength e.g. 500mg |
| frequency | Optional[str] | Pattern e.g. 1-0-1, twice daily |
| duration | Optional[str] | Length e.g. 5 days |
| timing | Optional[str] | When to take e.g. after meals |
| instructions_en | str | Plain English patient instruction sentence |
| side_effects | List[str] | Top 2 common side effects (AI-generated) |
| estimated_mrp | float | Estimated Indian market price in INR |
| common_salt | str | Generic name e.g. Paracetamol |

**PatientDetails**: 
ame, ge, gender — all Optional[str]

**HospitalDetails**: 
ame, ddress, doctor_name — all Optional[str]

**PrescriptionExtraction (top-level)**:

| Field | Type | Description |
|---|---|---|
| patient_details | Optional[PatientDetails] | Patient demographics |
| hospital_details | Optional[HospitalDetails] | Clinic / doctor info |
| medicines | List[Medicine] | All extracted medicines |
| drug_interactions | Optional[str] | AI-generated interaction warning |
| diet_and_lifestyle | List[str] | Minimum 4 wellness items |
| doctor_notes | Optional[str] | General prescription notes |
| follow_up | Optional[str] | Follow-up date or instruction |
| confidence_score | float | 0.0 to 1.0 AI extraction confidence |
| analysis_notes | str | Explanation of the confidence score |

#### Gemini API Call Configuration

`python
config = types.GenerateContentConfig(
 system_instruction=SYSTEM_PROMPT,
 response_mime_type=application/json,
 response_schema=PrescriptionExtraction, # Pydantic → strict JSON enforcement
 temperature=0.0 # Deterministic — critical for medicine
)
`

 emperature=0.0 eliminates randomness — the same prescription always produces the same result.

#### Key System Prompt Rules Given to Gemini

1. Decode frequency codes: 1-0-1 = morning+night, .c. = before meals, p.c. = after meals
2. Treat IV fluids and ORS sachets as medicines
3. Autocorrect messy drug names to real Indian pharma market drugs
4. Missing fields → 
ull, never guess
5. Always generate side_effects, drug_interactions, diet_and_lifestyle from medical knowledge
6. diet_and_lifestyle must never be empty — minimum 4 items
7. If image is blurry → confidence_score < 0.7

#### Retry + Fallback Logic

`python
for model in MODEL_FALLBACK_CHAIN:
 for attempt in range(3):
 try:
 result = _call_gemini(model, image_part, prompt)
 if not result.get(diet_and_lifestyle):
 result[diet_and_lifestyle] = generate_fallback_wellness(...)
 return result
 except 503_error:
 sleep([2, 4, 8][attempt])
 except other_error:
 break # Move to next model
return graceful_error_response
`

#### generate_fallback_wellness() — Keyword-Based Wellness

Scans medicine names/salts and returns tailored wellness advice if Gemini returns empty diet_and_lifestyle:

| Detected Category | Keywords | Advice Topic |
|---|---|---|
| Pain/Fever | paracetamol, ibuprofen, diclofenac | Avoid alcohol; take with food |
| Antibiotics | amoxicillin, azithromycin, cipro, metronidazole | Complete full course |
| Diabetes | metformin, glimepiride, insulin | Maintain meal schedule; monitor blood sugar |
| Blood Pressure | amlodipine, telmisartan, atenolol | Rise slowly; reduce salt |
| Steroids | prednisolone, dexamethasone | Avoid infections; report swelling |
| Vitamins | iron, folic, vitamin d, calcium | Take with food; avoid tea/coffee |

Always returns 5–8 items including 3 general lifestyle items.

---

### 5.3 services/ocr.py — Image Preprocessor

**Location**: ackend/services/ocr.py

#### preprocess_image(image_bytes) → bytes

`python
# Step 1: Convert RGBA/Palette/Grayscale → RGB
image = image.convert('RGB')

# Step 2: Boost contrast by 50%
enhancer = ImageEnhance.Contrast(image)
image = enhancer.enhance(1.5)

# Step 3: Resize to max 1200px width (maintains aspect ratio, LANCZOS)
if image.width > 1200:
 ratio = 1200 / float(image.width)
 image = image.resize((1200, int(image.height * ratio)), Image.Resampling.LANCZOS)

# Step 4: Export as PNG bytes
output = io.BytesIO()
image.save(output, format=PNG)
return output.getvalue()
`

#### extract_text(image_bytes) → str

Returns  — **intentional stub**. EasyOCR/PyTorch removed because they require 2+ GB RAM, exceeding the 512 MB free-tier limit. Gemini Vision handles all reading internally in 
lp.py.

---

### 5.4 services/translate.py — Parallel Translation Engine

**Location**: ackend/services/translate.py

#### Thread-Safe Translator Cache

`python
_translator_cache = {}
_cache_lock = threading.Lock()
# Double-checked locking: initialize translator once per language, then reuse
`

#### add_translations(structured_data) — Parallel Execution

`python
with ThreadPoolExecutor(max_workers=10) as executor:
 for idx, medicine in enumerate(medicines):
 te_task = executor.submit(translate_text, instructions_en, te)
 hi_task = executor.submit(translate_text, instructions_en, hi)
 tasks.append((te, idx, te_task))
 tasks.append((hi, idx, hi_task))

 for lang, idx, task in tasks:
 try:
 result = task.result(timeout=10)
 medicines[idx][finstructions_{lang}] = result
 except Exception:
 medicines[idx][finstructions_{lang}] = medicines[idx][instructions_en]
`

**Performance**: 5 medicines × 2 languages = 10 concurrent calls. Time ≈ 1 network round trip instead of 10 serial calls.

| Approach | Time for 5 medicines |
|---|---|
| Serial (old) | ~50 seconds |
| Parallel ThreadPool (current) | ~8-12 seconds |
| Speedup | ~4-6x |

---

### 5.5 services/chat.py — Nurse Lipi AI Chat Service

**Location**: ackend/services/chat.py

#### Configuration

`
MODEL = llama-3.3-70b-versatile
TEMPERATURE = 0.3
MAX_TOKENS = 1024
TIMEOUT = 10 seconds
ENDPOINT = https://api.groq.com/openai/v1/chat/completions
`

#### Nurse Lipi System Prompt Rules

1. Always refer to the specific medicines in the user's loaded prescription
2. Use empathetic phrases: I understand, I am here to help
3. For dangerous or out-of-scope questions → Please consult your doctor immediately
4. If not in the prescription → do not assume
5. Answer style: short intro + 4 bullet points + 1 safety line; no markdown
6. Mention drug interaction warnings from the report in simple language
7. MUST respond strictly in the user-selected language only

#### format_medication_reply() — Fast-Path Local Handler

No API call needed. Triggers when message contains: how, when, ake, dose, iming, medicine, ablet, capsule, morning, 
ight.

Returns formatted prescription guide instantly from the JSON context.

#### get_nurse_response(user_message, prescription_context, language) → str

`python
# Step 1: Try fast-path local handler
direct = format_medication_reply(user_message, prescription_context)
if direct: return direct

# Step 2: Build full prompt with context
prompt = fPRESCRIPTION DATA:\n{context}\n\nUSER QUESTION: {message}
system = SYSTEM_PROMPT + f\n\nYou MUST respond strictly in {language} language only.

# Step 3: Call Groq API
response = requests.post(GROQ_ENDPOINT, headers=auth_headers, json={
 model: llama-3.3-70b-versatile,
 messages: [{role: system, content: system}, {role: user, content: prompt}],
 temperature: 0.3, max_tokens: 1024
}, timeout=10)

return response.json()[choices][0][message][content]
`

---

### 5.6 services/security.py — AES-256 Encryption

**Location**: ackend/services/security.py

Uses cryptography.fernet.Fernet (AES-128-CBC + HMAC-SHA256).

`python
MASTER_KEY = os.environ.get(MASTER_ENCRYPTION_KEY)
if not MASTER_KEY:
 MASTER_KEY = Fernet.generate_key().decode() # Auto-generate in dev
cipher_suite = Fernet(MASTER_KEY.encode())

def encrypt_data(data: bytes) -> bytes:
 return cipher_suite.encrypt(data)

def decrypt_data(encrypted_data: bytes) -> bytes:
 return cipher_suite.decrypt(encrypted_data)
`

**Current Status**: encrypt_data is imported in main.py but not actively called. Available for future database image storage. The privacy: AES-256 Vaulted in API response declares readiness.

---

## 6. Frontend — Next.js Web Application

**Framework**: Next.js 16.2.6 with React 19.2.4
**Routing**: App Router (src/app/ — file-based)
**Styling**: Inline JavaScript style objects throughout
**3D Graphics**: Three.js + postprocessing (WebGL backgrounds)
**Animation**: Framer Motion
**Icons**: Lucide React
**Dev Port**: 3000

### 6.1 Route Map

| URL | File | Description |
|---|---|---|
| / | app/page.jsx | Landing (HeroSection + Hyperspeed WebGL) |
| /login | app/login/page.jsx | Login form (GridScan WebGL + BorderGlow card) |
| /signup | app/signup/page.jsx | Registration form |
| /app | app/app/page.jsx | Main dashboard — upload + 5-tab results |
| /account | app/account/page.jsx | Profile, language, account settings |
| /history | app/history/page.jsx | Past prescription analyses |
| /help | app/help/page.jsx | Help center with FAQ accordion |
| /contact | app/contact/page.jsx | Contact information |

---

### 6.2 app/page.jsx — Landing Page (Route: /)

Renders only <HeroSection /> inside a full-screen (100vh) black container with overflow: hidden.

Imports FeaturesSection, HowItWorksSection, CTASection, Footer, and LipiChat but **does not render them** — only HeroSection is active in the current JSX.

---

### 6.3 app/login/page.jsx — Login Page (Route: /login)

**Background**: <GridScan> Three.js scanning grid (SSR-disabled via dynamic())
**Card**: <BorderGlow> interactive glowing card

**Login Flow**:
1. User enters email and password
2. signInWithEmailAndPassword(auth, email, password) called
3. On success:
   - localStorage.setItem(userEmail, email)
   - localStorage.setItem(currentUserId, user.uid)
   - Fetches Firestore profile via getDoc(doc(db, profiles, user.uid))
   - If real ull_name found: sets localStorage[userName] + is_setup_complete=true
   - Redirects to /app
4. Error handling:
   - Detects adblocker Firebase blocking: shows mock mode instructions
   - Other errors: shown as inline red message

**Animations**: <DecryptedText> scramble on LipiRx brand and Login heading; pink focus ring on inputs via inline onFocus handler; submit button 	ranslateY(-2px) on hover.

---

### 6.4 app/signup/page.jsx — Signup (Route: /signup)

Uses createUserWithEmailAndPassword. On success creates blank Firestore profile:
`json
{ id: uid, full_name: User, email: ..., is_pro: false, scan_count: 0, updated_at: ISO }
`

---

### 6.5 app/app/page.jsx — Main Dashboard (Route: /app)

The primary functional view — an 888-line component managing the complete prescription analysis workflow.

#### React State Variables

| State | Type | Purpose |
|---|---|---|
| view | string | upload or esult — which view is shown |
| activeTab | string | Active results tab: overview/safety/wellness/buy/technical |
| loading | boolean | True while AI analysis POST is in progress |
| analysisStep | 0-4 | UI checklist step animation |
| resultData | object/null | Mapped backend data for UI rendering |
| showProfileMenu | boolean | Profile dropdown visibility |

#### Analysis Step Labels

`
Step 1: Enhancing image quality...
Step 2: Running OCR text extraction...
Step 3: Cross-referencing medical database...
Step 4: Generating safety and wellness report...
`

#### handleUploadComplete() — Full Analysis Flow

`javascript
setLoading(true);
setAnalysisStep(1);  // Enhancing image quality

const formData = new FormData();
formData.append('file', file);
const response = await fetch(${API_URL}/parse-prescription?languages=en,te,hi, {
    method: 'POST', body: formData
});

setAnalysisStep(2);  // OCR extraction
const backendData = await response.json();

setAnalysisStep(3);  // Cross-referencing
await sleep(800);   // UX: artificial progress delay

setAnalysisStep(4);  // Generating report
await sleep(600);

// Map backend JSON to UI resultData shape
setResultData(mapped);
setView('result');
`

#### Backend to UI Data Mapping

`javascript
{
    patient: {
        name, age, gender,
        doctor:    hospital_details.doctor_name,
        hospital:  hospital_details.name,
        confidence: confidence_score,    // Displayed as Wellness Score
        drug_interactions, analysis_notes, doctor_notes, follow_up
    },
    medicines: medicines.map(m => ({
        name, composition: m.common_salt,
        dosage, frequency, duration,
        instructions: m.instructions_en || m.timing,
        instructions_te: m.instructions_te || m.instructions_en,
        instructions_hi: m.instructions_hi || m.instructions_en,
        purpose: Generic:  + m.common_salt,
        estimated_mrp, side_effects
    })),
    safety: medicines.map(m => ({ med: m.name, warning: m.side_effects.join(' ') })),
    wellness: normalizeWellnessAdvice(diet_and_lifestyle),
    buy: top3meds.flatMap(m => [
        { name: 'Netmeds', price: mrp*0.86, tag: 'BEST DEAL', url: netmeds_search },
        { name: 'Tata 1mg', price: mrp*0.88, url: onemg_search },
        { name: 'Apollo',  price: mrp*0.92, url: apollo_search }
    ]),
    technical: { raw_ocr: backendData.raw_text, json: JSON.stringify(result, null, 2) }
}
`

#### normalizeWellnessAdvice() — Categorization

Splits flat diet_and_lifestyle[] into 3 sections using regex:

`javascript
const isDiet     = /eat|avoid|drink|protein|fiber|sodium|sugar/i.test(text);
const isExercise = /walk|yoga|stretch|breathing|cardio|workout/i.test(text);
// Assigns to diet[], exercise[], or general[]
`

#### Results Tab System

| Tab | Content |
|---|---|
| overview | Medicine cards: name, dosage, frequency, duration, instructions, MRP |
| safety | Drug interaction warning box + per-medicine side effects cards |
| wellness | Diet section + Exercise section + Daily Lifestyle Tips |
| buy | Price grid: Netmeds / Tata 1mg / Apollo with deep-linked search URLs |
| technical | Raw JSON viewer (green monospace) + Raw OCR text viewer |

#### handleDownloadReport() — jsPDF PDF Export

5-section A4 PDF:
1. Overview: patient info + medicine list
2. Safety: drug interactions + side effects
3. Wellness: diet + exercise + general tips
4. Buy and Find: pharmacy prices and URLs
5. Technical Notes: raw OCR + JSON

Saved as lipirx-prescription-report.pdf.

#### Navbar

- Fixed, centered floating glass navbar (ackdropFilter: blur(30px), gba(10,10,15,0.7))
- Animated purple glow pulse — 4-second Framer Motion loop
- Profile dropdown: Account / Help Center / Contact Us / Log Out
- Log Out: signOut(auth) → removes all user localStorage keys → /login

---

### 6.6 app/account/page.jsx — Account Settings (Route: /account)

**Full multilingual UI**: English / Hindi (हिन्दी) / Telugu (తెలుగు)

#### Features

| Feature | Details |
|---|---|
| Profile name edit | Input → updateDoc(doc(db, profiles, uid), { full_name }) |
| Language switcher | Dropdown: en/hi/te — saved to localStorage[userLang] |
| Email change | Modal → updates localStorage[userEmail] |
| Password change | Modal UI only (Firebase re-auth not implemented in v2.5) |
| Delete account | Modal → localStorage.clear() → redirect to / |
| Save button | Pink #FF9FFC → success toast for 3 seconds |

#### Firestore Profile Document

`json
{
    id: firebase_uid,
    full_name: Patient Name,
    email: user@example.com,
    is_pro: false,
    scan_count: 0,
    updated_at: 2026-06-27T15:00:00.000Z
}
`

Collection: profiles | Document ID: Firebase Auth UID

#### Security Guard

onAuthStateChanged compares localStorage[currentUserId] to uthUser.uid. If different (shared device, different user), wipes: isPro, userName, userEmail, is_setup_complete.

---

### 6.7 app/history/page.jsx — Prescription History (Route: /history)

Fetches past scans from GET /history/{email}:
`javascript
const res = await fetch(${apiBaseUrl}/history/);
const data = await res.json();
setHistory(data.reverse()); // newest first
`

Clicking a history item renders <PatientSummaryCard data={selectedItem.data} />.

> Note: /history/{email} endpoint not yet in main.py. Forward-compatible once MySQL persistence is added.

---

### 6.8 app/help/page.jsx — Help Center (Route: /help)

- Search bar (visual; not yet filtering accordion)
- 7 FAQ accordion items with Framer Motion height animation
- 5 help category grid cards (Getting Started, FAQ, Account, Clinics, Medical Students)
- Footer: Facebook, Instagram, LinkedIn, GitHub links

#### FAQ Questions

1. How to get accurate OCR for handwritten prescriptions?
2. What languages does LipiRx support?
3. How long does analysis take? (30-60 seconds)
4. Is prescription data stored? (No — processed in real-time only)
5. What to do if analysis is stuck?
6. Can I download my PDF report?
7. Clinical Counseling Service update notice

---

### 6.9 app/contact/page.jsx — Contact Page (Route: /contact)

Contact information display page.

---

## 7. Frontend Components Deep Dive

### 7.1 UploadCard.jsx

| Prop | Type | Description |
|---|---|---|
| onFileSelect | function | Called with File object on valid drop/select |
| selectedFile | File/null | Currently selected file |
| onClear | function | Called when X button clicked |
| isAnalyzing | boolean | Shows overlay + scanner ray |
| scanner | ReactNode | ScannerLine component during analysis |

**Accepted types**: image/jpeg, image/png, image/webp, image/heic, image/heif

**Design**: 360px tall glassmorphism card (gba(255,255,255,0.03) + lur(20px)), 32px radius.
On drag-over: pink #FF9FFC border + purple glow.
On hover: 	ranslateY(-2px).
Tags displayed: Handwritten, Printed, Hospital Letterhead.

---

### 7.2 LipiChat.jsx

| Prop | Type | Description |
|---|---|---|
| prescriptionData | object | Full resultData including all medicines + patient details |

**Internal State**: isOpen, language, messages[], isTyping

**Quick-Action Chips** (per language):
- Explain Medicines | Dosage Guide | Safety and Side Effects
- Diet Advice | Follow-up Tests | Quick Summary

**Chat API Call**:
`javascript
POST /chat
{ message: ..., context: prescriptionData, language: English }
`

**UI**: Fixed bottom-right (zIndex: 1000). Panel: 380×600px, 28px radius.
Header: purple gradient + ENG/HIN/TEL switcher.
User bubbles: pink #FF9FFC. Nurse bubbles: light gray.
Auto-scroll on new message.

---

### 7.3 PatientSummaryCard.jsx

Full prescription results display. Used on dashboard (post-upload) and history page (past scans). Shows medicine details, patient/hospital info, wellness plans, safety warnings.

---

### 7.4 LoadingState.jsx

Animated loading display with step-by-step progress indicators during AI analysis.

---

### 7.5 BrandBadge.jsx

Prop: compact (boolean — smaller navbar version). Renders LipiRx brand logo + wordmark.

---

### 7.6 BorderGlow.jsx / BorderGlow.css

Mouse-tracking reactive border glow effect. Glow follows cursor around card edges.

| Prop | Default | Description |
|---|---|---|
| edgeSensitivity | 30 | Pixels from edge for glow detection |
| glowColor | 300 80 60 | HSL: hue, saturation%, lightness% |
| backgroundColor | — | Card background color |
| borderRadius | 28 | Corner radius px |
| glowRadius | 50 | Glow spread size px |
| glowIntensity | 1.5 | Brightness multiplier |
| coneSpread | 25 | Angular width of glow cone degrees |
| animated | false | Continuous animation without mouse |
| colors | [] | Colors for animated gradient mode |

Used on: Login card, Signup card, Help section cards.

---

### 7.7 ElectricBorder.jsx / ElectricBorder.css

CSS keyframe-animated electric/lightning border effect. Used on: Account settings page.

---

### 7.8 GridScan.jsx / GridScan.css

Three.js WebGL scanning grid background with post-processing (bloom, chromatic aberration, film noise).

| Prop | Description |
|---|---|
| sensitivity | Mouse tracking sensitivity |
| lineThickness | Grid line width px |
| linesColor | Grid line hex color |
| scanColor | Scanner beam hex color |
| scanOpacity | Beam transparency 0-1 |
| enablePost | Enable EffectComposer post-processing |
| bloomIntensity | Bloom/glow strength |
| chromaticAberration | Color fringe amount |
| noiseIntensity | Film grain amount |
| enableWebcam | Use webcam as texture (false by default) |

Used on: Login page background.
Login config: linesColor=#2F293A, scanColor=#FF9FFC, enableWebcam=false.

---

### 7.9 Hyperspeed.jsx / Hyperspeed.css

Three.js WebGL hyperspace highway animation. Night road with incoming red car lights and outgoing white car lights.

**HeroSection configuration**:
`javascript
{
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    colors: {
        roadColor: 0x080808,
        islandColor: 0x0a0a0a,
        background: 0x000000,
        shoulderLines: 0xffffff,
        brokenLines: 0xffffff,
        leftCars: [0xff1010, 0x880000, 0x330000],  // Red oncoming traffic
        rightCars: [0xffffff, 0xcccccc, 0x999999], // White outgoing traffic
        sticks: 0xffffff
    }
}
`

Loaded with dynamic(() => import(...), { ssr: false }) to prevent WebGL errors during Next.js SSR.
Used on: Landing page hero background.

---

### 7.10 DecryptedText.jsx

Scrambles characters then reveals final text character by character.

| Prop | Default | Description |
|---|---|---|
| text | required | Final text to display |
| speed | 70 | ms between character reveals |
| maxIterations | 10 | Scramble iterations per character |
| animateOn | hover | hover or view (intersection observer) |
| characters | alphanumeric | Character pool for scrambling |
| useOriginalCharsOnly | false | Only use chars from the target word |
| revealDirection | left | left, right, or center |
| encryptedClassName | — | CSS class for unresolved scrambled chars |

Used on: Navbar buttons (Log In, Sign Up), login heading, CTA buttons.

---

### 7.11 ClickSpark.jsx

Canvas-based animation that draws radiating spark particles from cursor position on click. Adds micro-animation feedback.

---

### 7.12 Landing Section Components (src/components/landing/)

| File | Purpose | Status |
|---|---|---|
| HeroSection.jsx | Full-screen hero: Hyperspeed bg + headline + CTA buttons | ACTIVE |
| FeaturesSection.jsx | Feature showcase cards | INACTIVE — imported but not rendered |
| HowItWorksSection.jsx | Step-by-step workflow guide | INACTIVE |
| CTASection.jsx | Conversion call-to-action section | INACTIVE |
| Footer.jsx | Site footer with navigation links | INACTIVE |

**HeroSection content**:
- Cosmic light beam source (purple radial gradient, position: fixed, pointer-events: none)
- Floating glass navbar with animated glow border
- Headline: Decode Your Health + with AI-Powered Precision.
- Two CTA buttons: Get started (→ /signup) and Log in (→ /login)
- Both use <DecryptedText> scramble animation on hover
- <Toggle> component in navbar for demo mode switch (currently not wired)

---

## 8. Firebase Integration

**Location**: rontend/src/lib/firebase.js
**Purpose**: Unified Firebase client supporting live Firebase and offline mock mode via localStorage.

### 8.1 Mode Detection

`javascript
const firebaseConfig = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isMock =
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    firebaseConfig.apiKey === 'undefined' ||
    process.env.NEXT_PUBLIC_USE_MOCK_FIREBASE === 'true';
`

### 8.2 Mock Mode Behavior

When isMock = true:
- Console prints: [LipiRx] Running in Offline Mock Firebase Mode (pink + bold)
- uth = { currentUser: null, _listeners: [] } (in-memory)
- db = { _type: 'mock_db' } (in-memory marker)
- Users: localStorage[mock_users] (JSON array)
- Profiles: localStorage[mock_profiles] (JSON object keyed by uid)
- Sessions: localStorage[mock_session]
- Mock UIDs: mock-uid- + Math.random().toString(36).substr(2, 9)

### 8.3 Real Firebase Mode

Firebase SDK loaded lazily via dynamic imports (wait import('firebase/app')). App initialized once: getApps().length === 0 ? initializeApp(...) : getApp(). uth and db cached in module-level variables.

### 8.4 Exported Auth Functions

| Function | Signature | Description |
|---|---|---|
| signInWithEmailAndPassword | (auth, email, password) | Login with email/password |
| createUserWithEmailAndPassword | (auth, email, password) | Register new user |
| signOut | (auth) | Log out; clears session |
| onAuthStateChanged | (auth, callback) | Subscribe to auth state changes |

### 8.5 Exported Firestore Functions

| Function | Mock Behavior | Real Behavior |
|---|---|---|
| doc(db, collection, docId) | Returns { _type: 'doc_ref', collectionName, docId } | Real Firestore document reference |
| getDoc(docRef) | Reads localStorage[mock_profiles][docId] | Calls Firebase getDoc() |
| setDoc(docRef, data, options) | Writes/merges to localStorage mock_profiles | Calls Firebase setDoc() |
| updateDoc(docRef, data) | Merges into localStorage mock_profiles | Calls Firebase updateDoc() |

---

## 9. Data Models and JSON Schemas

### 9.1 Full /parse-prescription API Response

`json
{
    raw_text: ",
 engine: LipiRx-Flash-1.5,
 privacy: AES-256 Vaulted,
 languages: en,te,hi,
 result: {
 patient_details: {
 name: John Doe,
 age: 35,
 gender: Male
 },
 hospital_details: {
 name: City General Hospital,
 address: 123 Main Street, Hyderabad - 500001,
 doctor_name: Dr. Srinivasa Rao
 },
 medicines: [
 {
 name: Amoxicillin,
 dosage: 500mg,
 frequency: 1-0-1,
 duration: 5 days,
 timing: After meals,
 instructions_en: Take one 500mg Amoxicillin tablet twice daily (morning and night) after meals for 5 days. Complete the full course.,
 instructions_te: 5 రోజులు ప్రతి ఉదయం మరియు రాత్రి భోజనం తర్వాత 500mg అమాక్సిసిలిన్ మాత్రను వాడండి.,
 instructions_hi: 5 దिनों तक सुबह और रात में खाना खाने के बाद 500mg एमोक्सिसिलिन टैबलेट लें।,
 side_effects: [Diarrhoea, Nausea],
 estimated_mrp: 85.50,
 common_salt: Amoxicillin Trihydrate
 }
 ],
 drug_interactions: null,
 diet_and_lifestyle: [
 For the antibiotic, finish the full course and avoid alcohol.,
 Avoid very spicy or oily food if your stomach feels sensitive.,
 Do a 10-15 minute light walk after meals if your doctor approves.,
 Practice 5 minutes of gentle stretching or breathing exercises daily.
 ],
 doctor_notes: Drink plenty of water. Take rest.,
 follow_up: Review after 1 week if no improvement,
 confidence_score: 0.92,
 analysis_notes: Clear printed prescription. 92% certain of all medicine names and dosages.
 }
}
`

### 9.2 Chat API Request and Response

**Request (POST /chat)**:
`json
{
 message: How should I take the Amoxicillin?,
 context: { patient: {...}, medicines: [{...}] },
 language: English
}
`

**Response (200 OK)**:
`json
{
 response: Here is how to take your medicine.\n- Medicine 1: Amoxicillin\n  Dose: 500mg\n  How often: 1-0-1 (morning and night)\n  When to take: After meals\n  How long: 5 days\n  Possible side effects: Diarrhoea, Nausea\n- Safety: Complete the full course. Contact your doctor if side effects persist.
}
`

### 9.3 Frontend resultData Shape (After Mapping)

`javascript
{
 patient: {
 name: string,
 age: string,
 gender: string,
 doctor: string, // hospital_details.doctor_name
 hospital: string, // hospital_details.name
 confidence: number, // 0.0-1.0; shown as Wellness Score
 analysis_notes: string,
 doctor_notes: string,
 follow_up: string,
 drug_interactions: string|null
 },
 medicines: [{
 name: string,
 composition: string, // common_salt
 dosage: string,
 frequency: string,
 duration: string,
 instructions: string, // instructions_en or timing
 instructions_te: string,
 instructions_hi: string,
 purpose: string, // Generic: {common_salt}
 estimated_mrp: number, // INR
 side_effects: string[]
 }],
 safety: [{ med: string, warning: string }],
 wellness: {
 diet: string[],
 exercise: string[],
 general: string[],
 all: string[]
 },
 buy: [{
 name: string, // Netmeds | Tata 1mg | Apollo
 price: number, // INR (mrp * discount factor)
 url: string, // Deep-linked search URL
 savings: string, // Up to 14% (Netmeds only)
 tag: string, // BEST DEAL (Netmeds only)
 med: string // Medicine name
 }],
 technical: {
 raw_ocr: string, // Always  (OCR stub)
 json: string // Pretty-printed backend result JSON
 }
}
`

---

## 10. API Reference

### GET /

**Description**: Health check
**Response 200**:
`json
{ status: online, engine: LipiRx AI v2.5 }
`

---

### GET /chat

**Description**: Chat service status
**Response 200**:
`json
{ status: Nurse AI is online and ready }
`

---

### POST /parse-prescription

**Content-Type**: multipart/form-data

**Form Fields**:

| Field | Type | Required | Description |
|---|---|---|---|
| file | binary | Yes | Prescription image (JPEG/PNG/WEBP/HEIC/HEIF) |

**Query Parameters**:

| Parameter | Default | Description |
|---|---|---|
| languages | en,te,hi | Comma-separated language codes for translation |

**Response 200**: Full prescription JSON (see Section 9.1)

**Error Responses**:

| Status | Condition |
|---|---|
| 400 | File type not in allowed list |
| 500 | Gemini API failure or server exception |

---

### POST /chat and POST /chat/

**Content-Type**: pplication/json

**Request Body**:
`json
{
 message: string — user question,
 context: { ...prescription data object... },
 language: English | Hindi | Telugu
}
`

**Response 200**:
`json
{ response: string — nurse response }
`

**Error Responses**:

| Status | Condition |
|---|---|
| 500 | Groq API failure or exception |

---

## 11. AI Pipeline Deep Dive

### 11.1 Image Ingestion

`python
image_part = types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg')
# google-genai SDK handles multipart encoding internally — no base64 required
`

### 11.2 Gemini API Configuration

`python
response = client.models.generate_content(
 model=model, # e.g. 'gemini-2.5-flash'
 contents=[prompt, image_part], # Text prompt + image bytes
 config=types.GenerateContentConfig(
 system_instruction=SYSTEM_PROMPT,
 response_mime_type=application/json,
 response_schema=PrescriptionExtraction, # Strict schema enforcement
 temperature=0.0 # Deterministic output
 )
)
result = json.loads(response.text)
`

### 11.3 Retry Timing Diagram

`
gemini-2.5-flash attempt 1 → wait 2s → attempt 2 → wait 4s → attempt 3
 failure all 3 attempts
gemini-1.5-flash attempt 1 → wait 2s → attempt 2 → wait 4s → attempt 3
 failure all 3 attempts
gemini-1.5-pro attempt 1 → wait 2s → attempt 2 → wait 4s → attempt 3
 all failed
Return graceful error response with retry message
`

Maximum total wait: ~42 seconds before graceful fallback.

### 11.4 Drug Autocorrection Examples

| Raw Handwriting | Gemini Corrects To |
|---|---|
| Opor. w or Opox | Opox CV |
| Swipes-D or Shipas-D | Pantop-D or Pan-D |
| Allurose | Aldrose |

### 11.5 Structured Output Enforcement

esponse_schema=PrescriptionExtraction forces Gemini to output JSON exactly matching the Pydantic model. Required fields must be present; Optional fields may be null. Eliminates need for post-processing error handling on missing keys.

---

## 12. Translation Engine Deep Dive

### 12.1 Architecture

`
add_translations(structured_data)
 │
 └── ThreadPoolExecutor(max_workers=10)
 │
 For 5 medicines (example):
 ├── submit(translate, instructions_en[0], te) → Future[te_0]
 ├── submit(translate, instructions_en[0], hi) → Future[hi_0]
 ├── submit(translate, instructions_en[1], te) → Future[te_1]
 ├── submit(translate, instructions_en[1], hi) → Future[hi_1]
 └── ... (10 concurrent futures for 5 medicines)
 
 Collect results (timeout=10s each):
 medicines[0][instructions_te] = result(te_0)
 medicines[0][instructions_hi] = result(hi_0)
 ...
`

### 12.2 deep-translator Internals

GoogleTranslator(source='en', target='te') wraps the public Google Translate web API. No paid API key needed. HTTP calls to ranslate.googleapis.com. Thread-safe via double-checked locking cache.

### 12.3 Failure Handling

Each task: ask.result(timeout=10).
- Timeout: fallback to instructions_en
- API error: fallback to instructions_en
- Empty input: returns  immediately

Patients always receive instructions — English as worst-case fallback.

---

## 13. Security Architecture

### 13.1 Authentication (Firebase Auth)

- JWT token management by Firebase SDK
- onAuthStateChanged used as auth guard on protected pages
- Session persists in browser via Firebase local persistence
- Token refresh handled automatically

### 13.2 Multi-User Data Isolation

`javascript
const storedUserId = localStorage.getItem('currentUserId');
if (storedUserId && storedUserId !== authUser.uid) {
 // Different user detected — wipe ALL previous user data
 localStorage.removeItem('isPro');
 localStorage.removeItem('userName');
 localStorage.removeItem('userEmail');
 localStorage.removeItem('is_setup_complete');
}
localStorage.setItem('currentUserId', authUser.uid);
`

Guard present in: pp/app/page.jsx and pp/account/page.jsx.

### 13.3 Prescription Data Privacy

- Prescription images processed **in-memory only**
- No image written to disk or stored in any database after analysis
- aw_text always  — no text logged server-side
- Result JSON held only in React state — not persisted between sessions

### 13.4 AES-256 Encryption

- Fernet: AES-128-CBC + HMAC-SHA256 authentication
- Self-contained tokens: timestamp + IV + ciphertext + HMAC
- MASTER_ENCRYPTION_KEY in ackend/.env only — never exposed to frontend

### 13.5 CORS Configuration

`python
allow_origins=[*] # Development — restrict to frontend domain in production
`

**Production**: Replace with [https://lipirx.vercel.app] or actual domain.

### 13.6 API Key Security

| Secret | Location | Exposed To Frontend |
|---|---|---|
| GEMINI_API_KEY | backend/.env | Never |
| GROQ_API_KEY | backend/.env | Never |
| MASTER_ENCRYPTION_KEY | backend/.env | Never |
| Firebase NEXT_PUBLIC_* | frontend/.env.local | Yes (by design — Firebase requires this) |

---

## 14. Use Case Analysis

### 14.1 System Actors

| Actor | Role |
|---|---|
| Patient/User | Uploads prescriptions, reads results, chats with Nurse Lipi |
| LipiRx Backend | AI orchestrator: preprocessing, extraction, translation, chat |
| Google Gemini API | Vision AI: prescription reading, drug autocorrection, wellness generation |
| Groq API | Chat AI: Nurse Lipi responses via Llama-3.3-70b |
| Firebase Auth | Authentication: session management via JWT |
| Firestore | Profile database: user name, language preference |

### 14.2 Use Case Descriptions

#### UC1 — Register and Authenticate

- **Actors**: Patient/User, Firebase Auth
- **Preconditions**: Internet connection, valid email
- **Flow**: Navigate to /login or /signup → enter credentials → Firebase validates → store UID/email in localStorage → fetch/create Firestore profile → redirect to /app
- **Alternative**: Firebase blocked by adblocker → show mock mode instructions

#### UC2 — Analyze Prescription

- **Actors**: Patient, Backend, Google Gemini
- **Preconditions**: Authenticated, has prescription image (JPG/PNG/WEBP/HEIC)
- **Flow**:
  1. Drag image into UploadCard or click to browse
  2. File type validated
  3. POST /parse-prescription?languages=en,te,hi
  4. Backend: validate → Pillow preprocess → Gemini extraction (3-model fallback) → parallel translation
  5. Frontend maps JSON → resultData
  6. setView('result') — renders 5 tabs
- **Exception**: All Gemini models unavailable → graceful empty response with retry message

#### UC3 — View Medicine Details (Overview Tab)

- **Content**: Medicine cards — name, dosage, frequency, duration, instructions (EN/TE/HI), estimated MRP

#### UC4 — View Safety Warnings (Safety Tab)

- **Content**: Drug interaction warning box (if drug_interactions not null) + per-medicine side effects cards

#### UC5 — View Wellness Plan (Wellness Tab)

- **Content**: Diet and Nutrition section + Recommended Exercise + Daily Lifestyle Tips

#### UC6 — Compare Pharmacy Prices (Buy Tab)

- **Content**: 3x3 grid (top 3 medicines x 3 pharmacies)
  - Netmeds: mrp x 0.86 (14% off, BEST DEAL)
  - Tata 1mg: mrp x 0.88
  - Apollo: mrp x 0.92
  - Each cell is a deep-linked live search URL

#### UC7 — Chat with Nurse Lipi

- **Preconditions**: UC2 completed — prescription JSON loaded in chat context
- **Flow**: Open chat widget → select language (ENG/HIN/TEL) → type or click chip → fast-path reply (no API) or POST /chat → Groq/Llama-3 responds in chosen language

#### UC8 — Download PDF Report

- **Flow**: Click download button → handleDownloadReport() → jsPDF generates 5-section A4 PDF → browser saves lipirx-prescription-report.pdf

#### UC9 — View Prescription History

- **Flow**: Navigate to /history → fetch GET /history/{email} → browse past scans → click to view PatientSummaryCard
- **Note**: /history endpoint pending MySQL integration

#### UC10 — Manage Account Profile

- **Flow**: Navigate to /account → edit name → Save Changes → Firestore updateDoc

---

## 15. Database Design MySQL Proposed

The current implementation is **stateless** — no prescription data persists between sessions. The MySQL schema below is the full production design.

### 15.1 Entity-Relationship Diagram

`mermaid
erDiagram
    USERS {
        VARCHAR id PK Firebase UID string max 128 chars
        VARCHAR email UNIQUE User email
        VARCHAR name Full name
        BOOLEAN is_setup_complete Profile completion flag
        TIMESTAMP created_at Account creation time
    }
    PRESCRIPTIONS {
        INT id PK Auto-incremented
        VARCHAR user_id FK CASCADE DELETE from USERS
        VARCHAR patient_name From prescription
        VARCHAR patient_age From prescription
        VARCHAR patient_gender From prescription
        VARCHAR doctor_name From prescription
        VARCHAR hospital_name From prescription
        TEXT hospital_address From prescription
        DECIMAL confidence_score AI confidence 0.00 to 1.00
        TEXT analysis_notes Confidence explanation
        TEXT drug_interactions Warning text or null
        TEXT doctor_notes General notes
        VARCHAR follow_up Date or instruction
        VARCHAR language_code e.g. en,te,hi
        TIMESTAMP analyzed_at Scan timestamp
    }
    MEDICINES {
        INT id PK Auto-incremented
        INT prescription_id FK CASCADE DELETE from PRESCRIPTIONS
        VARCHAR name Brand name
        VARCHAR common_salt Generic chemical name
        VARCHAR dosage e.g. 500mg
        VARCHAR frequency e.g. 1-0-1
        VARCHAR duration e.g. 5 days
        VARCHAR timing e.g. after meals
        TEXT instructions_en English instruction
        TEXT instructions_te Telugu translation
        TEXT instructions_hi Hindi translation
        JSON side_effects Array of strings
        DECIMAL estimated_mrp INR price
    }
    WELLNESS_PLANS {
        INT id PK Auto-incremented
        INT prescription_id FK CASCADE DELETE
        ENUM advice_type diet or exercise or general
        TEXT recommendation_text Full advice text
    }
    CHAT_SESSIONS {
        INT id PK Auto-incremented
        VARCHAR user_id FK CASCADE DELETE from USERS
        INT prescription_id FK CASCADE DELETE from PRESCRIPTIONS
        TIMESTAMP created_at Session start time
    }
    CHAT_MESSAGES {
        INT id PK Auto-incremented
        INT session_id FK CASCADE DELETE from CHAT_SESSIONS
        ENUM sender user or nurse
        TEXT message_text Message content
        TIMESTAMP sent_at Message timestamp
    }

    USERS ||--o{ PRESCRIPTIONS : uploads
    USERS ||--o{ CHAT_SESSIONS : initiates
    PRESCRIPTIONS ||--|{ MEDICINES : contains
    PRESCRIPTIONS ||--|{ WELLNESS_PLANS : generates
    PRESCRIPTIONS ||--o{ CHAT_SESSIONS : context for
    CHAT_SESSIONS ||--|{ CHAT_MESSAGES : logs
`

### 15.2 MySQL DDL Script

`sql
-- LipiRx MySQL Database Schema
-- Engine: InnoDB | Charset: utf8mb4 | Collation: unicode_ci

-- 1. Users
CREATE TABLE users (
    id                VARCHAR(128)  NOT NULL,
    email             VARCHAR(255)  NOT NULL,
    
ame              VARCHAR(150)  NULL,
    is_setup_complete TINYINT(1)    DEFAULT 0,
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Prescriptions
CREATE TABLE prescriptions (
    id               INT            AUTO_INCREMENT,
    user_id          VARCHAR(128)   NOT NULL,
    patient_name     VARCHAR(150)   DEFAULT 'Unknown',
    patient_age      VARCHAR(50)    DEFAULT 'N/A',
    patient_gender   VARCHAR(50)    DEFAULT 'N/A',
    doctor_name      VARCHAR(150)   DEFAULT 'Unknown',
    hospital_name    VARCHAR(255)   DEFAULT 'N/A',
    hospital_address TEXT           DEFAULT NULL,
    confidence_score DECIMAL(3,2)   DEFAULT 0.00,
    nalysis_notes   TEXT           DEFAULT NULL,
    drug_interactions TEXT          DEFAULT NULL,
    doctor_notes     TEXT           DEFAULT NULL,
    ollow_up        VARCHAR(255)   DEFAULT NULL,
    language_code    VARCHAR(50)    DEFAULT 'en,te,hi',
    nalyzed_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_prescriptions_user (user_id),
    CONSTRAINT k_prescriptions_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Medicines
CREATE TABLE medicines (
    id              INT            AUTO_INCREMENT,
    prescription_id INT            NOT NULL,
    
ame            VARCHAR(255)   NOT NULL,
    common_salt     VARCHAR(255)   DEFAULT 'Unknown',
    dosage          VARCHAR(100)   DEFAULT NULL,
    requency       VARCHAR(100)   DEFAULT NULL,
    duration        VARCHAR(100)   DEFAULT NULL,
    	iming          VARCHAR(255)   DEFAULT NULL,
    instructions_en TEXT           NOT NULL,
    instructions_te TEXT           DEFAULT NULL,
    instructions_hi TEXT           DEFAULT NULL,
    side_effects    JSON           DEFAULT NULL,
    estimated_mrp   DECIMAL(10,2)  DEFAULT 0.00,
    PRIMARY KEY (id),
    KEY idx_medicines_prescription (prescription_id),
    CONSTRAINT k_medicines_prescription
        FOREIGN KEY (prescription_id) REFERENCES prescriptions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Wellness Plans
CREATE TABLE wellness_plans (
    id                  INT     AUTO_INCREMENT,
    prescription_id     INT     NOT NULL,
    dvice_type         ENUM('diet', 'exercise', 'general') NOT NULL,
    ecommendation_text TEXT    NOT NULL,
    PRIMARY KEY (id),
    KEY idx_wellness_prescription (prescription_id),
    CONSTRAINT k_wellness_prescription
        FOREIGN KEY (prescription_id) REFERENCES prescriptions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Chat Sessions
CREATE TABLE chat_sessions (
    id              INT           AUTO_INCREMENT,
    user_id         VARCHAR(128)  NOT NULL,
    prescription_id INT           NOT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_chats_user         (user_id),
    KEY idx_chats_prescription (prescription_id),
    CONSTRAINT k_chats_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT k_chats_prescription
        FOREIGN KEY (prescription_id) REFERENCES prescriptions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Chat Messages
CREATE TABLE chat_messages (
    id           INT    AUTO_INCREMENT,
    session_id   INT    NOT NULL,
    sender       ENUM('user', 'nurse') NOT NULL,
    message_text TEXT   NOT NULL,
    sent_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_messages_session (session_id),
    CONSTRAINT k_messages_session
        FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

### 15.3 Table Key Relationships

| Table | PK | Foreign Keys | Cascade On Delete |
|---|---|---|---|
| users | id (Firebase UID) | — | Root table |
| prescriptions | id (INT auto) | user_id → users.id | Deletes all scans |
| medicines | id (INT auto) | prescription_id → prescriptions.id | Deletes all medicines |
| wellness_plans | id (INT auto) | prescription_id → prescriptions.id | Deletes all wellness |
| chat_sessions | id (INT auto) | user_id + prescription_id | Both cascade delete |
| chat_messages | id (INT auto) | session_id → chat_sessions.id | Deletes all messages |

---

## 16. Software and Hardware Requirements

### 16.1 Hardware Requirements

| Environment | CPU | RAM | Storage |
|---|---|---|---|
| Development Workstation | Quad-core (Intel Core i5 / AMD Ryzen 5 or equivalent) | 8 GB minimum, 16 GB recommended | 20 GB free SSD |
| Production Backend Server | 1 vCPU | 512 MB minimum (compatible with Render/Fly.io free tier) | 1 GB |
| Client Device | Any modern device with a web browser | Any | None (stateless client) |

### 16.2 Software Requirements

| Category | Technology | Version |
|---|---|---|
| OS (Dev) | Windows 10/11, macOS, Linux | Any |
| OS (Prod) | Ubuntu 20.04+ / Debian 11+ | LTS |
| Python | CPython | 3.10+ |
| Node.js | Node.js | 18.0.0+ |
| npm | npm | 9.0.0+ |
| Next.js | Next.js | 16.2.6 |
| React | React | 19.2.4 |
| FastAPI | FastAPI | 0.115.x |
| Uvicorn | Uvicorn ASGI | 0.34.x |
| Google Gemini SDK | google-genai | Latest |
| Groq Client | groq | Latest |
| Translation | deep-translator | 1.11.x |
| Image Processing | Pillow | Latest |
| Cryptography | cryptography | Latest |
| Framer Motion | framer-motion | 12.38.0 |
| Three.js | three | 0.184.0 |
| Post-processing | postprocessing | 6.39.1 |
| Icons | lucide-react | 1.14.0 |
| PDF Generation | jsPDF | 4.2.1 |
| Firebase | firebase | 10.12.0 |
| Database (Proposed) | MySQL | 8.0+ |

### 16.3 Python Dependencies (requirements.txt)

`
fastapi
uvicorn
python-multipart
pillow
httpx
groq
python-dotenv
requests
deep-translator
google-genai
cryptography
`

### 16.4 Frontend npm Dependencies (package.json)

`json
{
   dependencies: {
    firebase: ^10.12.0,
    face-api.js: ^0.22.2,
    framer-motion: ^12.38.0,
    jspdf: ^4.2.1,
    lucide-react: ^1.14.0,
    motion: ^12.38.0,
    next: 16.2.6,
    postprocessing: ^6.39.1,
    react: 19.2.4,
    react-dom: 19.2.4,
    three: ^0.184.0
  }
}
`

---

## 17. Environment Configuration

### 17.1 Backend Environment Variables (backend/.env)

`env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
MASTER_ENCRYPTION_KEY=your_fernet_aes_256_key
ENVIRONMENT=dev
PORT=8000
`

### 17.2 Frontend Environment Variables (frontend/.env.local)

`env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
# Enable local mock database/auth
NEXT_PUBLIC_USE_MOCK_FIREBASE=true
`

---

## 18. Development Setup and Running Locally

### 18.1 Backend Setup

`ash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate
pip install -r requirements.txt
python main.py
`

FastAPI will run on http://localhost:8000 with docs at /docs.

### 18.2 Frontend Setup

`ash
cd frontend
npm install
npm run dev
`

Next.js will run on http://localhost:3000.

---

## 19. Literature Survey

### 19.1 Handwriting Recognition in Healthcare

Handwriting recognition of medical prescriptions is a classic problem in healthcare informatics. Older systems utilizing Tesseract or basic OCR models struggle heavily with typical cursive physician scripts, low resolution, folds on papers, and specific medical abbreviations (such as frequency notation like 1-0-1 or Latin codes like a.c. and p.c.). 

Multimodal Large Language Models (LLMs), specifically the Google Gemini 1.5/2.5 families, solve this by combining image scanning with clinical vocabulary heuristics. If a visual stroke is ambiguous, Gemini uses surrounding context (such as dosage specifications, standard salts, and Indian pharma databases) to autocorrect and resolve the text matching the most probable drug.

### 19.2 Saliency of Regional Language Translations

Medical adherence drops significantly when patients do not understand instruction manuals or labels. Translating instructions into local scripts (such as Hindi or Telugu in India) bridges the primary comprehension gap. Utilizing parallel asynchronous execution via Python's ThreadPoolExecutor ensures that translating prescription labels to multiple targets does not add sequential REST latency to the pipeline, keeping turnaround time below 60 seconds.

---

## 20. Existing vs Proposed System Comparison

| Feature | Existing Manual/Traditional OCR | Proposed LipiRx Engine |
|---|---|---|
| **Prescription Input** | Manual transcription or basic text extraction | Multimodal Vision AI with pharmaceutical spelling autocorrection |
| **Translation** | English only | Parallelized Hindi and Telugu translation (scalable to others) |
| **Interactive Chat** | None | Nurse Lipi AI Assistant (Llama-3.3-70b) with full prescription context |
| **Drug Interactions** | Relies on manual pharmacist warning | Automatic warnings calculated by Gemini |
| **Wellness Advice** | None or brief verbal | Custom condition-deduced diet & exercise plan |
| **Pharmacy Comparison** | Manual store-by-store visits | 3-pharmacy price comparison grid with deep-links |
| **Report Export** | Scanned image only | Clean, structured, downloadable PDF report |
| **Local Resources** | Requires high GPU/RAM (EasyOCR/Torch) | Pure API-driven endpoints, runs on 512 MB Render free tier |

---

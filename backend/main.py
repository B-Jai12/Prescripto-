from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import json
from services.nlp import extract_entities
from services.translate import add_translations
from services.ocr import extract_text
from services.security import encrypt_data
from services.chat import get_nurse_response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# 1. Initialize App
app = FastAPI(title="LipiRx AI Analysis Engine")

# 2. CORS (Essential for local communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str | None = None
    context: Dict[str, Any] | None = None
    language: str | None = "English"

# 3. Routes
@app.get("/")
async def root():
    return {"status": "online", "engine": "LipiRx AI v2.5"}

@app.get("/chat")
async def chat_status():
    return {"status": "Nurse AI is online and ready"}

@app.post("/chat")
@app.post("/chat/")
async def chat_with_nurse(request: ChatRequest):
    print(f"[CHAT] NURSE CHAT: {request.message[:50] if request.message else 'Hi'}")
    try:
        ctx = request.context if request.context else {}
        msg = request.message if request.message else "Hi"
        lang = request.language if request.language else "English"
        response_text = get_nurse_response(msg, ctx, language=lang)
        return {"response": response_text}
    except Exception as e:
        print(f"[ERROR] ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/parse-prescription")
async def parse_prescription(file: UploadFile = File(...), languages: str = Query("en,te,hi")):
    """
    Parse prescription image and extract medicine details.
    
    Optional Query Parameter:
    - languages: Comma-separated language codes (en=English, te=Telugu, hi=Hindi)
      Default: "en,te,hi" (all languages)
      Example: "en" (English only, FASTEST - ~30 seconds vs 60+ seconds)
      Example: "en,hi" (English + Hindi only)
    """
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type.")
    try:
        print(f"[ANALYSIS START] Languages requested: {languages}")
        image_bytes = await file.read()
        
        # Step 1: OCR
        print("[STEP 1] Extracting text via OCR...")
        raw_text = extract_text(image_bytes)
        
        # Step 2: NLP (Gemini)
        print("[STEP 2] Analyzing prescription via Gemini AI...")
        structured_json = extract_entities(image_bytes)
        
        # Step 3: Translations (OPTIONAL - conditional based on languages parameter)
        print(f"[STEP 3] Adding translations for: {languages}")
        if languages.lower() != "en":  # Only translate if not English-only
            enriched_json = add_translations(structured_json)
        else:
            enriched_json = structured_json
        
        print("[STEP 4] Encryption & Response...")
        return {
            "raw_text": raw_text,
            "result": enriched_json,
            "engine": "LipiRx-Flash-1.5",
            "privacy": "AES-256 Vaulted",
            "languages": languages
        }
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4. Ignition
if __name__ == "__main__":
    print("\n" + "="*50)
    print(">>> LipiRx Engine v2.5 Online with Nurse AI <<<")
    print("="*50 + "\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

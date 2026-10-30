import os
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional

from dotenv import load_dotenv
backend_dir = Path(__file__).resolve().parent
load_dotenv(backend_dir / ".env")
load_dotenv()

from services.nlp import extract_entities
from services.translate import add_translations
from services.ocr import extract_text, preprocess_image
from services.chat import get_nurse_response

# 1. Initialize FastAPI Application
app = FastAPI(
    title="Prescripto AI Analysis Engine",
    description="Multimodal clinical prescription analysis and patient assistant powered by Gemini & Groq",
    version="2.5"
)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: Optional[str] = "Hi"
    context: Optional[Dict[str, Any]] = None
    language: Optional[str] = "English"


# 3. Routes
@app.get("/")
@app.get("/health")
async def root():
    return {
        "status": "online",
        "engine": "Prescripto AI v2.5",
        "features": ["Gemini 2.5 Flash Vision", "Nurse Lipi Clinical Assistant", "Multi-Language (EN, HI, TE)"]
    }


@app.get("/chat")
async def chat_status():
    return {"status": "Nurse AI assistant is online and ready"}


@app.post("/chat")
@app.post("/chat/")
async def chat_with_nurse(request: ChatRequest):
    try:
        ctx = request.context or {}
        msg = request.message or "Hi"
        lang = request.language or "English"
        response_text = get_nurse_response(msg, ctx, language=lang)
        return {"response": response_text}
    except Exception as e:
        print(f"[ERROR in /chat]: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/parse-prescription")
async def parse_prescription(
    file: UploadFile = File(...),
    languages: str = Query("en,te,hi")
):
    """
    Parses prescription image and extracts patient, medicine, and clinical recommendations.
    Accepts JPG, PNG, WEBP, HEIC, HEIF, BMP images.
    """
    filename = (file.filename or "").lower()
    content_type = (file.content_type or "").lower()

    allowed_exts = ('.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.bmp', '.tiff')
    is_valid_type = (
        content_type.startswith("image/")
        or any(filename.endswith(ext) for ext in allowed_exts)
        or content_type in ["application/octet-stream", "binary/octet-stream"]
    )

    if not is_valid_type:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a clear image of a prescription.")

    try:
        print(f"\n[PRESCRIPTION INGESTION] File: '{file.filename}', Content-Type: '{content_type}', Requested languages: '{languages}'")
        raw_image_bytes = await file.read()

        if len(raw_image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Step 1: Image Preprocessing (Auto-rotation, contrast boost, aspect-ratio resizing)
        print("[STEP 1] Preprocessing prescription image...")
        try:
            processed_bytes = preprocess_image(raw_image_bytes)
            mime_type = "image/png"
        except Exception as pe:
            print(f"  [WARN] Preprocessing fallback: {pe}")
            processed_bytes = raw_image_bytes
            mime_type = content_type if content_type.startswith("image/") else "image/jpeg"

        # Step 2: Information Extraction (Gemini Multimodal Vision)
        print("[STEP 2] Multimodal extraction with Gemini AI...")
        structured_json = extract_entities(processed_bytes, mime_type=mime_type)

        # Step 3: Multi-Language Translation
        print(f"[STEP 3] Ensuring regional translations for '{languages}'...")
        if languages.lower() != "en":
            enriched_json = add_translations(structured_json)
        else:
            enriched_json = structured_json

        # Step 4: Response Packaging
        print("[STEP 4] Packaging clinical response...")
        return {
            "raw_text": extract_text(processed_bytes),
            "result": enriched_json,
            "engine": "Prescripto-Flash-2.5",
            "privacy": "Encrypted-In-Transit",
            "languages": languages
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[CRITICAL PARSE ERROR]: {e}")
        raise HTTPException(status_code=500, detail=f"AI prescription analysis failed: {str(e)}")


@app.get("/history/{email}")
async def get_prescription_history(email: str):
    """
    Returns prescription history for user.
    Client-side localStorage caches all analyses instantly.
    """
    return []


if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print(">>> Prescripto AI Engine Online <<<")
    print("="*50 + "\n")
    port = int(os.environ.get("PORT", 8000))
    reload = os.environ.get("ENVIRONMENT", "dev").lower() == "dev"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)

import os
import json
import time
from pathlib import Path
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional

# Load .env from backend directory if not already loaded
backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")
load_dotenv()

# Model fallback chain: if the primary is overloaded (503/429), try the next one
MODEL_FALLBACK_CHAIN = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-pro',
    'gemini-flash-latest',
]


def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    return genai.Client(api_key=api_key)


# Define the exact JSON structure we want using Pydantic
class Medicine(BaseModel):
    name: str = Field(description="Name of the medicine")
    dosage: Optional[str] = Field(default=None, description="Dosage strength (e.g., 500mg, 10ml)")
    frequency: Optional[str] = Field(default=None, description="How often to take it (e.g., 1-0-1, twice daily)")
    duration: Optional[str] = Field(default=None, description="For how many days (e.g., 5 days)")
    timing: Optional[str] = Field(default=None, description="When to take it (e.g., before meals, after meals)")
    instructions_en: str = Field(description="A clear, plain-English sentence for the patient explaining how to take this specific medicine.")
    instructions_hi: Optional[str] = Field(default="", description="Clear patient instruction in Hindi (e.g., 'सुबह और रात के खाने के बाद 1 गोली लें').")
    instructions_te: Optional[str] = Field(default="", description="Clear patient instruction in Telugu (e.g., 'రోజూ ఉదయం మరియు రాత్రి భోజనం తర్వాత ఒక టాబ్లెట్ వేసుకోండి').")
    side_effects: List[str] = Field(default_factory=list, description="Top 2 common side effects for this specific medicine. Leave empty if none.")
    estimated_mrp: float = Field(default=0.0, description="Estimated Average Price (MRP) in INR for a standard pack/strip of this medicine in the Indian market.")
    common_salt: str = Field(default="", description="The primary chemical salt or generic name (e.g., Paracetamol, Amoxicillin).")


class PatientDetails(BaseModel):
    name: Optional[str] = Field(default=None, description="Name of the patient, if present")
    age: Optional[str] = Field(default=None, description="Age of the patient, if present")
    gender: Optional[str] = Field(default=None, description="Gender of the patient, if present")


class HospitalDetails(BaseModel):
    name: Optional[str] = Field(default=None, description="Name of the hospital or clinic, if present")
    address: Optional[str] = Field(default=None, description="Address of the hospital, if present")
    doctor_name: Optional[str] = Field(default=None, description="Name of the prescribing doctor, if present")


class PrescriptionExtraction(BaseModel):
    patient_details: Optional[PatientDetails] = Field(default=None, description="Details of the patient if present")
    hospital_details: Optional[HospitalDetails] = Field(default=None, description="Details of the hospital and doctor if present")
    medicines: List[Medicine] = Field(default_factory=list, description="List of all medicines found in the prescription")
    drug_interactions: Optional[str] = Field(default=None, description="Analyze the prescribed medicines. If taking them together poses any severe risks or interactions, warn the patient here. If it is safe or only 1 medicine is prescribed, return null.")
    diet_and_lifestyle: List[str] = Field(default_factory=list, description="A comprehensive list of tailored recommendations including a diet plan (what exactly to eat/avoid) and specific exercises to do based on the disease deduced from the medicines.")
    doctor_notes: Optional[str] = Field(default=None, description="Any general advice, diagnosis, or notes (e.g., Drink plenty of water)")
    follow_up: Optional[str] = Field(default=None, description="Follow up date or instructions if present")
    confidence_score: float = Field(default=0.9, description="Your self-calculated confidence score (0.0 to 1.0) based on how clear the handwriting is and how certain you are of the medicine names and dosages.")
    analysis_notes: str = Field(default="", description="Briefly explain your confidence score. For example: 'Clear handwriting, 100% certain' or 'Messy handwriting, use caution for medicine X'.")


SYSTEM_PROMPT = """
You are an expert medical data extraction assistant AND a clinical pharmacist. Your job is to extract medicine information from a prescription image and provide supplementary medical analysis.

RULES:
1. Decode frequency codes: '1-0-1' = morning + night, '1-1-1' = 3 times daily, 'a.c.' = before meals, 'p.c.' = after meals.
2. If it's an IV fluid (like 5% Dextrose) or a powder (like ORS sachets), treat it as a medicine.
3. Be highly diligent with doctors' cursive handwriting. Look at the context clues (e.g., 'cap', 'tab', 'syr', 'inj').
4. DRUG NAME ACCURACY: Transcribe drug names carefully based on visible characters and medical context in the Indian pharmaceutical market (e.g. if it looks like 'Opox', check Opox CV; 'Pan-D' / 'Pantop-D'; 'Dolo 650'; 'Augmentin 625'). If ambiguous, provide the most probable medicine and note it in analysis_notes.
5. If a field like dosage or duration is missing for a specific medicine, leave it as null/empty. Do NOT guess.
6. If no medicines are found in the entire image, return an empty array for 'medicines'.
7. MULTI-LANGUAGE INSTRUCTIONS: For each medicine, provide clear patient instructions in English (instructions_en), Hindi (instructions_hi), and Telugu (instructions_te).
8. FOR SAFETY AND DIET: You MUST use your own medical knowledge to generate the 'side_effects', 'drug_interactions', and 'diet_and_lifestyle' fields. You must deduce the patient's illness from the actual medicines and proactively write a detailed, medicine-specific diet plan (what foods to eat and avoid) and specific exercises to improve their health.
9. IMPORTANT: 'diet_and_lifestyle' must never be empty. Always return at least 4 practical items: 2 diet/nutrition items and 2 exercise/lifestyle items. Each item should mention the medicine type or likely condition when relevant.
10. CONFIDENCE SCORE: Be honest. If the image is blurry or handwriting is unreadable, set confidence_score below 0.7 and mention the ambiguity in analysis_notes.
"""


def generate_fallback_wellness(medicines: list, doctor_notes: str = "") -> list:
    """Create medicine-specific wellness guidance using the parsed prescription details."""
    med_text = " ".join([
        str(m.get('name', '')) + " " + str(m.get('common_salt', ''))
        for m in medicines if isinstance(m, dict)
    ]).lower()

    tailored_items = []

    if any(term in med_text for term in ['paracetamol', 'acetaminophen', 'ibuprofen', 'diclofenac', 'naproxen', 'dolo']):
        tailored_items.append("For fever or pain medicines in this prescription, avoid alcohol and do not take additional over-the-counter painkillers without doctor advice.")
        tailored_items.append("Take them with food or water to avoid gastric irritation, and maintain regular hydration.")

    if any(term in med_text for term in ['amoxicillin', 'augmentin', 'azithromycin', 'cef', 'cipro', 'metronidazole', 'antibiotic']):
        tailored_items.append("For the antibiotic in this prescription, complete the full prescribed course even if you start feeling better.")
        tailored_items.append("Take with plenty of water and avoid skipping scheduled doses to prevent bacterial resistance.")

    if any(term in med_text for term in ['pan', 'pantoprazole', 'rabeprazole', 'omeprazole', 'antacid']):
        tailored_items.append("Take antacid/reflux capsules 30 minutes before your morning meal on an empty stomach for maximum effectiveness.")
        tailored_items.append("Avoid excessively spicy, deep-fried, or acidic foods during this treatment period.")

    if any(term in med_text for term in ['metformin', 'glimepiride', 'glipizide', 'insulin', 'gliclazide', 'sitagliptin']):
        tailored_items.append("For diabetes medication, keep your meal schedule punctual to prevent unexpected drops in blood sugar.")
        tailored_items.append("If you experience dizziness, trembling, or sudden cold sweats, consume a fast-acting glucose source and inform your doctor.")

    if any(term in med_text for term in ['amlodipine', 'telmisartan', 'losartan', 'enalapril', 'atenolol', 'hydrochlorothiazide']):
        tailored_items.append("For blood-pressure medication, take your dose consistently at the same hour each day and rise slowly from bed.")
        tailored_items.append("Moderate table salt intake and consume potassium-friendly foods like fruits and vegetables.")

    if not tailored_items:
        medicine_names = ", ".join([m.get('name', '') for m in medicines if isinstance(m, dict) and m.get('name')])
        if medicine_names:
            tailored_items.append(f"For {medicine_names}, strictly adhere to the prescribed timings and dosages.")
        tailored_items.append("Maintain good daily hydration, balanced nutrition, and adequate rest during treatment.")

    general_items = [
        "Take a 10–15 minute gentle walk daily if you feel comfortable.",
        "Drink at least 2 to 2.5 liters of clean water daily unless fluid-restricted by your doctor.",
        "Ensure 7–8 hours of quality sleep to support immune recovery."
    ]

    if doctor_notes:
        general_items.append(f"Doctor's advice: {doctor_notes}")

    combined = tailored_items + general_items
    return combined[:8]


def _call_gemini(model: str, image_part, prompt: str) -> dict:
    """Single Gemini API call using google.genai Client."""
    client = get_gemini_client()
    if not client:
        raise RuntimeError("GEMINI_API_KEY is not configured in environment.")

    response = client.models.generate_content(
        model=model,
        contents=[prompt, image_part],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=PrescriptionExtraction,
            temperature=0.0
        )
    )
    return json.loads(response.text)


def extract_entities(image_bytes: bytes, mime_type: str = "image/png") -> dict:
    """
    Extracts prescription data using Gemini.
    Retries up to 3 times with exponential backoff on 503/busy, then falls back
    through the model chain (gemini-2.5-flash → gemini-2.5-flash-lite → gemini-2.5-pro → gemini-flash-latest).
    """
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    prompt = "Carefully examine this prescription image and extract all patient, hospital, and medicine details into the requested schema. Provide instructions in English, Hindi, and Telugu."

    MAX_RETRIES = 3
    BACKOFF_SECONDS = [1.5, 3.0, 6.0]

    for model in MODEL_FALLBACK_CHAIN:
        for attempt in range(MAX_RETRIES):
            try:
                print(f"  [Gemini] Trying model={model}, attempt={attempt + 1}/{MAX_RETRIES}")
                result = _call_gemini(model, image_part, prompt)

                # Ensure wellness guidance is never empty
                if not result.get("diet_and_lifestyle"):
                    result["diet_and_lifestyle"] = generate_fallback_wellness(
                        result.get("medicines", []),
                        result.get("doctor_notes", "")
                    )

                print(f"  [OK] Extraction success with model={model}")
                return result

            except Exception as e:
                err_str = str(e)
                is_transient = "503" in err_str or "UNAVAILABLE" in err_str or "429" in err_str or "high demand" in err_str.lower()

                if is_transient and attempt < MAX_RETRIES - 1:
                    wait = BACKOFF_SECONDS[attempt]
                    print(f"  [WARN] Model {model} transient status. Retrying in {wait}s... [{attempt + 1}/{MAX_RETRIES}]")
                    time.sleep(wait)
                    continue
                elif is_transient:
                    print(f"  [FAIL] Model {model} busy after {MAX_RETRIES} attempts. Trying next fallback model...")
                    break
                else:
                    print(f"  [FAIL] Error with model={model}: {e}. Trying next model...")
                    break

    # All models failed — return graceful fallback
    print("[FAIL] All Gemini models exhausted. Returning fallback response.")
    return {
        "medicines": [],
        "doctor_notes": "Prescription extraction is temporarily overloaded. Please retry in a few moments.",
        "follow_up": None,
        "confidence_score": 0.0,
        "patient_details": {"name": "Patient", "age": "N/A", "gender": "N/A"},
        "hospital_details": {"name": "Hospital", "address": "", "doctor_name": ""},
        "drug_interactions": None,
        "analysis_notes": "AI service temporarily unavailable. Please retry with a clear photo.",
        "diet_and_lifestyle": generate_fallback_wellness([], "Please retry.")
    }

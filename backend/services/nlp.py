import os
import json
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional

load_dotenv()

# Configure Gemini
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Model fallback chain: if the primary is overloaded (503), try the next one
MODEL_FALLBACK_CHAIN = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
]


# Define the exact JSON structure we want using Pydantic
# Define a "Lean" structure to save Google tokens
class Medicine(BaseModel):
    name: str = Field(description="Name of the medicine")
    dosage: Optional[str] = Field(description="Dosage strength (e.g., 500mg, 10ml)")
    frequency: Optional[str] = Field(description="How often to take it (e.g., 1-0-1, twice daily)")
    duration: Optional[str] = Field(description="For how many days (e.g., 5 days)")
    timing: Optional[str] = Field(description="When to take it (e.g., before meals, after meals)")
    instructions_en: str = Field(description="A clear, plain-English sentence for the patient explaining how to take this specific medicine.")
    side_effects: List[str] = Field(default_factory=list, description="Top 2 common side effects for this specific medicine. Leave empty if none.")
    estimated_mrp: float = Field(description="Estimated Average Price (MRP) in INR for a standard pack/strip of this medicine in the Indian market.")
    common_salt: str = Field(description="The primary chemical salt or generic name (e.g., Paracetamol, Amoxicillin).")

class PatientDetails(BaseModel):
    name: Optional[str] = Field(description="Name of the patient, if present")
    age: Optional[str] = Field(description="Age of the patient, if present")
    gender: Optional[str] = Field(description="Gender of the patient, if present")

class HospitalDetails(BaseModel):
    name: Optional[str] = Field(description="Name of the hospital or clinic, if present")
    address: Optional[str] = Field(description="Address of the hospital, if present")
    doctor_name: Optional[str] = Field(description="Name of the prescribing doctor, if present")

class PrescriptionExtraction(BaseModel):
    patient_details: Optional[PatientDetails] = Field(description="Details of the patient if present")
    hospital_details: Optional[HospitalDetails] = Field(description="Details of the hospital and doctor if present")
    medicines: List[Medicine] = Field(description="List of all medicines found in the prescription")
    drug_interactions: Optional[str] = Field(description="Analyze the prescribed medicines. If taking them together poses any severe risks or interactions, warn the patient here. If it is safe or only 1 medicine is prescribed, return null.")
    diet_and_lifestyle: List[str] = Field(default_factory=list, description="A comprehensive list of tailored recommendations including a diet plan (what exactly to eat/avoid) and specific exercises to do based on the disease deduced from the medicines.")
    doctor_notes: Optional[str] = Field(description="Any general advice, diagnosis, or notes (e.g., Drink plenty of water)")
    follow_up: Optional[str] = Field(description="Follow up date or instructions if present")
    confidence_score: float = Field(description="Your self-calculated confidence score (0.0 to 1.0) based on how clear the handwriting is and how certain you are of the medicine names and dosages.")
    analysis_notes: str = Field(description="Briefly explain your confidence score. For example: 'Clear handwriting, 100% certain' or 'Messy handwriting, use caution for medicine X'.")

SYSTEM_PROMPT = """
You are an expert medical data extraction assistant AND a clinical pharmacist. Your job is to extract medicine information from a prescription image and provide supplementary medical analysis.

RULES:
1. Decode frequency codes: '1-0-1' = morning + night, '1-1-1' = 3 times daily, 'a.c.' = before meals, 'p.c.' = after meals.
2. If it's an IV fluid (like 5% Dextrose) or a powder (like ORS sachets), treat it as a medicine.
3. Be highly diligent with doctors' cursive handwriting. Look at the context clues (e.g., 'cap', 'tab', 'syr', 'inj').
4. AUTOCORRECT DRUG NAMES: If the handwriting is messy, autocorrect the drug name to the closest real medicine available in the Indian pharmaceutical market (e.g. if it looks like 'Opor. w' or 'Opox', it is likely 'Opox CV'. If it looks like 'Swipes-D' or 'Shipas-D', it might be 'Pantop-D' or 'Pan-D'. 'Allurose' might be 'Aldrose').
5. If a field like dosage or duration is missing for a specific medicine, leave it as null/empty. Do NOT guess.
6. If no medicines are found in the entire image, return an empty array for 'medicines'.
7. FOR SAFETY AND DIET: You MUST use your own medical knowledge to generate the 'side_effects', 'drug_interactions', and 'diet_and_lifestyle' fields. Do NOT just look for this advice on the prescription paper. You must deduce the patient's illness from the actual medicines and proactively write a detailed, medicine-specific diet plan (what foods to eat and avoid) and specific exercises to improve their health.
8. IMPORTANT: 'diet_and_lifestyle' must never be empty. Always return at least 4 practical items: 2 diet/nutrition items and 2 exercise/lifestyle items, even if the image is unclear. Each item should mention the medicine type or likely condition when relevant, not generic filler.
9. CONFIDENCE SCORE: Be honest. If the image is blurry or handwriting is unreadable, set confidence_score below 0.7 and mention the ambiguity in analysis_notes.
"""

def generate_fallback_wellness(medicines: list, doctor_notes: str = "") -> list:
    """Create medicine-specific wellness guidance using the parsed prescription details."""
    med_text = " ".join([
        str(m.get('name', '')) + " " + str(m.get('common_salt', ''))
        for m in medicines if isinstance(m, dict)
    ]).lower()

    tailored_items = []

    if any(term in med_text for term in ['paracetamol', 'acetaminophen', 'ibuprofen', 'diclofenac', 'naproxen']):
        tailored_items.append("For pain/fever medicines in this prescription, avoid alcohol and avoid taking extra painkillers unless your doctor advises it.")
        tailored_items.append("Take them with food or milk if you feel stomach discomfort, and keep your meals regular.")

    if any(term in med_text for term in ['amoxicillin', 'azithromycin', 'cef', 'cipro', 'metronidazole', 'antibiotic']):
        tailored_items.append("For the antibiotic in this prescription, finish the full course, take it with water, and avoid alcohol during treatment.")
        tailored_items.append("Avoid very spicy or oily food for the first day if your stomach feels sensitive.")

    if any(term in med_text for term in ['metformin', 'glimepiride', 'glipizide', 'insulin', 'gliclazide', 'sitagliptin']):
        tailored_items.append("For diabetes medicines in this prescription, take them on time and do not skip meals; keep your food schedule regular.")
        tailored_items.append("If you feel dizzy or weak, check your blood sugar and inform your doctor.")

    if any(term in med_text for term in ['amlodipine', 'telmisartan', 'losartan', 'enalapril', 'atenolol', 'hydrochlorothiazide']):
        tailored_items.append("For blood-pressure medicines in this prescription, rise slowly from bed, stay hydrated, and avoid standing too quickly.")
        tailored_items.append("Reduce extra salt in meals and keep your water intake steady unless your doctor restricts it.")

    if any(term in med_text for term in ['prednisolone', 'steroid', 'dexamethasone', 'betamethasone']):
        tailored_items.append("For steroid-based treatment, avoid skipping meals, monitor for stomach upset, and keep your sleep routine consistent.")
        tailored_items.append("Avoid crowded places or infections when possible and report any unusual swelling or mood changes to your doctor.")

    if any(term in med_text for term in ['iron', 'folic', 'vitamin d', 'calcium', 'multivitamin']):
        tailored_items.append("For vitamin or mineral supplements in this prescription, take them with food and avoid taking them with tea/coffee at the same time.")
        tailored_items.append("Include protein-rich foods such as eggs, lentils, yogurt, or milk if your doctor allows them.")

    if not tailored_items:
        medicine_names = ", ".join([m.get('name', '') for m in medicines if m.get('name')])
        if medicine_names:
            tailored_items.append(f"For {medicine_names}, follow the prescribed dose timing and do not increase or stop the medicine on your own.")
        tailored_items.append("Maintain a regular meal plan, keep hydrated, and avoid alcohol while on this treatment.")

    general_items = [
        "Do a 10–15 minute light walk after meals if your doctor approves.",
        "Practice 5 minutes of gentle stretching or breathing exercises daily for comfort and circulation.",
        "Keep your sleep routine consistent and do not skip doses unless your doctor says to do so.",
    ]

    if doctor_notes:
        general_items.append(f"Follow the doctor’s note: {doctor_notes}")

    combined = tailored_items + general_items
    return combined[:8]


def _call_gemini(model: str, image_part, prompt: str) -> dict:
    """Single Gemini API call. Raises on error."""
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


def extract_entities(image_bytes: bytes) -> dict:
    """
    Extracts prescription data using Gemini.
    Retries up to 3 times with exponential backoff on 503, then falls back
    through the model chain (2.5-flash → 1.5-flash → 1.5-pro).
    """
    image_part = types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg')
    prompt = "Carefully read this prescription and extract the medical data exactly into the requested JSON schema."

    MAX_RETRIES = 3
    BACKOFF_SECONDS = [2, 4, 8]

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

                print(f"  ✅ Success with model={model}")
                return result

            except Exception as e:
                err_str = str(e)
                is_503 = "503" in err_str or "UNAVAILABLE" in err_str or "high demand" in err_str.lower()

                if is_503 and attempt < MAX_RETRIES - 1:
                    wait = BACKOFF_SECONDS[attempt]
                    print(f"  ⚠️  Model {model} busy (503). Retrying in {wait}s... [{attempt + 1}/{MAX_RETRIES}]")
                    time.sleep(wait)
                    continue
                elif is_503:
                    print(f"  ❌ Model {model} still busy after {MAX_RETRIES} attempts. Trying next model...")
                    break  # Move to next model in fallback chain
                else:
                    # Non-503 error — don't retry, just log and fall back
                    print(f"  ❌ NLP Error (non-503) with model={model}: {e}")
                    break

    # All models failed — return a graceful error response
    print("❌ All Gemini models failed. Returning fallback response.")
    return {
        "medicines": [],
        "doctor_notes": "The AI analysis service is temporarily overloaded. Please try again in a minute.",
        "follow_up": None,
        "confidence_score": 0.0,
        "patient_details": {"name": "N/A", "age": "N/A", "gender": "N/A"},
        "hospital_details": {"name": "N/A", "address": "N/A", "doctor_name": "N/A"},
        "drug_interactions": None,
        "analysis_notes": "Service temporarily unavailable. Please retry.",
        "diet_and_lifestyle": generate_fallback_wellness([], "Please retry in 1-2 minutes.")
    }


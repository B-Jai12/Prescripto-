import os
import requests
from dotenv import load_dotenv

# Load .env immediately
load_dotenv()

API_KEY = os.environ.get("GROQ_API_KEY")


def format_medication_reply(user_message: str, prescription_context: dict) -> str | None:
    """Return a simple, patient-friendly medication instruction summary when the user asks how/when to take medicines."""
    text = (user_message or "").lower()
    if not prescription_context:
        return None

    medicines = prescription_context.get("medicines") or prescription_context.get("result", {}).get("medicines", []) or []
    if not medicines:
        return None

    asks_how_when = any(k in text for k in ["how", "when", "take", "dose", "timing", "medicine", "medicines", "tablet", "capsule", "morning", "night"])
    if not asks_how_when:
        return None

    lines = ["Here is how to take your medicine."]
    for i, med in enumerate(medicines, start=1):
        name = med.get("name") or "Medicine"
        dosage = med.get("dosage") or med.get("strength") or ""
        timing = med.get("timing") or med.get("instructions_en") or med.get("instructions") or ""
        frequency = med.get("frequency") or ""
        duration = med.get("duration") or ""
        side_effects = med.get("side_effects") or []

        lines.append(f"- Medicine {i}: {name}")
        if dosage:
            lines.append(f"  Dose: {dosage}")
        if frequency:
            lines.append(f"  How often: {frequency}")
        if timing:
            lines.append(f"  When to take: {timing}")
        if duration:
            lines.append(f"  How long: {duration}")
        if side_effects:
            lines.append(f"  Possible side effects: {', '.join(side_effects)}")

    lines.append("- Safety: Take the medicine exactly as prescribed. If you feel dizzy or have side effects, contact your doctor.")
    return "\n".join(lines)


SYSTEM_PROMPT = """
You are 'Lipi', a dedicated 24/7 medical assistant for the LipiRx platform.
Your goal is to provide clear, empathetic, and accurate information based ONLY on the prescription context provided.

RULES:
1. CONTEXT FIRST: Always refer to the specific medicines and instructions in the user's prescription.
2. EMPATHY: Be kind and professional. Use phrases like "I understand," or "I'm here to help."
3. SAFETY FIRST: If a user asks something dangerous or outside your knowledge, advise them to "Please consult your prescribing doctor immediately."
4. NO GUESSING: If the prescription doesn't mention something, don't make assumptions.
5. ANSWER STYLE: For medication questions, give a direct, patient-friendly answer in this exact pattern:
   - Start with one short sentence: "Here is how to take your medicine."
   - Then use 4 simple bullet points: Medicine, Dose, When to take, How long.
   - Add 1 short safety line: "If you feel dizzy or have side effects, contact your doctor."
   - Do not use markdown headings, bold text, or long paragraphs.
   - Use plain language only, like a short note to a patient.
6. DRUG INTERACTIONS: Mention any interactions identified in the report, but keep the wording simple.
7. NEVER output raw JSON, markdown headings, or clumsy section labels.
"""

def get_nurse_response(user_message: str, prescription_context: dict, chat_history: list = [], language: str = "English") -> str:
    """
    Generates a context-aware response from Nurse Lipi using Groq API for speed and reliability.
    """
    if not API_KEY:
        return "I'm sorry, my medical database connection is currently being updated. Please try again in a few seconds."

    try:
        direct_reply = format_medication_reply(user_message, prescription_context)
        if direct_reply:
            return direct_reply

        # Prepare the prompt with context
        prompt = f"PRESCRIPTION DATA:\n{str(prescription_context)}\n\nUSER QUESTION: {user_message}"
        
        # Dynamic Language Instruction
        lang_instruction = f"\n\nIMPORTANT: You MUST respond strictly in {language} language only. This is critical for the user."
        current_system_prompt = SYSTEM_PROMPT + lang_instruction

        # Call Groq API (OpenAI-compatible)
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": current_system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 1024
            },
            timeout=10
        )
        
        res_data = response.json()
        if response.status_code == 200:
            return res_data['choices'][0]['message']['content']
        else:
            error_msg = res_data.get('error', {}).get('message', 'Unknown API Error')
            print(f"❌ GROQ API ERROR: {error_msg}")
            return f"I'm reviewing your records but I'm having trouble connecting to the medical database ({error_msg}). Please try again in a moment."
        
    except Exception as e:
        print(f"❌ NURSE AI CRITICAL ERROR: {str(e)}")
        return "I'm sorry, I encountered a clinical data error. Please try again in a moment."

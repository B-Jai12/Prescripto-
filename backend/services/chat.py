import os
import requests
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")
load_dotenv()

GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
]


def format_medication_reply(user_message: str, prescription_context: dict) -> str | None:
    """Return a simple, patient-friendly medication instruction summary when the user asks how/when to take medicines."""
    text = (user_message or "").lower()
    if not prescription_context:
        return None

    medicines = (
        prescription_context.get("medicines")
        or prescription_context.get("result", {}).get("medicines", [])
        or []
    )
    if not medicines:
        return None

    asks_how_when = any(k in text for k in [
        "how", "when", "take", "dose", "dosage", "timing", "medicine", "medicines",
        "tablet", "capsule", "morning", "night", "food", "meals", "routine"
    ])
    if not asks_how_when:
        return None

    lines = ["Here is how to take your prescribed medicine(s):"]
    for i, med in enumerate(medicines, start=1):
        name = med.get("name") or f"Medicine {i}"
        dosage = med.get("dosage") or med.get("strength") or ""
        frequency = med.get("frequency") or ""
        timing = med.get("timing") or med.get("instructions_en") or med.get("instructions") or ""
        duration = med.get("duration") or ""
        side_effects = med.get("side_effects") or []

        lines.append(f"\n{i}. {name}")
        if dosage:
            lines.append(f"   • Strength: {dosage}")
        if frequency:
            lines.append(f"   • Frequency: {frequency}")
        if timing:
            lines.append(f"   • When to take: {timing}")
        if duration:
            lines.append(f"   • Duration: {duration}")
        if side_effects:
            lines.append(f"   • Common side effects: {', '.join(side_effects)}")

    lines.append("\nSafety Note: Always follow your prescribing doctor's exact instructions. If you feel unwell or experience adverse effects, contact your doctor immediately.")
    return "\n".join(lines)


SYSTEM_PROMPT = """
You are 'Lipi', an empathetic, licensed clinical pharmacist assistant.
Your goal is to provide clear, patient-friendly answers based on the patient's prescription data.

RULES:
1. CONTEXT FIRST: Refer strictly to the medicines, dosages, and notes in the patient's prescription data.
2. EMPATHY: Be warm, calm, and reassuring.
3. SAFETY: If asked anything high-risk, advise consulting their prescribing doctor immediately.
4. NO MEDICAL JARGON: Explain medical terms in simple, plain language.
5. CONCISE: Keep answers focused, practical, and under 3-4 short paragraphs.
6. LANGUAGE: Respond strictly in the requested language.
"""


def _call_groq_chat(prompt: str, system_prompt: str, api_key: str) -> str | None:
    """Call Groq API using available active models."""
    for model_name in GROQ_MODELS:
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1024
                },
                timeout=8
            )
            if response.status_code == 200:
                data = response.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                if content:
                    return content
        except Exception as e:
            print(f"  [Groq attempt failed with {model_name}]: {e}")
            continue
    return None


def _call_gemini_chat(prompt: str, system_prompt: str, api_key: str) -> str | None:
    """Fallback call to Google Gemini for chat responses."""
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        resp = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"system_instruction": system_prompt, "temperature": 0.3}
        )
        return resp.text
    except Exception as e:
        print(f"  [Gemini chat fallback error]: {e}")
        return None


def get_nurse_response(user_message: str, prescription_context: dict, chat_history: list = [], language: str = "English") -> str:
    """
    Generates a context-aware response from Nurse Lipi.
    Tries: Direct format -> Groq API (openai/gpt-oss-120b, qwen/qwen3.8-27b) -> Gemini 2.5 Flash fallback.
    """
    try:
        # Check if direct rule-based medication schedule summary applies
        direct_reply = format_medication_reply(user_message, prescription_context)
        if direct_reply:
            return direct_reply

        # Prepare context prompt
        prompt = f"PRESCRIPTION CONTEXT:\n{str(prescription_context)}\n\nUSER QUESTION: {user_message}"
        lang_instruction = f"\n\nCRITICAL: You MUST answer the user in {language} language."
        current_system = SYSTEM_PROMPT + lang_instruction

        # 1. Try Groq
        groq_key = os.environ.get("GROQ_API_KEY")
        if groq_key and not groq_key.startswith("mock_"):
            reply = _call_groq_chat(prompt, current_system, groq_key)
            if reply:
                return reply

        # 2. Fallback to Gemini
        gemini_key = os.environ.get("GEMINI_API_KEY")
        if gemini_key:
            reply = _call_gemini_chat(prompt, current_system, gemini_key)
            if reply:
                return reply

        # 3. Graceful offline fallback
        return f"I have reviewed your prescription details. Please let me know how I can help you with your medications or dosage schedule."

    except Exception as e:
        print(f"[CHAT ERROR]: {e}")
        return "I am currently reviewing your records. Please feel free to ask again in a moment."

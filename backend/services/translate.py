import os
import threading
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

load_dotenv()

# Thread-safe translator instances
_translator_cache = {}
_cache_lock = threading.Lock()


def get_translator(target_language: str):
    """Cache translators to avoid recreating them."""
    try:
        from deep_translator import GoogleTranslator
        if target_language not in _translator_cache:
            with _cache_lock:
                if target_language not in _translator_cache:
                    _translator_cache[target_language] = GoogleTranslator(source='en', target=target_language)
        return _translator_cache[target_language]
    except Exception:
        return None


def translate_text(text: str, target_language: str) -> str:
    """
    Translates text to the target language.
    target_language: 'te' for Telugu, 'hi' for Hindi.
    Gracefully falls back to English if translation is rate-limited or unavailable.
    """
    if not text:
        return ""

    try:
        translator = get_translator(target_language)
        if translator:
            return translator.translate(text)
    except Exception as e:
        print(f"  [Translation Note] Could not translate to {target_language}: {e}")

    return text  # Fallback to English


def add_translations(structured_data: dict) -> dict:
    """
    Ensures instructions_te and instructions_hi are populated for all medicines.
    If already populated by the Gemini extraction pipeline, preserves them.
    Otherwise fills them in parallel via translation service.
    """
    if not structured_data or "medicines" not in structured_data:
        return structured_data

    medicines = structured_data["medicines"]
    tasks = []

    with ThreadPoolExecutor(max_workers=5) as executor:
        for idx, medicine in enumerate(medicines):
            instructions_en = medicine.get("instructions_en", "")

            # Only translate if missing from primary extraction
            if not medicine.get("instructions_te") and instructions_en:
                te_task = executor.submit(translate_text, instructions_en, "te")
                tasks.append(("te", idx, te_task))

            if not medicine.get("instructions_hi") and instructions_en:
                hi_task = executor.submit(translate_text, instructions_en, "hi")
                tasks.append(("hi", idx, hi_task))

        for lang, idx, task in tasks:
            try:
                res = task.result(timeout=4)
                if lang == "te":
                    medicines[idx]["instructions_te"] = res
                elif lang == "hi":
                    medicines[idx]["instructions_hi"] = res
            except Exception:
                fallback = medicines[idx].get("instructions_en", "")
                if lang == "te" and not medicines[idx].get("instructions_te"):
                    medicines[idx]["instructions_te"] = fallback
                elif lang == "hi" and not medicines[idx].get("instructions_hi"):
                    medicines[idx]["instructions_hi"] = fallback

    return structured_data

from deep_translator import GoogleTranslator
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Thread-safe translator instances
_translator_cache = {}
_cache_lock = threading.Lock()

def get_translator(target_language: str):
    """Cache translators to avoid recreating them."""
    if target_language not in _translator_cache:
        with _cache_lock:
            if target_language not in _translator_cache:
                _translator_cache[target_language] = GoogleTranslator(source='en', target=target_language)
    return _translator_cache[target_language]

def translate_text(text: str, target_language: str) -> str:
    """
    Translates text to the target language using deep-translator (Google Translate under the hood).
    target_language: 'te' for Telugu, 'hi' for Hindi
    """
    if not text:
        return ""
        
    try:
        translator = get_translator(target_language)
        return translator.translate(text)
    except Exception as e:
        print(f"Translation Error for {target_language}: {e}")
        return text # Fallback to English

def add_translations(structured_data: dict) -> dict:
    """
    Loops through all medicines in the structured JSON, 
    adds instructions_te and instructions_hi fields in PARALLEL,
    and returns the enriched dict.
    
    Optimization: Uses ThreadPoolExecutor to translate multiple medicines concurrently.
    This reduces translation time from O(n*2) to O(2) for n medicines.
    """
    if not structured_data or "medicines" not in structured_data:
        return structured_data
    
    medicines = structured_data["medicines"]
    
    # Prepare translation tasks
    translation_tasks = []
    task_to_medicine = {}
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        # Submit all translation tasks
        for idx, medicine in enumerate(medicines):
            instructions_en = medicine.get("instructions_en", "")
            if instructions_en:
                # Submit Tamil (Telugu) translation
                te_task = executor.submit(translate_text, instructions_en, "te")
                translation_tasks.append(("te", idx, te_task))
                
                # Submit Hindi translation
                hi_task = executor.submit(translate_text, instructions_en, "hi")
                translation_tasks.append(("hi", idx, hi_task))
            else:
                medicines[idx]["instructions_te"] = ""
                medicines[idx]["instructions_hi"] = ""
        
        # Collect results as they complete
        for lang, idx, task in translation_tasks:
            try:
                result = task.result(timeout=10)
                if lang == "te":
                    medicines[idx]["instructions_te"] = result
                elif lang == "hi":
                    medicines[idx]["instructions_hi"] = result
            except Exception as e:
                print(f"Failed to translate to {lang} for medicine {idx}: {e}")
                if lang == "te":
                    medicines[idx]["instructions_te"] = medicines[idx].get("instructions_en", "")
                elif lang == "hi":
                    medicines[idx]["instructions_hi"] = medicines[idx].get("instructions_en", "")
    
    return structured_data

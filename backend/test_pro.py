import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents="Hello"
    )
    print("PRO_SUCCESS")
except Exception as e:
    print("PRO_ERROR:", e)

try:
    response = client.models.generate_content(
        model='gemini-1.5-pro',
        contents="Hello"
    )
    print("1.5_PRO_SUCCESS")
except Exception as e:
    print("1.5_PRO_ERROR:", e)

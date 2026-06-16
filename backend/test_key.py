import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents="Hello, reply with the word 'SUCCESS'"
    )
    print("API_TEST_RESULT: " + response.text.strip())
except Exception as e:
    print("API_TEST_ERROR: " + str(e))

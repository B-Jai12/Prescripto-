import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

try:
    models = client.models.list()
    for m in models.data:
        if 'vision' in m.id.lower():
            print(m.id)
except Exception as e:
    print("ERROR:", e)

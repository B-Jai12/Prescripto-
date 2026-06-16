import os
import base64
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Create a dummy image
from PIL import Image
import io
img = Image.new('RGB', (100, 100), color = 'red')
img_bytes = io.BytesIO()
img.save(img_bytes, format='JPEG')
base64_image = base64.b64encode(img_bytes.getvalue()).decode('utf-8')

try:
    response = client.chat.completions.create(
        model="llama-3.2-90b-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "What is in this image? Return JSON { 'color': '...' }"},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                        },
                    },
                ],
            }
        ],
        temperature=0,
        response_format={"type": "json_object"}
    )
    print("SUCCESS")
    print(response.choices[0].message.content)
except Exception as e:
    print("ERROR:", e)

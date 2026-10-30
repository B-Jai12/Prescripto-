import os
import io
from pathlib import Path
from PIL import Image
from dotenv import load_dotenv
from google import genai
from google.genai import types

backend_dir = Path(__file__).resolve().parent
load_dotenv(backend_dir / ".env")
load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY is not set.")
    exit(1)

client = genai.Client(api_key=api_key)

# Check if test prescription image exists
image_path = Path(__file__).resolve().parent.parent / "test_prescription.png"
if image_path.exists():
    with open(image_path, "rb") as f:
        img_bytes = f.read()
    mime_type = "image/png"
    print(f"Reading real test prescription from: {image_path.name}")
else:
    # Create test dummy image in-memory
    img = Image.new('RGB', (100, 100), color='red')
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    img_bytes = buf.getvalue()
    mime_type = "image/jpeg"
    print("Reading generated test image")

try:
    image_part = types.Part.from_bytes(data=img_bytes, mime_type=mime_type)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            "Extract any text or doctor medicine notes you see in this image. Return short JSON.",
            image_part
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.0
        )
    )
    print("SUCCESS: Multimodal Vision API is working properly!")
    print(response.text.strip())
except Exception as e:
    print("ERROR:", e)

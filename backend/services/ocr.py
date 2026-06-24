import io
from PIL import Image, ImageEnhance


def preprocess_image(image_bytes: bytes) -> bytes:
    """
    Preprocesses the image for better analysis accuracy.
    Converts to RGB, boosts contrast, and resizes if too large.
    """
    image = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB (in case it's RGBA or P)
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Boost contrast slightly
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.5)

    # Resize width to max 1200px while maintaining aspect ratio
    max_width = 1200
    if image.width > max_width:
        ratio = max_width / float(image.width)
        new_height = int(float(image.height) * ratio)
        image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)

    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def extract_text(image_bytes: bytes) -> str:
    """
    Lightweight stub — Gemini Vision handles full prescription reading.
    EasyOCR/torch removed to stay within Render free-tier memory (512MB).
    Returns empty string; the 'raw_text' field is informational only.
    """
    return ""

import io
from PIL import Image, ImageEnhance, ImageOps


def preprocess_image(image_bytes: bytes) -> bytes:
    """
    Preprocesses the image for optimal AI vision accuracy.
    - Automatically transposes image based on EXIF tags (fixes mobile phone photo rotation).
    - Converts to RGB color mode.
    - Enhances contrast slightly for clearer doctor handwriting.
    - Resizes to max 1600px width/height while maintaining aspect ratio.
    """
    image = Image.open(io.BytesIO(image_bytes))

    # Auto-rotate based on mobile phone EXIF orientation tag
    try:
        image = ImageOps.exif_transpose(image)
    except Exception:
        pass

    # Convert to RGB (in case it's RGBA, P, or Grayscale)
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Boost contrast slightly to make faint pencil/pen ink legible
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.3)

    # Resize width/height to max 1600px while maintaining aspect ratio
    max_dimension = 1600
    if image.width > max_dimension or image.height > max_dimension:
        image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def extract_text(image_bytes: bytes) -> str:
    """
    Lightweight stub — Gemini Multimodal Vision handles full prescription reading.
    EasyOCR/torch was removed to stay lean and fast within serverless / free-tier limits.
    Returns empty string; the 'raw_text' field is informational only.
    """
    return ""

import io
from PIL import Image, ImageEnhance
import easyocr
import numpy as np
import torch


# Initialize the EasyOCR reader (this will download models on first run if not present)
# We specify 'en' for English.
# Lazy loading to avoid blocking startup.
reader = None
def get_reader():
    global reader
    if reader is None:
        print("Initializing EasyOCR (this may take a while to download models on first run)...")
        # Enable GPU if available (CUDA), fallback to CPU
        use_gpu = torch.cuda.is_available()
        print(f"EasyOCR GPU Available: {use_gpu}")
        reader = easyocr.Reader(['en'], gpu=use_gpu)
    return reader

def preprocess_image(image_bytes: bytes) -> bytes:
    """
    Preprocesses the image for better OCR accuracy with optimized speed.
    Converts to grayscale, boosts contrast, and resizes if too large.
    
    Optimization: Reduced max width from 1500px to 1000px for faster processing
    while maintaining good OCR accuracy for typical prescription images.
    """
    # Load image from bytes
    image = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB (in case it's RGBA or P)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Convert to grayscale
    image = image.convert('L')
    
    # Boost contrast (2.0x)
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)
    
    # Resize width to max 1000px while maintaining aspect ratio (OPTIMIZED: was 1500px)
    max_width = 1000
    if image.width > max_width:
        ratio = max_width / float(image.width)
        new_height = int((float(image.height) * float(ratio)))
        image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
    
    # Save back to bytes
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()

def extract_text(image_bytes: bytes) -> str:
    """
    Extracts text from image bytes using EasyOCR.
    """
    try:
        # Preprocess the image
        processed_bytes = preprocess_image(image_bytes)
        
        # EasyOCR works well with numpy arrays or file paths.
        # We can convert the PIL image to a numpy array.
        image = Image.open(io.BytesIO(processed_bytes))
        image_np = np.array(image)
        
        # Read text from image
        ocr_reader = get_reader()
        result = ocr_reader.readtext(image_np, detail=0) # detail=0 returns just the text
        
        # Join the text parts into a single string with newlines
        extracted_text = "\n".join(result)
        return extracted_text.strip()
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

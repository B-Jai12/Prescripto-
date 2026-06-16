import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# We look for a MASTER_KEY in .env. If not found, we use a default (for dev only)
# IMPORTANT: In production, this MUST be a 32-byte base64 encoded string
MASTER_KEY = os.environ.get("MASTER_ENCRYPTION_KEY")

if not MASTER_KEY:
    # Generate a key for first-time setup if missing
    MASTER_KEY = Fernet.generate_key().decode()
    print("\nSECURITY ALERT: No MASTER_ENCRYPTION_KEY found in .env.")
    print(f"Generated a new one for you: {MASTER_KEY}")
    print(f"PLEASE ADD THIS TO YOUR .env AS: MASTER_ENCRYPTION_KEY={MASTER_KEY}\n")

cipher_suite = Fernet(MASTER_KEY.encode())

def encrypt_data(data: bytes) -> bytes:
    """
    Encrypts any bytes data (like images) using AES-256.
    """
    return cipher_suite.encrypt(data)

def decrypt_data(encrypted_data: bytes) -> bytes:
    """
    Decrypts AES-256 encrypted data back to its original form.
    """
    return cipher_suite.decrypt(encrypted_data)

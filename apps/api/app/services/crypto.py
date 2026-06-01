import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings


def _key() -> bytes:
    raw = settings.encryption_key.encode("utf-8")[:32]
    return raw.ljust(32, b"0")


def encrypt_secret(value: str) -> str:
    aes = AESGCM(_key())
    nonce = os.urandom(12)
    encrypted = aes.encrypt(nonce, value.encode("utf-8"), None)
    return base64.urlsafe_b64encode(nonce + encrypted).decode("utf-8")


def decrypt_secret(value: str) -> str:
    raw = base64.urlsafe_b64decode(value.encode("utf-8"))
    nonce, encrypted = raw[:12], raw[12:]
    return AESGCM(_key()).decrypt(nonce, encrypted, None).decode("utf-8")

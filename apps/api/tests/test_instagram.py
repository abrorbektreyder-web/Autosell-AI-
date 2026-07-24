import hashlib
import hmac
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.crypto import decrypt_secret, encrypt_secret
from app.services.instagram import verify_webhook_signature

SECRET = "meta-app-secret"
BODY = b'{"object":"instagram","entry":[{"id":"17841400000000000"}]}'


def sign(body: bytes, secret: str) -> str:
    return "sha256=" + hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()


class WebhookSignatureTests(unittest.TestCase):
    def test_valid_signature_is_accepted(self):
        self.assertTrue(verify_webhook_signature(BODY, sign(BODY, SECRET), SECRET))

    def test_signature_from_wrong_secret_is_rejected(self):
        self.assertFalse(verify_webhook_signature(BODY, sign(BODY, "attacker-secret"), SECRET))

    def test_tampered_body_is_rejected(self):
        signature = sign(BODY, SECRET)
        self.assertFalse(verify_webhook_signature(b'{"object":"tampered"}', signature, SECRET))

    def test_missing_signature_header_is_rejected(self):
        self.assertFalse(verify_webhook_signature(BODY, None, SECRET))

    def test_malformed_signature_header_is_rejected(self):
        self.assertFalse(verify_webhook_signature(BODY, "md5=abc123", SECRET))

    def test_verification_skipped_when_secret_not_configured(self):
        # Local dev has no META_WEBHOOK_SECRET; verification must not block testing.
        self.assertTrue(verify_webhook_signature(BODY, None, ""))


class TokenEncryptionTests(unittest.TestCase):
    def test_access_token_roundtrip(self):
        token = "EAAGm0PX4ZCpsBA1234567890fakeTokenForTests"
        encrypted = encrypt_secret(token)
        self.assertNotEqual(encrypted, token)
        self.assertNotIn(token, encrypted)
        self.assertEqual(decrypt_secret(encrypted), token)

    def test_same_token_encrypts_to_different_ciphertexts(self):
        token = "EAAGm0PX4ZCpsBA1234567890fakeTokenForTests"
        self.assertNotEqual(encrypt_secret(token), encrypt_secret(token))


if __name__ == "__main__":
    unittest.main()

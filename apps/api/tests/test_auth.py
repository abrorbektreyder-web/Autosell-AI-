import os
import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

# Add api directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app
from app.core.database import AsyncSessionLocal
from app.services import db_repository

class TestAuthAPI(unittest.TestCase):
    def setUp(self):
        # We will use unique emails for each test run to avoid unique conflicts
        self.email = f"user_{os.urandom(4).hex()}@example.com"
        self.password = "secret-secure-password"
        self.first_name = "Kamil"
        self.business_name = "Kamil Furnitures"

    def test_register_and_login_flow(self):
        with TestClient(app) as client:
            # 1. Register a new user
            reg_payload = {
                "email": self.email,
                "password": self.password,
                "first_name": self.first_name,
                "business_name": self.business_name
            }
            reg_response = client.post("/api/auth/register", json=reg_payload)
            self.assertEqual(reg_response.status_code, 200)
            self.assertEqual(reg_response.json()["status"], "created")

            # 2. Try to register same email again (should fail)
            dup_response = client.post("/api/auth/register", json=reg_payload)
            self.assertEqual(dup_response.status_code, 400)
            self.assertIn("Foydalanuvchi elektron manzili", dup_response.json()["detail"])

            # 3. Login with incorrect password
            bad_login = {
                "email": self.email,
                "password": "wrong-password"
            }
            bad_response = client.post("/api/auth/login", json=bad_login)
            self.assertEqual(bad_response.status_code, 401)
            self.assertEqual(bad_response.json()["detail"], "Email yoki parol noto'g'ri")

            # 4. Login with correct password
            good_login = {
                "email": self.email,
                "password": self.password
            }
            login_response = client.post("/api/auth/login", json=good_login)
            self.assertEqual(login_response.status_code, 200)
            token_data = login_response.json()
            self.assertIn("access_token", token_data)
            self.assertEqual(token_data["token_type"], "bearer")

            # 5. Access auth/me with JWT token
            token = token_data["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            me_response = client.get("/api/auth/me", headers=headers)
            self.assertEqual(me_response.status_code, 200)
            me_data = me_response.json()
            self.assertEqual(me_data["email"], self.email)
            self.assertEqual(me_data["first_name"], self.first_name)
            self.assertIn("business_id", me_data)

            # 6. Try accessing auth/me without token (should fail)
            fail_me = client.get("/api/auth/me")
            self.assertEqual(fail_me.status_code, 401)
            self.assertEqual(fail_me.json()["detail"], "Missing authorization token")

if __name__ == "__main__":
    unittest.main()

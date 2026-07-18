import os
import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

# Add api directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app

class TestTenantIsolation(unittest.TestCase):
    def setUp(self):
        # Generate unique emails for clean database state
        rand_suffix_a = os.urandom(4).hex()
        rand_suffix_b = os.urandom(4).hex()
        
        self.email_a = f"tenant_a_{rand_suffix_a}@example.com"
        self.email_b = f"tenant_b_{rand_suffix_b}@example.com"
        self.password = "secure-password"

    def test_tenant_isolation_and_rls(self):
        with TestClient(app) as client:
            # 1. Register and login Tenant A
            client.post("/api/auth/register", json={
                "email": self.email_a,
                "password": self.password,
                "first_name": "Alice",
                "business_name": "Business A"
            })
            login_a = client.post("/api/auth/login", json={
                "email": self.email_a,
                "password": self.password
            }).json()
            token_a = login_a["access_token"]

            # 2. Register and login Tenant B
            client.post("/api/auth/register", json={
                "email": self.email_b,
                "password": self.password,
                "first_name": "Bob",
                "business_name": "Business B"
            })
            login_b = client.post("/api/auth/login", json={
                "email": self.email_b,
                "password": self.password
            }).json()
            token_b = login_b["access_token"]

            # 3. Tenant A creates a product
            product_payload = {
                "name": "Exclusive Sofa A",
                "price": 7500000,
                "discount_price": 7000000,
                "description": "Tenant A only sofa.",
                "delivery_info": "1 hour delivery.",
                "variants": ["red", "blue"],
                "faq": [{"q": "Warranty?", "a": "5 years."}],
                "status": "active"
            }
            res_create = client.post(
                "/api/products", 
                json=product_payload, 
                headers={"Authorization": f"Bearer {token_a}"}
            )
            self.assertEqual(res_create.status_code, 200)
            product_a = res_create.json()
            product_a_id = product_a["id"]

            # 4. Tenant B lists products (should NOT contain Tenant A's product)
            res_list_b = client.get(
                "/api/products", 
                headers={"Authorization": f"Bearer {token_b}"}
            )
            self.assertEqual(res_list_b.status_code, 200)
            products_b = res_list_b.json()
            # Tenant B has no products seeded, only Tenant A has the product
            # Verify Tenant A's product is NOT in Bob's product list
            product_in_b = next((p for p in products_b if p["id"] == product_a_id), None)
            self.assertIsNone(product_in_b)

            # 5. Tenant B attempts to retrieve Tenant A's product by ID (should return 404)
            res_get_b = client.get(
                f"/api/products/{product_a_id}",
                headers={"Authorization": f"Bearer {token_b}"}
            )
            self.assertEqual(res_get_b.status_code, 404)
            self.assertEqual(res_get_b.json()["detail"], "Product not found")

            # 6. Tenant A lists products (should contain Product A)
            res_list_a = client.get(
                "/api/products",
                headers={"Authorization": f"Bearer {token_a}"}
            )
            self.assertEqual(res_list_a.status_code, 200)
            products_a = res_list_a.json()
            product_in_a = next((p for p in products_a if p["id"] == product_a_id), None)
            self.assertIsNotNone(product_in_a)
            self.assertEqual(product_in_a["name"], "Exclusive Sofa A")

if __name__ == "__main__":
    unittest.main()

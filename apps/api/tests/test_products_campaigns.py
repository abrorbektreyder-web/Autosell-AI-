import os
import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

# Add api directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app

class TestProductsCampaignsAPI(unittest.TestCase):
    def setUp(self):
        self.email = f"owner_crud_{os.urandom(4).hex()}@example.com"
        self.password = "secure-password"

    def test_products_and_campaigns_crud_lifecycle(self):
        with TestClient(app) as client:
            # 1. Register and login to obtain token
            client.post("/api/auth/register", json={
                "email": self.email,
                "password": self.password,
                "first_name": "CRUD Owner",
                "business_name": "CRUD Shop"
            })
            login_res = client.post("/api/auth/login", json={
                "email": self.email,
                "password": self.password
            }).json()
            token = login_res["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # --- PRODUCTS CRUD TEST ---
            # Create product
            product_payload = {
                "name": "Test Table",
                "price": 1200000,
                "discount_price": 1000000,
                "description": "Wooden table.",
                "delivery_info": "Next day.",
                "variants": ["oak", "pine"],
                "faq": [{"q": "Sizes?", "a": "120x80cm."}],
                "status": "active"
            }
            res_create_prod = client.post("/api/products", json=product_payload, headers=headers)
            self.assertEqual(res_create_prod.status_code, 200)
            product = res_create_prod.json()
            product_id = product["id"]
            self.assertEqual(product["name"], "Test Table")

            # Get product by ID
            res_get_prod = client.get(f"/api/products/{product_id}", headers=headers)
            self.assertEqual(res_get_prod.status_code, 200)
            self.assertEqual(res_get_prod.json()["name"], "Test Table")

            # Update product
            update_payload = {
                **product_payload,
                "price": 1300000,
                "name": "Updated Table"
            }
            res_update_prod = client.patch(f"/api/products/{product_id}", json=update_payload, headers=headers)
            self.assertEqual(res_update_prod.status_code, 200)
            self.assertEqual(res_update_prod.json()["name"], "Updated Table")
            self.assertEqual(res_update_prod.json()["price"], 1300000)

            # --- CAMPAIGNS CRUD TEST ---
            # Create campaign (linked to the product)
            campaign_payload = {
                "product_id": product_id,
                "name": "Table Promo",
                "keyword": "  Stol100  ",  # keyword contains spaces and uppercase
                "instagram_url": "https://instagram.com/table_promo",
                "first_dm_message": "Hi, check this table out!",
                "auto_dm_enabled": True,
                "status": "active"
            }
            res_create_camp = client.post("/api/campaigns", json=campaign_payload, headers=headers)
            self.assertEqual(res_create_camp.status_code, 200)
            campaign = res_create_camp.json()
            campaign_id = campaign["id"]
            self.assertEqual(campaign["name"], "Table Promo")
            # Verify keyword normalization was applied automatically (trimmed & lowercased)
            self.assertEqual(campaign["keyword"], "  Stol100  ")
            self.assertEqual(campaign["normalized_keyword"], "stol100")

            # Get campaign by ID
            res_get_camp = client.get(f"/api/campaigns/{campaign_id}", headers=headers)
            self.assertEqual(res_get_camp.status_code, 200)
            self.assertEqual(res_get_camp.json()["name"], "Table Promo")

            # Update campaign
            update_camp_payload = {
                **campaign_payload,
                "name": "Super Table Promo",
                "keyword": "  STOL200  "  # Change keyword
            }
            res_update_camp = client.patch(f"/api/campaigns/{campaign_id}", json=update_camp_payload, headers=headers)
            self.assertEqual(res_update_camp.status_code, 200)
            self.assertEqual(res_update_camp.json()["name"], "Super Table Promo")
            self.assertEqual(res_update_camp.json()["normalized_keyword"], "stol200")

            # --- DELETE TESTS ---
            # Delete campaign (soft-delete, sets status to inactive)
            res_del_camp = client.delete(f"/api/campaigns/{campaign_id}", headers=headers)
            self.assertEqual(res_del_camp.status_code, 200)
            self.assertEqual(res_del_camp.json()["status"], "inactive")

            # Delete product (soft-delete, sets status to inactive)
            res_del_prod = client.delete(f"/api/products/{product_id}", headers=headers)
            self.assertEqual(res_del_prod.status_code, 200)
            self.assertEqual(res_del_prod.json()["status"], "inactive")

            # Listing campaigns should exclude the deleted campaign (since active status is checked)
            res_list_camps = client.get("/api/campaigns", headers=headers)
            self.assertEqual(res_list_camps.status_code, 200)
            self.assertEqual(len(res_list_camps.json()), 0)

            # Listing products should exclude the deleted product
            res_list_prods = client.get("/api/products", headers=headers)
            self.assertEqual(res_list_prods.status_code, 200)
            self.assertEqual(len(res_list_prods.json()), 0)

if __name__ == "__main__":
    unittest.main()

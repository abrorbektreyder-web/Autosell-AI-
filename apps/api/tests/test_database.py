import os
import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

# Add api directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app

class TestDatabaseAPI(unittest.TestCase):
    def test_health_check(self):
        with TestClient(app) as client:
            response = client.get("/health")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["status"], "ok")

    def test_list_products_from_db(self):
        with TestClient(app) as client:
            response = client.get("/api/products")
            self.assertEqual(response.status_code, 200)
            products = response.json()
            self.assertIsInstance(products, list)
            self.assertGreater(len(products), 0)
            
            # Verify one of the seeded products
            sofa_product = next((p for p in products if p["name"] == "Yumshoq mebel"), None)
            self.assertIsNotNone(sofa_product)
            self.assertEqual(sofa_product["price"], 4500000)
            self.assertEqual(sofa_product["discount_price"], 3990000)

    def test_get_dashboard_summary(self):
        with TestClient(app) as client:
            response = client.get("/api/dashboard")
            self.assertEqual(response.status_code, 200)
            summary = response.json()
            self.assertIn("total_leads", summary)
            self.assertIn("active_campaigns", summary)
            self.assertEqual(summary["active_campaigns"], 2)

    def test_get_campaigns(self):
        with TestClient(app) as client:
            response = client.get("/api/campaigns")
            self.assertEqual(response.status_code, 200)
            campaigns = response.json()
            self.assertIsInstance(campaigns, list)
            self.assertGreater(len(campaigns), 0)
            
            sofa_campaign = next((c for c in campaigns if c["name"] == "May oyi yumshoq mebel reklamasi"), None)
            self.assertIsNotNone(sofa_campaign)
            self.assertEqual(sofa_campaign["keyword"], "55")
            self.assertEqual(sofa_campaign["normalized_keyword"], "55")

if __name__ == "__main__":
    unittest.main()

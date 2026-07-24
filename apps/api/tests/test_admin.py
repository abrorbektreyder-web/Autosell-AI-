import asyncio
import sys
import unittest
from pathlib import Path

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

ADMIN_PATHS = [
    "/api/v1/admin/overview",
    "/api/v1/admin/businesses",
    "/api/v1/admin/system",
    "/api/v1/admin/audit",
]


def token(client) -> str:
    return client.post("/api/v1/auth/demo-login").json()["access_token"]


class AdminAccessControlTests(unittest.TestCase):
    """The /admin endpoints read across every tenant, so access must be locked down."""

    def setUp(self):
        self._original = list(settings.superadmin_emails)

    def tearDown(self):
        settings.superadmin_emails = self._original

    def test_denied_without_a_token(self):
        with TestClient(app) as client:
            for path in ADMIN_PATHS:
                self.assertEqual(client.get(path).status_code, 401, path)

    def test_denied_when_no_superadmin_is_configured(self):
        # Default deployment state: an ordinary logged-in user must not see other tenants.
        settings.superadmin_emails = []
        with TestClient(app) as client:
            headers = {"Authorization": f"Bearer {token(client)}"}
            for path in ADMIN_PATHS:
                self.assertEqual(client.get(path, headers=headers).status_code, 403, path)

    def test_allowed_once_email_is_whitelisted(self):
        settings.superadmin_emails = ["owner@autosell.ai"]
        with TestClient(app) as client:
            headers = {"Authorization": f"Bearer {token(client)}"}
            for path in ADMIN_PATHS:
                self.assertEqual(client.get(path, headers=headers).status_code, 200, path)

    def test_whitelist_is_case_insensitive(self):
        settings.superadmin_emails = ["OWNER@AutoSell.AI"]
        with TestClient(app) as client:
            headers = {"Authorization": f"Bearer {token(client)}"}
            self.assertEqual(client.get(ADMIN_PATHS[0], headers=headers).status_code, 200)


class AdminPayloadTests(unittest.TestCase):
    def setUp(self):
        self._original = list(settings.superadmin_emails)
        settings.superadmin_emails = ["owner@autosell.ai"]

    def tearDown(self):
        settings.superadmin_emails = self._original

    def test_overview_reports_real_counts(self):
        with TestClient(app) as client:
            headers = {"Authorization": f"Bearer {token(client)}"}
            data = client.get("/api/v1/admin/overview", headers=headers).json()
            # The demo tenant is seeded on login, so the platform is never empty here.
            self.assertGreaterEqual(data["total_businesses"], 1)
            self.assertGreaterEqual(data["total_products"], 1)
            for key in ("total_leads", "total_campaigns", "connected_telegram"):
                self.assertIsInstance(data[key], int, key)

    def test_system_health_measures_the_database(self):
        with TestClient(app) as client:
            headers = {"Authorization": f"Bearer {token(client)}"}
            data = client.get("/api/v1/admin/system", headers=headers).json()

            components = {c["component"]: c for c in data["checks"]}
            self.assertIn("PostgreSQL", components)
            # Latency must be a measurement, not a constant.
            self.assertEqual(components["PostgreSQL"]["status"], "ok")
            self.assertIsInstance(components["PostgreSQL"]["latency_ms"], float)

            # Components that are not deployed must report that, not a green tick.
            self.assertEqual(components["Background jobs"]["status"], "not_configured")
            self.assertIn(data["overall"], {"ok", "degraded", "error"})
            self.assertTrue(0 <= data["health_score"] <= 100)

    def test_businesses_listing_carries_per_tenant_counts(self):
        with TestClient(app) as client:
            headers = {"Authorization": f"Bearer {token(client)}"}
            rows = client.get("/api/v1/admin/businesses", headers=headers).json()
            self.assertGreaterEqual(len(rows), 1)
            demo = next((r for r in rows if r["owner_email"] == "owner@autosell.ai"), None)
            self.assertIsNotNone(demo)
            self.assertGreaterEqual(demo["products"], 1)


if __name__ == "__main__":
    unittest.main()

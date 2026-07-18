import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.keyword_engine import extract_phone, normalize_keyword


class BaselineTests(unittest.TestCase):
    def test_normalize_keyword_trims_and_lowercases(self):
        self.assertEqual(normalize_keyword("  Mebel55  "), "mebel55")
        self.assertEqual(normalize_keyword("#mebel55."), "mebel55")
        self.assertEqual(normalize_keyword("  #mebel.55?  "), "mebel55")

    def test_extract_phone_normalizes_uzbek_number(self):
        self.assertEqual(extract_phone("Akmal +998 90 123 45 67"), "+998901234567")


if __name__ == "__main__":
    unittest.main()

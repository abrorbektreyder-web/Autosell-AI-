import re
import unicodedata


def normalize_keyword(value: str) -> str:
    text = unicodedata.normalize("NFKC", value or "")
    text = text.strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text


def extract_phone(text: str) -> str | None:
    match = re.search(r"(?:\+?998)?[\s-]?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}", text)
    if not match:
        return None
    raw = re.sub(r"\D", "", match.group(0))
    if raw.startswith("998"):
        return "+" + raw
    return "+998" + raw[-9:]

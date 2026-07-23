import json
import urllib.request
from app.core.config import settings
from app.schemas.domain import Product, Campaign


def build_first_reply(product: Product, campaign: Campaign) -> str:
    price = product.discount_price or product.price
    formatted_price = f"{int(price):,}".replace(",", " ")
    return f"{campaign.first_dm_message}\n\n{product.name}: {formatted_price} so'm. {product.delivery_info}"


def generate_ai_sales_response(product: Product, campaign: Campaign, customer_message: str) -> str:
    if not settings.groq_api_key:
        return build_first_reply(product, campaign)

    price = product.discount_price or product.price
    formatted_price = f"{int(price):,}".replace(",", " ")
    variants = ", ".join(product.variants) if product.variants else "Barcha o'lchamlar"
    
    system_prompt = (
        f"Siz Instagram'da {product.name} sotadigan professional, xushmuomala va sotuvga yo'naltirilgan AI assistantsiz.\n"
        f"Mahsulot ma'lumotlari:\n"
        f"- Nomi: {product.name}\n"
        f"- Narxi: {formatted_price} so'm\n"
        f"- Dostavka: {product.delivery_info}\n"
        f"- Variantlar: {variants}\n"
        f"Qoidalaringiz:\n"
        f"1. Faqat berilgan mahsulot ma'lumotlari asosida o'zbek tilida qisqa (2-3 jumla) professional javob bering.\n"
        f"2. Mijozdan ismi va telefon raqamini so'rab, buyurtmani rasmiylashtirishga yordam bering.\n"
    )

    try:
        payload = {
            "model": settings.ai_model or "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": customer_message},
            ],
            "temperature": 0.7,
            "max_tokens": 200,
        }
        req = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0",
            },
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Groq AI call error: {e}")
        return build_first_reply(product, campaign)


def summarize_sales_context(product: Product, customer_text: str) -> str:
    return (
        f"Mijoz {product.name} bo'yicha qiziqdi. "
        f"AI faqat product carddagi narx, variant, delivery va FAQ asosida javob beradi. "
        f"Oxirgi xabar: {customer_text}"
    )


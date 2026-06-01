from app.schemas.domain import Product, Campaign


def build_first_reply(product: Product, campaign: Campaign) -> str:
    price = product.discount_price or product.price
    return f"{campaign.first_dm_message}\n\n{product.name}: {price:,} so'm. {product.delivery_info}".replace(",", " ")


def summarize_sales_context(product: Product, customer_text: str) -> str:
    return (
        f"Mijoz {product.name} bo'yicha qiziqdi. "
        f"AI faqat product carddagi narx, variant, delivery va FAQ asosida javob beradi. "
        f"Oxirgi xabar: {customer_text}"
    )

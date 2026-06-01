from app.schemas.domain import Product, Campaign, Lead, Conversation, Message, TelegramSettings
from app.services.keyword_engine import normalize_keyword

products: dict[str, Product] = {
    "prod-soft-sofa": Product(
        id="prod-soft-sofa",
        name="Yumshoq mebel",
        price=4500000,
        discount_price=3990000,
        description="Premium matoli, oila uchun qulay yumshoq mebel to'plami.",
        delivery_info="Toshkent bo'ylab 24 soat ichida yetkazib berish.",
        variants=["kulrang", "bej", "ko'k"],
        faq=[{"q": "Kafolat bormi?", "a": "12 oy kafolat bor."}],
    ),
    "prod-office-chair": Product(
        id="prod-office-chair",
        name="Ofis kreslosi",
        price=1250000,
        description="Ergonomik suyanchiqli ofis kreslosi.",
        delivery_info="1-2 ish kuni ichida yetkaziladi.",
        variants=["qora", "oq"],
    ),
}

campaigns: dict[str, Campaign] = {
    "camp-may-sofa": Campaign(
        id="camp-may-sofa",
        product_id="prod-soft-sofa",
        name="May oyi yumshoq mebel reklamasi",
        keyword="55",
        normalized_keyword="55",
        instagram_url="https://instagram.com/reel/demo-sofa",
        first_dm_message="Assalomu alaykum! Yumshoq mebel narxi va variantlarini yuboraman. Ismingizni ayta olasizmi?",
    ),
    "camp-chair": Campaign(
        id="camp-chair",
        product_id="prod-office-chair",
        name="Ofis kreslosi keyword kampaniyasi",
        keyword="88",
        normalized_keyword="88",
        instagram_url="https://instagram.com/reel/demo-chair",
        first_dm_message="Assalomu alaykum! Ofis kreslosi haqida qisqa ma'lumot yuboraman. Sizga qaysi rang qiziq?",
    ),
}

leads: dict[str, Lead] = {
    "lead-001": Lead(
        id="lead-001",
        customer_name="Akmal",
        phone="+998901234567",
        instagram_username="akmal_home",
        product_id="prod-soft-sofa",
        campaign_id="camp-may-sofa",
        source_comment="55",
        ai_summary="Narx so'radi, kulrang variantga qiziqdi, telefon qoldirdi.",
    )
}

conversations: dict[str, Conversation] = {
    "conv-001": Conversation(
        id="conv-001",
        instagram_username="akmal_home",
        lead_id="lead-001",
        product_id="prod-soft-sofa",
        campaign_id="camp-may-sofa",
        status="lead_captured",
        messages=[
            Message(id="msg-1", conversation_id="conv-001", sender_type="customer", message_text="55"),
            Message(id="msg-2", conversation_id="conv-001", sender_type="ai", message_text="Assalomu alaykum! Yumshoq mebel narxi 3 990 000 so'mdan boshlanadi."),
            Message(id="msg-3", conversation_id="conv-001", sender_type="customer", message_text="Akmal, +998 90 123 45 67"),
        ],
    )
}

telegram_settings = TelegramSettings(bot_username="sales_leads_bot", chat_id="-100123456789", notification_enabled=True, last_test_status="passed")


def find_campaign_by_keyword(comment_text: str) -> Campaign | None:
    normalized = normalize_keyword(comment_text)
    for campaign in campaigns.values():
        if campaign.status == "active" and campaign.auto_dm_enabled and campaign.normalized_keyword == normalized:
            product = products.get(campaign.product_id)
            if product and product.status == "active":
                return campaign
    return None

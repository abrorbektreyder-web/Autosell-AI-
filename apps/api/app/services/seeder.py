from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models import (
    Business,
    Campaign,
    CampaignKeyword,
    Conversation,
    Lead,
    Message,
    Product,
    TelegramSettings,
    User,
)

# Fixed UUIDs for demo data to avoid duplicate inserts and maintain consistency
DEMO_BUSINESS_ID = UUID("00000000-0000-0000-0000-000000000001")
DEMO_USER_ID = UUID("00000000-0000-0000-0000-000000000002")
DEMO_PRODUCT_1_ID = UUID("00000000-0000-0000-0000-000000000101")
DEMO_PRODUCT_2_ID = UUID("00000000-0000-0000-0000-000000000102")
DEMO_CAMPAIGN_1_ID = UUID("00000000-0000-0000-0000-000000000201")
DEMO_CAMPAIGN_2_ID = UUID("00000000-0000-0000-0000-000000000202")
DEMO_KEYWORD_1_ID = UUID("00000000-0000-0000-0000-000000000211")
DEMO_KEYWORD_2_ID = UUID("00000000-0000-0000-0000-000000000212")
DEMO_LEAD_ID = UUID("00000000-0000-0000-0000-000000000301")
DEMO_CONVERSATION_ID = UUID("00000000-0000-0000-0000-000000000401")


async def seed_demo_data(session: AsyncSession) -> None:
    """Seeds the database with initial demo data if it doesn't already exist."""
    # Check if demo business exists
    business_result = await session.execute(
        select(Business).filter(Business.id == DEMO_BUSINESS_ID)
    )
    db_business = business_result.scalar_one_or_none()

    if db_business:
        # Already seeded
        return

    # 1. Create Business
    business = Business(
        id=DEMO_BUSINESS_ID,
        business_name="Autosell AI Demo Store",
        owner_email="owner@example.com",
        status="active",
    )
    session.add(business)

    # 2. Create User
    user = User(
        id=DEMO_USER_ID,
        business_id=DEMO_BUSINESS_ID,
        email="owner@example.com",
        # bcrypt hash for password "password" (dummy for now)
        password_hash="$2b$12$oNAXq9B5/208rqmTqPuXBeUQmbQuAkgY.kjmTSmkq3j/x7G6tgrcC",
        first_name="Akmal",
        role="owner",
        status="active",
    )
    session.add(user)

    # 3. Create Telegram Settings
    tg_settings = TelegramSettings(
        business_id=DEMO_BUSINESS_ID,
        bot_username="sales_leads_bot",
        chat_id="-100123456789",
        notification_enabled=True,
        last_test_status="passed",
    )
    session.add(tg_settings)

    # 4. Create Products
    product1 = Product(
        id=DEMO_PRODUCT_1_ID,
        business_id=DEMO_BUSINESS_ID,
        name="Yumshoq mebel",
        price=4500000,
        discount_price=3990000,
        description="Premium matoli, oila uchun qulay yumshoq mebel to'plami.",
        delivery_info="Toshkent bo'ylab 24 soat ichida yetkazib berish.",
        colors=["kulrang", "bej", "ko'k"],
        variants=["kulrang", "bej", "ko'k"],
        faq=[{"q": "Kafolat bormi?", "a": "12 oy kafolat bor."}],
        status="active",
    )
    product2 = Product(
        id=DEMO_PRODUCT_2_ID,
        business_id=DEMO_BUSINESS_ID,
        name="Ofis kreslosi",
        price=1250000,
        description="Ergonomik suyanchiqli ofis kreslosi.",
        delivery_info="1-2 ish kuni ichida yetkaziladi.",
        colors=["qora", "oq"],
        variants=["qora", "oq"],
        status="active",
    )
    session.add_all([product1, product2])

    # 5. Create Campaigns
    campaign1 = Campaign(
        id=DEMO_CAMPAIGN_1_ID,
        business_id=DEMO_BUSINESS_ID,
        product_id=DEMO_PRODUCT_1_ID,
        name="May oyi yumshoq mebel reklamasi",
        instagram_url="https://instagram.com/reel/demo-sofa",
        first_dm_message="Assalomu alaykum! Yumshoq mebel narxi va variantlarini yuboraman. Ismingizni ayta olasizmi?",
        auto_dm_enabled=True,
        status="active",
    )
    campaign2 = Campaign(
        id=DEMO_CAMPAIGN_2_ID,
        business_id=DEMO_BUSINESS_ID,
        product_id=DEMO_PRODUCT_2_ID,
        name="Ofis kreslosi keyword kampaniyasi",
        instagram_url="https://instagram.com/reel/demo-chair",
        first_dm_message="Assalomu alaykum! Ofis kreslosi haqida qisqa ma'lumot yuboraman. Sizga qaysi rang qiziq?",
        auto_dm_enabled=True,
        status="active",
    )
    session.add_all([campaign1, campaign2])

    # 6. Create Campaign Keywords
    keyword1 = CampaignKeyword(
        id=DEMO_KEYWORD_1_ID,
        business_id=DEMO_BUSINESS_ID,
        campaign_id=DEMO_CAMPAIGN_1_ID,
        product_id=DEMO_PRODUCT_1_ID,
        keyword="55",
        normalized_keyword="55",
        match_type="exact",
        status="active",
    )
    keyword2 = CampaignKeyword(
        id=DEMO_KEYWORD_2_ID,
        business_id=DEMO_BUSINESS_ID,
        campaign_id=DEMO_CAMPAIGN_2_ID,
        product_id=DEMO_PRODUCT_2_ID,
        keyword="88",
        normalized_keyword="88",
        match_type="exact",
        status="active",
    )
    session.add_all([keyword1, keyword2])

    # 7. Create Lead (must be added after conversation is established or simultaneously)
    lead = Lead(
        id=DEMO_LEAD_ID,
        business_id=DEMO_BUSINESS_ID,
        customer_name="Akmal",
        phone="+998901234567",
        instagram_username="akmal_home",
        product_id=DEMO_PRODUCT_1_ID,
        campaign_id=DEMO_CAMPAIGN_1_ID,
        status="new",
        ai_summary="Narx so'radi, kulrang variantga qiziqdi, telefon qoldirdi.",
    )
    session.add(lead)

    # 8. Create Conversation
    conversation = Conversation(
        id=DEMO_CONVERSATION_ID,
        business_id=DEMO_BUSINESS_ID,
        instagram_username="akmal_home",
        lead_id=DEMO_LEAD_ID,
        product_id=DEMO_PRODUCT_1_ID,
        campaign_id=DEMO_CAMPAIGN_1_ID,
        status="lead_captured",
    )
    session.add(conversation)

    # 9. Create Messages
    msg1 = Message(
        id=uuid4(),
        business_id=DEMO_BUSINESS_ID,
        conversation_id=DEMO_CONVERSATION_ID,
        sender_type="customer",
        message_text="55",
    )
    msg2 = Message(
        id=uuid4(),
        business_id=DEMO_BUSINESS_ID,
        conversation_id=DEMO_CONVERSATION_ID,
        sender_type="ai",
        message_text="Assalomu alaykum! Yumshoq mebel narxi 3 990 000 so'mdan boshlanadi.",
    )
    msg3 = Message(
        id=uuid4(),
        business_id=DEMO_BUSINESS_ID,
        conversation_id=DEMO_CONVERSATION_ID,
        sender_type="customer",
        message_text="Akmal, +998 90 123 45 67",
    )
    session.add_all([msg1, msg2, msg3])

    # Commit all seeded data
    await session.commit()
    print("Demo data seeded successfully!")

from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from sqlalchemy.orm import selectinload

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
from app.schemas.domain import CampaignCreate, ProductCreate
from app.services.keyword_engine import normalize_keyword


# Helper to convert string to UUID safely
def to_uuid(val: str | UUID) -> UUID | None:
    if isinstance(val, UUID):
        return val
    try:
        return UUID(val)
    except (ValueError, AttributeError, TypeError):
        return None


async def get_dashboard_summary(db: AsyncSession, business_id: UUID) -> dict:
    # Get active campaigns count
    active_campaigns_query = await db.execute(
        select(Campaign).filter(
            Campaign.business_id == business_id, Campaign.status == "active"
        )
    )
    active_campaigns = len(active_campaigns_query.scalars().all())

    # Get leads count
    leads_query = await db.execute(
        select(Lead).filter(Lead.business_id == business_id)
    )
    total_leads = len(leads_query.scalars().all())

    # Get conversation count
    conversations_query = await db.execute(
        select(Conversation).filter(Conversation.business_id == business_id)
    )
    ai_conversations = len(conversations_query.scalars().all())

    # Get telegram connection status
    tg_query = await db.execute(
        select(TelegramSettings).filter(TelegramSettings.business_id == business_id)
    )
    tg_settings = tg_query.scalar_one_or_none()
    telegram_status = (
        "connected"
        if (tg_settings and tg_settings.notification_enabled)
        else "disabled"
    )

    return {
        "today_leads": total_leads,  # For demo/mock matches
        "total_leads": total_leads,
        "active_campaigns": active_campaigns,
        "top_product": "Yumshoq mebel",
        "instagram_status": "connected-demo",
        "telegram_status": telegram_status,
        "ai_conversations": ai_conversations,
    }


# PRODUCTS CRUD
async def list_products(db: AsyncSession, business_id: UUID) -> list[Product]:
    result = await db.execute(
        select(Product).filter(
            Product.business_id == business_id, Product.status == "active"
        )
    )
    return list(result.scalars().all())


async def get_product(
    db: AsyncSession, business_id: UUID, product_id: UUID
) -> Product | None:
    result = await db.execute(
        select(Product).filter(
            Product.business_id == business_id, Product.id == product_id
        )
    )
    return result.scalar_one_or_none()


async def create_product(
    db: AsyncSession, business_id: UUID, payload: ProductCreate
) -> Product:
    product = Product(
        business_id=business_id,
        name=payload.name,
        price=payload.price,
        discount_price=payload.discount_price,
        description=payload.description,
        delivery_info=payload.delivery_info,
        variants=payload.variants,
        faq=payload.faq,
        status=payload.status,
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def update_product(
    db: AsyncSession,
    business_id: UUID,
    product_id: UUID,
    payload: ProductCreate,
) -> Product | None:
    product = await get_product(db, business_id, product_id)
    if not product:
        return None

    product.name = payload.name
    product.price = payload.price
    product.discount_price = payload.discount_price
    product.description = payload.description
    product.delivery_info = payload.delivery_info
    product.variants = payload.variants
    product.faq = payload.faq
    product.status = payload.status

    await db.commit()
    await db.refresh(product)
    return product


async def delete_product(
    db: AsyncSession, business_id: UUID, product_id: UUID
) -> bool:
    product = await get_product(db, business_id, product_id)
    if not product:
        return False

    product.status = "inactive"
    await db.commit()
    return True


# CAMPAIGNS CRUD
async def list_campaigns(db: AsyncSession, business_id: UUID) -> list[Campaign]:
    result = await db.execute(
        select(Campaign)
        .options(selectinload(Campaign.campaign_keywords))
        .filter(Campaign.business_id == business_id, Campaign.status == "active")
    )
    return list(result.scalars().all())


async def get_campaign(
    db: AsyncSession, business_id: UUID, campaign_id: UUID
) -> Campaign | None:
    result = await db.execute(
        select(Campaign)
        .options(selectinload(Campaign.campaign_keywords))
        .filter(Campaign.business_id == business_id, Campaign.id == campaign_id)
    )
    return result.scalar_one_or_none()


async def create_campaign(
    db: AsyncSession, business_id: UUID, payload: CampaignCreate
) -> Campaign:
    # Verify product exists
    product_uuid = to_uuid(payload.product_id)
    product = await get_product(db, business_id, product_uuid)
    if not product:
        raise ValueError("Product not found")

    campaign = Campaign(
        business_id=business_id,
        product_id=product_uuid,
        name=payload.name,
        instagram_url=payload.instagram_url,
        first_dm_message=payload.first_dm_message,
        auto_dm_enabled=payload.auto_dm_enabled,
        status=payload.status,
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)

    # Automatically create the normalized keyword row
    keyword_normalized = normalize_keyword(payload.keyword)
    campaign_keyword = CampaignKeyword(
        business_id=business_id,
        campaign_id=campaign.id,
        product_id=product_uuid,
        keyword=payload.keyword,
        normalized_keyword=keyword_normalized,
        match_type="exact",
        status="active",
    )
    db.add(campaign_keyword)
    await db.commit()

    # Re-fetch with keywords loaded
    return await get_campaign(db, business_id, campaign.id)


async def update_campaign(
    db: AsyncSession,
    business_id: UUID,
    campaign_id: UUID,
    payload: CampaignCreate,
) -> Campaign | None:
    campaign = await get_campaign(db, business_id, campaign_id)
    if not campaign:
        return None

    product_uuid = to_uuid(payload.product_id)
    product = await get_product(db, business_id, product_uuid)
    if not product:
        raise ValueError("Product not found")

    campaign.product_id = product_uuid
    campaign.name = payload.name
    campaign.instagram_url = payload.instagram_url
    campaign.first_dm_message = payload.first_dm_message
    campaign.auto_dm_enabled = payload.auto_dm_enabled
    campaign.status = payload.status

    # Update keyword as well
    keyword_normalized = normalize_keyword(payload.keyword)
    kw_result = await db.execute(
        select(CampaignKeyword).filter(
            CampaignKeyword.business_id == business_id,
            CampaignKeyword.campaign_id == campaign_id,
        )
    )
    kw_row = kw_result.scalar_one_or_none()
    if kw_row:
        kw_row.keyword = payload.keyword
        kw_row.normalized_keyword = keyword_normalized
        kw_row.product_id = product_uuid
    else:
        new_kw = CampaignKeyword(
            business_id=business_id,
            campaign_id=campaign_id,
            product_id=product_uuid,
            keyword=payload.keyword,
            normalized_keyword=keyword_normalized,
            match_type="exact",
            status="active",
        )
        db.add(new_kw)

    await db.commit()
    await db.refresh(campaign)
    return await get_campaign(db, business_id, campaign.id)


async def delete_campaign(
    db: AsyncSession, business_id: UUID, campaign_id: UUID
) -> bool:
    campaign = await get_campaign(db, business_id, campaign_id)
    if not campaign:
        return False

    campaign.status = "inactive"
    await db.commit()
    return True


# LEADS
async def list_leads(db: AsyncSession, business_id: UUID) -> list[Lead]:
    result = await db.execute(
        select(Lead)
        .options(selectinload(Lead.source_comment))
        .filter(Lead.business_id == business_id)
        .order_by(Lead.created_at.desc())
    )
    return list(result.scalars().all())


async def get_lead(
    db: AsyncSession, business_id: UUID, lead_id: UUID
) -> Lead | None:
    result = await db.execute(
        select(Lead)
        .options(selectinload(Lead.source_comment))
        .filter(Lead.business_id == business_id, Lead.id == lead_id)
    )
    return result.scalar_one_or_none()


async def update_lead_status(
    db: AsyncSession, business_id: UUID, lead_id: UUID, status: str
) -> Lead | None:
    lead = await get_lead(db, business_id, lead_id)
    if not lead:
        return None

    lead.status = status
    await db.commit()
    await db.refresh(lead)
    return lead


# CONVERSATIONS
async def get_conversation(
    db: AsyncSession, business_id: UUID, conversation_id: UUID
) -> Conversation | None:
    # Need to load conversation along with messages
    result = await db.execute(
        select(Conversation).filter(
            Conversation.business_id == business_id,
            Conversation.id == conversation_id,
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        return None

    # Load messages
    msg_result = await db.execute(
        select(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    conversation.messages = list(msg_result.scalars().all())
    return conversation


# TELEGRAM SETTINGS
async def get_telegram_settings(
    db: AsyncSession, business_id: UUID
) -> TelegramSettings | None:
    result = await db.execute(
        select(TelegramSettings).filter(TelegramSettings.business_id == business_id)
    )
    return result.scalar_one_or_none()


async def save_telegram_settings(
    db: AsyncSession,
    business_id: UUID,
    bot_username: str | None,
    chat_id: str | None,
    notification_enabled: bool = False,
) -> TelegramSettings:
    settings = await get_telegram_settings(db, business_id)
    if not settings:
        settings = TelegramSettings(
            business_id=business_id,
            bot_username=bot_username,
            chat_id=chat_id,
            notification_enabled=notification_enabled,
        )
        db.add(settings)
    else:
        settings.bot_username = bot_username
        settings.chat_id = chat_id
        settings.notification_enabled = notification_enabled

    await db.commit()
    await db.refresh(settings)
    return settings


# KEYWORD MATCHING
async def find_campaign_by_keyword(
    db: AsyncSession, business_id: UUID, comment_text: str
) -> Campaign | None:
    normalized = normalize_keyword(comment_text)
    # Join with CampaignKeyword to search
    result = await db.execute(
        select(Campaign)
        .join(CampaignKeyword, CampaignKeyword.campaign_id == Campaign.id)
        .filter(
            Campaign.business_id == business_id,
            Campaign.status == "active",
            Campaign.auto_dm_enabled == True,
            CampaignKeyword.normalized_keyword == normalized,
            CampaignKeyword.status == "active",
        )
    )
    return result.scalar_one_or_none()

from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.domain import (
    Campaign,
    CampaignCreate,
    DashboardSummary,
    InstagramWebhookEvent,
    Lead,
    Product,
    ProductCreate,
    Conversation,
    Message,
    TelegramSettings as TelegramSettingsSchema,
)
from app.services import db_repository
from app.services.ai_sales import build_first_reply
from app.services.telegram import format_lead_notification

router = APIRouter()

# Default Demo Business ID used until Section 2 (Auth) is fully active
DEMO_BUSINESS_ID = UUID("00000000-0000-0000-0000-000000000001")


# Helper mappers from DB ORM models to Pydantic schemas
def map_product_to_pydantic(product) -> Product:
    return Product(
        id=str(product.id),
        name=product.name,
        price=product.price,
        discount_price=product.discount_price,
        description=product.description,
        delivery_info=product.delivery_info or "",
        variants=product.variants or [],
        faq=product.faq or [],
        status=product.status,
    )


def map_campaign_to_pydantic(campaign) -> Campaign:
    kw = campaign.campaign_keywords[0] if campaign.campaign_keywords else None
    return Campaign(
        id=str(campaign.id),
        product_id=str(campaign.product_id),
        name=campaign.name,
        keyword=kw.keyword if kw else "",
        normalized_keyword=kw.normalized_keyword if kw else "",
        instagram_url=campaign.instagram_url or "",
        first_dm_message=campaign.first_dm_message,
        auto_dm_enabled=campaign.auto_dm_enabled,
        status=campaign.status,
    )


def map_lead_to_pydantic(lead) -> Lead:
    return Lead(
        id=str(lead.id),
        customer_name=lead.customer_name,
        phone=lead.phone,
        instagram_username=lead.instagram_username or "",
        product_id=str(lead.product_id),
        campaign_id=str(lead.campaign_id),
        status=lead.status,
        source_comment=lead.source_comment.comment_text if lead.source_comment else "",
        ai_summary=lead.ai_summary or "",
    )


def map_conversation_to_pydantic(conv) -> Conversation:
    return Conversation(
        id=str(conv.id),
        instagram_username=conv.instagram_username or "",
        lead_id=str(conv.lead_id) if conv.lead_id else None,
        product_id=str(conv.product_id) if conv.product_id else "",
        campaign_id=str(conv.campaign_id) if conv.campaign_id else "",
        status=conv.status,
        messages=[
            Message(
                id=str(msg.id),
                conversation_id=str(msg.conversation_id),
                sender_type=msg.sender_type,
                message_text=msg.message_text,
            )
            for msg in conv.messages
        ],
    )


@router.get("/dashboard", response_model=DashboardSummary)
async def dashboard(db: AsyncSession = Depends(get_db)) -> DashboardSummary:
    summary = await db_repository.get_dashboard_summary(db, DEMO_BUSINESS_ID)
    return DashboardSummary(**summary)


@router.get("/auth/me")
def me() -> dict[str, str]:
    # Placeholder for auth
    return {
        "id": "owner-demo",
        "business_id": str(DEMO_BUSINESS_ID),
        "email": "owner@example.com",
        "role": "owner",
    }


@router.post("/auth/register")
def register() -> dict[str, str]:
    return {"status": "created", "next": "Implement password hashing and business provisioning."}


@router.post("/auth/login")
def login() -> dict[str, str]:
    return {"access_token": "demo-token", "token_type": "bearer"}


@router.post("/auth/logout")
def logout() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/products", response_model=list[Product])
async def list_products(db: AsyncSession = Depends(get_db)) -> list[Product]:
    db_products = await db_repository.list_products(db, DEMO_BUSINESS_ID)
    return [map_product_to_pydantic(p) for p in db_products]


@router.post("/products", response_model=Product)
async def create_product(
    payload: ProductCreate, db: AsyncSession = Depends(get_db)
) -> Product:
    product = await db_repository.create_product(db, DEMO_BUSINESS_ID, payload)
    return map_product_to_pydantic(product)


@router.get("/products/{product_id}", response_model=Product)
async def get_product(
    product_id: str, db: AsyncSession = Depends(get_db)
) -> Product:
    product_uuid = db_repository.to_uuid(product_id)
    if not product_uuid:
        raise HTTPException(status_code=400, detail="Invalid product UUID format")

    product = await db_repository.get_product(db, DEMO_BUSINESS_ID, product_uuid)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return map_product_to_pydantic(product)


@router.patch("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str, payload: ProductCreate, db: AsyncSession = Depends(get_db)
) -> Product:
    product_uuid = db_repository.to_uuid(product_id)
    if not product_uuid:
        raise HTTPException(status_code=400, detail="Invalid product UUID format")

    product = await db_repository.update_product(
        db, DEMO_BUSINESS_ID, product_uuid, payload
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return map_product_to_pydantic(product)


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str, db: AsyncSession = Depends(get_db)
) -> dict[str, str]:
    product_uuid = db_repository.to_uuid(product_id)
    if not product_uuid:
        raise HTTPException(status_code=400, detail="Invalid product UUID format")

    success = await db_repository.delete_product(db, DEMO_BUSINESS_ID, product_uuid)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "inactive"}


@router.get("/campaigns", response_model=list[Campaign])
async def list_campaigns(db: AsyncSession = Depends(get_db)) -> list[Campaign]:
    db_campaigns = await db_repository.list_campaigns(db, DEMO_BUSINESS_ID)
    return [map_campaign_to_pydantic(c) for c in db_campaigns]


@router.post("/campaigns", response_model=Campaign)
async def create_campaign(
    payload: CampaignCreate, db: AsyncSession = Depends(get_db)
) -> Campaign:
    try:
        campaign = await db_repository.create_campaign(
            db, DEMO_BUSINESS_ID, payload
        )
        return map_campaign_to_pydantic(campaign)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/campaigns/{campaign_id}", response_model=Campaign)
async def get_campaign(
    campaign_id: str, db: AsyncSession = Depends(get_db)
) -> Campaign:
    campaign_uuid = db_repository.to_uuid(campaign_id)
    if not campaign_uuid:
        raise HTTPException(status_code=400, detail="Invalid campaign UUID format")

    campaign = await db_repository.get_campaign(db, DEMO_BUSINESS_ID, campaign_uuid)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return map_campaign_to_pydantic(campaign)


@router.patch("/campaigns/{campaign_id}", response_model=Campaign)
async def update_campaign(
    campaign_id: str, payload: CampaignCreate, db: AsyncSession = Depends(get_db)
) -> Campaign:
    campaign_uuid = db_repository.to_uuid(campaign_id)
    if not campaign_uuid:
        raise HTTPException(status_code=400, detail="Invalid campaign UUID format")

    try:
        campaign = await db_repository.update_campaign(
            db, DEMO_BUSINESS_ID, campaign_uuid, payload
        )
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return map_campaign_to_pydantic(campaign)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: str, db: AsyncSession = Depends(get_db)
) -> dict[str, str]:
    campaign_uuid = db_repository.to_uuid(campaign_id)
    if not campaign_uuid:
        raise HTTPException(status_code=400, detail="Invalid campaign UUID format")

    success = await db_repository.delete_campaign(
        db, DEMO_BUSINESS_ID, campaign_uuid
    )
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "inactive"}


@router.get("/integrations/instagram/connect")
def instagram_connect() -> dict[str, str]:
    return {"status": "pending", "next": "Redirect owner to Meta OAuth with instagram_manage_messages permissions."}


@router.get("/integrations/instagram/callback")
def instagram_callback() -> dict[str, str]:
    return {"status": "received", "next": "Exchange code for long-lived token and encrypt before storage."}


@router.get("/webhooks/instagram")
def verify_instagram_webhook(
    mode: str | None = Query(default=None, alias="hub.mode"),
    token: str | None = Query(default=None, alias="hub.verify_token"),
    challenge: str | None = Query(default=None, alias="hub.challenge"),
) -> str:
    # Use config verification token
    from app.core.config import settings

    if mode == "subscribe" and token == settings.meta_verify_token and challenge:
        return challenge
    raise HTTPException(status_code=403, detail="Webhook verification failed")


@router.post("/webhooks/instagram")
async def receive_instagram_webhook(
    payload: InstagramWebhookEvent, db: AsyncSession = Depends(get_db)
) -> dict[str, str]:
    campaign = await db_repository.find_campaign_by_keyword(
        db, DEMO_BUSINESS_ID, payload.comment_text
    )
    if not campaign:
        return {"status": "ignored", "reason": "keyword_not_found"}

    product = await db_repository.get_product(
        db, DEMO_BUSINESS_ID, campaign.product_id
    )
    if not product:
        return {"status": "ignored", "reason": "associated_product_not_active"}

    # Mock matching schemas for compatibility
    from app.schemas.domain import Product as SchemaProduct, Campaign as SchemaCampaign
    schema_product = map_product_to_pydantic(product)
    schema_campaign = map_campaign_to_pydantic(campaign)

    reply = build_first_reply(schema_product, schema_campaign)
    return {
        "status": "queued",
        "campaign_id": str(campaign.id),
        "product_id": str(product.id),
        "private_reply_preview": reply,
        "next": "Persist comment, SETNX Redis dedupe, enqueue Private Reply and AI follow-up jobs.",
    }


@router.get("/integrations/telegram", response_model=TelegramSettingsSchema)
async def get_telegram_settings(
    db: AsyncSession = Depends(get_db),
) -> TelegramSettingsSchema:
    settings = await db_repository.get_telegram_settings(db, DEMO_BUSINESS_ID)
    if not settings:
        return TelegramSettingsSchema(
            bot_username=None, chat_id=None, notification_enabled=False
        )
    return TelegramSettingsSchema(
        bot_username=settings.bot_username,
        chat_id=settings.chat_id,
        notification_enabled=settings.notification_enabled,
        last_test_status=settings.last_test_status,
    )


@router.post("/integrations/telegram")
async def save_telegram_settings(
    payload: TelegramSettingsSchema, db: AsyncSession = Depends(get_db)
) -> dict[str, str]:
    await db_repository.save_telegram_settings(
        db,
        DEMO_BUSINESS_ID,
        payload.bot_username,
        payload.chat_id,
        payload.notification_enabled,
    )
    return {
        "status": "saved",
        "security": "Token must be AES-256-GCM encrypted before persistence.",
    }


@router.post("/integrations/telegram/test")
async def test_telegram(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    db_leads = await db_repository.list_leads(db, DEMO_BUSINESS_ID)
    if not db_leads:
        raise HTTPException(status_code=400, detail="No leads available to test notification")

    lead = db_leads[0]
    product = await db_repository.get_product(db, DEMO_BUSINESS_ID, lead.product_id)
    product_name = product.name if product else "Unknown"

    schema_lead = map_lead_to_pydantic(lead)
    return {
        "status": "passed",
        "message_preview": format_lead_notification(schema_lead, product_name),
    }


@router.get("/leads", response_model=list[Lead])
async def list_leads(db: AsyncSession = Depends(get_db)) -> list[Lead]:
    db_leads = await db_repository.list_leads(db, DEMO_BUSINESS_ID)
    return [map_lead_to_pydantic(l) for l in db_leads]


@router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str, db: AsyncSession = Depends(get_db)) -> Lead:
    lead_uuid = db_repository.to_uuid(lead_id)
    if not lead_uuid:
        raise HTTPException(status_code=400, detail="Invalid lead UUID format")

    lead = await db_repository.get_lead(db, DEMO_BUSINESS_ID, lead_uuid)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return map_lead_to_pydantic(lead)


@router.patch("/leads/{lead_id}", response_model=Lead)
async def update_lead_status(
    lead_id: str, status: str, db: AsyncSession = Depends(get_db)
) -> Lead:
    lead_uuid = db_repository.to_uuid(lead_id)
    if not lead_uuid:
        raise HTTPException(status_code=400, detail="Invalid lead UUID format")

    lead = await db_repository.update_lead_status(
        db, DEMO_BUSINESS_ID, lead_uuid, status
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return map_lead_to_pydantic(lead)


@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: str, db: AsyncSession = Depends(get_db)
) -> Conversation:
    conv_uuid = db_repository.to_uuid(conversation_id)
    if not conv_uuid:
        raise HTTPException(status_code=400, detail="Invalid conversation UUID format")

    conv = await db_repository.get_conversation(db, DEMO_BUSINESS_ID, conv_uuid)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return map_conversation_to_pydantic(conv)


@router.post("/exports")
def create_export() -> dict[str, str]:
    return {"id": "export-demo", "status": "queued", "format": "xlsx"}


@router.get("/exports/{export_id}")
def get_export(export_id: str) -> dict[str, str]:
    return {"id": export_id, "status": "ready"}


@router.get("/exports/{export_id}/download")
def download_export(export_id: str) -> dict[str, str]:
    return {"id": export_id, "download_url": "/exports/export-demo.xlsx"}

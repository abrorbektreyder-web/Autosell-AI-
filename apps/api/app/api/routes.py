from uuid import uuid4
from fastapi import APIRouter, HTTPException, Query, Request

from app.core.config import settings
from app.schemas.domain import Campaign, CampaignCreate, DashboardSummary, InstagramWebhookEvent, Lead, Product, ProductCreate
from app.services import demo_store
from app.services.ai_sales import build_first_reply
from app.services.keyword_engine import normalize_keyword
from app.services.telegram import format_lead_notification

router = APIRouter()


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard() -> DashboardSummary:
    active_campaigns = sum(1 for item in demo_store.campaigns.values() if item.status == "active")
    return DashboardSummary(
        today_leads=len(demo_store.leads),
        total_leads=len(demo_store.leads),
        active_campaigns=active_campaigns,
        top_product="Yumshoq mebel",
        instagram_status="connected-demo",
        telegram_status="connected" if demo_store.telegram_settings.notification_enabled else "disabled",
        ai_conversations=len(demo_store.conversations),
    )


@router.get("/auth/me")
def me() -> dict[str, str]:
    return {"id": "owner-demo", "business_id": "business-demo", "email": "owner@example.com", "role": "owner"}


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
def list_products() -> list[Product]:
    return list(demo_store.products.values())


@router.post("/products", response_model=Product)
def create_product(payload: ProductCreate) -> Product:
    product = Product(id=f"prod-{uuid4().hex[:8]}", **payload.model_dump())
    demo_store.products[product.id] = product
    return product


@router.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str) -> Product:
    product = demo_store.products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/products/{product_id}", response_model=Product)
def update_product(product_id: str, payload: ProductCreate) -> Product:
    if product_id not in demo_store.products:
        raise HTTPException(status_code=404, detail="Product not found")
    product = Product(id=product_id, **payload.model_dump())
    demo_store.products[product_id] = product
    return product


@router.delete("/products/{product_id}")
def delete_product(product_id: str) -> dict[str, str]:
    product = demo_store.products.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    demo_store.products[product_id] = product.model_copy(update={"status": "inactive"})
    return {"status": "inactive"}


@router.get("/campaigns", response_model=list[Campaign])
def list_campaigns() -> list[Campaign]:
    return list(demo_store.campaigns.values())


@router.post("/campaigns", response_model=Campaign)
def create_campaign(payload: CampaignCreate) -> Campaign:
    if payload.product_id not in demo_store.products:
        raise HTTPException(status_code=400, detail="Product is required for campaign")
    campaign = Campaign(
        id=f"camp-{uuid4().hex[:8]}",
        normalized_keyword=normalize_keyword(payload.keyword),
        **payload.model_dump(),
    )
    demo_store.campaigns[campaign.id] = campaign
    return campaign


@router.get("/campaigns/{campaign_id}", response_model=Campaign)
def get_campaign(campaign_id: str) -> Campaign:
    campaign = demo_store.campaigns.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.patch("/campaigns/{campaign_id}", response_model=Campaign)
def update_campaign(campaign_id: str, payload: CampaignCreate) -> Campaign:
    if campaign_id not in demo_store.campaigns:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign = Campaign(id=campaign_id, normalized_keyword=normalize_keyword(payload.keyword), **payload.model_dump())
    demo_store.campaigns[campaign_id] = campaign
    return campaign


@router.delete("/campaigns/{campaign_id}")
def delete_campaign(campaign_id: str) -> dict[str, str]:
    campaign = demo_store.campaigns.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    demo_store.campaigns[campaign_id] = campaign.model_copy(update={"status": "inactive"})
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
    if mode == "subscribe" and token == settings.meta_verify_token and challenge:
        return challenge
    raise HTTPException(status_code=403, detail="Webhook verification failed")


@router.post("/webhooks/instagram")
async def receive_instagram_webhook(payload: InstagramWebhookEvent, request: Request) -> dict[str, str]:
    campaign = demo_store.find_campaign_by_keyword(payload.comment_text)
    if not campaign:
        return {"status": "ignored", "reason": "keyword_not_found"}
    product = demo_store.products[campaign.product_id]
    reply = build_first_reply(product, campaign)
    return {
        "status": "queued",
        "campaign_id": campaign.id,
        "product_id": product.id,
        "private_reply_preview": reply,
        "next": "Persist comment, SETNX Redis dedupe, enqueue Private Reply and AI follow-up jobs.",
    }


@router.get("/integrations/telegram")
def get_telegram_settings():
    return demo_store.telegram_settings


@router.post("/integrations/telegram")
def save_telegram_settings() -> dict[str, str]:
    return {"status": "saved", "security": "Token must be AES-256-GCM encrypted before persistence."}


@router.post("/integrations/telegram/test")
def test_telegram() -> dict[str, str]:
    lead = next(iter(demo_store.leads.values()))
    product = demo_store.products[lead.product_id]
    return {"status": "passed", "message_preview": format_lead_notification(lead, product.name)}


@router.get("/leads", response_model=list[Lead])
def list_leads() -> list[Lead]:
    return list(demo_store.leads.values())


@router.get("/leads/{lead_id}", response_model=Lead)
def get_lead(lead_id: str) -> Lead:
    lead = demo_store.leads.get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/leads/{lead_id}", response_model=Lead)
def update_lead_status(lead_id: str, status: str) -> Lead:
    lead = demo_store.leads.get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    updated = lead.model_copy(update={"status": status})
    demo_store.leads[lead_id] = updated
    return updated


@router.get("/conversations/{conversation_id}")
def get_conversation(conversation_id: str):
    conversation = demo_store.conversations.get(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.post("/exports")
def create_export() -> dict[str, str]:
    return {"id": "export-demo", "status": "queued", "format": "xlsx"}


@router.get("/exports/{export_id}")
def get_export(export_id: str) -> dict[str, str]:
    return {"id": export_id, "status": "ready"}


@router.get("/exports/{export_id}/download")
def download_export(export_id: str) -> dict[str, str]:
    return {"id": export_id, "download_url": "/exports/export-demo.xlsx"}

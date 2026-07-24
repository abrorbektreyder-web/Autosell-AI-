from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Literal

Status = Literal["active", "inactive"]
LeadStatus = Literal["new", "contacted", "qualified", "won", "lost"]


class Product(BaseModel):
    id: str
    name: str
    price: int
    discount_price: int | None = None
    description: str
    delivery_info: str
    variants: list[str] = Field(default_factory=list)
    faq: list[dict[str, str]] = Field(default_factory=list)
    status: Status = "active"


class ProductCreate(BaseModel):
    name: str
    price: int
    discount_price: int | None = None
    description: str
    delivery_info: str
    variants: list[str] = Field(default_factory=list)
    faq: list[dict[str, str]] = Field(default_factory=list)
    status: Status = "active"


class Campaign(BaseModel):
    id: str
    product_id: str
    name: str
    keyword: str
    normalized_keyword: str
    instagram_url: str
    first_dm_message: str
    auto_dm_enabled: bool = True
    status: Status = "active"


class CampaignCreate(BaseModel):
    product_id: str
    name: str
    keyword: str
    instagram_url: str
    first_dm_message: str
    auto_dm_enabled: bool = True
    status: Status = "active"


class Lead(BaseModel):
    id: str
    customer_name: str
    phone: str
    instagram_username: str | None = None
    product_id: str
    campaign_id: str
    status: LeadStatus = "new"
    source_comment: str
    ai_summary: str


class Message(BaseModel):
    id: str
    conversation_id: str
    sender_type: Literal["customer", "ai", "system"]
    message_text: str


class Conversation(BaseModel):
    id: str
    instagram_username: str
    lead_id: str | None = None
    product_id: str
    campaign_id: str
    status: Literal["open", "lead_captured", "closed"] = "open"
    messages: list[Message] = Field(default_factory=list)


class InstagramWebhookEvent(BaseModel):
    comment_id: str
    instagram_user_id: str | None = None
    instagram_username: str | None = None
    comment_text: str
    media_id: str | None = None


class TelegramSettings(BaseModel):
    bot_username: str | None = None
    chat_id: str | None = None
    notification_enabled: bool = False
    last_test_status: Literal["not_tested", "passed", "failed"] = "not_tested"


InstagramTokenStatus = Literal["not_connected", "active", "invalid", "expired"]


class InstagramSettings(BaseModel):
    """Read-only view returned to the dashboard. The access token is never echoed back."""

    instagram_account_id: str | None = None
    instagram_username: str | None = None
    page_id: str | None = None
    token_status: InstagramTokenStatus = "not_connected"
    connected_at: datetime | None = None


class InstagramSettingsInput(BaseModel):
    """Payload the owner submits from the Instagram Integration form."""

    instagram_account_id: str
    page_id: str | None = None
    access_token: str


class DashboardSummary(BaseModel):
    today_leads: int
    total_leads: int
    active_campaigns: int
    top_product: str
    instagram_status: str
    telegram_status: str
    ai_conversations: int


class UserRegister(BaseModel):
    email: str
    password: str
    first_name: str
    business_name: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


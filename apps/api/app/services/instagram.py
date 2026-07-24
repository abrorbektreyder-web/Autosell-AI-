"""Meta Graph API integration for Instagram Business accounts.

MVP note: full OAuth (Meta App Review for instagram_manage_messages /
instagram_manage_comments) is a separate manual step the business owner
completes on developers.facebook.com. Until that is approved, the owner
pastes a long-lived Page Access Token generated from the Graph API
Explorer directly into the dashboard form below. Everything downstream
(token encryption, verification against the real Graph API, webhook
signature checking, Private Reply sending) is fully wired so switching
to a real OAuth flow later only means replacing how the token is
obtained, not any of the code that uses it.
"""

import hashlib
import hmac

import httpx

from app.core.config import settings


class InstagramAPIError(Exception):
    """Raised when the Meta Graph API rejects a request (bad/expired token, wrong ID, etc)."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


async def verify_instagram_token(instagram_account_id: str, access_token: str) -> dict:
    """Call the real Meta Graph API to confirm the account id + token pair is valid.

    Returns the account's username/id on success. Raises InstagramAPIError on failure
    (expired token, wrong permissions, wrong account id, network error, etc).
    """
    url = f"{settings.meta_graph_api_base}/{instagram_account_id}"
    params = {"fields": "id,username", "access_token": access_token}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, params=params)
    except httpx.RequestError as exc:
        raise InstagramAPIError(f"Could not reach Meta Graph API: {exc}", status_code=502)

    data = response.json()
    if response.status_code != 200 or "error" in data:
        error_message = data.get("error", {}).get("message", "Unknown Meta API error")
        raise InstagramAPIError(error_message, status_code=response.status_code or 400)

    return {
        "instagram_account_id": data.get("id", instagram_account_id),
        "instagram_username": data.get("username"),
    }


async def send_private_reply(comment_id: str, message: str, access_token: str) -> dict:
    """Send a Private Reply to a customer who commented a campaign keyword.

    Wired for when the webhook pipeline (Section 5/6 of tasks.md) goes live.
    Not called anywhere yet — the webhook currently only returns a preview.
    """
    url = f"{settings.meta_graph_api_base}/{comment_id}/private_replies"
    payload = {"message": message, "access_token": access_token}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, data=payload)
    except httpx.RequestError as exc:
        raise InstagramAPIError(f"Could not reach Meta Graph API: {exc}", status_code=502)

    data = response.json()
    if response.status_code != 200 or "error" in data:
        error_message = data.get("error", {}).get("message", "Unknown Meta API error")
        raise InstagramAPIError(error_message, status_code=response.status_code or 400)

    return data


def verify_webhook_signature(payload_body: bytes, signature_header: str | None, app_secret: str) -> bool:
    """Validate Meta's X-Hub-Signature-256 header (HMAC-SHA256 over the raw body).

    Per TZ 7.5: requests with a missing/invalid signature must be rejected.
    If app_secret is not configured (local dev), verification is skipped so
    local testing isn't blocked — production must set META_WEBHOOK_SECRET.
    """
    if not app_secret:
        return True

    if not signature_header or not signature_header.startswith("sha256="):
        return False

    expected = hmac.new(app_secret.encode("utf-8"), payload_body, hashlib.sha256).hexdigest()
    provided = signature_header.removeprefix("sha256=")
    return hmac.compare_digest(expected, provided)

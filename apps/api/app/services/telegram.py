from app.schemas.domain import Lead


def format_lead_notification(lead: Lead, product_name: str) -> str:
    return "\n".join([
        "Yangi Instagram lead",
        f"Ism: {lead.customer_name}",
        f"Telefon: {lead.phone}",
        f"Mahsulot: {product_name}",
        f"Instagram: @{lead.instagram_username or 'unknown'}",
        f"Status: {lead.status}",
        f"AI summary: {lead.ai_summary}",
    ])

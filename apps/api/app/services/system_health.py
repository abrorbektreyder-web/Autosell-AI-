"""Live infrastructure checks for the platform admin panel.

Every value here is measured at request time. Nothing is hardcoded: a component
that is not wired up reports "not_configured" rather than pretending to be green.
"""

import time
from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

_STARTED_AT = datetime.now(timezone.utc)


async def check_database(db: AsyncSession) -> dict:
    """Round-trip a trivial query to measure real database latency."""
    started = time.perf_counter()
    try:
        await db.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - started) * 1000, 1)
        return {
            "component": "PostgreSQL",
            "status": "ok",
            "detail": f"javob {latency_ms} ms",
            "latency_ms": latency_ms,
        }
    except Exception as exc:
        return {
            "component": "PostgreSQL",
            "status": "error",
            "detail": f"ulanmadi: {type(exc).__name__}",
            "latency_ms": None,
        }


async def check_redis() -> dict:
    """PING Redis if a URL is configured; otherwise say so plainly."""
    if not settings.redis_url:
        return {
            "component": "Redis",
            "status": "not_configured",
            "detail": "REDIS_URL sozlanmagan",
            "latency_ms": None,
        }

    try:
        import redis.asyncio as redis_asyncio
    except ImportError:
        return {
            "component": "Redis",
            "status": "not_configured",
            "detail": "redis kutubxonasi yo'q",
            "latency_ms": None,
        }

    client = None
    started = time.perf_counter()
    try:
        client = redis_asyncio.from_url(settings.redis_url, socket_connect_timeout=2, socket_timeout=2)
        await client.ping()
        latency_ms = round((time.perf_counter() - started) * 1000, 1)
        return {
            "component": "Redis",
            "status": "ok",
            "detail": f"PING {latency_ms} ms",
            "latency_ms": latency_ms,
        }
    except Exception as exc:
        return {
            "component": "Redis",
            "status": "error",
            "detail": f"ulanmadi: {type(exc).__name__}",
            "latency_ms": None,
        }
    finally:
        if client is not None:
            try:
                await client.aclose()
            except Exception:
                pass


def check_instagram() -> dict:
    """Report whether the Meta credentials needed for live webhooks are present."""
    if settings.meta_app_id and settings.meta_app_secret:
        detail = "App sozlangan" + ("" if settings.meta_webhook_secret else ", webhook secret yo'q")
        return {"component": "Instagram / Meta", "status": "ok" if settings.meta_webhook_secret else "warning", "detail": detail, "latency_ms": None}
    return {
        "component": "Instagram / Meta",
        "status": "not_configured",
        "detail": "META_APP_ID sozlanmagan",
        "latency_ms": None,
    }


def check_ai() -> dict:
    if settings.groq_api_key:
        return {"component": "AI provider", "status": "ok", "detail": settings.ai_model, "latency_ms": None}
    return {
        "component": "AI provider",
        "status": "not_configured",
        "detail": "GROQ_API_KEY sozlanmagan",
        "latency_ms": None,
    }


def check_background_jobs() -> dict:
    """Celery is on the roadmap but not deployed; say that instead of showing a green tick."""
    return {
        "component": "Background jobs",
        "status": "not_configured",
        "detail": "Celery worker ishga tushirilmagan",
        "latency_ms": None,
    }


async def collect_system_health(db: AsyncSession) -> dict:
    checks = [
        await check_database(db),
        await check_redis(),
        check_instagram(),
        check_ai(),
        check_background_jobs(),
    ]

    ok = sum(1 for c in checks if c["status"] == "ok")
    degraded = sum(1 for c in checks if c["status"] in {"warning", "not_configured"})
    failed = sum(1 for c in checks if c["status"] == "error")

    # Health score reflects what is actually running, so it moves as components come online.
    score = round((ok + degraded * 0.5) / len(checks) * 100) if checks else 0
    overall = "error" if failed else ("degraded" if degraded else "ok")

    return {
        "checks": checks,
        "health_score": score,
        "overall": overall,
        "uptime_seconds": int((datetime.now(timezone.utc) - _STARTED_AT).total_seconds()),
        "environment": settings.app_env,
        "checked_at": datetime.now(timezone.utc),
    }

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.services.seeder import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed the database on startup
    async with AsyncSessionLocal() as session:
        try:
            await seed_demo_data(session)
        except Exception as e:
            print(f"Error seeding database: {e}")
    yield


app = FastAPI(
    title="Instagram AI Sales Bot CRM API",
    version="0.1.0",
    description="Owner dashboard API for Instagram comment-to-DM automation and CRM leads.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "instagram-ai-sales-bot-crm"}

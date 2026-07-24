from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    api_base_url: str = "http://localhost:4000"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/instagram_sales_crm"
    redis_url: str = "redis://localhost:6379/0"
    encryption_key: str = "change-me-32-byte-secret-key-value"
    meta_app_id: str = ""
    meta_app_secret: str = ""
    meta_verify_token: str = "local-verify-token"
    meta_webhook_secret: str = ""
    meta_graph_api_base: str = "https://graph.facebook.com/v19.0"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    groq_api_key: str = ""
    ai_model: str = "llama-3.3-70b-versatile"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()

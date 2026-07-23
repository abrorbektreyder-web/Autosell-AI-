from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    api_base_url: str = "http://localhost:4000"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/instagram_sales_crm"
    redis_url: str = "redis://localhost:6379/0"
    encryption_key: str = "change-me-32-byte-secret-key-value"
    meta_verify_token: str = "local-verify-token"
    meta_webhook_secret: str = ""
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()

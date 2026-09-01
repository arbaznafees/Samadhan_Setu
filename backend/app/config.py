import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Samadhan Setu Jharkhand"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment & Host
    ENV: str = "development"
    PORT: int = 8000
    
    # PostgreSQL Database URL with pgvector & PostGIS (Direct Render external connection or local PostgreSQL)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/samadhan_setu"
    
    # Redis for Celery background worker
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT Auth Settings
    JWT_SECRET: str = "samadhan_setu_jharkhand_super_secret_jwt_key_2026_change_in_prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Google Gemini AI API Key (Gemini Flash)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    
    # S3 / Cloudflare R2 Media Storage
    S3_ENDPOINT_URL: Optional[str] = None
    S3_ACCESS_KEY_ID: Optional[str] = None
    S3_SECRET_ACCESS_KEY: Optional[str] = None
    S3_BUCKET_NAME: str = "samadhan-setu-media"
    S3_REGION_NAME: str = "auto"
    S3_PUBLIC_BASE_URL: Optional[str] = None
    
    # CORS & Frontend Origins
    FRONTEND_URL: Optional[str] = None  # e.g. https://samadhan-setu.vercel.app
    ALLOWED_ORIGINS: Optional[str] = None  # Comma-separated list of origins

    def get_cors_origins(self) -> list[str]:
        origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL.rstrip("/"))
        if self.ALLOWED_ORIGINS:
            origins.extend([o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()])
        return origins

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

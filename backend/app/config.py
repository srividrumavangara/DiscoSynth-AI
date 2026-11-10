"""Application configuration using pydantic-settings."""

from __future__ import annotations

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration sourced from environment variables / .env file."""

    APP_NAME: str = "DiscoSynth AI"
    DATABASE_URL: str = "sqlite:///./discosynth.db"
    GEMINI_API_KEY: str = ""
    LLM_PROVIDER: str = "mock"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"

    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    # Development / Testing toggle for isolated tests and mock evaluation
    ALLOW_MOCK_AUTH: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        """Return CORS origins as a list of strings."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def normalized_database_url(self) -> str:
        """Ensure postgres:// is translated to postgresql:// for SQLAlchemy."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()

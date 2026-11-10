"""Application configuration using pydantic-settings."""

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration sourced from environment variables / .env file."""

    APP_NAME: str = "DiscoSynth AI"
    DATABASE_URL: str = "sqlite:///./discosynth.db"
    GEMINI_API_KEY: str = ""
    LLM_PROVIDER: str = "mock"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"

    @property
    def cors_origin_list(self) -> list[str]:
        """Return CORS origins as a list of strings."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()

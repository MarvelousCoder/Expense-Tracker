
# INFO: Test config
# app/core/config.py

from pydantic_settings import BaseSettings
from typing import List, Optional
from pathlib import Path
from pydantic import field_validator

# This finds the .env file relative to THIS file's location
# config.py is at server/app/core/config.py
# So we go up 3 levels to reach server/, then look for .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
# BASE_DIR = server/

ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    # ================================
    # APP
    # ================================
    APP_NAME: str = "TrackWise"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    BACKEND_URL: str = "http://localhost:8000"
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000/api/v1"

    # ================================
    # DATABASE
    # ================================
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str

    # ================================
    # REDIS
    # ================================
    REDIS_URL: str = "redis://localhost:6379"

    # ================================
    # AUTH / JWT
    # ================================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ================================
    # AI Services
    # ================================
    GROQ_API_KEY: Optional[str] = None
    GOOGLE_AI_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_MODEL_LARGE: str = "llama-3.3-70b-versatile"
    GEMINI_MODEL: str = "gemini-3.5-flash"

    # ================================
    # CORS
    # ================================
    # ALLOWED_ORIGINS: List[str] = [
    #     "http://localhost:3000",
    #     "http://localhost:3001",
    # ]
    ALLOWED_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        """
        Accept ALLOWED_ORIGINS as either:
        - A JSON array string: '["http://localhost:3000"]'
        - A comma-separated string: 'http://localhost:3000,http://localhost:3001'
        - Already a list (from default)
        """
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return ["http://localhost:3000"]
            if v.startswith("["):
                import json
                return json.loads(v)
            # comma separated
            return [origin.strip() for origin in v.split(",")]
        return v

    model_config = {
        "env_file": str(ENV_FILE),
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }


settings = Settings()


# ================================
# TEMPORARY DEBUG — remove after confirming
# ================================
if __name__ == "__main__":
    print(f"ENV file path: {ENV_FILE}")
    print(f"ENV file exists: {ENV_FILE.exists()}")
    print(f"DB URL: {settings.DATABASE_URL}")
    print(f"User: {settings.POSTGRES_USER}")
    print(f"Database: {settings.POSTGRES_DB}")
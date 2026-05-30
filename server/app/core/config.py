# from pydantic_settings import BaseSettings
# from pydantic import AnyHttpUrl, validator
# from typing import List, Optional
# import secrets


# class Settings(BaseSettings):
#     # ================================
#     # APP
#     # ================================
#     APP_NAME: str = "Expense_Tracker"
#     APP_VERSION: str = "1.0.0"
#     ENVIRONMENT: str = "development"
#     DEBUG: bool = True
#     BACKEND_URL: str = "http://localhost:8000"
#     NEXT_PUBLIC_API_URL: str = "http://localhost:8000/api/v1"

#     # ================================
#     # DATABASE
#     # ================================
#     POSTGRES_USER: str
#     POSTGRES_PASSWORD: str
#     POSTGRES_DB: str
#     POSTGRES_HOST: str = "localhost"
#     POSTGRES_PORT: int = 5432
#     DATABASE_URL: str

#     # ================================
#     # REDIS
#     # ================================
#     REDIS_URL: str = "redis://localhost:6379"

#     # ================================
#     # AUTH / JWT
#     # ================================
#     SECRET_KEY: str
#     ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
#     REFRESH_TOKEN_EXPIRE_DAYS: int = 7

#     # ================================
#     # AI SERVICES (optional for now)
#     # ================================
#     OPENAI_API_KEY: Optional[str] = None
#     ANTHROPIC_API_KEY: Optional[str] = None
#     GOOGLE_VISION_API_KEY: Optional[str] = None

#     # ================================
#     # CORS
#     # ================================
#     ALLOWED_ORIGINS: List[str] = [
#         "http://localhost:3000",   # Next.js dev server
#         "http://localhost:3001",
#     ]

#     class Config:
#         env_file = "../.env",        # server/.env first, root .env as fallback
#         env_file_encoding = "utf-8",
#         case_sensitive = True,
#         extra = "ignore"


# # Single instance used across entire app
# settings = Settings()

# # TEMPORARY — remove after confirming
# if __name__ == "__main__":
#     print(f"DB URL: {settings.DATABASE_URL}")
#     print(f"User: {settings.POSTGRES_USER}")


# INFO: Test config
# app/core/config.py

from pydantic_settings import BaseSettings
from typing import List, Optional
from pathlib import Path

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
    APP_NAME: str = "Expense_Tracker"
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
    # AI SERVICES
    # ================================
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_VISION_API_KEY: Optional[str] = None

    # ================================
    # CORS
    # ================================
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

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
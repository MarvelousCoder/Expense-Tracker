import redis.asyncio as aioredis
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check():
    """Basic health check — is the API alive?"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


@router.get("/health/db", tags=["Health"])
async def database_health(db: AsyncSession = Depends(get_db)):
    """Check PostgreSQL connection."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "postgresql", "connected": True}
    except Exception as e:
        return {"status": "unhealthy", "database": "postgresql", "error": str(e)}


@router.get("/health/redis", tags=["Health"])
async def redis_health():
    """Check Redis connection."""
    try:
        r = aioredis.from_url(settings.REDIS_URL)
        await r.ping()
        await r.aclose()
        return {"status": "healthy", "cache": "redis", "connected": True}
    except Exception as e:
        return {"status": "unhealthy", "cache": "redis", "error": str(e)}

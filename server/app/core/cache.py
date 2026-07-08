# app/core/cache.py

import json
import logging
from typing import Any, Optional

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

# Redis connection pool
_redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
    return _redis_client


async def cache_get(key: str) -> Optional[Any]:
    """Get value from cache. Returns None if not found."""
    try:
        redis = await get_redis()
        value = await redis.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        logger.warning(f"Cache get failed for {key}: {e}")
        return None


async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    """
    Set value in cache with TTL in seconds.
    Default TTL = 5 minutes.
    Fails silently — cache is optional, never blocks the app.
    """
    try:
        redis = await get_redis()
        await redis.setex(key, ttl, json.dumps(value, default=str))
    except Exception as e:
        logger.warning(f"Cache set failed for {key}: {e}")


async def cache_delete(key: str) -> None:
    """Delete a specific cache key."""
    try:
        redis = await get_redis()
        await redis.delete(key)
    except Exception as e:
        logger.warning(f"Cache delete failed for {key}: {e}")


async def cache_delete_pattern(pattern: str) -> None:
    """
    Delete all keys matching a pattern.
    e.g. cache_delete_pattern("dashboard:user123:*")
    """
    try:
        redis = await get_redis()
        keys = await redis.keys(pattern)
        if keys:
            await redis.delete(*keys)
    except Exception as e:
        logger.warning(f"Cache pattern delete failed for {pattern}: {e}")


# ================================
# Cache key builders
# ================================
def dashboard_key(user_id: str) -> str:
    return f"dashboard:{user_id}"

def categories_key() -> str:
    return "categories:global"

def insights_key(user_id: str) -> str:
    return f"insights:{user_id}"

def analytics_key(user_id: str, year: int) -> str:
    return f"analytics:{user_id}:{year}"

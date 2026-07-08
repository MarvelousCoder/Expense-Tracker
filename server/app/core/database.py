import logging
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

logger = logging.getLogger(__name__)


# ================================
# Engine — the actual DB connection
# ================================
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,          # logs all SQL in development
    pool_size=10,                  # max persistent connections
    max_overflow=20,               # extra connections under load
    pool_pre_ping=True,            # verify connection before using it
)


# ================================
# Session Factory
# ================================
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,        # don't expire objects after commit
)


# ================================
# Base class for all models
# ================================
class Base(DeclarativeBase):
    pass


# ================================
# Dependency — used in every route
# ================================
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

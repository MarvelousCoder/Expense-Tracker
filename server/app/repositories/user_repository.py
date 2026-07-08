# app/repositories/user_repository.py

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserRepository:
    """
    Handles all database operations for User model.
    No business logic here — only DB queries.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    # ================================
    # Create
    # ================================
    async def create(self, user_data: UserCreate) -> User:
        user = User(
            email=user_data.email.lower(),
            username=user_data.username.lower(),
            full_name=user_data.full_name,
            hashed_password=hash_password(user_data.password),
            currency=user_data.currency,
            theme=user_data.theme,
        )
        self.db.add(user)
        try:
            await self.db.flush()   # write to DB but don't commit yet
            await self.db.refresh(user)
             # Explicitly access all fields to load them within session
            _ = user.id, user.email, user.created_at, user.updated_at
            _ = user.is_active, user.is_verified, user.currency, user.theme
            return user
        except IntegrityError:
            await self.db.rollback()
            raise

    # ================================
    # Read
    # ================================
    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(
                User.id == user_id,
                User.deleted_at.is_(None)    # exclude soft deleted
            )
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(
                User.email == email.lower(),
                User.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(
                User.username == username.lower(),
                User.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none()

    # ================================
    # Update
    # ================================
    async def update(self, user_id: UUID, update_data: UserUpdate) -> Optional[User]:
        values = update_data.model_dump(exclude_none=True)
        if not values:
            return await self.get_by_id(user_id)

        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(**values)
        )
        await self.db.flush()
        return await self.get_by_id(user_id)

    async def update_last_login(self, user_id: UUID) -> None:
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(last_login=datetime.now(timezone.utc))
        )
        await self.db.flush()
        # Re-fetch the user with all attributes loaded within session
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one()

    # ================================
    # Soft Delete
    # ================================
    async def soft_delete(self, user_id: UUID) -> None:
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(deleted_at=datetime.now(timezone.utc))
        )
        await self.db.flush()

    # ================================
    # Existence checks
    # ================================
    async def email_exists(self, email: str) -> bool:
        result = await self.db.execute(
            select(User.id).where(User.email == email.lower())
        )
        return result.scalar_one_or_none() is not None

    async def username_exists(self, username: str) -> bool:
        result = await self.db.execute(
            select(User.id).where(User.username == username.lower())
        )
        return result.scalar_one_or_none() is not None

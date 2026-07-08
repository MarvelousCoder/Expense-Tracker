# app/repositories/category_repository.py

from typing import Optional
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category


class CategoryRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, user_id: UUID) -> list[Category]:
        """Get global categories + user's custom categories."""
        result = await self.db.execute(
            select(Category).where(
                or_(
                    Category.user_id.is_(None),     # global defaults
                    Category.user_id == user_id      # user's custom ones
                ),
                Category.is_active is True
            ).order_by(Category.user_id.asc().nullsfirst(), Category.name.asc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, category_id: UUID) -> Optional[Category]:
        result = await self.db.execute(
            select(Category).where(Category.id == category_id)
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: UUID, name: str, icon: str, color: str) -> Category:
        category = Category(
            user_id=user_id,
            name=name,
            icon=icon,
            color=color,
        )
        self.db.add(category)
        await self.db.flush()
        await self.db.refresh(category)
        return category

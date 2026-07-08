# app/utils/seed.py

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category

logger = logging.getLogger(__name__)

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining",    "icon": "🍔", "color": "#F59E0B"},
    {"name": "Travel",           "icon": "✈️", "color": "#3B82F6"},
    {"name": "Shopping",         "icon": "🛍️", "color": "#EC4899"},
    {"name": "Bills & Utilities","icon": "📄", "color": "#6366F1"},
    {"name": "Entertainment",    "icon": "🎬", "color": "#8B5CF6"},
    {"name": "Health",           "icon": "🏥", "color": "#10B981"},
    {"name": "Education",        "icon": "📚", "color": "#F97316"},
    {"name": "Fuel",             "icon": "⛽", "color": "#EF4444"},
    {"name": "Groceries",        "icon": "🛒", "color": "#84CC16"},
    {"name": "Rent",             "icon": "🏠", "color": "#06B6D4"},
    {"name": "Salary",           "icon": "💰", "color": "#22C55E"},
    {"name": "Investment",       "icon": "📈", "color": "#A855F7"},
    {"name": "EMI",              "icon": "🏦", "color": "#F43F5E"},
    {"name": "Subscriptions",    "icon": "📱", "color": "#0EA5E9"},
    {"name": "Other",            "icon": "📦", "color": "#94A3B8"},
]


async def seed_default_categories(db: AsyncSession) -> None:
    """
    Insert default categories if they don't exist yet.
    These are global categories (user_id = NULL) available to all users.
    Called once at app startup.
    """
    result = await db.execute(
        select(Category).where(Category.user_id.is_(None)).limit(1)
    )
    existing = result.scalar_one_or_none()

    if existing:
        logger.info("Default categories already seeded — skipping")
        return

    categories = [
        Category(
            name=cat["name"],
            icon=cat["icon"],
            color=cat["color"],
            user_id=None,
        )
        for cat in DEFAULT_CATEGORIES
    ]

    db.add_all(categories)
    await db.commit()
    logger.info(f"Seeded {len(categories)} default categories")

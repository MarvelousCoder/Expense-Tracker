# app/models/category.py

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # NULL user_id = global/default category
    # Non-null user_id = user-created custom category
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)

    name = Column(String(50), nullable=False)
    icon = Column(String(10), nullable=False, default="📦")
    color = Column(String(7), nullable=False, default="#6366F1")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    transactions = relationship("Transaction", back_populates="category")

    def __repr__(self):
        return f"<Category {self.name}>"

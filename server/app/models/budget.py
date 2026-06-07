# app/models/budget.py

from sqlalchemy import (
    Column, String, Boolean, DateTime,
    ForeignKey, BigInteger, Integer,
    Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class BudgetPeriod(str, enum.Enum):
    MONTHLY = "monthly"
    WEEKLY = "weekly"
    YEARLY = "yearly"


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=True, index=True)

    name = Column(String(100), nullable=False)
    amount = Column(BigInteger, nullable=False)
    # Stored in paise/cents like transactions

    period = Column(SQLEnum(BudgetPeriod), default=BudgetPeriod.MONTHLY, nullable=False)
    month = Column(Integer, nullable=True)   # 1-12, null means all months
    year = Column(Integer, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    alert_threshold = Column(Integer, default=80, nullable=False)
    # Alert when spending reaches X% of budget (default 80%)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="budgets")
    category = relationship("Category")

    def __repr__(self):
        return f"<Budget {self.name}>"
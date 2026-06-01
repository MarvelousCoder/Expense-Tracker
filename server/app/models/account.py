# app/models/account.py

from sqlalchemy import (
    Column, String, Boolean, DateTime,
    Enum as SQLEnum, ForeignKey, BigInteger, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class AccountType(str, enum.Enum):
    SAVINGS = "savings"
    CURRENT = "current"
    WALLET = "wallet"
    CREDIT_CARD = "credit_card"
    CASH = "cash"
    INVESTMENT = "investment"


class Account(Base):
    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Owner
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Details
    name = Column(String(100), nullable=False)
    account_type = Column(SQLEnum(AccountType), default=AccountType.SAVINGS, nullable=False)
    balance = Column(BigInteger, default=0, nullable=False)
    # NOTE: balance stored in smallest unit (paise/cents)
    # ₹1000.50 is stored as 100050
    # This avoids floating point precision bugs in financial calculations

    currency = Column(String(3), default="INR", nullable=False)
    color = Column(String(7), default="#6366F1", nullable=False)
    icon = Column(String(50), default="wallet", nullable=False)
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Account {self.name}>"
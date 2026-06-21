# app/models/transaction.py

from sqlalchemy import (
    Column, String, Boolean, DateTime,
    Enum as SQLEnum, ForeignKey, BigInteger,
    Text, Date, Float
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid
import enum
from app.core.database import Base


class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    UPI = "upi"
    CARD = "card"
    NET_BANKING = "net_banking"
    BANK = "bank"
    WALLET = "wallet"
    OTHER = "other"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Owner
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Account this transaction belongs to
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)

    # Category
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)

    # Core fields
    amount = Column(BigInteger, nullable=False)
    # Stored in smallest unit — paise for INR, cents for USD

    transaction_type = Column(SQLEnum(TransactionType), nullable=False, index=True)
    payment_method = Column(SQLEnum(PaymentMethod), default=PaymentMethod.UPI, nullable=False)

    description = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    date = Column(Date, nullable=False, index=True)

    # Receipt
    receipt_url = Column(Text, nullable=True)

    # AI fields — Phase 5
    ai_category_suggestion = Column(String(100), nullable=True)
    ai_confidence = Column(String(10), nullable=True)

    # ── Phase 6 AI fields ─────────────────────────────────────────────────

    # Semantic embedding vector — 768 floats from Google text-embedding-004
    # NULL until the transaction is embedded (on creation or via backfill)
    # Stored as a native pgvector VECTOR(768) column in PostgreSQL
    # Used by semantic_search.py for cosine similarity queries
    embedding = Column(Vector(3072), nullable=True)

    # Anomaly score set by anomaly.py detection pipeline
    # NULL  = not yet analysed
    # 0.0   = completely normal spending
    # 0.5+  = mildly unusual
    # 1.0+  = significantly anomalous (more than 2 std deviations above mean)
    anomaly_score = Column(Float, nullable=True)
    

    # Flags
    is_recurring = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)

    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction {self.description} {self.amount}>"
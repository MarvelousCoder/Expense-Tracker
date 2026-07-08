# app/schemas/transaction.py

from datetime import date as date_type
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator

from app.models.transaction import PaymentMethod, TransactionType


class TransactionBase(BaseModel):
    amount: int
    # Amount in paise/cents — frontend sends 50000 for ₹500.00
    transaction_type: TransactionType
    payment_method: PaymentMethod
    description: str
    notes: Optional[str] = None
    date: date_type
    category_id: Optional[UUID] = None
    is_recurring: bool = False


class TransactionCreate(TransactionBase):
    account_id: UUID

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v


class TransactionUpdate(BaseModel):
    amount: Optional[int] = None
    transaction_type: Optional[TransactionType] = None
    payment_method: Optional[PaymentMethod] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[date_type] = None
    category_id: Optional[UUID] = None
    account_id: Optional[UUID] = None
    is_recurring: Optional[bool] = None


class TransactionResponse(TransactionBase):
    id: UUID
    user_id: UUID
    account_id: UUID
    amount_display: float = 0.0
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    account_name: Optional[str] = None
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class DashboardSummary(BaseModel):
    total_balance: float
    monthly_income: float
    monthly_expenses: float
    total_savings: float
    income_change_pct: float = 0.0
    expense_change_pct: float = 0.0

# ================================
# Bulk Import
# ================================
class BulkTransactionItem(BaseModel):
    account_id: UUID
    amount: int                    # in paise — already converted by frontend
    transaction_type: TransactionType
    payment_method: PaymentMethod = PaymentMethod.BANK
    description: str
    date: date_type
    notes: Optional[str] = None
    category_id: Optional[UUID] = None
    is_recurring: bool = False

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v


class BulkTransactionCreate(BaseModel):
    transactions: list[BulkTransactionItem]

    @field_validator("transactions")
    @classmethod
    def not_empty(cls, v: list) -> list:
        if not v:
            raise ValueError("At least one transaction is required")
        if len(v) > 500:
            raise ValueError("Cannot import more than 500 transactions at once")
        return v


class BulkTransactionResponse(BaseModel):
    imported: int
    failed: int
    total: int
    message: str

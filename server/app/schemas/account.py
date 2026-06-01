# app/schemas/account.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.account import AccountType


class AccountBase(BaseModel):
    name: str
    account_type: AccountType = AccountType.SAVINGS
    currency: str = "INR"
    color: str = "#6366F1"
    icon: str = "wallet"
    description: Optional[str] = None
    is_default: bool = False


class AccountCreate(AccountBase):
    balance: int = 0
    # Balance passed in paise/cents


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type: Optional[AccountType] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    is_default: Optional[bool] = None


class AccountResponse(AccountBase):
    id: UUID
    user_id: UUID
    balance: int
    balance_display: float = 0.0
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    def model_post_init(self, __context):
        # Convert paise to rupees for display
        object.__setattr__(self, "balance_display", self.balance / 100)
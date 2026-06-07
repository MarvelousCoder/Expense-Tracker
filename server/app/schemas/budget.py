# app/schemas/budget.py

from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.budget import BudgetPeriod


class BudgetCreate(BaseModel):
    name: str
    amount: int                          # in paise
    period: BudgetPeriod = BudgetPeriod.MONTHLY
    category_id: Optional[UUID] = None
    month: Optional[int] = None
    year: Optional[int] = None
    alert_threshold: int = 80

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Budget amount must be positive")
        return v

    @field_validator("alert_threshold")
    @classmethod
    def threshold_valid(cls, v: int) -> int:
        if not 1 <= v <= 100:
            raise ValueError("Alert threshold must be between 1 and 100")
        return v


class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[int] = None
    alert_threshold: Optional[int] = None
    is_active: Optional[bool] = None


class BudgetResponse(BaseModel):
    id: UUID
    user_id: UUID
    category_id: Optional[UUID] = None
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    name: str
    amount: int
    amount_display: float
    period: BudgetPeriod
    month: Optional[int] = None
    year: Optional[int] = None
    is_active: bool
    alert_threshold: int
    spent: float = 0.0          # how much spent this period
    spent_paise: int = 0        # raw paise
    remaining: float = 0.0
    percentage: float = 0.0     # 0-100
    is_exceeded: bool = False
    is_alert: bool = False      # True when >= alert_threshold%
    created_at: datetime

    model_config = {"from_attributes": True}
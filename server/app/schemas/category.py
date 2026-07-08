# app/schemas/category.py

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    icon: str = "📦"
    color: str = "#6366F1"
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: UUID
    user_id: Optional[UUID] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

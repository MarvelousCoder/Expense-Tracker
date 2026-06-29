# app/schemas/user.py

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.user import CurrencyEnum, ThemeEnum


# ================================
# Base — shared fields
# ================================
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    currency: CurrencyEnum = CurrencyEnum.INR
    theme: ThemeEnum = ThemeEnum.system


# ================================
# Register Request
# ================================
class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not v.isalnum():
            raise ValueError("Username must be alphanumeric only")
        return v.lower()


# ================================
# Update Request
# ================================
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    currency: Optional[CurrencyEnum] = None
    theme: Optional[ThemeEnum] = None
    avatar_url: Optional[str] = None


# ================================
# Response — what API returns
# Never expose hashed_password
# ================================
class UserResponse(UserBase):
    id: UUID
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ================================
# Login Request
# ================================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ================================
# Token Response
# ================================
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


# ================================
# Token Refresh Request
# ================================
class RefreshTokenRequest(BaseModel):
    refresh_token: str

# ================================
# Change Password Request
# ================================
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: any) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v
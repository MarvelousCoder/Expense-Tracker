# app/models/user.py

from sqlalchemy import (
    Column, String, Boolean, DateTime,
    Enum as SQLEnum, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class CurrencyEnum(str, enum.Enum):
    INR = "INR"
    USD = "USD"


class ThemeEnum(str, enum.Enum):
    light = "light"
    dark = "dark"
    system = "system"


class User(Base):
    __tablename__ = "users"

    # ================================
    # Primary Key — UUID not integer
    # ================================
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # ================================
    # Identity
    # ================================
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # ================================
    # Profile
    # ================================
    avatar_url = Column(Text, nullable=True)
    currency = Column(
        SQLEnum(CurrencyEnum),
        default=CurrencyEnum.INR,
        nullable=False
    )
    theme = Column(
        SQLEnum(ThemeEnum),
        default=ThemeEnum.system,
        nullable=False
    )

    # ================================
    # Account Status
    # ================================
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    # ================================
    # Timestamps — auto managed
    # ================================
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    last_login = Column(DateTime(timezone=True), nullable=True)

    # ================================
    # Soft delete — never hard delete users
    # ================================
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<User {self.email}>"
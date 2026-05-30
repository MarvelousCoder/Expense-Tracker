# app/api/v1/auth.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.user import UserCreate, LoginRequest, TokenResponse, RefreshTokenRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user and return tokens."""
    service = AuthService(db)
    return await service.register(user_data)


@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login and return tokens."""
    service = AuthService(db)
    return await service.login(login_data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(token_data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Get new access token using refresh token."""
    service = AuthService(db)
    return await service.refresh_token(token_data.refresh_token)
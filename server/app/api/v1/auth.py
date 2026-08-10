# app/api/v1/auth.py

from fastapi import APIRouter, Depends, Request, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.schemas.user import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


# @router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
# async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
#     """Register a new user and return tokens."""
#     service = AuthService(db)
#     return await service.register(user_data)

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")          # max 5 registrations per minute per IP
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.register(user_data)


# @router.post("/login", response_model=TokenResponse)
# async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
#     """Login and return tokens."""
#     service = AuthService(db)
#     return await service.login(login_data)

@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")         # max 10 login attempts per minute per IP
async def login(request: Request, login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(login_data)


# @router.post("/refresh", response_model=TokenResponse)
# async def refresh(token_data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
#     """Get new access token using refresh token."""
#     service = AuthService(db)
#     return await service.refresh_token(token_data.refresh_token)

@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("20/minute")
async def refresh(request: Request, token_data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.refresh_token(token_data.refresh_token)


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("3/minute")          # strict — this triggers an email send
async def forgot_password(
    request: Request,
    background_tasks: BackgroundTasks,
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.forgot_password(data.email, background_tasks)
    return MessageResponse(
        message="If an account with that email exists, a password reset link has been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.reset_password(data.token, data.new_password)
    return MessageResponse(
        message="Password reset successful. You can now log in with your new password."
    )
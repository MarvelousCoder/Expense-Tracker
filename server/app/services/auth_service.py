# # app/services/auth_service.py

# from sqlalchemy.ext.asyncio import AsyncSession
# from fastapi import HTTPException, status

# from app.repositories.user_repository import UserRepository
# from app.schemas.user import UserCreate, TokenResponse, UserResponse, LoginRequest
# from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token


# class AuthService:
#     """
#     Business logic for authentication.
#     Calls repository for DB operations.
#     Never touches DB directly.
#     """

#     def __init__(self, db: AsyncSession):
#         self.db = db
#         self.user_repo = UserRepository(db)

#     # ================================
#     # Register
#     # ================================
#     async def register(self, user_data: UserCreate) -> TokenResponse:
#         # Check duplicates
#         if await self.user_repo.email_exists(user_data.email):
#             raise HTTPException(
#                 status_code=status.HTTP_409_CONFLICT,
#                 detail="Email already registered"
#             )
#         if await self.user_repo.username_exists(user_data.username):
#             raise HTTPException(
#                 status_code=status.HTTP_409_CONFLICT,
#                 detail="Username already taken"
#             )

#         # Create user
#         user = await self.user_repo.create(user_data)

#         # Generate tokens
#         access_token = create_access_token(subject=str(user.id))
#         refresh_token = create_refresh_token(subject=str(user.id))

#         return TokenResponse(
#             access_token=access_token,
#             refresh_token=refresh_token,
#             user=UserResponse.model_validate(user)
#         )

#     # ================================
#     # Login
#     # ================================
#     async def login(self, login_data: LoginRequest) -> TokenResponse:
#         # Find user
#         user = await self.user_repo.get_by_email(login_data.email)

#         if not user or not verify_password(login_data.password, user.hashed_password):
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid email or password"
#             )

#         if not user.is_active:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Account is deactivated"
#             )

#         # Use returned user — all attributes loaded within session
#         refreshed_user = await self.user_repo.update_last_login(user.id)

#         access_token = create_access_token(subject=str(refreshed_user.id))
#         refresh_token = create_refresh_token(subject=str(refreshed_user.id))

#         return TokenResponse(
#             access_token=access_token,
#             refresh_token=refresh_token,
#             user=UserResponse.model_validate(refreshed_user)
#         )

#         # Update last login
#         await self.user_repo.update_last_login(user.id)

#         # Generate tokens
#         access_token = create_access_token(subject=str(user.id))
#         refresh_token = create_refresh_token(subject=str(user.id))

#         return TokenResponse(
#             access_token=access_token,
#             refresh_token=refresh_token,
#             user=UserResponse.model_validate(user)
#         )

#     # ================================
#     # Refresh Token
#     # ================================
#     async def refresh_token(self, refresh_token: str) -> TokenResponse:
#         try:
#             payload = decode_token(refresh_token)
#             if payload.get("type") != "refresh":
#                 raise ValueError("Not a refresh token")
#             user_id = payload.get("sub")
#         except ValueError:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid refresh token"
#             )

#         user = await self.user_repo.get_by_id(user_id)
#         if not user:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="User not found"
#             )

#         access_token = create_access_token(subject=str(user.id))
#         new_refresh_token = create_refresh_token(subject=str(user.id))

#         return TokenResponse(
#             access_token=access_token,
#             refresh_token=new_refresh_token,
#             user=UserResponse.model_validate(user)
#         )

# NOTE: 2nd change
# app/services/auth_service.py

import logging
import secrets
from uuid import UUID

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache_delete, cache_get, cache_set, password_reset_key
from app.core.config import settings
from app.core.email import send_password_reset_email
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.account import AccountType
from app.repositories.account_repository import AccountRepository
from app.repositories.user_repository import UserRepository
from app.schemas.account import AccountCreate
from app.schemas.user import LoginRequest, TokenResponse, UserCreate, UserResponse


class AuthService:
    """
    Business logic for authentication.
    Calls repository for DB operations.
    Never touches DB directly.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.account_repo = AccountRepository(db)

    # ================================
    # Register
    # ================================
    async def register(self, user_data: UserCreate) -> TokenResponse:
        # Check duplicates
        if await self.user_repo.email_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        if await self.user_repo.username_exists(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken"
            )

        # Create user
        user = await self.user_repo.create(user_data)

        # Auto-create a default account for the new user
        # This means new users can add transactions immediately
        # without having to manually create an account first
        try:
            default_account = AccountCreate(
                name="Main Account",
                account_type=AccountType.SAVINGS,  # use enum not string
                balance=0,
                currency=user_data.currency or "INR",
                color="#6366f1",
                icon="wallet",
                is_default=True,
            )
            await self.account_repo.create(user.id, default_account)
            await self.db.commit()
        except Exception as e:
            # Account creation failure must never block registration
            # User can create accounts manually if this fails
            logging.getLogger(__name__).error(f"Auto account creation failed: {e}")
            await self.db.rollback()

        # Generate tokens
        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user)
        )

    # ================================
    # Login
    # ================================
    async def login(self, login_data: LoginRequest) -> TokenResponse:
        # Find user
        user = await self.user_repo.get_by_email(login_data.email)

        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )

        # Update last login and get refreshed user object
        refreshed_user = await self.user_repo.update_last_login(user.id)

        # Generate tokens
        access_token = create_access_token(subject=str(refreshed_user.id))
        refresh_token = create_refresh_token(subject=str(refreshed_user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(refreshed_user)
        )

    # ================================
    # Refresh Token
    # ================================
    async def refresh_token(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise ValueError("Not a refresh token")
            user_id = payload.get("sub")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        access_token = create_access_token(subject=str(user.id))
        new_refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            user=UserResponse.model_validate(user)
        )

    # ================================
    # Forgot Password
    # ================================
    async def forgot_password(self, email: str, background_tasks: BackgroundTasks) -> None:
        user = await self.user_repo.get_by_email(email)

        # Always behave the same whether or not the user exists —
        # prevents attackers from discovering registered emails.
        if user:
            token = secrets.token_urlsafe(32)
            await cache_set(
                password_reset_key(token),
                str(user.id),
                ttl=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES * 60,
            )
            background_tasks.add_task(
                send_password_reset_email, user.email, user.full_name, token
            )

    # ================================
    # Reset Password
    # ================================
    async def reset_password(self, token: str, new_password: str) -> None:
        user_id_str = await cache_get(password_reset_key(token))
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset link. Please request a new one."
            )

        user = await self.user_repo.get_by_id(UUID(user_id_str))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        await self.user_repo.update_password(user.id, hash_password(new_password))
        await self.db.commit()
        await cache_delete(password_reset_key(token))

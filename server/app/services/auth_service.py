# app/services/auth_service.py

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, TokenResponse, UserResponse, LoginRequest
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token


class AuthService:
    """
    Business logic for authentication.
    Calls repository for DB operations.
    Never touches DB directly.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

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
        
        # Use returned user — all attributes loaded within session
        refreshed_user = await self.user_repo.update_last_login(user.id)

        access_token = create_access_token(subject=str(refreshed_user.id))
        refresh_token = create_refresh_token(subject=str(refreshed_user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(refreshed_user)
        )

        # Update last login
        await self.user_repo.update_last_login(user.id)

        # Generate tokens
        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user)
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
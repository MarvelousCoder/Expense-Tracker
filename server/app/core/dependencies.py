from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.security import decode_token
from app.repositories.user_repository import UserRepository
from app.models.user import User

# ================================
# Bearer token extractor
# Reads "Authorization: Bearer <token>" header
# ================================
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Extract and validate JWT token from Authorization header.
    Returns the current authenticated user.
    Raises 401 if token is missing, invalid, or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # No token provided
    if not credentials:
        raise credentials_exception

    token = credentials.credentials

    # Decode and validate token
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")

        if user_id is None:
            raise credentials_exception

        # Must be an access token, not refresh
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type. Use access token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except ValueError:
        raise credentials_exception

    # Fetch user from DB
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(UUID(user_id))

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Secondary dependency — alias for get_current_user.
    Use this on all protected routes.
    Kept separate so we can add extra checks later
    (email verified, subscription active, etc.)
    """
    return current_user
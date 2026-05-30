# app/api/v1/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/users", tags=["Users"])


# ================================
# GET /me — current user profile
# ================================
@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the currently authenticated user's profile.
    Requires valid access token in Authorization header.
    """
    return current_user


# ================================
# PATCH /me — update profile
# ================================
@router.patch("/me", response_model=UserResponse)
async def update_me(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user's profile.
    Only updates fields that are provided.
    """
    user_repo = UserRepository(db)
    updated_user = await user_repo.update(current_user.id, update_data)

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Refresh to load all attributes within session
    from sqlalchemy import select
    from app.models.user import User as UserModel
    result = await db.execute(
        select(UserModel).where(UserModel.id == updated_user.id)
    )
    refreshed = result.scalar_one()
    return refreshed


# ================================
# DELETE /me — soft delete account
# ================================
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Soft delete current user's account.
    Sets deleted_at timestamp. Data is preserved.
    """
    user_repo = UserRepository(db)
    await user_repo.soft_delete(current_user.id)
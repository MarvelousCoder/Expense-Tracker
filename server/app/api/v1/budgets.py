# app/api/v1/budgets.py

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.repositories.budget_repository import BudgetRepository
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetUpdate

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=list[BudgetResponse])
async def get_budgets(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = BudgetRepository(db)
    return await repo.get_all(current_user.id)


# @router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
# async def create_budget(
#     data: BudgetCreate,
#     current_user: User = Depends(get_current_active_user),
#     db: AsyncSession = Depends(get_db)
# ):
#     repo = BudgetRepository(db)
#     budget = await repo.create(current_user.id, data)
#     enriched = await repo._enrich(budget, current_user.id)
#     return enriched

@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    data: BudgetCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = BudgetRepository(db)

    # Guard against duplicate budgets — same category + period combo
    # would create two overlapping trackers showing confusing numbers
    is_duplicate = await repo.exists_duplicate(
        user_id=current_user.id,
        category_id=data.category_id,
        period=data.period,
    )
    if is_duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A {data.period.value} budget already exists for this category. "
                   f"Edit the existing budget instead of creating a duplicate."
        )

    budget = await repo.create(current_user.id, data)
    enriched = await repo._enrich(budget, current_user.id)
    return enriched


@router.patch("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: UUID,
    data: BudgetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = BudgetRepository(db)
    budget = await repo.update(budget_id, current_user.id, data)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return await repo._enrich(budget, current_user.id)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = BudgetRepository(db)
    await repo.delete(budget_id, current_user.id)

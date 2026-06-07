# app/repositories/budget_repository.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, and_, extract
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.models.budget import Budget
from app.models.transaction import Transaction, TransactionType
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse


class BudgetRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    # async def create(self, user_id: UUID, data: BudgetCreate) -> Budget:
    #     budget = Budget(
    #         user_id=user_id,
    #         **data.model_dump()
    #     )
    #     self.db.add(budget)
    #     await self.db.flush()
    #     await self.db.refresh(budget)
    #     return budget

    async def create(self, user_id: UUID, data: BudgetCreate) -> Budget:
        budget = Budget(
        user_id=user_id,
        **data.model_dump()
    )
        self.db.add(budget)
        await self.db.flush()

    # Re-fetch with category relationship loaded
        result = await self.db.execute(
        select(Budget)
        .options(selectinload(Budget.category))
        .where(Budget.id == budget.id)
    )
        return result.scalar_one()

    async def get_all(self, user_id: UUID) -> List[BudgetResponse]:
        result = await self.db.execute(
            select(Budget)
            .options(selectinload(Budget.category))
            .where(
                Budget.user_id == user_id,
                Budget.is_active == True
            )
            .order_by(Budget.created_at.desc())
        )
        budgets = list(result.scalars().all())
        return [await self._enrich(b, user_id) for b in budgets]

    async def get_by_id(self, budget_id: UUID, user_id: UUID) -> Optional[Budget]:
        result = await self.db.execute(
            select(Budget)
            .options(selectinload(Budget.category))
            .where(Budget.id == budget_id, Budget.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def update(self, budget_id: UUID, user_id: UUID, data: BudgetUpdate) -> Optional[Budget]:
        values = data.model_dump(exclude_none=True)
        if not values:
            return await self.get_by_id(budget_id, user_id)
        await self.db.execute(
            update(Budget)
            .where(Budget.id == budget_id, Budget.user_id == user_id)
            .values(**values)
        )
        await self.db.flush()
        return await self.get_by_id(budget_id, user_id)

    async def delete(self, budget_id: UUID, user_id: UUID) -> None:
        await self.db.execute(
            update(Budget)
            .where(Budget.id == budget_id, Budget.user_id == user_id)
            .values(is_active=False)
        )
        await self.db.flush()

    async def _enrich(self, budget: Budget, user_id: UUID) -> BudgetResponse:
        """Calculate spent amount for the budget's period."""
        now = datetime.now(timezone.utc)
        month = budget.month or now.month
        year = budget.year or now.year

        conditions = [
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE,
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        ]

        if budget.category_id:
            conditions.append(Transaction.category_id == budget.category_id)

        result = await self.db.execute(
            select(func.sum(Transaction.amount))
            .where(and_(*conditions))
        )
        # Correct — force to int
        spent_paise = int(result.scalar_one() or 0)
        spent = spent_paise / 100
        budget_amount = budget.amount / 100
        remaining = max(0, budget_amount - spent)
        percentage = min(100, round((spent / budget_amount) * 100, 1)) if budget_amount > 0 else 0

        return BudgetResponse(
            id=budget.id,
            user_id=budget.user_id,
            category_id=budget.category_id,
            category_name=budget.category.name if budget.category else None,
            category_icon=budget.category.icon if budget.category else None,
            category_color=budget.category.color if budget.category else None,
            name=budget.name,
            amount=budget.amount,
            amount_display=budget_amount,
            period=budget.period,
            month=budget.month,
            year=budget.year,
            is_active=budget.is_active,
            alert_threshold=budget.alert_threshold,
            spent=spent,
            spent_paise=spent_paise,
            remaining=remaining,
            percentage=percentage,
            is_exceeded=percentage >= 100,
            is_alert=percentage >= budget.alert_threshold,
            created_at=budget.created_at,
        )
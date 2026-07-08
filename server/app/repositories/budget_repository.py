# app/repositories/budget_repository.py

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.budget import Budget, BudgetPeriod
from app.models.transaction import Transaction, TransactionType
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetUpdate


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

    async def exists_duplicate(
        self,
        user_id: UUID,
        category_id: Optional[UUID],
        period: BudgetPeriod,
        exclude_budget_id: Optional[UUID] = None
    ) -> bool:
        """
        Check if an active budget already exists for the same user,
        category, and period combination. Prevents confusing overlapping
        budgets like two 'Monthly Food' budgets both tracking the same
        spending window.

        category_id=None means "all categories" — handled correctly via
        IS NULL comparison so two all-category budgets for the same
        period are also caught as duplicates.

        exclude_budget_id is used when editing — so a budget doesn't
        flag itself as a duplicate of itself.
        """
        conditions = [
            Budget.user_id == user_id,
            Budget.period == period,
            Budget.is_active is True,
        ]

        if category_id is None:
            conditions.append(Budget.category_id.is_(None))
        else:
            conditions.append(Budget.category_id == category_id)

        if exclude_budget_id:
            conditions.append(Budget.id != exclude_budget_id)

        result = await self.db.execute(
            select(Budget.id).where(and_(*conditions)).limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def get_all(self, user_id: UUID) -> list[BudgetResponse]:
        result = await self.db.execute(
            select(Budget)
            .options(selectinload(Budget.category))
            .where(
                Budget.user_id == user_id,
                Budget.is_active is True
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

    def _get_period_date_range(self, period: BudgetPeriod) -> tuple[datetime, datetime]:
        """
        Compute start and end DATE objects for the current period window.
        Returns date (not datetime) so comparisons work correctly against
        Transaction.date (a Date column) in both PostgreSQL and SQLite.
        Always uses NOW so old transactions are always included — no stale month/year.
        """
        now = datetime.now(timezone.utc)
        today = now.date()

        if period == BudgetPeriod.WEEKLY:
            # Monday to Sunday of the current ISO week
            # start = now - timedelta(days=now.weekday())
            # start = start.replace(hour=0, minute=0, second=0, microsecond=0)
            # end = start + timedelta(days=7)
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=7)

        # elif period == BudgetPeriod.YEARLY:
        #     start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        #     end = now.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)
        elif period == BudgetPeriod.YEARLY:
            start = today.replace(month=1, day=1)
            end = today.replace(month=12, day=31)

        # else:
        #     # MONTHLY — default
        #     start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        #     # First day of next month
        #     if now.month == 12:
        #         end = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        #     else:
        #         end = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)

        # return start, end

        else:
            # MONTHLY — default
            start = today.replace(day=1)
            # First day of next month
            if today.month == 12:
                end = today.replace(year=today.year + 1, month=1, day=1)
            else:
                end = today.replace(month=today.month + 1, day=1)

        return start, end

    async def _enrich(self, budget: Budget, user_id: UUID) -> BudgetResponse:
            """
        Calculate spent amount dynamically based on period.
        Always computes the current window from NOW — never trusts stored month/year.
        This means old transactions are always included correctly.

        Includes both EXPENSE and TRANSFER transaction types — transfers
        reduce your spendable balance just like expenses, consistent with
        how they are treated in the dashboard and analytics.
        """
            start, end = self._get_period_date_range(budget.period)

            conditions = [
                Transaction.user_id == user_id,
                Transaction.deleted_at.is_(None),
                Transaction.transaction_type.in_([
                TransactionType.EXPENSE,
                TransactionType.TRANSFER,
            ]),
                Transaction.date >= start,
                Transaction.date < end,
            ]

            if budget.category_id:
                conditions.append(Transaction.category_id == budget.category_id)

            result = await self.db.execute(
                select(func.sum(Transaction.amount))
                .where(and_(*conditions))
            )
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

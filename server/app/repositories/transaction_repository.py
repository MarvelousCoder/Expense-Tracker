# app/repositories/transaction_repository.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, and_, extract
from sqlalchemy.orm import selectinload
from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime, timezone, date
import calendar

from app.models.transaction import Transaction, TransactionType
from app.models.account import Account
from app.models.category import Category
from app.schemas.transaction import TransactionCreate, TransactionUpdate


class TransactionRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: UUID, data: TransactionCreate) -> Transaction:
        transaction = Transaction(
            user_id=user_id,
            **data.model_dump()
        )
        self.db.add(transaction)
        await self.db.flush()

        # Update account balance
        delta = data.amount if data.transaction_type == TransactionType.INCOME else -data.amount
        await self.db.execute(
            update(Account)
            .where(Account.id == data.account_id)
            .values(balance=Account.balance + delta)
        )
        await self.db.flush()

        result = await self.db.execute(
            select(Transaction)
            .options(
                selectinload(Transaction.category),
                selectinload(Transaction.account)
            )
            .where(Transaction.id == transaction.id)
        )
        return result.scalar_one()

    async def get_by_id(self, transaction_id: UUID, user_id: UUID) -> Optional[Transaction]:
        result = await self.db.execute(
            select(Transaction)
            .options(
                selectinload(Transaction.category),
                selectinload(Transaction.account)
            )
            .where(
                Transaction.id == transaction_id,
                Transaction.user_id == user_id,
                Transaction.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        user_id: UUID,
        page: int = 1,
        per_page: int = 20,
        transaction_type: Optional[TransactionType] = None,
        account_id: Optional[UUID] = None,
        category_id: Optional[UUID] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Transaction], int]:

        # Base query
        conditions = [
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None)
        ]

        if transaction_type:
            conditions.append(Transaction.transaction_type == transaction_type)
        if account_id:
            conditions.append(Transaction.account_id == account_id)
        if category_id:
            conditions.append(Transaction.category_id == category_id)
        if start_date:
            conditions.append(Transaction.date >= start_date)
        if end_date:
            conditions.append(Transaction.date <= end_date)
        if search:
            conditions.append(
                Transaction.description.ilike(f"%{search}%")
            )

        # Count total
        count_result = await self.db.execute(
            select(func.count(Transaction.id)).where(and_(*conditions))
        )
        total = count_result.scalar_one()

        # Fetch page
        result = await self.db.execute(
            select(Transaction)
            .options(
                selectinload(Transaction.category),
                selectinload(Transaction.account)
            )
            .where(and_(*conditions))
            .order_by(Transaction.date.desc(), Transaction.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        items = list(result.scalars().all())
        return items, total

    # async def update(
    #     self,
    #     transaction_id: UUID,
    #     user_id: UUID,
    #     data: TransactionUpdate
    # ) -> Optional[Transaction]:
    #     existing = await self.get_by_id(transaction_id, user_id)
    #     if not existing:
    #         return None

    #     values = data.model_dump(exclude_none=True)

    #     # Reverse old balance effect
    #     old_delta = existing.amount if existing.transaction_type == TransactionType.INCOME else -existing.amount
    #     await self.db.execute(
    #         update(Account)
    #         .where(Account.id == existing.account_id)
    #         .values(balance=Account.balance - old_delta)
    #     )

    #     await self.db.execute(
    #         update(Transaction)
    #         .where(Transaction.id == transaction_id)
    #         .values(**values)
    #     )
    #     await self.db.flush()

    #     updated = await self.get_by_id(transaction_id, user_id)

    #     # Apply new balance effect
    #     new_type = data.transaction_type or existing.transaction_type
    #     new_amount = data.amount or existing.amount
    #     new_account = data.account_id or existing.account_id
    #     new_delta = new_amount if new_type == TransactionType.INCOME else -new_amount
    #     await self.db.execute(
    #         update(Account)
    #         .where(Account.id == new_account)
    #         .values(balance=Account.balance + new_delta)
    #     )
    #     await self.db.flush()
    #     return updated

    # NOTE: 2nd change for update function
    async def update(
        self,
        transaction_id: UUID,
        user_id: UUID,
        data: TransactionUpdate
    ) -> Optional[Transaction]:
        existing = await self.get_by_id(transaction_id, user_id)
        if not existing:
            return None

        values = data.model_dump(exclude_none=True)

        # Determine the new state, falling back to existing values for anything not changed
        new_type = data.transaction_type or existing.transaction_type
        new_amount = data.amount if data.amount is not None else existing.amount
        new_account = data.account_id or existing.account_id

        old_delta = existing.amount if existing.transaction_type == TransactionType.INCOME else -existing.amount
        new_delta = new_amount if new_type == TransactionType.INCOME else -new_amount

        if new_account == existing.account_id:
            # Same account — apply only the NET change in one atomic SQL statement.
            # balance = balance - old_delta + new_delta, computed entirely in SQL
            # using the column's live value, so there's no read-modify-write gap
            # for a concurrent request to land in.
            net_delta = new_delta - old_delta
            await self.db.execute(
                update(Account)
                .where(Account.id == new_account)
                .values(balance=Account.balance + net_delta)
            )
        else:
            # Account changed — reverse the effect on the old account and apply
            # the new effect on the new account. Each is still a single atomic
            # SQL UPDATE using the column's current value, just on two different rows,
            # so there's no race window within either account's balance.
            await self.db.execute(
                update(Account)
                .where(Account.id == existing.account_id)
                .values(balance=Account.balance - old_delta)
            )
            await self.db.execute(
                update(Account)
                .where(Account.id == new_account)
                .values(balance=Account.balance + new_delta)
            )

        await self.db.execute(
            update(Transaction)
            .where(Transaction.id == transaction_id)
            .values(**values)
        )
        await self.db.flush()

        return await self.get_by_id(transaction_id, user_id)

    async def soft_delete(self, transaction_id: UUID, user_id: UUID) -> bool:
        existing = await self.get_by_id(transaction_id, user_id)
        if not existing:
            return False

        # Reverse balance effect
        delta = existing.amount if existing.transaction_type == TransactionType.INCOME else -existing.amount
        await self.db.execute(
            update(Account)
            .where(Account.id == existing.account_id)
            .values(balance=Account.balance - delta)
        )

        await self.db.execute(
            update(Transaction)
            .where(Transaction.id == transaction_id)
            .values(deleted_at=datetime.now(timezone.utc))
        )
        await self.db.flush()
        return True

    async def get_dashboard_summary(self, user_id: UUID) -> dict:
        now = datetime.now(timezone.utc)
        current_month = now.month
        current_year = now.year
        last_month = current_month - 1 if current_month > 1 else 12
        last_month_year = current_year if current_month > 1 else current_year - 1

        async def get_month_totals(month: int, year: int):
            result = await self.db.execute(
                select(
                    Transaction.transaction_type,
                    func.sum(Transaction.amount).label("total")
                )
                .where(
                    Transaction.user_id == user_id,
                    Transaction.deleted_at.is_(None),
                    extract("month", Transaction.date) == month,
                    extract("year", Transaction.date) == year,
                )
                .group_by(Transaction.transaction_type)
            )
            rows = result.all()
            totals = {row.transaction_type: row.total or 0 for row in rows}
            return totals

        current = await get_month_totals(current_month, current_year)
        previous = await get_month_totals(last_month, last_month_year)

        # Get total balance across all accounts
        balance_result = await self.db.execute(
            select(func.sum(Account.balance))
            .where(
                Account.user_id == user_id,
                Account.deleted_at.is_(None),
                Account.is_active == True
            )
        )
        total_balance = balance_result.scalar_one() or 0

        curr_income = current.get(TransactionType.INCOME, 0)
         # Transfer counts as expense — it reduces spendable balance just like a regular expense
        curr_expense = current.get(TransactionType.EXPENSE, 0) + current.get(TransactionType.TRANSFER, 0)
        prev_income = previous.get(TransactionType.INCOME, 0)
        prev_expense = previous.get(TransactionType.EXPENSE, 0) + previous.get(TransactionType.TRANSFER, 0)

        def pct_change(current, previous):
            if previous == 0:
                return 0.0
            return round(((current - previous) / previous) * 100, 1)

        return {
            "total_balance": total_balance / 100,
            "monthly_income": curr_income / 100,
            "monthly_expenses": curr_expense / 100,
            # Fix: savings = what you earned minus what you spent this month
            "total_savings": (curr_income - curr_expense) / 100,
            "income_change_pct": pct_change(curr_income, prev_income),
            "expense_change_pct": pct_change(curr_expense, prev_expense),
        }
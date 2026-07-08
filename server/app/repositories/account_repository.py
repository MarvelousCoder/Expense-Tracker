# app/repositories/account_repository.py

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate


class AccountRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: UUID, data: AccountCreate) -> Account:
        # If this is set as default, unset others first
        if data.is_default:
            await self._unset_default(user_id)

        account = Account(
            user_id=user_id,
            **data.model_dump()
        )
        self.db.add(account)
        await self.db.flush()
        await self.db.refresh(account)
        return account

    async def get_by_id(self, account_id: UUID, user_id: UUID) -> Optional[Account]:
        result = await self.db.execute(
            select(Account).where(
                Account.id == account_id,
                Account.user_id == user_id,
                Account.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none()

    async def get_all(self, user_id: UUID) -> list[Account]:
        result = await self.db.execute(
            select(Account).where(
                Account.user_id == user_id,
                Account.deleted_at.is_(None),
                Account.is_active is True
            ).order_by(Account.is_default.desc(), Account.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_default(self, user_id: UUID) -> Optional[Account]:
        result = await self.db.execute(
            select(Account).where(
                Account.user_id == user_id,
                Account.is_default is True,
                Account.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none()

    async def update(self, account_id: UUID, user_id: UUID, data: AccountUpdate) -> Optional[Account]:
        values = data.model_dump(exclude_none=True)
        if not values:
            return await self.get_by_id(account_id, user_id)

        if values.get("is_default"):
            await self._unset_default(user_id)

        await self.db.execute(
            update(Account)
            .where(Account.id == account_id, Account.user_id == user_id)
            .values(**values)
        )
        await self.db.flush()
        return await self.get_by_id(account_id, user_id)

    async def update_balance(self, account_id: UUID, amount_delta: int) -> None:
        """Add or subtract from balance. Pass negative for deductions."""
        account = await self.db.get(Account, account_id)
        if account:
            account.balance += amount_delta
            await self.db.flush()

    async def soft_delete(self, account_id: UUID, user_id: UUID) -> None:
        await self.db.execute(
            update(Account)
            .where(Account.id == account_id, Account.user_id == user_id)
            .values(deleted_at=datetime.now(timezone.utc))
        )
        await self.db.flush()

    async def _unset_default(self, user_id: UUID) -> None:
        await self.db.execute(
            update(Account)
            .where(Account.user_id == user_id, Account.is_default is True)
            .values(is_default=False)
        )

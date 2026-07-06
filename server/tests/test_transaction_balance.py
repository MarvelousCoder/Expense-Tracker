# tests/test_transaction_balance.py
#
# Tests for transaction creation and the atomic balance update logic.
# Protects against the non-atomic balance reversal bug we fixed —
# editing a transaction's amount/type must correctly recalculate
# the account balance using a single net-delta SQL update.

import pytest
from datetime import date

from app.models.transaction import TransactionType
from app.models.account import Account
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.repositories.transaction_repository import TransactionRepository
from sqlalchemy import select


@pytest.mark.asyncio
async def test_create_expense_decreases_balance(db_session, test_user, test_account, test_category):
    repo = TransactionRepository(db_session)
    data = TransactionCreate(
        account_id=test_account.id,
        amount=50000,  # ₹500
        transaction_type=TransactionType.EXPENSE,
        payment_method="upi",
        description="Groceries",
        date=date.today(),
        category_id=test_category.id,
    )
    await repo.create(test_user.id, data)

    result = await db_session.execute(select(Account).where(Account.id == test_account.id))
    account = result.scalar_one()
    assert account.balance == -50000


@pytest.mark.asyncio
async def test_create_income_increases_balance(db_session, test_user, test_account):
    repo = TransactionRepository(db_session)
    data = TransactionCreate(
        account_id=test_account.id,
        amount=1200000,  # ₹12000
        transaction_type=TransactionType.INCOME,
        payment_method="bank",
        description="Salary",
        date=date.today(),
    )
    await repo.create(test_user.id, data)

    result = await db_session.execute(select(Account).where(Account.id == test_account.id))
    account = result.scalar_one()
    assert account.balance == 1200000


@pytest.mark.asyncio
async def test_update_amount_recalculates_balance_correctly(db_session, test_user, test_account):
    """
    The core regression test for the atomic balance fix.
    Create an expense of ₹500, then edit it to ₹800 —
    the account balance should reflect ONLY the new amount,
    not double-count or leave a stale partial reversal.
    """
    repo = TransactionRepository(db_session)
    create_data = TransactionCreate(
        account_id=test_account.id,
        amount=50000,  # ₹500
        transaction_type=TransactionType.EXPENSE,
        payment_method="upi",
        description="Initial amount",
        date=date.today(),
    )
    transaction = await repo.create(test_user.id, create_data)

    # Balance should be -₹500 after creation
    result = await db_session.execute(select(Account).where(Account.id == test_account.id))
    account = result.scalar_one()
    assert account.balance == -50000

    # Now edit the amount to ₹800
    update_data = TransactionUpdate(amount=80000)
    await repo.update(transaction.id, test_user.id, update_data)

    result = await db_session.execute(select(Account).where(Account.id == test_account.id))
    account = result.scalar_one()
    # Balance must reflect the NEW amount exactly — not -500-800=-1300,
    # and not some partially-reversed intermediate value
    assert account.balance == -80000


@pytest.mark.asyncio
async def test_update_transaction_type_recalculates_balance(db_session, test_user, test_account):
    """Changing a transaction from expense to income should flip the balance sign correctly."""
    repo = TransactionRepository(db_session)
    create_data = TransactionCreate(
        account_id=test_account.id,
        amount=50000,
        transaction_type=TransactionType.EXPENSE,
        payment_method="upi",
        description="Will become income",
        date=date.today(),
    )
    transaction = await repo.create(test_user.id, create_data)

    result = await db_session.execute(select(Account).where(Account.id == test_account.id))
    assert result.scalar_one().balance == -50000

    # Change type from expense to income — same amount
    update_data = TransactionUpdate(transaction_type=TransactionType.INCOME)
    await repo.update(transaction.id, test_user.id, update_data)

    result = await db_session.execute(select(Account).where(Account.id == test_account.id))
    account = result.scalar_one()
    # Was -500 (expense), now should be +500 (income) — a swing of 1000
    assert account.balance == 50000


@pytest.mark.asyncio
async def test_delete_transaction_reverses_balance(db_session, test_user, test_account):
    repo = TransactionRepository(db_session)
    create_data = TransactionCreate(
        account_id=test_account.id,
        amount=30000,
        transaction_type=TransactionType.EXPENSE,
        payment_method="cash",
        description="To be deleted",
        date=date.today(),
    )
    transaction = await repo.create(test_user.id, create_data)

    result = await db_session.execute(select(Account).where(Account.id == test_account.id))
    assert result.scalar_one().balance == -30000

    await repo.soft_delete(transaction.id, test_user.id)

    result = await db_session.execute(select(Account).where(Account.id == test_account.id))
    account = result.scalar_one()
    # Balance should return to zero after deletion
    assert account.balance == 0


@pytest.mark.asyncio
async def test_multiple_transactions_accumulate_correctly(db_session, test_user, test_account):
    """Sanity check — several transactions in sequence should sum correctly."""
    repo = TransactionRepository(db_session)

    await repo.create(test_user.id, TransactionCreate(
        account_id=test_account.id, amount=1000000,
        transaction_type=TransactionType.INCOME, payment_method="bank",
        description="Salary", date=date.today(),
    ))
    await repo.create(test_user.id, TransactionCreate(
        account_id=test_account.id, amount=200000,
        transaction_type=TransactionType.EXPENSE, payment_method="upi",
        description="Rent", date=date.today(),
    ))
    await repo.create(test_user.id, TransactionCreate(
        account_id=test_account.id, amount=50000,
        transaction_type=TransactionType.EXPENSE, payment_method="card",
        description="Groceries", date=date.today(),
    ))

    result = await db_session.execute(select(Account).where(Account.id == test_account.id))
    account = result.scalar_one()
    # 1,000,000 - 200,000 - 50,000 = 750,000
    assert account.balance == 750000
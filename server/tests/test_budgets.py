# tests/test_budgets.py
#
# Tests for budget period calculation and spending aggregation.
# These protect against the exact bug we found in this project:
# budgets that only counted transactions from the month the budget
# was created, instead of dynamically computing the current period
# window every time.

from datetime import datetime, timedelta, timezone

import pytest

from app.models.budget import Budget, BudgetPeriod
from app.models.transaction import TransactionType
from app.repositories.budget_repository import BudgetRepository
from tests.conftest import make_transaction


@pytest.mark.asyncio
async def test_monthly_budget_includes_transactions_from_before_budget_created(
    db_session, test_user, test_account, test_category
):
    """
    Regression test for the original bug: a budget created today should
    still count transactions made earlier in the SAME calendar month,
    even though those transactions existed before the budget did.
    """
    today = datetime.now(timezone.utc).date()
    earlier_this_month = today.replace(day=1)  # 1st of current month

    # Transaction created BEFORE the budget existed
    await make_transaction(
        db_session, test_user, test_account,
        amount=50000,  # ₹500 in paise
        transaction_type=TransactionType.EXPENSE,
        txn_date=earlier_this_month,
        category=test_category,
    )

    # Now create the budget (simulating: budget created AFTER the transaction)
    budget = Budget(
        user_id=test_user.id,
        category_id=test_category.id,
        name="Monthly Food",
        amount=200000,  # ₹2000 budget
        period=BudgetPeriod.MONTHLY,
        alert_threshold=80,
    )
    db_session.add(budget)
    await db_session.flush()

    repo = BudgetRepository(db_session)
    enriched = await repo._enrich(budget, test_user.id)

    # The pre-existing transaction MUST be counted
    assert enriched.spent == 500.0
    assert enriched.remaining == 1500.0


@pytest.mark.asyncio
async def test_monthly_budget_excludes_transactions_from_other_months(
    db_session, test_user, test_account, test_category
):
    """A monthly budget should NOT count transactions from a different month."""
    today = datetime.now(timezone.utc).date()
    last_month = (today.replace(day=1) - timedelta(days=1)).replace(day=1)

    await make_transaction(
        db_session, test_user, test_account,
        amount=30000,
        transaction_type=TransactionType.EXPENSE,
        txn_date=last_month,
        category=test_category,
    )

    budget = Budget(
        user_id=test_user.id,
        category_id=test_category.id,
        name="Monthly Food",
        amount=200000,
        period=BudgetPeriod.MONTHLY,
        alert_threshold=80,
    )
    db_session.add(budget)
    await db_session.flush()

    repo = BudgetRepository(db_session)
    enriched = await repo._enrich(budget, test_user.id)

    assert enriched.spent == 0.0


@pytest.mark.asyncio
async def test_budget_percentage_and_alert_threshold(
    db_session, test_user, test_account, test_category
):
    """Verify percentage calculation and is_alert flag trigger correctly."""
    today = datetime.now(timezone.utc).date()

    await make_transaction(
        db_session, test_user, test_account,
        amount=170000,  # ₹1700 spent
        transaction_type=TransactionType.EXPENSE,
        txn_date=today,
        category=test_category,
    )

    budget = Budget(
        user_id=test_user.id,
        category_id=test_category.id,
        name="Monthly Food",
        amount=200000,  # ₹2000 budget
        period=BudgetPeriod.MONTHLY,
        alert_threshold=80,  # alert at 80%
    )
    db_session.add(budget)
    await db_session.flush()

    repo = BudgetRepository(db_session)
    enriched = await repo._enrich(budget, test_user.id)

    assert enriched.percentage == 85.0  # 1700/2000 = 85%
    assert enriched.is_alert is True    # 85% >= 80% threshold
    assert enriched.is_exceeded is False  # not yet over 100%


@pytest.mark.asyncio
async def test_budget_exceeded_flag(db_session, test_user, test_account, test_category):
    """Spending over 100% of budget should set is_exceeded."""
    today = datetime.now(timezone.utc).date()

    await make_transaction(
        db_session, test_user, test_account,
        amount=250000,  # ₹2500 spent — over budget
        transaction_type=TransactionType.EXPENSE,
        txn_date=today,
        category=test_category,
    )

    budget = Budget(
        user_id=test_user.id,
        category_id=test_category.id,
        name="Monthly Food",
        amount=200000,  # ₹2000 budget
        period=BudgetPeriod.MONTHLY,
        alert_threshold=80,
    )
    db_session.add(budget)
    await db_session.flush()

    repo = BudgetRepository(db_session)
    enriched = await repo._enrich(budget, test_user.id)

    assert enriched.is_exceeded is True
    assert enriched.percentage == 100  # capped at 100, never shows e.g. 125%
    assert enriched.remaining == 0     # never goes negative


@pytest.mark.asyncio
async def test_transfer_counts_toward_budget_spending(
    db_session, test_user, test_account, test_category
):
    """
    Transfer transactions should count toward budget spending,
    consistent with how transfers are treated as expenses everywhere
    else in the app (dashboard, analytics).
    """
    today = datetime.now(timezone.utc).date()

    await make_transaction(
        db_session, test_user, test_account,
        amount=50000,
        transaction_type=TransactionType.TRANSFER,
        txn_date=today,
        category=test_category,
    )

    budget = Budget(
        user_id=test_user.id,
        category_id=test_category.id,
        name="Monthly Food",
        amount=200000,
        period=BudgetPeriod.MONTHLY,
        alert_threshold=80,
    )
    db_session.add(budget)
    await db_session.flush()

    repo = BudgetRepository(db_session)
    enriched = await repo._enrich(budget, test_user.id)

    # NOTE: this test documents CURRENT behavior. If _enrich only filters
    # on TransactionType.EXPENSE (as it did historically), this will FAIL
    # and is a signal to align budget spending with the dashboard/analytics
    # transfer-as-expense treatment.
    assert enriched.spent == 500.0

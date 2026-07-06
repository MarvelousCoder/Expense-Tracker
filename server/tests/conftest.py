# tests/conftest.py
#
# Shared pytest fixtures for the entire test suite.
# Uses an in-memory SQLite database instead of PostgreSQL so tests:
#   - run fast (no Docker, no network)
#   - never touch real data
#   - are fully isolated — every test gets a fresh empty database
#
# Note: pgvector and Postgres-specific enum casing aren't available
# in SQLite, so AI/embedding columns are simply left unset in test
# fixtures (they're nullable) and embedding-dependent features are
# out of scope for this test suite — that logic depends on a live
# Groq/Gemini API call anyway and isn't meaningfully unit-testable.

import pytest
import pytest_asyncio
from datetime import date
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.models.user import User
from app.models.account import Account, AccountType
from app.models.category import Category
from app.models.transaction import Transaction, TransactionType, PaymentMethod
from app.models.budget import Budget, BudgetPeriod
from app.core.security import hash_password

from sqlalchemy.ext.compiler import compiles
from pgvector.sqlalchemy import Vector

# pgvector's VECTOR type has no SQLite DDL compiler. Since embeddings are
# never exercised in this test suite (see note above), just tell SQLite
# to treat the column as an opaque BLOB when creating tables in tests.
@compiles(Vector, "sqlite")
def _compile_vector_sqlite(type_, compiler, **kw):
    return "BLOB"


# ================================
# Test database engine — in-memory SQLite
# StaticPool keeps the same in-memory DB alive across the test's
# multiple connections (default SQLite behavior closes it otherwise)
# ================================
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        yield session

    await engine.dispose()


# ================================
# Test user fixture
# ================================
@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    user = User(
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password=hash_password("TestPass123"),
        currency="INR",
        theme="system",
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


# ================================
# Test account fixture — starts with zero balance
# ================================
@pytest_asyncio.fixture
async def test_account(db_session: AsyncSession, test_user: User) -> Account:
    account = Account(
        user_id=test_user.id,
        name="Main Account",
        account_type=AccountType.SAVINGS,
        balance=0,
        currency="INR",
    )
    db_session.add(account)
    await db_session.flush()
    return account


# ================================
# Test category fixture
# ================================
@pytest_asyncio.fixture
async def test_category(db_session: AsyncSession) -> Category:
    category = Category(
        name="Food & Dining",
        icon="🍔",
        color="#F59E0B",
        user_id=None,
    )
    db_session.add(category)
    await db_session.flush()
    return category


# ================================
# Helper — create a transaction directly (bypassing the repository)
# Used to set up test data without testing the create logic itself
# ================================
async def make_transaction(
    db_session: AsyncSession,
    user: User,
    account: Account,
    amount: int,
    transaction_type: TransactionType,
    txn_date: date,
    category=None,
    description: str = "Test transaction",
) -> Transaction:
    transaction = Transaction(
        user_id=user.id,
        account_id=account.id,
        category_id=category.id if category else None,
        amount=amount,
        transaction_type=transaction_type,
        payment_method=PaymentMethod.UPI,
        description=description,
        date=txn_date,
    )
    db_session.add(transaction)
    await db_session.flush()
    return transaction
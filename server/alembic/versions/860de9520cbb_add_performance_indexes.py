"""add performance indexes

Revision ID: 860de9520cbb
Revises: 67b1c8bda60b
Create Date: 2026-06-11 12:27:54.429776

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '860de9520cbb'
down_revision: Union[str, None] = '67b1c8bda60b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Composite index for common dashboard query pattern
    op.create_index(
        "ix_transactions_user_date",
        "transactions",
        ["user_id", "date"],
        unique=False
    )
    # Composite index for category + user filtering
    op.create_index(
        "ix_transactions_user_type_date",
        "transactions",
        ["user_id", "transaction_type", "date"],
        unique=False
    )
    # Index for budget queries
    op.create_index(
        "ix_budgets_user_active",
        "budgets",
        ["user_id", "is_active"],
        unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_transactions_user_date", table_name="transactions")
    op.drop_index("ix_transactions_user_type_date", table_name="transactions")
    op.drop_index("ix_budgets_user_active", table_name="budgets")
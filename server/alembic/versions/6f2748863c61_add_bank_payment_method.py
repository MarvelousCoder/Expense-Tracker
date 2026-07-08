"""add_bank_payment_method

Revision ID: 6f2748863c61
Revises: 27400ef47706
Create Date: 2026-06-18 12:12:45.087817

"""
from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '6f2748863c61'
down_revision: Union[str, None] = '27400ef47706'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE paymentmethod ADD VALUE IF NOT EXISTS 'bank'")

def downgrade() -> None:
    pass  # PostgreSQL does not support removing enum values

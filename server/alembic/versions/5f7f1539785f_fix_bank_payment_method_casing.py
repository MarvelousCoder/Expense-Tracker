"""fix_bank_payment_method_casing

Revision ID: 5f7f1539785f
Revises: 6f2748863c61
Create Date: 2026-06-21 17:49:50.000737

"""
from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '5f7f1539785f'
down_revision: Union[str, None] = '6f2748863c61'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # The original migration (6f2748863c61) added lowercase 'bank', but
    # SQLEnum(PaymentMethod) sends the Python enum MEMBER NAME to Postgres
    # (i.e. "BANK", not "bank") for this column. This left a casing
    # mismatch — the column needs uppercase 'BANK' to actually work.
    # Lowercase 'bank' is left in place since Postgres can't drop enum
    # values; it's just an unused leftover, harmless.
    op.execute("ALTER TYPE paymentmethod ADD VALUE IF NOT EXISTS 'BANK'")


def downgrade() -> None:
    pass  # PostgreSQL does not support removing enum values

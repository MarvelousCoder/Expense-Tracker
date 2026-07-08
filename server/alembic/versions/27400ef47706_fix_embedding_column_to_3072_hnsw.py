"""fix embedding column to 3072 hnsw

Revision ID: 27400ef47706
Revises: 7d837a603f27
Create Date: 2026-06-13 14:56:40.170098

"""
from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '27400ef47706'
down_revision: Union[str, None] = '7d837a603f27'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop any existing embedding index
    op.execute("DROP INDEX IF EXISTS ix_transactions_embedding")

    # Fix column to correct dimension for gemini-embedding-001
    op.execute(
        "ALTER TABLE transactions "
        "ALTER COLUMN embedding TYPE vector(3072)"
    )
    # No index created — pgvector in this container does not support
    # hnsw or ivfflat beyond 2000 dimensions.
    # Exact cosine search (sequential scan) works correctly and is
    # fast enough for personal finance scale (hundreds of transactions).


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_transactions_embedding")
    op.execute(
        "ALTER TABLE transactions "
        "ALTER COLUMN embedding TYPE vector(1536)"
    )

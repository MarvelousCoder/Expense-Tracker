"""fix embedding dimension to 3072

Revision ID: 7d837a603f27
Revises: a4aa83dde7a4
Create Date: 2026-06-12 20:58:02.869057

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d837a603f27'
down_revision: Union[str, None] = 'a4aa83dde7a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the old ivfflat index (built for vector(768))
    op.execute("DROP INDEX IF EXISTS ix_transactions_embedding")

    # Change column from vector(768) to vector(1536)
    # HNSW has a hard limit of 2000 dimensions — 1536 works perfectly
    op.execute(
        "ALTER TABLE transactions "
        "ALTER COLUMN embedding TYPE vector(1536)"
    )

    # Recreate index using HNSW 
    # m=16 = number of connections per layer (default, good for most cases)
    # ef_construction=64 = build-time accuracy/speed tradeoff (default)
    op.execute(
        "CREATE INDEX ix_transactions_embedding "
        "ON transactions USING hnsw (embedding vector_cosine_ops) "
        "WITH (m = 16, ef_construction = 64)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_transactions_embedding")
    op.execute(
        "ALTER TABLE transactions "
        "ALTER COLUMN embedding TYPE vector(768)"
    )
    op.execute(
        "CREATE INDEX ix_transactions_embedding "
        "ON transactions USING ivfflat (embedding vector_cosine_ops) "
        "WITH (lists = 100)"
    )
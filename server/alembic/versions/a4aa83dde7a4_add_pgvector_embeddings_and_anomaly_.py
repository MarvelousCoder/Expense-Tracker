"""add pgvector embeddings and anomaly score

Revision ID: a4aa83dde7a4
Revises: 860de9520cbb
Create Date: 2026-06-12 16:22:15.522946

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a4aa83dde7a4'
down_revision: Union[str, None] = '860de9520cbb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Enable pgvector PostgreSQL extension ───────────────────────────
    # IF NOT EXISTS makes this safe to run multiple times
    # Must be done before any VECTOR column can be created
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # ── 2. Add embedding column ───────────────────────────────────────────
    # VECTOR(768) matches Google text-embedding-004 output dimensions exactly
    # nullable=True because existing transactions have no embedding yet
    # They get populated lazily via /ai/search/backfill endpoint
    op.execute(
        "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "
        "embedding vector(768)"
    )

    # ── 3. Add anomaly score column ───────────────────────────────────────
    # NULL  = transaction not yet analysed
    # 0.0   = completely normal
    # 1.0+  = significantly anomalous (Z-score / threshold)
    op.add_column(
        "transactions",
        sa.Column(
            "anomaly_score",
            sa.Float,
            nullable=True,
        )
    )

    # ── 4. Create ivfflat index for fast vector similarity search ─────────
    # ivfflat = inverted file index, splits vectors into `lists` clusters
    # vector_cosine_ops = use cosine distance metric (best for text embeddings)
    # lists=100 is the recommended value for tables up to ~1M rows
    # Without this index, similarity search does a full table scan
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_transactions_embedding "
        "ON transactions USING ivfflat (embedding vector_cosine_ops) "
        "WITH (lists = 100)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_transactions_embedding")
    op.execute("ALTER TABLE transactions DROP COLUMN IF EXISTS embedding")
    op.drop_column("transactions", "anomaly_score")
    # Intentionally NOT dropping the vector extension on downgrade
    # because other tables might depend on it
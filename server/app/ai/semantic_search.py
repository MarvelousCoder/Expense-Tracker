# app/ai/semantic_search.py
#
# Responsible for:
# Searching transactions by MEANING rather than exact keyword match.
#
# How it works:
# 1. User types a query: "coffee shop spending"
# 2. We embed that query into a 768-dim vector
# 3. PostgreSQL finds the N transactions whose stored vectors are
#    closest to the query vector using cosine similarity
# 4. Return those transactions ranked by similarity score
#
# Cosine similarity scores:
# 1.0  = identical meaning
# 0.8+ = very similar
# 0.6+ = related
# <0.5 = probably unrelated (filtered out)
#
# The ivfflat index created in the migration makes step 3 fast
# even with hundreds of thousands of transactions.

import logging
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.models.transaction import Transaction, TransactionType
from app.models.category import Category
from app.ai.embeddings import generate_query_embedding, embed_transaction

logger = logging.getLogger(__name__)

# Results below this similarity score are considered irrelevant
SIMILARITY_THRESHOLD = 0.65

# Default max results returned
DEFAULT_LIMIT = 10


async def semantic_search(
    db: AsyncSession,
    user_id: UUID,
    query: str,
    limit: int = DEFAULT_LIMIT,
    transaction_type: Optional[TransactionType] = None,
) -> list[dict]:
    """
    Find transactions semantically similar to the query string.

    Args:
        db:               Database session
        user_id:          Only search this user's transactions
        query:            Natural language query e.g. "coffee shop spending"
        limit:            Max results (default 10)
        transaction_type: Optionally filter to INCOME or EXPENSE only

    Returns:
        List of transaction dicts with similarity_score, sorted by relevance
    """
    if not query or not query.strip():
        return []

    # ── Step 1: Embed the query ───────────────────────────────────────────
    query_embedding = await generate_query_embedding(query)
    if query_embedding is None:
        logger.warning(f"Could not generate embedding for query: '{query}'")
        return []

    # ── Step 2: pgvector cosine similarity query ──────────────────────────
    # <=> is the pgvector cosine DISTANCE operator (0=identical, 2=opposite)
    # We convert distance to similarity: similarity = 1 - distance
    # CAST(:query_vector AS vector) is required because SQLAlchemy
    # passes the value as a plain string

    type_filter = ""
    if transaction_type:
        type_filter = f"AND t.transaction_type = '{transaction_type.value}'"

    sql = text(f"""
        SELECT
            t.id,
            t.description,
            t.amount,
            t.transaction_type,
            t.payment_method,
            t.date,
            t.category_id,
            t.account_id,
            t.is_recurring,
            t.anomaly_score,
            t.notes,
            1 - (t.embedding <=> CAST(:query_vector AS vector)) AS similarity
        FROM transactions t
        WHERE
            t.user_id       = :user_id
            AND t.deleted_at IS NULL
            AND t.embedding  IS NOT NULL
            {type_filter}
            AND 1 - (t.embedding <=> CAST(:query_vector AS vector)) > :threshold
        ORDER BY similarity DESC
        LIMIT :limit
    """)

    # pgvector expects the vector as a string: '[0.1, 0.2, ...]'
    vector_str = "[" + ",".join(str(v) for v in query_embedding) + "]"

    result = await db.execute(
        sql,
        {
            "query_vector": vector_str,
            "user_id":      str(user_id),
            "threshold":    SIMILARITY_THRESHOLD,
            "limit":        limit,
        }
    )
    rows = result.fetchall()

    if not rows:
        logger.info(f"No semantic matches for query: '{query}'")
        return []

    # ── Step 3: Fetch category names for matched transactions ─────────────
    category_ids = [row.category_id for row in rows if row.category_id]
    categories = {}
    if category_ids:
        cat_result = await db.execute(
            select(Category).where(Category.id.in_(category_ids))
        )
        for cat in cat_result.scalars().all():
            categories[cat.id] = cat

    # ── Step 4: Build response dicts ──────────────────────────────────────
    results = []
    for row in rows:
        cat = categories.get(row.category_id)
        results.append({
            "id":              str(row.id),
            "description":     row.description,
            "amount":          row.amount,
            "amount_display":  row.amount / 100,
            "transaction_type": row.transaction_type.lower() if isinstance(row.transaction_type, str) else row.transaction_type.value,
            "payment_method":  row.payment_method,
            "date":            str(row.date),
            "category_name":   cat.name if cat else None,
            "category_icon":   cat.icon if cat else None,
            "category_color":  cat.color if cat else None,
            "is_recurring":    row.is_recurring,
            "anomaly_score":   row.anomaly_score,
            "notes":           row.notes,
            "similarity_score": round(float(row.similarity), 4),
        })

    logger.info(
        f"Semantic search '{query}' → {len(results)} results "
        f"for user {user_id}"
    )
    return results


async def ensure_transaction_embedded(
    db: AsyncSession,
    transaction: Transaction,
) -> None:
    """
    Called after a new transaction is created.
    Embeds it immediately if Google AI is available.
    If embedding fails, the transaction is still saved — it will be
    picked up the next time the user calls /ai/search/backfill.

    This is intentionally fire-and-forget: embedding failure must
    never block or roll back a transaction creation.
    """
    if transaction.embedding is not None:
        return  # already embedded, nothing to do

    try:
        await embed_transaction(db, transaction)
    except Exception as e:
        logger.warning(
            f"Could not embed transaction {transaction.id} on creation: {e}. "
            "Will be picked up by backfill."
        )
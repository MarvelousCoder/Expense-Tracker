# app/ai/embeddings.py
#
# Responsible for:
# 1. Generating 768-dimension vectors from transaction descriptions
#    using Google's text-embedding-004 model
# 2. Storing those vectors back onto the Transaction row
# 3. Batch-embedding multiple transactions efficiently
#
# Why Google embeddings?
# - Your config already has GOOGLE_AI_API_KEY
# - text-embedding-004 produces 768-dim vectors (matches our VECTOR(768) column)
# - Free tier is generous enough for a personal finance app
# - Better multilingual support for Indian merchant names

import logging
from typing import Optional
from uuid import UUID

import google.generativeai as genai
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.transaction import Transaction

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "models/gemini-embedding-001"
EMBEDDING_DIMENSIONS = 1536  # gemini-embedding-001 outputs 3072-dim vectors


def _get_genai_client():
    """
    Configure and return the Google AI client.
    Called lazily so a missing API key does not crash startup.
    """
    if not settings.GOOGLE_AI_API_KEY:
        raise ValueError("GOOGLE_AI_API_KEY is not set in .env")
    genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
    return genai


async def generate_embedding(text: str) -> Optional[list[float]]:
    """
    Generate a 768-dimension embedding vector for a single piece of text.

    task_type="RETRIEVAL_DOCUMENT" tells Google this text will be stored
    and searched against — optimises the vector for similarity search.

    Args:
        text: Transaction description e.g. "Swiggy order ₹450"

    Returns:
        List of 768 floats, or None if generation fails
    """
    if not text or not text.strip():
        return None

    try:
        client = _get_genai_client()
        result = client.embed_content(
            model=EMBEDDING_MODEL,
            content=text.strip(),
            task_type="RETRIEVAL_DOCUMENT",
        )
        return result["embedding"]

    except Exception as e:
        logger.error(f"Embedding generation failed for '{text[:50]}': {e}")
        return None


async def generate_query_embedding(text: str) -> Optional[list[float]]:
    """
    Generate embedding for a SEARCH QUERY (not a stored document).

    task_type="RETRIEVAL_QUERY" tells Google this vector will be used
    to search against stored document vectors — different optimisation
    than RETRIEVAL_DOCUMENT, gives better results.

    Args:
        text: User's search query e.g. "coffee shop spending"

    Returns:
        List of 768 floats, or None if generation fails
    """
    if not text or not text.strip():
        return None

    try:
        client = _get_genai_client()
        result = client.embed_content(
            model=EMBEDDING_MODEL,
            content=text.strip(),
            task_type="RETRIEVAL_QUERY",
        )
        return result["embedding"]

    except Exception as e:
        logger.error(f"Query embedding failed for '{text[:50]}': {e}")
        return None


async def embed_transaction(
    db: AsyncSession,
    transaction: Transaction
) -> bool:
    """
    Generate and store an embedding for a single transaction.
    Called when a transaction is created or during backfill.

    We embed description + ai_category_suggestion together so the vector
    captures both what the user typed and what category it belongs to —
    this makes similarity search more accurate.

    Args:
        db:          Database session
        transaction: Transaction ORM object (will be mutated + committed)

    Returns:
        True if embedding was stored, False if it failed
    """
    # Build the text to embed
    # Combining description with category hint gives richer vectors
    text_to_embed = transaction.description
    if transaction.ai_category_suggestion:
        text_to_embed = (
            f"{transaction.description} ({transaction.ai_category_suggestion})"
        )

    embedding = await generate_embedding(text_to_embed)
    if embedding is None:
        return False

    transaction.embedding = embedding
    # Use flush instead of commit — keeps the session alive for the caller
    # The caller (create_transaction) owns the commit lifecycle
    await db.flush()
    logger.info(
        f"Embedded transaction {transaction.id}: "
        f"'{transaction.description[:40]}'"
    )
    return True


async def backfill_embeddings(
    db: AsyncSession,
    user_id: UUID,
    batch_size: int = 50,
) -> dict:
    """
    Generate embeddings for all transactions that don't have one yet.
    Called from the POST /ai/search/backfill endpoint.

    Processes in batches to avoid hitting Google AI rate limits.
    Call the endpoint multiple times until remaining = 0.

    Args:
        db:         Database session
        user_id:    Only backfill this user's transactions
        batch_size: How many to process per call (default 50)

    Returns:
        {"processed": int, "failed": int, "remaining": int}
    """
    # Fetch transactions missing embeddings
    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.embedding.is_(None),
        )
        .limit(batch_size)
    )
    transactions = result.scalars().all()

    processed = 0
    failed = 0

    for txn in transactions:
        success = await embed_transaction(db, txn)
        if success:
            processed += 1
        else:
            failed += 1

    # Count how many still need embedding after this batch
    remaining_result = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.embedding.is_(None),
        )
    )
    remaining = len(remaining_result.scalars().all())

    logger.info(
        f"Backfill for user {user_id}: "
        f"{processed} processed, {failed} failed, {remaining} remaining"
    )
    return {"processed": processed, "failed": failed, "remaining": remaining}

# app/ai/anomaly.py
#
# Responsible for:
# Detecting statistically unusual transactions in a user's history.
#
# Algorithm:
# 1. For each expense category, compute mean + std deviation of
#    transaction amounts over the past 90 days
# 2. For each transaction, compute a Z-score:
#    z = (amount - mean) / std_dev
#    Z-score > 2.0 means "more than 2 standard deviations above normal"
# 3. Normalise Z-score to an anomaly_score between 0.0 and 1.0+
# 4. For flagged transactions, use Groq to generate a human-readable
#    explanation ("You usually spend ₹200 on food, this was ₹1,800")
# 5. Store anomaly_score on the transaction row

import logging
import json
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from uuid import UUID

import numpy as np
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from groq import Groq

from app.core.config import settings
from app.models.transaction import Transaction, TransactionType
from app.models.category import Category

logger = logging.getLogger(__name__)

# Z-score threshold above which a transaction is considered anomalous
ANOMALY_Z_THRESHOLD = 2.0

# Minimum transactions in a category needed to compute meaningful stats
MIN_SAMPLES_FOR_STATS = 3

# How many days back to look when computing "normal" spending
BASELINE_DAYS = 90


async def _compute_category_baselines(
    db: AsyncSession,
    user_id: UUID,
) -> dict[str, dict]:
    """
    Compute mean and std deviation of spending per category
    over the past BASELINE_DAYS days.

    Returns:
        {
            "category_id_str": {
                "mean": 450.0,
                "std":  120.0,
                "count": 15,
                "category_name": "Food & Dining"
            }
        }
    """
    cutoff = datetime.now(timezone.utc).date() - timedelta(days=BASELINE_DAYS)

    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE,
            Transaction.date >= cutoff,
        )
    )
    transactions = result.scalars().all()

    # Group amounts by category
    category_amounts: dict[str, list[float]] = defaultdict(list)
    for txn in transactions:
        key = str(txn.category_id) if txn.category_id else "uncategorized"
        category_amounts[key].append(txn.amount / 100)

    # Fetch category names
    category_ids = [
        txn.category_id for txn in transactions
        if txn.category_id is not None
    ]
    category_names = {}
    if category_ids:
        cat_result = await db.execute(
            select(Category).where(Category.id.in_(set(category_ids)))
        )
        for cat in cat_result.scalars().all():
            category_names[str(cat.id)] = cat.name

    # Compute stats per category
    baselines = {}
    for cat_key, amounts in category_amounts.items():
        if len(amounts) < MIN_SAMPLES_FOR_STATS:
            continue  # not enough data for reliable stats
        baselines[cat_key] = {
            "mean":          round(float(np.mean(amounts)), 2),
            "std":           round(float(np.std(amounts)), 2),
            "count":         len(amounts),
            "category_name": category_names.get(cat_key, "Uncategorized"),
        }

    return baselines


async def _generate_anomaly_explanation(
    description: str,
    amount: float,
    category_name: str,
    baseline_mean: float,
    baseline_std: float,
) -> str:
    """
    Use Groq to generate a human-readable explanation for an anomalous transaction.
    Falls back to a template string if Groq is unavailable.
    """
    # Template fallback — always works without API
    fallback = (
        f"This {category_name} transaction of ₹{amount:,.0f} is unusual. "
        f"Your typical spending is around ₹{baseline_mean:,.0f} "
        f"(±₹{baseline_std:,.0f})."
    )

    if not settings.GROQ_API_KEY:
        return fallback

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        prompt = f"""A personal finance app detected an unusual transaction.

Transaction: "{description}"
Amount: ₹{amount:,.0f}
Category: {category_name}
User's typical spending in this category: ₹{baseline_mean:,.0f} (±₹{baseline_std:,.0f})

Write a single friendly, specific sentence explaining why this is unusual.
Maximum 20 words. Start with the category or merchant name."""

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=60,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        logger.warning(f"Groq explanation failed: {e}")
        return fallback


async def detect_anomalies(
    db: AsyncSession,
    user_id: UUID,
    days_back: int = 30,
) -> list[dict]:
    """
    Detect anomalous transactions for a user in the past `days_back` days.
    Updates anomaly_score on flagged transactions in the DB.

    Args:
        db:        Database session
        user_id:   User to analyse
        days_back: How many recent days to scan for anomalies (default 30)

    Returns:
        List of anomalous transactions with explanations:
        [
            {
                "transaction_id": "...",
                "description":    "Big Basket order",
                "amount":         4500.0,
                "category":       "Groceries",
                "anomaly_score":  2.8,
                "explanation":    "Groceries spend of ₹4,500 is 3x your usual ₹1,200"
            }
        ]
    """
    # ── 1. Compute baselines from past 90 days ────────────────────────────
    baselines = await _compute_category_baselines(db, user_id)
    if not baselines:
        return []  # not enough history to detect anomalies

    # ── 2. Fetch recent transactions to scan ─────────────────────────────
    scan_cutoff = datetime.now(timezone.utc).date() - timedelta(days=days_back)

    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE,
            Transaction.date >= scan_cutoff,
        )
        .order_by(Transaction.date.desc())
    )
    recent_transactions = result.scalars().all()

    # ── 3. Score each transaction ─────────────────────────────────────────
    anomalies = []

    for txn in recent_transactions:
        cat_key = str(txn.category_id) if txn.category_id else "uncategorized"
        baseline = baselines.get(cat_key)

        if baseline is None:
            continue  # no baseline for this category

        amount = txn.amount / 100
        mean = baseline["mean"]
        std = baseline["std"]

        # Avoid division by zero for categories with identical amounts
        if std < 1.0:
            continue

        # Z-score: how many standard deviations above the mean?
        z_score = (amount - mean) / std

        # Only flag if significantly above normal (not below — saving is fine)
        if z_score < ANOMALY_Z_THRESHOLD:
            # Store 0.0 score for normal transactions that were analysed
            txn.anomaly_score = round(float(max(z_score / 10, 0.0)), 3)
            continue

        # ── Anomaly confirmed ─────────────────────────────────────────────
        anomaly_score = round(float(z_score / ANOMALY_Z_THRESHOLD), 3)
        txn.anomaly_score = anomaly_score

        # Generate human-readable explanation
        explanation = await _generate_anomaly_explanation(
            description=txn.description,
            amount=amount,
            category_name=baseline["category_name"],
            baseline_mean=mean,
            baseline_std=std,
        )

        anomalies.append({
            "transaction_id": str(txn.id),
            "description":    txn.description,
            "amount":         amount,
            "date":           str(txn.date),
            "category":       baseline["category_name"],
            "anomaly_score":  anomaly_score,
            "baseline_mean":  mean,
            "baseline_std":   std,
            "explanation":    explanation,
        })

    # ── 4. Commit all anomaly_score updates ───────────────────────────────
    await db.commit()

    logger.info(
        f"Anomaly detection for user {user_id}: "
        f"{len(anomalies)} anomalies found in last {days_back} days"
    )
    return anomalies
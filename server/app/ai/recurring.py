# app/ai/recurring.py
#
# Responsible for:
# Detecting recurring expense patterns in a user's transaction history.
#
# Algorithm (pure Python — no AI API needed):
# 1. Fetch all expense transactions for the user
# 2. Group them by "merchant fingerprint"
#    Fingerprint = normalised description with amounts/IDs stripped
#    e.g. "Swiggy #12345 ₹299" and "Swiggy #67890 ₹349" → same group "swiggy"
# 3. For each group with 2+ transactions, compute day-intervals
#    between consecutive transactions
# 4. If the mean interval is close to a known period (weekly/monthly etc.)
#    AND the standard deviation is low (consistent timing) → recurring
# 5. Mark all matched transactions as is_recurring=True in the DB
# 6. Return a summary of each detected pattern

import logging
import re
from collections import defaultdict
from datetime import timedelta
from typing import Optional
from uuid import UUID

import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction, TransactionType

logger = logging.getLogger(__name__)

# ── Tuning constants ──────────────────────────────────────────────────────────

# Minimum occurrences to consider something recurring
MIN_OCCURRENCES = 2

# How many days of tolerance when matching to a known period
# e.g. 5 means "25–35 days" all count as monthly
INTERVAL_TOLERANCE = 5

# Known periods in days that we try to match against
KNOWN_PERIODS = {
    "weekly":    7,
    "biweekly": 14,
    "monthly":  30,
    "quarterly": 91,
    "yearly":  365,
}


def _normalise_description(description: str) -> str:
    """
    Strip order IDs, amounts, and punctuation from a description
    to create a stable merchant fingerprint for grouping.

    Examples:
        "Swiggy Order #12345"     → "swiggy order"
        "Netflix ₹499"            → "netflix"
        "Zomato - Food Delivery"  → "zomato food delivery"
        "Amazon Pay UPI 9988776"  → "amazon pay upi"
    """
    desc = description.lower()

    # Remove order/reference numbers like #12345
    desc = re.sub(r'#\w+', '', desc)

    # Remove Indian currency amounts like ₹499 or Rs.499
    desc = re.sub(r'₹[\d,]+', '', desc)
    desc = re.sub(r'\brs\.?\s*[\d,]+', '', desc)

    # Remove standalone long numbers (transaction IDs, phone numbers)
    desc = re.sub(r'\b\d{4,}\b', '', desc)

    # Remove all punctuation except spaces
    desc = re.sub(r'[^\w\s]', ' ', desc)

    # Collapse multiple spaces into one
    desc = re.sub(r'\s+', ' ', desc).strip()

    return desc


def _detect_period(intervals: list[float]) -> Optional[str]:
    """
    Check if a list of day-intervals between transactions matches
    a known recurring period.

    Args:
        intervals: Day counts between consecutive transactions
                   e.g. [29, 31, 30] for a monthly subscription

    Returns:
        Period name like "monthly" or None if no pattern found
    """
    if not intervals:
        return None

    mean_interval = np.mean(intervals)
    std_interval  = np.std(intervals)

    # High standard deviation = irregular timing = not truly recurring
    # We allow up to 2x the tolerance as max std deviation
    if std_interval > INTERVAL_TOLERANCE * 2:
        return None

    # Match mean interval against each known period
    for period_name, period_days in KNOWN_PERIODS.items():
        if abs(mean_interval - period_days) <= INTERVAL_TOLERANCE:
            return period_name

    return None  # no known period matched


async def detect_recurring_transactions(
    db: AsyncSession,
    user_id: UUID,
) -> list[dict]:
    """
    Analyse all expense transactions for a user and detect recurring patterns.
    Updates is_recurring=True on all matched transactions in the DB.

    Args:
        db:      Database session
        user_id: User to analyse

    Returns:
        List of detected recurring patterns:
        [
            {
                "merchant":        "netflix",
                "period":          "monthly",
                "occurrences":     6,
                "avg_amount":      499.0,
                "transaction_ids": ["uuid1", "uuid2", ...],
                "next_expected":   "2026-07-11"
            }
        ]
    """
    # ── 1. Fetch all expense transactions sorted by date ──────────────────
    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE,
        )
        .order_by(Transaction.date.asc())
    )
    transactions = result.scalars().all()

    if len(transactions) < MIN_OCCURRENCES:
        return []

    # ── 2. Group transactions by normalised description fingerprint ───────
    groups: dict[str, list[Transaction]] = defaultdict(list)
    for txn in transactions:
        fingerprint = _normalise_description(txn.description)
        if fingerprint:  # skip transactions with empty descriptions
            groups[fingerprint].append(txn)

    # ── 3. Analyse each group for a recurring pattern ─────────────────────
    detected_patterns = []
    transactions_to_mark: list[Transaction] = []

    for fingerprint, group_txns in groups.items():
        if len(group_txns) < MIN_OCCURRENCES:
            continue

        # Sort by date ascending to compute intervals correctly
        group_txns.sort(key=lambda t: t.date)
        dates = [t.date for t in group_txns]

        # Compute day gaps between consecutive transactions
        intervals = [
            (dates[i + 1] - dates[i]).days
            for i in range(len(dates) - 1)
        ]

        period = _detect_period(intervals)
        if period is None:
            continue  # not a recurring pattern, skip this group

        # ── Pattern confirmed ─────────────────────────────────────────────
        amounts      = [t.amount / 100 for t in group_txns]
        avg_amount   = round(float(np.mean(amounts)), 2)
        avg_interval = int(np.mean(intervals))

        # Estimate next expected date = last transaction date + avg interval
        last_date     = dates[-1]
        next_expected = last_date + timedelta(days=avg_interval)

        pattern = {
            "merchant":        fingerprint,
            "period":          period,
            "occurrences":     len(group_txns),
            "avg_amount":      avg_amount,
            "transaction_ids": [str(t.id) for t in group_txns],
            "next_expected":   str(next_expected),
        }
        detected_patterns.append(pattern)

        # Collect transactions to mark as recurring
        for txn in group_txns:
            if not txn.is_recurring:
                txn.is_recurring = True
                transactions_to_mark.append(txn)

    # ── 4. Commit all is_recurring updates in one transaction ─────────────
    if transactions_to_mark:
        await db.commit()
        logger.info(
            f"Marked {len(transactions_to_mark)} transactions as recurring "
            f"for user {user_id}"
        )

    logger.info(
        f"Recurring detection for user {user_id}: "
        f"{len(detected_patterns)} patterns found"
    )
    return detected_patterns

# app/ai/chatbot.py

import json
import logging
from datetime import datetime, timezone
from uuid import UUID

from groq import Groq
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction, TransactionType

logger = logging.getLogger(__name__)


async def _get_financial_summary(db: AsyncSession, user_id: UUID) -> dict:
    """Build compact financial context for the chatbot."""
    now = datetime.now(timezone.utc)

    # Last 3 months totals
    monthly_data = []
    for i in range(3):
        month = now.month - i
        year = now.year
        if month <= 0:
            month += 12
            year -= 1

        result = await db.execute(
            select(
                Transaction.transaction_type,
                func.sum(Transaction.amount).label("total")
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.deleted_at.is_(None),
                extract("month", Transaction.date) == month,
                extract("year", Transaction.date) == year,
            )
            .group_by(Transaction.transaction_type)
        )
        rows = result.all()
        totals = {row.transaction_type.value: int(row.total or 0) / 100 for row in rows}
        monthly_data.append({
            "month": datetime(year, month, 1).strftime("%B %Y"),
            "income": totals.get("income", 0),
            "expense": totals.get("expense", 0),
        })

    # Category breakdown
    cat_result = await db.execute(
        select(
            Category.name,
            func.sum(Transaction.amount).label("total")
        )
        .join(Category, Transaction.category_id == Category.id, isouter=True)
        .where(
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE,
        )
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
    )
    categories = [
        {"category": r.name or "Uncategorized", "total_spent": int(r.total or 0) / 100}
        for r in cat_result.all()
    ]

    # Account balances
    acc_result = await db.execute(
        select(Account)
        .where(
            Account.user_id == user_id,
            Account.deleted_at.is_(None),
            Account.is_active is True
        )
    )
    accounts = [
        {"name": a.name, "balance": a.balance / 100}
        for a in acc_result.scalars().all()
    ]

    return {
        "monthly_summary": monthly_data,
        "spending_by_category": categories,
        "accounts": accounts,
        "currency": "INR",
        "as_of": now.strftime("%B %d, %Y"),
    }


async def chat(
    message: str,
    db: AsyncSession,
    user_id: UUID,
    conversation_history: list = None
) -> str:
    """
    Chat with AI about your finances.
    Uses SQL aggregation → compact JSON → LLM.
    Much faster and cheaper than RAG.
    """
    if not settings.GROQ_API_KEY:
        return "AI chat is not configured. Please add GROQ_API_KEY to enable this feature."

    context = await _get_financial_summary(db, user_id)

    system_prompt = f"""You are a helpful personal finance assistant for an expense tracking app.

You have access to the user's financial data:
{json.dumps(context, indent=2)}

Guidelines:
- Answer questions about spending, income, savings, and budgets
- Be specific with numbers from the data
- Use Indian currency format (₹) and Indian number formatting
- Be friendly, concise and actionable
- If data is not available for a specific query, say so clearly
- Do not make up numbers not in the data
- Keep responses under 150 words"""

    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history for context
    if conversation_history:
        messages.extend(conversation_history[-6:])  # last 3 exchanges

    messages.append({"role": "user", "content": message})

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.5,
            max_tokens=300,
        )
        return response.choices[0].message.content

    except Exception as e:
        logger.error(f"Chat failed: {e}")
        return "Sorry, I couldn't process your request. Please try again."

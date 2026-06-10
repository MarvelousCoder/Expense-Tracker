# app/ai/insights.py

import json
import logging
from datetime import datetime, timezone
from groq import Groq
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract, and_
from app.core.config import settings
from app.models.transaction import Transaction, TransactionType
from app.models.category import Category
from uuid import UUID

logger = logging.getLogger(__name__)


async def _gather_financial_context(db: AsyncSession, user_id: UUID) -> dict:
    """
    Gather compact financial statistics from DB.
    This is sent to LLM instead of raw transactions.
    Keeps context small → faster + cheaper.
    """
    now = datetime.now(timezone.utc)
    current_month = now.month
    current_year = now.year
    last_month = current_month - 1 if current_month > 1 else 12
    last_month_year = current_year if current_month > 1 else current_year - 1

    async def month_totals(month, year):
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
        return {
            row.transaction_type.value: int(row.total or 0) / 100
            for row in rows
        }

    # Category breakdown current month
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
            extract("month", Transaction.date) == current_month,
            extract("year", Transaction.date) == current_year,
        )
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(5)
    )
    top_categories = [
        {"category": row.name or "Uncategorized", "amount": int(row.total or 0) / 100}
        for row in cat_result.all()
    ]

    # Day of week spending
    dow_result = await db.execute(
        select(
            extract("dow", Transaction.date).label("dow"),
            func.sum(Transaction.amount).label("total")
        )
        .where(
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE,
            extract("month", Transaction.date) == current_month,
        )
        .group_by("dow")
        .order_by(func.sum(Transaction.amount).desc())
        .limit(1)
    )
    dow_row = dow_result.first()
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    highest_day = days[int(dow_row.dow)] if dow_row else "Unknown"

    current = await month_totals(current_month, current_year)
    previous = await month_totals(last_month, last_month_year)

    return {
        "current_month": {
            "income": current.get("income", 0),
            "expense": current.get("expense", 0),
        },
        "previous_month": {
            "income": previous.get("income", 0),
            "expense": previous.get("expense", 0),
        },
        "top_spending_categories": top_categories,
        "highest_spending_day": highest_day,
        "month_name": now.strftime("%B"),
        "year": current_year,
    }


async def generate_insights(db: AsyncSession, user_id: UUID) -> list:
    """
    Generate AI-powered financial insights.
    Returns list of insight strings.
    """
    context = await _gather_financial_context(db, user_id)

    # Generate rule-based insights first (no API needed)
    insights = []

    curr = context["current_month"]
    prev = context["previous_month"]
    month = context["month_name"]

    # Rule-based insights
    if prev["expense"] > 0 and curr["expense"] > 0:
        change = ((curr["expense"] - prev["expense"]) / prev["expense"]) * 100
        if change > 10:
            insights.append(f"📈 Your expenses increased by {abs(change):.0f}% compared to last month.")
        elif change < -10:
            insights.append(f"📉 Great job! Your expenses decreased by {abs(change):.0f}% compared to last month.")

    if curr["income"] > 0 and curr["expense"] > 0:
        savings_rate = ((curr["income"] - curr["expense"]) / curr["income"]) * 100
        if savings_rate > 30:
            insights.append(f"💰 Excellent! You're saving {savings_rate:.0f}% of your income this month.")
        elif savings_rate < 0:
            insights.append(f"⚠️ You're spending more than you earn this month. Review your expenses.")

    if context["top_spending_categories"]:
        top = context["top_spending_categories"][0]
        insights.append(f"🏆 Your highest spending category is {top['category']} at ₹{top['amount']:,.0f}.")

    if context["highest_spending_day"] != "Unknown":
        insights.append(f"📅 You spend the most on {context['highest_spending_day']}s.")

    # Enhance with AI if Groq available
    if settings.GROQ_API_KEY and len(insights) > 0:
        try:
            client = Groq(api_key=settings.GROQ_API_KEY)

            prompt = f"""You are a friendly personal finance advisor analyzing spending data.

Financial data for {month} {context['year']}:
{json.dumps(context, indent=2)}

Based on this data, provide exactly 2 additional personalized financial insights.
Each insight should be:
- Specific to the data provided
- Actionable (suggest what the user can do)
- Friendly and encouraging tone
- Start with a relevant emoji
- Maximum 2 sentences each

Respond with ONLY a JSON array of 2 strings:
["insight 1", "insight 2"]"""

            response = client.chat.completions.create(
                model=settings.GROQ_MODEL_LARGE,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=300,
                response_format={"type": "json_object"},
            )

            # Parse AI insights
            content = response.choices[0].message.content
            ai_data = json.loads(content)

            # Handle all response formats from Groq
            if isinstance(ai_data, list):
                # Flatten in case of nested lists
                ai_insights = []
                for item in ai_data:
                    if isinstance(item, str):
                        ai_insights.append(item)
                    elif isinstance(item, list):
                        ai_insights.extend([s for s in item if isinstance(s, str)])
            elif isinstance(ai_data, dict):
                # Extract string values only
                ai_insights = [v for v in ai_data.values() if isinstance(v, str)][:2]
            else:
                ai_insights = []

            # Final safety — ensure all items are strings
            ai_insights = [str(i) for i in ai_insights if i][:2]

            insights.extend(ai_insights[:2])

        except Exception as e:
            logger.error(f"AI insights generation failed: {e}")

    return insights if insights else [
        "📊 Add more transactions to get personalized insights.",
        "💡 Track your daily expenses to see spending patterns."
    ]
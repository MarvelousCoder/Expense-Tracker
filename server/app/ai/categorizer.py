# app/ai/categorizer.py

import json
import logging
from typing import Optional
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

# Default categories the AI knows about
KNOWN_CATEGORIES = [
    {"name": "Food & Dining", "keywords": ["swiggy", "zomato", "restaurant", "cafe", "food", "eat", "lunch", "dinner", "breakfast", "pizza", "burger"]},
    {"name": "Groceries", "keywords": ["bigbasket", "dmart", "grofers", "blinkit", "zepto", "grocery", "vegetables", "fruits", "supermarket"]},
    {"name": "Travel", "keywords": ["uber", "ola", "rapido", "bus", "train", "flight", "petrol", "fuel", "metro", "cab", "auto"]},
    {"name": "Shopping", "keywords": ["amazon", "flipkart", "myntra", "ajio", "clothes", "shoes", "shopping", "mall"]},
    {"name": "Bills & Utilities", "keywords": ["electricity", "water", "gas", "internet", "broadband", "bill", "recharge", "dth"]},
    {"name": "Entertainment", "keywords": ["netflix", "hotstar", "spotify", "prime", "movie", "cinema", "game", "concert"]},
    {"name": "Health", "keywords": ["pharmacy", "medicine", "doctor", "hospital", "clinic", "gym", "apollo", "medplus"]},
    {"name": "Education", "keywords": ["udemy", "coursera", "book", "course", "school", "college", "fees", "tuition"]},
    {"name": "Fuel", "keywords": ["petrol", "diesel", "fuel", "hp", "indian oil", "bharat petroleum", "bpcl"]},
    {"name": "Salary", "keywords": ["salary", "stipend", "wages", "payroll", "income", "bonus"]},
    {"name": "Investment", "keywords": ["zerodha", "groww", "mutual fund", "sip", "stocks", "shares", "fd", "investment"]},
    {"name": "Rent", "keywords": ["rent", "house", "flat", "pg", "hostel", "accommodation"]},
    {"name": "EMI", "keywords": ["emi", "loan", "credit card", "bank", "installment"]},
    {"name": "Subscriptions", "keywords": ["subscription", "netflix", "spotify", "amazon prime", "youtube premium"]},
    {"name": "Other", "keywords": []},
]


def _rule_based_categorize(description: str) -> Optional[str]:
    """
    Fast rule-based categorization before calling AI.
    Saves API calls for obvious cases.
    """
    desc_lower = description.lower()
    for category in KNOWN_CATEGORIES:
        for keyword in category["keywords"]:
            if keyword in desc_lower:
                return category["name"]
    return None


async def categorize_transaction(description: str, amount: float) -> dict:
    """
    Categorize a transaction using:
    1. Rule-based matching (fast, free)
    2. Groq AI (for ambiguous cases)

    Returns:
        {
            "category": "Food & Dining",
            "confidence": "high",
            "method": "ai" | "rules",
            "reasoning": "..."
        }
    """
    # Try rule-based first
    rule_result = _rule_based_categorize(description)
    if rule_result:
        logger.info(f"Rule-based categorization: {description} → {rule_result}")
        return {
            "category": rule_result,
            "confidence": "high",
            "method": "rules",
            "reasoning": f"Matched keyword in '{description}'"
        }

    # Fall back to AI
    if not settings.GROQ_API_KEY:
        return {
            "category": "Other",
            "confidence": "low",
            "method": "fallback",
            "reasoning": "No AI key configured"
        }

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)

        category_names = [c["name"] for c in KNOWN_CATEGORIES]

        prompt = f"""You are a financial transaction categorizer for Indian expenses.

Transaction: "{description}"
Amount: ₹{amount}

Available categories: {', '.join(category_names)}

Respond with ONLY a JSON object, no other text:
{{
    "category": "<exact category name from the list>",
    "confidence": "<high|medium|low>",
    "reasoning": "<one sentence explanation>"
}}"""

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=150,
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)

        # Validate category is in our list
        if result.get("category") not in category_names:
            result["category"] = "Other"

        result["method"] = "ai"
        logger.info(f"AI categorization: {description} → {result['category']} ({result['confidence']})")
        return result

    except Exception as e:
        logger.error(f"AI categorization failed: {e}")
        return {
            "category": "Other",
            "confidence": "low",
            "method": "fallback",
            "reasoning": str(e)
        }
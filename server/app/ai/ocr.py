# app/ai/ocr.py

import json
import logging
import re

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)


async def extract_receipt_data(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Extract transaction data from a receipt image using Google Gemini Vision.
    """
    if not settings.GOOGLE_AI_API_KEY:
        return {"error": "Google AI API key not configured"}

    try:
        client = genai.Client(api_key=settings.GOOGLE_AI_API_KEY)

        prompt = """Analyze this receipt image and extract the following information.
Respond ONLY with a valid JSON object, no other text.

Required JSON format:
{
    "merchant": "<store/restaurant name or null>",
    "amount": <total amount as number or null>,
    "date": "<date in YYYY-MM-DD format or null>",
    "items": ["<item1>", "<item2>"],
    "category_hint": "<Food & Dining|Groceries|Travel|Shopping|Bills & Utilities|Health|Other>",
    "currency": "<INR|USD>",
    "confidence": "<high|medium|low>",
    "raw_text": "<key text extracted from receipt>"
}

Rules:
- Extract the TOTAL amount (final payable amount)
- If date not visible, use null
- Items should be the main purchased items (max 5)
- currency should be INR for Indian receipts
- confidence: high if all fields found, medium if some missing, low if unclear image"""

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type
                )
            ]
        )

        text = response.text.strip()

        # Clean up markdown code blocks if present
        text = re.sub(r"```json\n?", "", text)
        text = re.sub(r"```\n?", "", text)
        text = text.strip()

        result = json.loads(text)
        logger.info(f"OCR extracted: merchant={result.get('merchant')}, amount={result.get('amount')}")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"OCR JSON parse error: {e}")
        return {"error": "Could not parse receipt data"}
    except Exception as e:
        logger.error(f"OCR failed: {e}")
        return {"error": str(e)}

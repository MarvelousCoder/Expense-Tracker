# app/api/v1/ai.py

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.ai.categorizer import categorize_transaction
from app.ai.ocr import extract_receipt_data
from app.ai.insights import generate_insights
from app.ai.chatbot import chat

router = APIRouter(prefix="/ai", tags=["AI"])


# ================================
# 5A — Smart Categorization
# ================================
class CategorizeRequest(BaseModel):
    description: str
    amount: float


class CategorizeResponse(BaseModel):
    category: str
    confidence: str
    method: str
    reasoning: str


@router.post("/categorize", response_model=CategorizeResponse)
async def categorize(
    data: CategorizeRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Suggest category for a transaction description.
    Used in the Add Transaction form for instant suggestions.
    """
    result = await categorize_transaction(data.description, data.amount)
    return CategorizeResponse(**result)


# ================================
# 5B — OCR Receipt Scanner
# ================================
class OCRResponse(BaseModel):
    merchant: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = None
    items: List[str] = []
    category_hint: Optional[str] = None
    currency: str = "INR"
    confidence: str = "low"
    raw_text: Optional[str] = None
    error: Optional[str] = None


@router.post("/ocr/receipt", response_model=OCRResponse)
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Extract transaction data from a receipt image.
    Supports JPG, PNG, WEBP.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not supported. Use JPG, PNG or WEBP."
        )

    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 5MB.")

    result = await extract_receipt_data(contents, file.content_type)

    if "error" in result and not result.get("merchant"):
        return OCRResponse(error=result["error"])

    return OCRResponse(
        merchant=result.get("merchant"),
        amount=result.get("amount"),
        date=result.get("date"),
        items=result.get("items", []),
        category_hint=result.get("category_hint"),
        currency=result.get("currency", "INR"),
        confidence=result.get("confidence", "low"),
        raw_text=result.get("raw_text"),
    )


# ================================
# 5C — Financial Insights
# ================================
class InsightsResponse(BaseModel):
    insights: List[str]


@router.get("/insights", response_model=InsightsResponse)
async def get_insights(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate AI-powered financial insights for the current user."""
    insights = await generate_insights(db, current_user.id)
    return InsightsResponse(insights=insights)


# ================================
# 5D — Chat Assistant
# ================================
class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []


class ChatResponse(BaseModel):
    response: str


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    data: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Chat with AI about your finances.
    Example: "How much did I spend on food last month?"
    """
    response = await chat(
        message=data.message,
        db=db,
        user_id=current_user.id,
        conversation_history=data.history
    )
    return ChatResponse(response=response)
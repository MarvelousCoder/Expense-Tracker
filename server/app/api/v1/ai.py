# # app/api/v1/ai.py

# from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
# from sqlalchemy.ext.asyncio import AsyncSession
# from pydantic import BaseModel
# from typing import List, Optional
# from uuid import UUID

# from app.core.database import get_db
# from app.core.dependencies import get_current_active_user
# from app.models.user import User
# from app.ai.categorizer import categorize_transaction
# from app.ai.ocr import extract_receipt_data
# from app.ai.insights import generate_insights
# from app.ai.chatbot import chat

# router = APIRouter(prefix="/ai", tags=["AI"])


# # ================================
# # 5A — Smart Categorization
# # ================================
# class CategorizeRequest(BaseModel):
#     description: str
#     amount: float


# class CategorizeResponse(BaseModel):
#     category: str
#     confidence: str
#     method: str
#     reasoning: str


# @router.post("/categorize", response_model=CategorizeResponse)
# async def categorize(
#     data: CategorizeRequest,
#     current_user: User = Depends(get_current_active_user)
# ):
#     """
#     Suggest category for a transaction description.
#     Used in the Add Transaction form for instant suggestions.
#     """
#     result = await categorize_transaction(data.description, data.amount)
#     return CategorizeResponse(**result)


# # ================================
# # 5B — OCR Receipt Scanner
# # ================================
# class OCRResponse(BaseModel):
#     merchant: Optional[str] = None
#     amount: Optional[float] = None
#     date: Optional[str] = None
#     items: List[str] = []
#     category_hint: Optional[str] = None
#     currency: str = "INR"
#     confidence: str = "low"
#     raw_text: Optional[str] = None
#     error: Optional[str] = None


# @router.post("/ocr/receipt", response_model=OCRResponse)
# async def scan_receipt(
#     file: UploadFile = File(...),
#     current_user: User = Depends(get_current_active_user)
# ):
#     """
#     Extract transaction data from a receipt image.
#     Supports JPG, PNG, WEBP.
#     """
#     # Validate file type
#     allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
#     if file.content_type not in allowed_types:
#         raise HTTPException(
#             status_code=400,
#             detail=f"File type {file.content_type} not supported. Use JPG, PNG or WEBP."
#         )

#     # Validate file size (max 5MB)
#     contents = await file.read()
#     if len(contents) > 5 * 1024 * 1024:
#         raise HTTPException(status_code=400, detail="File too large. Maximum 5MB.")

#     result = await extract_receipt_data(contents, file.content_type)

#     if "error" in result and not result.get("merchant"):
#         return OCRResponse(error=result["error"])

#     return OCRResponse(
#         merchant=result.get("merchant"),
#         amount=result.get("amount"),
#         date=result.get("date"),
#         items=result.get("items", []),
#         category_hint=result.get("category_hint"),
#         currency=result.get("currency", "INR"),
#         confidence=result.get("confidence", "low"),
#         raw_text=result.get("raw_text"),
#     )


# # ================================
# # 5C — Financial Insights
# # ================================
# class InsightsResponse(BaseModel):
#     insights: List[str]


# @router.get("/insights", response_model=InsightsResponse)
# async def get_insights(
#     current_user: User = Depends(get_current_active_user),
#     db: AsyncSession = Depends(get_db)
# ):
#     """Generate AI-powered financial insights for the current user."""
#     insights = await generate_insights(db, current_user.id)
#     return InsightsResponse(insights=insights)


# # ================================
# # 5D — Chat Assistant
# # ================================
# class ChatRequest(BaseModel):
#     message: str
#     history: List[dict] = []


# class ChatResponse(BaseModel):
#     response: str


# @router.post("/chat", response_model=ChatResponse)
# async def chat_endpoint(
#     data: ChatRequest,
#     current_user: User = Depends(get_current_active_user),
#     db: AsyncSession = Depends(get_db)
# ):
#     """
#     Chat with AI about your finances.
#     Example: "How much did I spend on food last month?"
#     """
#     response = await chat(
#         message=data.message,
#         db=db,
#         user_id=current_user.id,
#         conversation_history=data.history
#     )
#     return ChatResponse(response=response)


# app/api/v1/ai.py

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.transaction import TransactionType

# Phase 5 AI
from app.ai.categorizer import categorize_transaction
from app.ai.ocr import extract_receipt_data
from app.ai.insights import generate_insights
from app.ai.chatbot import chat

# Phase 6 AI
from app.ai.embeddings import backfill_embeddings
from app.ai.semantic_search import semantic_search
from app.ai.recurring import detect_recurring_transactions
from app.ai.anomaly import detect_anomalies

router = APIRouter(prefix="/ai", tags=["AI"])


# ============================================================
# Phase 5A — Smart Categorization
# ============================================================

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
    """Suggest a category for a transaction description."""
    result = await categorize_transaction(data.description, data.amount)
    return CategorizeResponse(**result)


# ============================================================
# Phase 5B — OCR Receipt Scanner
# ============================================================

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
    """Extract transaction data from a receipt image (JPG, PNG, WEBP)."""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not supported. Use JPG, PNG or WEBP."
        )

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


# ============================================================
# Phase 5C — Financial Insights
# ============================================================

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


# ============================================================
# Phase 5D — Chat Assistant
# ============================================================

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
    """Chat with AI about your finances."""
    response = await chat(
        message=data.message,
        db=db,
        user_id=current_user.id,
        conversation_history=data.history
    )
    return ChatResponse(response=response)


# ============================================================
# Phase 6A — Semantic Search
# ============================================================

class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 10
    transaction_type: Optional[TransactionType] = None


class SemanticSearchResult(BaseModel):
    id: str
    description: str
    amount: int
    amount_display: float
    transaction_type: str
    payment_method: str
    date: str
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    is_recurring: bool
    anomaly_score: Optional[float] = None
    notes: Optional[str] = None
    similarity_score: float


class SemanticSearchResponse(BaseModel):
    results: List[SemanticSearchResult]
    query: str
    total: int


@router.post("/search", response_model=SemanticSearchResponse)
async def semantic_search_endpoint(
    data: SemanticSearchRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Search transactions by meaning, not just keywords.
    Example: "coffee shop" will find Starbucks, Costa, café transactions.
    Requires transactions to have embeddings — run /ai/search/backfill first.
    """
    if not data.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    results = await semantic_search(
        db=db,
        user_id=current_user.id,
        query=data.query,
        limit=min(data.limit, 50),  # cap at 50
        transaction_type=data.transaction_type,
    )

    return SemanticSearchResponse(
        results=[SemanticSearchResult(**r) for r in results],
        query=data.query,
        total=len(results),
    )


class BackfillResponse(BaseModel):
    processed: int
    failed: int
    remaining: int
    message: str


@router.post("/search/backfill", response_model=BackfillResponse)
async def backfill_search_embeddings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate embeddings for all transactions that don't have one yet.
    Call this once after Phase 6 is deployed to make existing transactions searchable.
    New transactions get embedded automatically on creation.
    Processes up to 50 transactions per call — call multiple times if needed.
    """
    result = await backfill_embeddings(db, current_user.id, batch_size=50)
    message = (
        f"Processed {result['processed']} transactions. "
        f"{result['remaining']} remaining — call again if needed."
        if result['remaining'] > 0
        else f"All transactions are now searchable. Processed {result['processed']}."
    )
    return BackfillResponse(**result, message=message)


# ============================================================
# Phase 6B — Recurring Expense Detection
# ============================================================

class RecurringPattern(BaseModel):
    merchant: str
    period: str
    occurrences: int
    avg_amount: float
    transaction_ids: List[str]
    next_expected: str


class RecurringResponse(BaseModel):
    patterns: List[RecurringPattern]
    total: int
    message: str


@router.get("/recurring", response_model=RecurringResponse)
async def get_recurring_transactions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Detect recurring expense patterns (subscriptions, rent, bills).
    Automatically marks matched transactions as is_recurring=True.
    Returns each pattern with its detected period and next expected date.
    """
    patterns = await detect_recurring_transactions(db, current_user.id)

    message = (
        f"Found {len(patterns)} recurring patterns in your transactions."
        if patterns
        else "No recurring patterns detected yet. Add more transactions over time."
    )

    return RecurringResponse(
        patterns=[RecurringPattern(**p) for p in patterns],
        total=len(patterns),
        message=message,
    )


# ============================================================
# Phase 6C — Anomaly Detection
# ============================================================

class AnomalyTransaction(BaseModel):
    transaction_id: str
    description: str
    amount: float
    date: str
    category: str
    anomaly_score: float
    baseline_mean: float
    baseline_std: float
    explanation: str


class AnomalyResponse(BaseModel):
    anomalies: List[AnomalyTransaction]
    total: int
    days_analysed: int
    message: str


@router.get("/anomalies", response_model=AnomalyResponse)
async def get_anomalies(
    days: int = Query(default=30, ge=7, le=90, description="Days to scan (7–90)"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Detect unusually large transactions compared to your normal spending patterns.
    Uses statistical analysis (Z-score) per category.
    Requires at least 3 months of transaction history for accurate results.
    """
    anomalies = await detect_anomalies(db, current_user.id, days_back=days)

    message = (
        f"Found {len(anomalies)} unusual transactions in the last {days} days."
        if anomalies
        else f"No anomalies detected in the last {days} days. Your spending looks normal!"
    )

    return AnomalyResponse(
        anomalies=[AnomalyTransaction(**a) for a in anomalies],
        total=len(anomalies),
        days_analysed=days,
        message=message,
    )
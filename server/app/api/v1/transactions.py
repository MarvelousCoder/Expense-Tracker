# app/api/v1/transactions.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction,TransactionType
from app.models.category import Category as CategoryModel
from typing import Optional
from uuid import UUID
from datetime import date
import csv
import io
from sqlalchemy import select, func, extract, case

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate, TransactionUpdate,
    TransactionResponse, TransactionListResponse, DashboardSummary
)
from app.repositories.transaction_repository import TransactionRepository
import math

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    data: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = TransactionRepository(db)
    transaction = await repo.create(current_user.id, data)
    return _build_response(transaction)


@router.get("/dashboard", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = TransactionRepository(db)
    return await repo.get_dashboard_summary(current_user.id)


@router.get("", response_model=TransactionListResponse)
async def get_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    transaction_type: Optional[TransactionType] = None,
    account_id: Optional[UUID] = None,
    category_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = TransactionRepository(db)
    items, total = await repo.get_all(
        user_id=current_user.id,
        page=page,
        per_page=per_page,
        transaction_type=transaction_type,
        account_id=account_id,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )
    return TransactionListResponse(
        items=[_build_response(t) for t in items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if total > 0 else 0
    )


@router.get("/export/csv")
async def export_transactions_csv(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = TransactionRepository(db)
    items, _ = await repo.get_all(
        user_id=current_user.id,
        page=1,
        per_page=10000
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Date", "Description", "Type", "Amount",
        "Category", "Account", "Payment Method", "Notes"
    ])

    for t in items:
        writer.writerow([
            t.date,
            t.description,
            t.transaction_type.value,
            t.amount / 100,
            t.category.name if t.category else "",
            t.account.name if t.account else "",
            t.payment_method.value,
            t.notes or ""
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"}
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = TransactionRepository(db)
    transaction = await repo.get_by_id(transaction_id, current_user.id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return _build_response(transaction)



# @router.get("/analytics/summary")
# async def get_analytics_summary(
#     year: int = Query(default=None),
#     current_user: User = Depends(get_current_active_user),
#     db: AsyncSession = Depends(get_db)
# ):
#     from datetime import datetime
#     target_year = year or datetime.now().year

#     # Monthly breakdown for the year
#     result = await db.execute(
#         select(
#             extract("month", Transaction.date).label("month"),
#             Transaction.transaction_type,
#             func.sum(Transaction.amount).label("total")
#         )
#         .where(
#             Transaction.user_id == current_user.id,
#             Transaction.deleted_at.is_(None),
#             extract("year", Transaction.date) == target_year
#         )
#         .group_by("month", Transaction.transaction_type)
#         .order_by("month")
#     )
#     rows = result.all()

#     # Build monthly data
#     monthly = {}
#     for row in rows:
#         m = int(row.month)
#         if m not in monthly:
#             monthly[m] = {"month": m, "income": 0, "expense": 0}
#         if row.transaction_type == TransactionType.INCOME:
#             monthly[m]["income"] = row.total / 100
#         elif row.transaction_type == TransactionType.EXPENSE:
#             monthly[m]["expense"] = row.total / 100

#     # Category breakdown
#     cat_result = await db.execute(
#         select(
#             Transaction.category_id,
#             func.sum(Transaction.amount).label("total")
#         )
#         .where(
#             Transaction.user_id == current_user.id,
#             Transaction.deleted_at.is_(None),
#             Transaction.transaction_type == TransactionType.EXPENSE,
#             extract("year", Transaction.date) == target_year
#         )
#         .group_by(Transaction.category_id)
#         .order_by(func.sum(Transaction.amount).desc())
#         .limit(8)
#     )
#     cat_rows = cat_result.all()

#     # Fetch category names
#     from app.models.category import Category
#     categories_data = []
#     for row in cat_rows:
#         if row.category_id:
#             cat = await db.get(Category, row.category_id)
#             if cat:
#                 categories_data.append({
#                     "name": cat.name,
#                     "icon": cat.icon,
#                     "color": cat.color,
#                     "amount": row.total / 100,
#                 })
#         else:
#             categories_data.append({
#                 "name": "Uncategorized",
#                 "icon": "📦",
#                 "color": "#94A3B8",
#                 "amount": row.total / 100,
#             })

#     return {
#         "year": target_year,
#         "monthly": list(monthly.values()),
#         "categories": categories_data,
#     }

# NOTE: 2nd change
# @router.get("/analytics/summary")
# async def get_analytics_summary(
#     year: int = Query(default=None),
#     current_user: User = Depends(get_current_active_user),
#     db: AsyncSession = Depends(get_db)
# ):
#     from datetime import datetime as dt
#     from sqlalchemy import select, func, extract
#     from app.models.category import Category as CategoryModel

#     target_year = year or dt.now().year

#     # Monthly income vs expense breakdown
#     monthly_result = await db.execute(
#         select(
#             extract("month", Transaction.date).label("month"),
#             Transaction.transaction_type,
#             func.sum(Transaction.amount).label("total")
#         )
#         .where(
#             Transaction.user_id == current_user.id,
#             Transaction.deleted_at.is_(None),
#             extract("year", Transaction.date) == target_year
#         )
#         .group_by(
#             extract("month", Transaction.date),
#             Transaction.transaction_type
#         )
#         .order_by(extract("month", Transaction.date))
#     )
#     rows = monthly_result.all()

#     monthly = {}
#     for row in rows:
#         m = int(row.month)
#         if m not in monthly:
#             monthly[m] = {"month": m, "income": 0, "expense": 0}
#         if row.transaction_type == TransactionType.INCOME:
#             monthly[m]["income"] = (row.total or 0) / 100
#         elif row.transaction_type == TransactionType.EXPENSE:
#             monthly[m]["expense"] = (row.total or 0) / 100

#     # Category spending breakdown
#     cat_result = await db.execute(
#         select(
#             Transaction.category_id,
#             func.sum(Transaction.amount).label("total")
#         )
#         .where(
#             Transaction.user_id == current_user.id,
#             Transaction.deleted_at.is_(None),
#             Transaction.transaction_type == TransactionType.EXPENSE,
#             extract("year", Transaction.date) == target_year
#         )
#         .group_by(Transaction.category_id)
#         .order_by(func.sum(Transaction.amount).desc())
#         .limit(8)
#     )
#     cat_rows = cat_result.all()

#     categories_data = []
#     for row in cat_rows:
#         if row.category_id:
#             cat_result2 = await db.execute(
#                 select(CategoryModel).where(CategoryModel.id == row.category_id)
#             )
#             cat = cat_result2.scalar_one_or_none()
#             if cat:
#                 categories_data.append({
#                     "name": cat.name,
#                     "icon": cat.icon,
#                     "color": cat.color,
#                     "amount": (row.total or 0) / 100,
#                 })
#         else:
#             categories_data.append({
#                 "name": "Uncategorized",
#                 "icon": "📦",
#                 "color": "#94A3B8",
#                 "amount": (row.total or 0) / 100,
#             })

#     return {
#         "year": target_year,
#         "monthly": list(monthly.values()),
#         "categories": categories_data,
#     }

@router.get("/analytics/summary")
async def get_analytics_summary(
    year: int = Query(default=None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    from datetime import datetime as dt
    target_year = year or dt.now().year

    # Monthly income vs expense breakdown
    monthly_result = await db.execute(
        select(
            extract("month", Transaction.date).label("month"),
            Transaction.transaction_type,
            func.sum(Transaction.amount).label("total")
        )
        .where(
            Transaction.user_id == current_user.id,
            Transaction.deleted_at.is_(None),
            extract("year", Transaction.date) == target_year
        )
        .group_by(
            extract("month", Transaction.date),
            Transaction.transaction_type
        )
        .order_by(extract("month", Transaction.date))
    )
    rows = monthly_result.all()

    monthly = {}
    for row in rows:
        m = int(row.month)
        if m not in monthly:
            monthly[m] = {"month": m, "income": 0, "expense": 0}
        if row.transaction_type == TransactionType.INCOME:
            monthly[m]["income"] = (row.total or 0) / 100
        elif row.transaction_type == TransactionType.EXPENSE:
            monthly[m]["expense"] = (row.total or 0) / 100

    # Category spending breakdown
    cat_result = await db.execute(
        select(
            Transaction.category_id,
            func.sum(Transaction.amount).label("total")
        )
        .where(
            Transaction.user_id == current_user.id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE,
            extract("year", Transaction.date) == target_year
        )
        .group_by(Transaction.category_id)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(8)
    )
    cat_rows = cat_result.all()

    categories_data = []
    for row in cat_rows:
        if row.category_id:
            cat_fetch = await db.execute(
                select(CategoryModel).where(CategoryModel.id == row.category_id)
            )
            cat = cat_fetch.scalar_one_or_none()
            if cat:
                categories_data.append({
                    "name": cat.name,
                    "icon": cat.icon,
                    "color": cat.color,
                    "amount": (row.total or 0) / 100,
                })
        else:
            categories_data.append({
                "name": "Uncategorized",
                "icon": "📦",
                "color": "#94A3B8",
                "amount": (row.total or 0) / 100,
            })

    return {
        "year": target_year,
        "monthly": list(monthly.values()),
        "categories": categories_data,
    }

@router.patch("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: UUID,
    data: TransactionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = TransactionRepository(db)
    transaction = await repo.update(transaction_id, current_user.id, data)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return _build_response(transaction)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = TransactionRepository(db)
    deleted = await repo.soft_delete(transaction_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")


def _build_response(t) -> TransactionResponse:
    return TransactionResponse(
        id=t.id,
        user_id=t.user_id,
        account_id=t.account_id,
        amount=t.amount,
        amount_display=t.amount / 100,
        transaction_type=t.transaction_type,
        payment_method=t.payment_method,
        description=t.description,
        notes=t.notes,
        date=t.date,
        category_id=t.category_id,
        category_name=t.category.name if t.category else None,
        category_icon=t.category.icon if t.category else None,
        category_color=t.category.color if t.category else None,
        account_name=t.account.name if t.account else None,
        is_recurring=t.is_recurring,
        is_verified=t.is_verified,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )
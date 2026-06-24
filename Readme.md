# TrackWise — Personal Expense Tracker

A full-stack personal finance platform built with FastAPI, Next.js 15, and PostgreSQL. Features real-time budget tracking, AI-powered insights, receipt scanning via OCR, and a financial chat assistant.

Live Demo: https://expense-tracker-sigma-puce-84.vercel.app  
API Docs: https://expense-tracker-api-mvu7.onrender.com/docs

---

## Features

**Transactions**  
Add, edit, and delete transactions across income, expense, and transfer types. Account balances update atomically on every operation. Full search, filter by type, category, and date range, with pagination and CSV export.

**Budgets**  
Create budgets with monthly, weekly, or yearly periods. Spending is computed dynamically from live transaction data — no stale figures. Alert thresholds are configurable per budget. Duplicate budgets for the same category and period are prevented at the database level.

**Analytics**  
Dashboard summary showing balance, income, expenses, and monthly savings. Analytics page with income vs expense bar chart, spending by category donut chart, net savings trend line, and a category breakdown table with percentage bars. Transfer amounts are correctly counted as expenses across all figures.

**AI Layer**  
Smart categorization suggests categories and description completions as you type, powered by Groq LLaMA 3.3 70B. Receipt scanner extracts merchant, amount, date, and category from an uploaded photo and pre-fills the transaction form for review. Financial insights combine rule-based analysis with LLM-generated observations. A chat assistant answers natural language questions about spending and savings.

**Auth and Security**  
JWT authentication with access and refresh token rotation. bcrypt password hashing. Rate limiting on auth endpoints. Security headers middleware. Audit logging on all write operations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, ShadCN UI |
| State | React Query, Zustand |
| Backend | FastAPI, Python 3.12, async SQLAlchemy 2.0 |
| Database | PostgreSQL 16 with pgvector |
| Cache | Redis 7.2 |
| Migrations | Alembic |
| AI | Groq LLaMA 3.3 70B, Google Gemini (OCR) |
| Auth | JWT, bcrypt |
| Deployment | Vercel (frontend), Render (backend) |
| Dev | Docker Compose |

---

## Project Structure

```text
Expense Tracker/
├── client/
│   └── src/
│       ├── app/
│       │   ├── (auth)/             # Login, Register
│       │   └── (dashboard)/        # Dashboard, Transactions, Budgets, Analytics, AI Insights
│       ├── components/
│       │   ├── forms/              # Add and Edit transaction modals
│       │   └── ui/                 # ShadCN components
│       ├── hooks/                  # React Query data hooks
│       ├── services/               # API service layer
│       └── store/                  # Zustand auth store
└── server/
    ├── app/
    │   ├── ai/                     # Categorizer, OCR, Insights, Chat, Embeddings, Semantic search
    │   ├── api/v1/                 # Route handlers
    │   ├── core/                   # Config, cache, auth, security
    │   ├── models/                 # SQLAlchemy models
    │   ├── repositories/           # Data access layer
    │   └── schemas/                # Pydantic v2 schemas
    └── alembic/                    # Database migrations

---
```
## Getting Started

### Prerequisites

- Docker Desktop
- Node.js 18 or later
- Python 3.12

### 1. Clone the repository

```bash
git clone https://github.com/MarvelousCoder/Expense-Tracker.git
cd Expense-Tracker
```

### 2. Start Docker services

```bash
docker compose up -d
```

This starts PostgreSQL on port 5433 and Redis on port 6379.

### 3. Backend setup

```bash
cd server
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create server/.env:

```env
POSTGRES_USER=expense_user
POSTGRES_PASSWORD=expenseT2004
POSTGRES_DB=expense_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
DATABASE_URL=postgresql+asyncpg://expense_user:expenseT2004@localhost:5433/expense_db

REDIS_URL=redis://localhost:6379

SECRET_KEY=your_secret_key_minimum_32_characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

ENVIRONMENT=development
BACKEND_URL=http://localhost:8000

GROQ_API_KEY=your_groq_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

Run migrations and start the server:

```bash
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend setup

```bash
cd client
npm install
```

Create client/.env.local:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

---

## API Reference

Full interactive documentation is available at the API docs link above.

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/register | Register a new user |
| POST | /api/v1/auth/login | Login and receive JWT tokens |
| POST | /api/v1/auth/refresh | Refresh access token |
| GET | /api/v1/transactions | List transactions with filters and pagination |
| POST | /api/v1/transactions | Create a transaction |
| PATCH | /api/v1/transactions/{id} | Edit a transaction |
| DELETE | /api/v1/transactions/{id} | Soft delete a transaction |
| GET | /api/v1/transactions/dashboard | Dashboard summary figures |
| GET | /api/v1/transactions/analytics/summary | Yearly analytics breakdown |
| GET | /api/v1/transactions/export/csv | Export all transactions as CSV |
| GET | /api/v1/budgets | List budgets with live spending figures |
| POST | /api/v1/budgets | Create a budget |
| PATCH | /api/v1/budgets/{id} | Edit a budget |
| DELETE | /api/v1/budgets/{id} | Delete a budget |
| POST | /api/v1/ai/categorize | Suggest a category for a transaction |
| POST | /api/v1/ai/ocr/receipt | Extract data from a receipt image |
| GET | /api/v1/ai/insights | Generate financial insights |
| POST | /api/v1/ai/chat | Chat with the financial assistant |

---

## Deployment

### Frontend

Deployed on Vercel. Automatically redeploys on every push to main.

### Backend

Deployed on Render. The start command runs pending migrations before the server accepts traffic:
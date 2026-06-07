from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.core.exceptions import register_exception_handlers
from app.api.v1.users import router as users_router
from app.utils.seed import seed_default_categories
from app.core.database import AsyncSessionLocal

from app.api.v1.accounts import router as accounts_router
from app.api.v1.categories import router as categories_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.budgets import router as budgets_router

# ================================
# Logging Setup
# ================================
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s"
)
logger = logging.getLogger(__name__)


# ================================
# Lifespan — startup + shutdown
# ================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Seed default categories on startup
    async with AsyncSessionLocal() as db:
        await seed_default_categories(db)
    
    yield
    # Shutdown
    logger.info("Shutting down — closing DB connections")
    await engine.dispose()


# ================================
# App Instance
# ================================
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Expense Tracker Platform",
    docs_url="/docs",          # Swagger UI
    redoc_url="/redoc",        # ReDoc UI
    lifespan=lifespan
)

# ================================
# Exception Handlers
# ================================
register_exception_handlers(app)

# ================================
# Middleware
# ================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================================
# Routers
# ================================
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(accounts_router, prefix="/api/v1")
app.include_router(categories_router, prefix="/api/v1")
app.include_router(transactions_router, prefix="/api/v1")
app.include_router(budgets_router, prefix="/api/v1")

# ================================
# Root
# ================================
@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health"
    }
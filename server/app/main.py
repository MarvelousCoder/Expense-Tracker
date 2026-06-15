# from venv import logger

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.middleware.trustedhost import TrustedHostMiddleware
# from contextlib import asynccontextmanager
# import logging.config

# from app.core.config import settings
# from app.core.database import engine, Base
# from app.api.v1.health import router as health_router
# from app.api.v1.auth import router as auth_router
# from app.core.exceptions import register_exception_handlers
# from app.api.v1.users import router as users_router
# from app.utils.seed import seed_default_categories
# from app.core.database import AsyncSessionLocal

# from app.api.v1.accounts import router as accounts_router
# from app.api.v1.categories import router as categories_router
# from app.api.v1.transactions import router as transactions_router
# from app.api.v1.budgets import router as budgets_router
# from app.api.v1.ai import router as ai_router

# from slowapi import Limiter, _rate_limit_exceeded_handler
# from slowapi.errors import RateLimitExceeded
# from slowapi.middleware import SlowAPIMiddleware
# from app.core.rate_limit import limiter
# from app.core.security_headers import SecurityHeadersMiddleware

# # ================================
# # Logging Setup
# # ================================
# # logging.basicConfig(
# #     level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
# #     format="%(asctime)s — %(name)s — %(levelname)s — %(message)s"
# # )
# # logger = logging.getLogger(__name__)


# LOGGING_CONFIG = {
#     "version": 1,
#     "disable_existing_loggers": False,
#     "formatters": {
#         "standard": {
#             "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
#         },
#         "audit": {
#             "format": "%(asctime)s [AUDIT] %(message)s"
#         }
#     },
#     "handlers": {
#         "console": {
#             "class": "logging.StreamHandler",
#             "formatter": "standard",
#             "level": "DEBUG",
#         },
#         "audit_file": {
#             "class": "logging.FileHandler",
#             "filename": "audit.log",
#             "formatter": "audit",
#             "level": "INFO",
#         }
#     },
#     "loggers": {
#         "audit": {
#             "handlers": ["console", "audit_file"],
#             "level": "INFO",
#             "propagate": False
#         },
#         "app": {
#             "handlers": ["console"],
#             "level": "DEBUG" if settings.ENVIRONMENT == "development" else "INFO",
#             "propagate": False
#         }
#     },
#     "root": {
#         "handlers": ["console"],
#         "level": "INFO"
#     }
# }

# # Apply at startup — replace existing basicConfig call
# logging.config.dictConfig(LOGGING_CONFIG)


# # ================================
# # Lifespan — startup + shutdown
# # ================================
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup
#     logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
#     logger.info(f"Environment: {settings.ENVIRONMENT}")

#     # Seed default categories on startup
#     async with AsyncSessionLocal() as db:
#         await seed_default_categories(db)
    
#     yield
#     # Shutdown
#     logger.info("Shutting down — closing DB connections")
#     await engine.dispose()


# # ================================
# # App Instance
# # ================================
# app = FastAPI(
#     title=settings.APP_NAME,
#     version=settings.APP_VERSION,
#     description="AI-powered Expense Tracker Platform",
#     docs_url="/docs",          # Swagger UI
#     redoc_url="/redoc",        # ReDoc UI
#     lifespan=lifespan
# )


# # ================================
# # Rate Limit Handlers
# # ================================
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# app.add_middleware(SlowAPIMiddleware)

# # ================================
# # Exception Handlers
# # ================================
# register_exception_handlers(app)

# # ================================
# # Middleware
# # ================================
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.ALLOWED_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.add_middleware(SecurityHeadersMiddleware)


# # ================================
# # Routers
# # ================================
# app.include_router(health_router, prefix="/api/v1")
# app.include_router(auth_router, prefix="/api/v1")
# app.include_router(users_router, prefix="/api/v1")
# app.include_router(accounts_router, prefix="/api/v1")
# app.include_router(categories_router, prefix="/api/v1")
# app.include_router(transactions_router, prefix="/api/v1")
# app.include_router(budgets_router, prefix="/api/v1")
# app.include_router(ai_router, prefix="/api/v1")

# # ================================
# # Root
# # ================================
# @app.get("/")
# async def root():
#     return {
#         "message": f"Welcome to {settings.APP_NAME} API",
#         "version": settings.APP_VERSION,
#         "docs": "/docs",
#         "health": "/api/v1/health"
#     }

# app/main.py

import logging
import logging.config
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.database import engine, AsyncSessionLocal
from app.core.exceptions import register_exception_handlers
from app.core.rate_limit import limiter
from app.core.security_headers import SecurityHeadersMiddleware
from app.utils.seed import seed_default_categories

from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.accounts import router as accounts_router
from app.api.v1.categories import router as categories_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.budgets import router as budgets_router
from app.api.v1.ai import router as ai_router


# ================================
# Logging Setup
# ================================
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        },
        "audit": {
            "format": "%(asctime)s [AUDIT] %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "level": "DEBUG",
        },
        "audit_file": {
            "class": "logging.FileHandler",
            "filename": "audit.log",
            "formatter": "audit",
            "level": "INFO",
        }
    },
    "loggers": {
        "audit": {
            "handlers": ["console", "audit_file"],
            "level": "INFO",
            "propagate": False
        },
        "app": {
            "handlers": ["console"],
            "level": "DEBUG" if settings.ENVIRONMENT == "development" else "INFO",
            "propagate": False
        }
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO"
    }
}

logging.config.dictConfig(LOGGING_CONFIG)

# Get logger AFTER dictConfig is applied
logger = logging.getLogger(__name__)


# ================================
# Lifespan — startup + shutdown
# ================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

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
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# ================================
# Rate Limit Handlers
# ================================
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ================================
# Exception Handlers
# ================================
register_exception_handlers(app)

# ================================
# Middleware
# ================================
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.ALLOWED_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow all Vercel preview URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecurityHeadersMiddleware)


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
app.include_router(ai_router, prefix="/api/v1")


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
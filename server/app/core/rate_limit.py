# app/core/rate_limit.py

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

# Create limiter instance
# Uses client IP as identifier
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"],  # global default
)


def get_user_id_or_ip(request: Request) -> str:
    """
    Use user ID for authenticated requests, IP for unauthenticated.
    This way legitimate users get higher limits than anonymous scrapers.
    """
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth.split(" ")[1]
        # Use first 16 chars of token as key (avoid storing full token)
        return f"user_{token[:16]}"
    return get_remote_address(request)


# Specific limiters for sensitive endpoints
auth_limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["10/minute"],   # strict for auth endpoints
)

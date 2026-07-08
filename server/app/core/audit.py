# app/core/audit.py

import logging
from datetime import datetime, timezone

from fastapi import Request

audit_logger = logging.getLogger("audit")


def log_action(
    action: str,
    user_id: str,
    resource: str,
    resource_id: str = None,
    details: dict = None,
    request: Request = None,
):
    """
    Log security-relevant actions for audit trail.
    These logs are separate from app logs.
    """
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "user_id": user_id,
        "resource": resource,
        "resource_id": resource_id,
        "details": details or {},
        "ip": request.client.host if request else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown") if request else "unknown",
    }
    audit_logger.info(entry)

# # app/core/email.py

# import logging
# import smtplib
# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText

# from app.core.config import settings

# logger = logging.getLogger(__name__)


# def _send_email_sync(to_email: str, subject: str, html_body: str) -> None:
#     """Blocking SMTP send. Called via BackgroundTasks so it never blocks a request."""
#     msg = MIMEMultipart("alternative")
#     msg["Subject"] = subject
#     msg["From"] = settings.EMAILS_FROM_EMAIL
#     msg["To"] = to_email
#     msg.attach(MIMEText(html_body, "html"))

#     with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
#         server.starttls()
#         if settings.SMTP_USER and settings.SMTP_PASSWORD:
#             server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
#         server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], msg.as_string())


# def send_password_reset_email(to_email: str, full_name: str, token: str) -> None:
#     reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
#     subject = "Reset your TrackWise password"
#     html_body = f"""
#     <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
#       <h2>Hi {full_name},</h2>
#       <p>We received a request to reset your TrackWise password. Click the button
#       below to set a new one. This link expires in
#       {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
#       <p style="text-align:center; margin: 24px 0;">
#         <a href="{reset_link}"
#            style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;
#                   text-decoration:none;display:inline-block;">
#           Reset Password
#         </a>
#       </p>
#       <p>If you didn't request this, you can safely ignore this email — your
#       password will stay the same.</p>
#       <p style="color:#888; font-size: 12px;">{reset_link}</p>
#     </div>
#     """
#     try:
#         _send_email_sync(to_email, subject, html_body)
#     except Exception as e:
#         logger.error(f"Failed to send password reset email to {to_email}: {e}")



import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


async def send_password_reset_email(to_email: str, full_name: str, token: str) -> None:
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"
    subject = "Reset your TrackWise password"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>Hi {full_name},</h2>
      <p>We received a request to reset your TrackWise password. Click the button
      below to set a new one. This link expires in
      {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
      <p style="text-align:center; margin: 24px 0;">
        <a href="{reset_link}"
           style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;
                  text-decoration:none;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p>If you didn't request this, you can safely ignore this email — your
      password will stay the same.</p>
      <p style="color:#888; font-size: 12px;">{reset_link}</p>
    </div>
    """

    payload = {
        "sender": {
            "name": settings.EMAILS_FROM_NAME,
            "email": settings.EMAILS_FROM_EMAIL,
        },
        "to": [{"email": to_email, "name": full_name}],
        "subject": subject,
        "htmlContent": html_body,
    }
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(BREVO_API_URL, json=payload, headers=headers)
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        logger.error(
            f"Brevo rejected password reset email to {to_email}: "
            f"{e.response.status_code} {e.response.text}"
        )
    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}: {e}")

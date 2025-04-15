from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from app.core.config import settings
from app.auth.utils import create_access_token
from datetime import datetime, timedelta

async def send_email(to_email: str, subject: str, body: str) -> None:
    """
    Send email using SMTP
    """
    message = MIMEMultipart()
    message["From"] = settings.EMAILS_FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "html"))

    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        use_tls=settings.SMTP_TLS
    )

async def send_verification_email(email: str) -> None:
    """
    Send email verification link
    """
    # Create verification token
    verification_token = create_access_token(
        data={"sub": email},
        expires_delta=timedelta(hours=24)
    )

    # Create verification URL
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"

    # Email content
    subject = "Verify your email"
    body = f"""
    <html>
        <body>
            <h2>Email Verification</h2>
            <p>Please click the link below to verify your email:</p>
            <p><a href="{verification_url}">Verify Email</a></p>
            <p>If you did not request this verification, please ignore this email.</p>
        </body>
    </html>
    """

    await send_email(email, subject, body)

async def send_password_reset_email(email: str, reset_token: str) -> None:
    """
    Send password reset link
    """
    # Create reset URL
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    # Email content
    subject = "Password Reset Request"
    body = f"""
    <html>
        <body>
            <h2>Password Reset</h2>
            <p>You have requested to reset your password. Click the link below to proceed:</p>
            <p><a href="{reset_url}">Reset Password</a></p>
            <p>This link will expire in 15 minutes.</p>
            <p>If you did not request this reset, please ignore this email.</p>
        </body>
    </html>
    """

    await send_email(email, subject, body) 
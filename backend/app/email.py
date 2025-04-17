from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
from typing import List
import json

conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.EMAILS_FROM_EMAIL,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_ticket_email(email: str, name: str, event_title: str, tickets: List[dict]):
    """
    Send email with ticket details to the user
    """
    # Format ticket details for email
    ticket_details = []
    for ticket in tickets:
        ticket_details.append(f"""
        Ticket Type: {ticket['ticket_type_name']}
        Quantity: {ticket['quantity']}
        Total Price: ${ticket['total_price']}
        """)

    message = MessageSchema(
        subject=f"Your Tickets for {event_title}",
        recipients=[email],
        body=f"""
        Dear {name},

        Thank you for your purchase! Here are your ticket details for {event_title}:

        {''.join(ticket_details)}

        You can also view and download your tickets by visiting the "My Tickets" section on our website.

        Best regards,
        {settings.EMAILS_FROM_NAME}
        """,
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message) 
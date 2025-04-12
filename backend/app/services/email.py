from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from typing import Optional
from app.core.config import settings
from app.events.models import Event
from app.tickets.models import TicketModel

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"  # Gmail SMTP server
        self.smtp_port = 587  # Gmail TLS port
        self.smtp_username = settings.EMAIL_HOST_USER
        self.smtp_password = settings.EMAIL_HOST_PASSWORD
        self.sender_email = settings.EMAIL_HOST_USER  # Using the same email as username
        self.use_tls = True  # Always use TLS for Gmail

    async def send_email(
        self,
        recipient_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """
        Send an email to the specified recipient
        """
        try:
            # Create message
            message = MIMEMultipart('alternative')
            message['From'] = self.sender_email
            message['To'] = recipient_email
            message['Subject'] = subject

            # Add text and HTML parts
            message.attach(MIMEText(body, 'plain'))
            if html_body:
                message.attach(MIMEText(html_body, 'html'))

            # Connect to SMTP server
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Always use TLS for Gmail
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(message)

            return True
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

    async def send_ticket_confirmation(
        self,
        ticket: TicketModel,
        event: Event,
        recipient_email: str
    ) -> bool:
        """
        Send ticket confirmation email
        """
        subject = f"Your Ticket Confirmation - {event.title}"
        
        # Text version
        text_body = f"""
        Thank you for your purchase!
        
        Event: {event.title}
        Date: {event.start_date.strftime('%B %d, %Y')}
        Venue: {event.venue}
        
        Ticket Details:
        - Type: {ticket.ticket_type_name}
        - Quantity: {ticket.quantity}
        - Total Price: ${ticket.total_price:.2f}
        
        Your ticket QR code will be sent in a separate email.
        
        Thank you for choosing our service!
        """
        
        # HTML version
        html_body = f"""
        <html>
            <body>
                <h2>Thank you for your purchase!</h2>
                <p>
                    <strong>Event:</strong> {event.title}<br>
                    <strong>Date:</strong> {event.start_date.strftime('%B %d, %Y')}<br>
                    <strong>Venue:</strong> {event.venue}
                </p>
                <h3>Ticket Details:</h3>
                <ul>
                    <li>Type: {ticket.ticket_type_name}</li>
                    <li>Quantity: {ticket.quantity}</li>
                    <li>Total Price: ${ticket.total_price:.2f}</li>
                </ul>
                <p>Your ticket QR code will be sent in a separate email.</p>
                <p>Thank you for choosing our service!</p>
            </body>
        </html>
        """
        
        return await self.send_email(recipient_email, subject, text_body, html_body)

    async def send_ticket_qr_code(
        self,
        ticket: TicketModel,
        event: Event,
        qr_code_url: str,
        recipient_email: str
    ) -> bool:
        """
        Send ticket QR code email
        """
        subject = f"Your Ticket QR Code - {event.title}"
        
        # Text version
        text_body = f"""
        Your ticket QR code is ready!
        
        Event: {event.title}
        Date: {event.start_date.strftime('%B %d, %Y')}
        Venue: {event.venue}
        
        Please find your QR code below:
        {qr_code_url}
        
        This QR code will be scanned at the event entrance.
        Please keep it safe and ready to present.
        """
        
        # HTML version
        html_body = f"""
        <html>
            <body>
                <h2>Your ticket QR code is ready!</h2>
                <p>
                    <strong>Event:</strong> {event.title}<br>
                    <strong>Date:</strong> {event.start_date.strftime('%B %d, %Y')}<br>
                    <strong>Venue:</strong> {event.venue}
                </p>
                <p>Please find your QR code below:</p>
                <img src="{qr_code_url}" alt="Ticket QR Code" style="max-width: 200px;">
                <p>
                    This QR code will be scanned at the event entrance.<br>
                    Please keep it safe and ready to present.
                </p>
            </body>
        </html>
        """
        
        return await self.send_email(recipient_email, subject, text_body, html_body)

    async def send_password_reset(
        self,
        recipient_email: str,
        reset_token: str
    ) -> bool:
        """
        Send password reset email
        """
        subject = "Password Reset Request"
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        # Text version
        text_body = f"""
        You have requested to reset your password.
        
        Please click the following link to reset your password:
        {reset_url}
        
        If you did not request this, please ignore this email.
        This link will expire in 1 hour.
        """
        
        # HTML version
        html_body = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password.</p>
                <p>
                    Please click the following link to reset your password:<br>
                    <a href="{reset_url}">Reset Password</a>
                </p>
                <p>
                    If you did not request this, please ignore this email.<br>
                    This link will expire in 1 hour.
                </p>
            </body>
        </html>
        """
        
        return await self.send_email(recipient_email, subject, text_body, html_body)

    async def send_email_verification(
        self,
        recipient_email: str,
        verification_token: str
    ) -> bool:
        """
        Send email verification
        """
        subject = "Verify Your Email Address"
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        
        # Text version
        text_body = f"""
        Thank you for registering!
        
        Please click the following link to verify your email address:
        {verification_url}
        
        If you did not create an account, please ignore this email.
        """
        
        # HTML version
        html_body = f"""
        <html>
            <body>
                <h2>Verify Your Email Address</h2>
                <p>Thank you for registering!</p>
                <p>
                    Please click the following link to verify your email address:<br>
                    <a href="{verification_url}">Verify Email</a>
                </p>
                <p>
                    If you did not create an account, please ignore this email.
                </p>
            </body>
        </html>
        """
        
        return await self.send_email(recipient_email, subject, text_body, html_body) 
from twilio.rest import Client
from fastapi import HTTPException, status
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class TwilioService:
    def __init__(self):
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self.phone_number = settings.TWILIO_PHONE_NUMBER

    async def send_sms(self, to_number: str, message: str) -> bool:
        """
        Send an SMS message using Twilio
        
        Args:
            to_number (str): The recipient's phone number
            message (str): The message to send
            
        Returns:
            bool: True if message was sent successfully, False otherwise
        """
        try:
            # Format the phone number
            if not to_number.startswith('+'):
                # Remove any non-digit characters
                to_number = ''.join(filter(str.isdigit, to_number))
                # Add country code if not present (assuming Kenya)
                if not to_number.startswith('254'):
                    to_number = '254' + to_number.lstrip('0')
                to_number = '+' + to_number
            
            # Send the message
            message = self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_number
            )
            
            logger.info(f"SMS sent successfully to {to_number}. Message SID: {message.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send SMS: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send SMS notification"
            )

    async def send_ticket_confirmation(
        self,
        to_number: str,
        event_title: str,
        ticket_id: str,
        qr_code_url: str = None
    ) -> bool:
        """
        Send a ticket confirmation SMS with QR code information
        """
        try:
            # Create a shorter message
            message = (
                f"Ticket Confirmed: {event_title}\n"
                f"ID: {ticket_id}\n"
                "Check email for QR code"
            )
            
            # Only add QR code URL if it's short enough
            if qr_code_url and len(message) + len(qr_code_url) < 1500:
                message += f"\nQR: {qr_code_url}"
            
            return await self.send_sms(to_number, message)
            
        except Exception as e:
            logger.error(f"Failed to send ticket confirmation SMS: {str(e)}")
            return False

    async def send_payment_confirmation(self, to_number: str, event_title: str, amount: float) -> bool:
        """
        Send a payment confirmation SMS
        
        Args:
            to_number (str): The recipient's phone number
            event_title (str): The title of the event
            amount (float): The amount paid
            
        Returns:
            bool: True if message was sent successfully
        """
        message = (
            f"Payment confirmed for {event_title}!\n"
            f"Amount: ${amount:.2f}\n"
            f"Thank you for your purchase!"
        )
        return await self.send_sms(to_number, message) 
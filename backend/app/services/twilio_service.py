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
            # Format the phone number if needed
            if not to_number.startswith('+'):
                to_number = f'+{to_number}'
            
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

    async def send_ticket_confirmation(self, to_number: str, event_title: str, ticket_id: str) -> bool:
        """
        Send a ticket confirmation SMS
        
        Args:
            to_number (str): The recipient's phone number
            event_title (str): The title of the event
            ticket_id (str): The ticket ID
            
        Returns:
            bool: True if message was sent successfully
        """
        message = (
            f"Your ticket for {event_title} has been confirmed!\n"
            f"Ticket ID: {ticket_id}\n"
            f"Thank you for your purchase!"
        )
        return await self.send_sms(to_number, message)

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
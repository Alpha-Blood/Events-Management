import qrcode
import io
import base64
import hmac
import hashlib
import time
from app.core.config import settings
from typing import Dict
from PIL import Image

class QRService:
    def __init__(self):
        self.secret_key = settings.JWT_SECRET_KEY

    def generate_signature(self, data: str) -> str:
        """
        Generate HMAC signature for the data
        """
        return hmac.new(
            self.secret_key.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()

    def generate_qr_code(self, ticket_id: str, event_id: str) -> str:
        """
        Generate QR code for a ticket
        """
        try:
            # Prepare data for QR code
            data = {
                "ticket_id": ticket_id,
                "event_id": event_id,
                "timestamp": str(int(time.time()))
            }
            
            # Convert data to string and add signature
            data_str = f"{data['ticket_id']}:{data['event_id']}:{data['timestamp']}"
            signature = self.generate_signature(data_str)
            data_str = f"{data_str}:{signature}"
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(data_str)
            qr.make(fit=True)
            
            # Create QR code image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
        except Exception as e:
            print(f"Error generating QR code: {str(e)}")
            raise

    def validate_qr_code(self, data: str, signature: str) -> bool:
        """
        Validate QR code data
        """
        expected_signature = self.generate_signature(data)
        return hmac.compare_digest(signature, expected_signature) 
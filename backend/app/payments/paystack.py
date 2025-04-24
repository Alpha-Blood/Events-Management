import httpx
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

class PaystackService:
    def __init__(self):
        self.base_url = "https://api.paystack.co"
        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }

    async def initialize_transaction(
        self,
        email: str,
        amount: float,
        reference: str,
        callback_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Initialize a payment transaction
        """
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "email": email,
                    "amount": int(amount * 100),  # Convert to kobo/pesewas
                    "reference": reference,
                    "callback_url": callback_url,
                    "metadata": metadata or {}
                }
                
                response = await client.post(
                    f"{self.base_url}/transaction/initialize",
                    headers=self.headers,
                    json=payload
                )
                
                response_data = response.json()
                
                if response.status_code != 200:
                    error_message = response_data.get("message", "Failed to initialize transaction")
                    logger.error(f"Paystack initialization failed: {error_message}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=error_message
                    )
                
                if not response_data.get("status"):
                    error_message = response_data.get("message", "Transaction initialization failed")
                    logger.error(f"Paystack initialization failed: {error_message}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=error_message
                    )
                
                return response_data
        except httpx.RequestError as e:
            logger.error(f"Network error while initializing Paystack transaction: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment service is currently unavailable. Please try again later."
            )
        except Exception as e:
            logger.error(f"Error initializing Paystack transaction: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while processing your payment. Please try again."
            )

    async def verify_transaction(self, reference: str) -> Dict[str, Any]:
        """
        Verify a transaction status
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/transaction/verify/{reference}",
                    headers=self.headers
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to verify transaction"
                    )
                
                return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    async def initialize_mpesa(
        self,
        email: str,
        amount: float,
        reference: str,
        phone: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Initialize M-Pesa payment
        """
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "email": email,
                    "amount": int(amount * 100),  # Convert to kobo/pesewas
                    "reference": reference,
                    "mobile_money": {
                        "phone": phone,
                        "provider": "mpesa"
                    },
                    "metadata": metadata or {}
                }
                
                response = await client.post(
                    f"{self.base_url}/charge",
                    headers=self.headers,
                    json=payload
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to initialize M-Pesa payment"
                    )
                
                return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    async def check_mpesa_status(self, reference: str) -> Dict[str, Any]:
        """
        Check M-Pesa payment status
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/charge/{reference}",
                    headers=self.headers
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to check M-Pesa status"
                    )
                
                return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    async def initialize_mobile_money(
        self,
        email: str,
        amount: float,
        reference: str,
        phone: str,
        provider: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Initialize a mobile money payment
        """
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "email": email,
                    "amount": int(amount * 100),  # Convert to kobo/pesewas
                    "reference": reference,
                    "mobile_money": {
                        "phone": phone,
                        "provider": provider
                    },
                    "metadata": metadata or {}
                }
                
                response = await client.post(
                    f"{self.base_url}/charge",
                    headers=self.headers,
                    json=payload
                )
                
                response_data = response.json()
                
                if response.status_code != 200:
                    error_message = response_data.get("message", "Failed to initialize mobile money payment")
                    logger.error(f"Paystack mobile money initialization failed: {error_message}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=error_message
                    )
                
                if not response_data.get("status"):
                    error_message = response_data.get("message", "Mobile money payment initialization failed")
                    logger.error(f"Paystack mobile money initialization failed: {error_message}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=error_message
                    )
                
                return response_data
        except httpx.RequestError as e:
            logger.error(f"Network error while initializing mobile money payment: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment service is currently unavailable. Please try again later."
            )
        except Exception as e:
            logger.error(f"Error initializing mobile money payment: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while processing your payment. Please try again."
            )

    async def verify_mobile_money(self, reference: str) -> Dict[str, Any]:
        """
        Verify a mobile money payment
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/transaction/verify/{reference}",
                    headers=self.headers
                )
                
                if response.status_code != 200:
                    error_data = response.json()
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=error_data.get("message", "Failed to verify mobile money payment")
                    )
                
                return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            ) 
import httpx
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from ..core.config import settings

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
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to initialize transaction"
                    )
                
                return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
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
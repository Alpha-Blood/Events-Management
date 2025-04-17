from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

class PaymentMethod(str, Enum):
    PAYSTACK = "paystack"
    MPESA = "mpesa"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class PaymentCreate(BaseModel):
    event_id: str
    amount: float
    email: str
    name: str
    phone: str
    callback_url: str
    payment_method: PaymentMethod = PaymentMethod.PAYSTACK

class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    payment_details: Optional[Dict[str, Any]] = None

class Payment(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    event_id: str
    amount: float
    status: PaymentStatus
    payment_method: PaymentMethod
    payment_details: Dict[str, Any]
    paystack_reference: Optional[str] = None
    paystack_authorization_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        } 
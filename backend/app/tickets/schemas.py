# app/schemas/ticket.py
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, validator
from enum import Enum

class TicketStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    CARD = "card"
    MPESA = "mpesa"
    PAYPAL = "paypal"

class TicketBase(BaseModel):
    event_id: str = Field(..., min_length=1)
    ticket_type_name: str = Field(..., min_length=1)
    quantity: int = Field(..., gt=0)
    buyer_name: str = Field(..., min_length=1, max_length=200)
    buyer_email: EmailStr
    buyer_phone: Optional[str] = None
    payment_method: PaymentMethod
    total_amount: float = Field(..., gt=0)

    @validator('total_amount')
    def validate_total_amount(cls, v, values):
        if 'quantity' in values and v <= 0:
            raise ValueError('total_amount must be greater than 0')
        return v

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    payment_status: Optional[str] = None
    payment_reference: Optional[str] = None
    notes: Optional[str] = None

class TicketInDB(TicketBase):
    id: str
    status: TicketStatus = TicketStatus.PENDING
    payment_status: Optional[str] = None
    payment_reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    qr_code_url: Optional[str] = None

class Ticket(TicketInDB):
    pass

class TicketResponse(BaseModel):
    tickets: List[Ticket]
    total: int
    page: int
    size: int

# Database indexes
TICKET_INDEXES = [
    [("event_id", 1)],
    [("buyer_email", 1)],
    [("status", 1)],
    [("created_at", -1)],
    [("payment_reference", 1)],
    {
        "keys": [("buyer_name", "text"), ("buyer_email", "text")],
        "weights": {"buyer_name": 10, "buyer_email": 5}
    }
]

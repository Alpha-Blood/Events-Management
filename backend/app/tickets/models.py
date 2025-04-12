from pydantic import BaseModel, Field
from typing import List, Optional, Tuple
from datetime import datetime
from enum import Enum
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from .schemas import (
    TicketCreate, TicketUpdate, TicketInDB, Ticket,
    TicketStatus, PaymentMethod, TICKET_INDEXES
)
from app.core.utils.objectid import PyObjectId

class TicketStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"
    USED = "used"

class TicketBase(BaseModel):
    event_id: str
    ticket_type_name: str
    quantity: int
    total_price: float
    buyer_name: str
    buyer_email: str
    buyer_phone: Optional[str] = None
    status: TicketStatus = TicketStatus.PENDING

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    buyer_name: Optional[str] = None
    buyer_email: Optional[str] = None
    buyer_phone: Optional[str] = None

class TicketInDB(TicketBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    qr_code_url: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class Ticket(TicketInDB):
    pass

class TicketResponse(BaseModel):
    tickets: List[Ticket]
    total: int
    page: int
    size: int

class TicketModel:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.tickets
        self._ensure_indexes()

    async def _ensure_indexes(self):
        """Create necessary indexes for the tickets collection"""
        for index in TICKET_INDEXES:
            if isinstance(index, dict):
                # Text index
                await self.collection.create_index(
                    index["keys"],
                    weights=index["weights"]
                )
            else:
                # Regular index
                await self.collection.create_index(index)

    async def create(self, ticket: TicketCreate) -> TicketInDB:
        """Create a new ticket"""
        ticket_dict = ticket.dict()
        ticket_dict["status"] = TicketStatus.PENDING
        ticket_dict["created_at"] = ticket_dict["updated_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(ticket_dict)
        ticket_dict["id"] = str(result.inserted_id)
        
        return TicketInDB(**ticket_dict)

    async def get_by_id(self, ticket_id: str) -> Optional[TicketInDB]:
        """Get a ticket by ID"""
        try:
            ticket = await self.collection.find_one({"_id": ObjectId(ticket_id)})
            if ticket:
                ticket["id"] = str(ticket.pop("_id"))
                return TicketInDB(**ticket)
            return None
        except:
            return None

    async def get_by_event(self, event_id: str, page: int = 1, size: int = 10) -> Tuple[List[TicketInDB], int]:
        """Get tickets for a specific event"""
        filter_query = {"event_id": event_id}
        
        total = await self.collection.count_documents(filter_query)
        skip = (page - 1) * size
        
        cursor = self.collection.find(filter_query).skip(skip).limit(size)
        tickets = []
        
        async for ticket in cursor:
            ticket["id"] = str(ticket.pop("_id"))
            tickets.append(TicketInDB(**ticket))
        
        return tickets, total

    async def get_by_buyer(self, buyer_email: str, page: int = 1, size: int = 10) -> Tuple[List[TicketInDB], int]:
        """Get tickets purchased by a specific buyer"""
        filter_query = {"buyer_email": buyer_email}
        
        total = await self.collection.count_documents(filter_query)
        skip = (page - 1) * size
        
        cursor = self.collection.find(filter_query).skip(skip).limit(size)
        tickets = []
        
        async for ticket in cursor:
            ticket["id"] = str(ticket.pop("_id"))
            tickets.append(TicketInDB(**ticket))
        
        return tickets, total

    async def update(self, ticket_id: str, ticket_update: TicketUpdate) -> Optional[TicketInDB]:
        """Update a ticket"""
        update_data = {k: v for k, v in ticket_update.dict().items() if v is not None}
        if not update_data:
            return None
            
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(ticket_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            result["id"] = str(result.pop("_id"))
            return TicketInDB(**result)
        return None

    async def update_status(self, ticket_id: str, status: TicketStatus) -> bool:
        """Update ticket status"""
        result = await self.collection.update_one(
            {"_id": ObjectId(ticket_id)},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def update_payment(
        self,
        ticket_id: str,
        payment_status: str,
        payment_reference: str
    ) -> bool:
        """Update payment information"""
        result = await self.collection.update_one(
            {"_id": ObjectId(ticket_id)},
            {
                "$set": {
                    "payment_status": payment_status,
                    "payment_reference": payment_reference,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def update_qr_code(self, ticket_id: str, qr_code_url: str) -> bool:
        """Update QR code URL"""
        result = await self.collection.update_one(
            {"_id": ObjectId(ticket_id)},
            {
                "$set": {
                    "qr_code_url": qr_code_url,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def search(
        self,
        query: Optional[str] = None,
        event_id: Optional[str] = None,
        buyer_email: Optional[str] = None,
        status: Optional[TicketStatus] = None,
        payment_method: Optional[PaymentMethod] = None,
        page: int = 1,
        size: int = 10
    ) -> Tuple[List[TicketInDB], int]:
        """Search tickets with filtering"""
        filter_query = {}
        
        if query:
            filter_query["$text"] = {"$search": query}
        
        if event_id:
            filter_query["event_id"] = event_id
        
        if buyer_email:
            filter_query["buyer_email"] = buyer_email
        
        if status:
            filter_query["status"] = status
        
        if payment_method:
            filter_query["payment_method"] = payment_method

        total = await self.collection.count_documents(filter_query)
        skip = (page - 1) * size
        
        cursor = self.collection.find(filter_query).skip(skip).limit(size)
        tickets = []
        
        async for ticket in cursor:
            ticket["id"] = str(ticket.pop("_id"))
            tickets.append(TicketInDB(**ticket))
        
        return tickets, total

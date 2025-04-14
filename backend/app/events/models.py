from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from .schemas import (
    EventCreate, EventUpdate, EventInDB, Event,
    EventCategory, TicketType, EVENT_INDEXES
)

class EventCategory(str, Enum):
    CONCERT = "concert"
    CONFERENCE = "conference"
    EXHIBITION = "exhibition"
    FESTIVAL = "festival"
    SPORTS = "sports"
    THEATER = "theater"
    OTHER = "other"

class TicketType(BaseModel):
    name: str
    price: float
    quantity: int
    description: Optional[str] = None
    is_available: bool = True

class EventBase(BaseModel):
    title: str
    description: str
    category: EventCategory
    venue: str
    location: str
    start_date: datetime
    end_date: datetime
    image_url: str
    organizer_name: str
    organizer_email: EmailStr
    organizer_phone: str
    ticket_types: List[TicketType]
    is_published: bool = False
    max_attendees: Optional[int] = None
    featured: bool = False
    total_tickets_sold: int = 0
    total_revenue: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[EventCategory] = None
    venue: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    image_url: Optional[str] = None
    organizer_name: Optional[str] = None
    organizer_email: Optional[EmailStr] = None
    organizer_phone: Optional[str] = None
    ticket_types: Optional[List[TicketType]] = None
    is_published: Optional[bool] = None
    max_attendees: Optional[int] = None

class EventInDB(EventBase):
    id: str
    created_at: datetime
    updated_at: datetime
    total_tickets_sold: int = 0
    total_revenue: float = 0.0

class Event(EventInDB):
    class Config:
        json_encoders = {
            ObjectId: str
        }
        populate_by_name = True
        arbitrary_types_allowed = True

    @classmethod
    def from_mongo(cls, data: dict):
        if not data:
            return None
        # Convert _id to id
        data = dict(data)
        if '_id' in data:
            data['id'] = str(data.pop('_id'))
        return cls(**data)

    @classmethod
    async def get_by_id(cls, db: AsyncIOMotorDatabase, event_id: str) -> Optional["Event"]:
        event = await db.events.find_one({"_id": ObjectId(event_id)})
        return cls.from_mongo(event) if event else None

class EventSearch(BaseModel):
    query: Optional[str] = None
    category: Optional[EventCategory] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    location: Optional[str] = None
    is_published: Optional[bool] = True

class EventResponse(BaseModel):
    events: List[Event]
    total: int
    page: int
    size: int

class EventModel:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.events
        self._ensure_indexes()

    async def _ensure_indexes(self):
        """Create necessary indexes for the events collection"""
        for index in EVENT_INDEXES:
            if isinstance(index, dict):
                # Text index
                await self.collection.create_index(
                    index["keys"],
                    weights=index["weights"]
                )
            else:
                # Regular index
                await self.collection.create_index(index)

    async def create(self, event: EventCreate) -> EventInDB:
        """Create a new event"""
        event_dict = event.dict()
        event_dict["created_at"] = event_dict["updated_at"] = datetime.utcnow()
        event_dict["total_tickets_sold"] = 0
        event_dict["total_revenue"] = 0.0
        
        result = await self.collection.insert_one(event_dict)
        event_dict["id"] = str(result.inserted_id)
        
        return EventInDB(**event_dict)

    async def get_by_id(self, event_id: str) -> Optional[EventInDB]:
        """Get an event by ID"""
        try:
            event = await self.collection.find_one({"_id": ObjectId(event_id)})
            if event:
                event["id"] = str(event.pop("_id"))
                return EventInDB(**event)
            return None
        except:
            return None

    async def get_many(
        self,
        query: Optional[str] = None,
        category: Optional[EventCategory] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        location: Optional[str] = None,
        is_published: Optional[bool] = True,
        page: int = 1,
        size: int = 10
    ) -> tuple[List[EventInDB], int]:
        """Get events with filtering and pagination"""
        # Build filter query
        filter_query = {"is_published": is_published}
        
        if query:
            filter_query["$text"] = {"$search": query}
        
        if category:
            filter_query["category"] = category
        
        if start_date:
            filter_query["start_date"] = {"$gte": start_date}
        
        if end_date:
            filter_query["end_date"] = {"$lte": end_date}
        
        if location:
            filter_query["location"] = {"$regex": location, "$options": "i"}
        
        if min_price is not None or max_price is not None:
            filter_query["ticket_types.price"] = {}
            if min_price is not None:
                filter_query["ticket_types.price"]["$gte"] = min_price
            if max_price is not None:
                filter_query["ticket_types.price"]["$lte"] = max_price

        # Get total count
        total = await self.collection.count_documents(filter_query)
        
        # Get paginated results
        skip = (page - 1) * size
        cursor = self.collection.find(filter_query).skip(skip).limit(size)
        events = []
        
        async for event in cursor:
            event["id"] = str(event.pop("_id"))
            events.append(EventInDB(**event))
        
        return events, total

    async def update(self, event_id: str, event_update: EventUpdate) -> Optional[EventInDB]:
        """Update an event"""
        update_data = {k: v for k, v in event_update.dict().items() if v is not None}
        if not update_data:
            return None
            
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(event_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            result["id"] = str(result.pop("_id"))
            return EventInDB(**result)
        return None

    async def delete(self, event_id: str) -> bool:
        """Delete an event"""
        result = await self.collection.delete_one({"_id": ObjectId(event_id)})
        return result.deleted_count > 0

    async def get_categories(self) -> List[str]:
        """Get all available event categories"""
        return [category.value for category in EventCategory]

    async def update_ticket_sales(
        self,
        event_id: str,
        ticket_type_name: str,
        quantity: int,
        price: float
    ) -> bool:
        """Update ticket sales and revenue for an event"""
        try:
            # Update ticket type quantity
            result = await self.collection.update_one(
                {
                    "_id": ObjectId(event_id),
                    "ticket_types.name": ticket_type_name
                },
                {
                    "$inc": {
                        "ticket_types.$.quantity": -quantity,
                        "total_tickets_sold": quantity,
                        "total_revenue": price * quantity
                    }
                }
            )
            return result.modified_count > 0
        except:
            return False

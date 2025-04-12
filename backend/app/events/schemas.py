from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from enum import Enum
from bson import ObjectId

class EventCategory(str, Enum):
    CONCERT = "concert"
    CONFERENCE = "conference"
    WORKSHOP = "workshop"
    SPORTS = "sports"
    EXHIBITION = "exhibition"
    FESTIVAL = "festival"
    OTHER = "other"

class TicketType(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0)
    quantity: int = Field(..., ge=0)
    description: Optional[str] = None
    is_available: bool = True

class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    category: EventCategory
    venue: str = Field(..., min_length=1, max_length=200)
    location: str = Field(..., min_length=1, max_length=200)
    start_date: datetime
    end_date: datetime
    image_url: Optional[str] = None
    organizer_name: str = Field(..., min_length=1, max_length=200)
    organizer_email: str = Field(..., min_length=1, max_length=200)
    ticket_types: List[TicketType]
    is_published: bool = False
    max_attendees: Optional[int] = None

    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

    @validator('ticket_types')
    def validate_ticket_types(cls, v):
        if not v:
            raise ValueError('At least one ticket type is required')
        return v

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    category: Optional[EventCategory] = None
    venue: Optional[str] = Field(None, min_length=1, max_length=200)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    image_url: Optional[str] = None
    organizer_name: Optional[str] = Field(None, min_length=1, max_length=200)
    organizer_email: Optional[str] = Field(None, min_length=1, max_length=200)
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
    pass

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

# Database indexes
EVENT_INDEXES = [
    {
        "keys": [("title", "text"), ("description", "text")],
        "weights": {"title": 10, "description": 5}
    },
    [("category", 1)],
    [("start_date", 1)],
    [("end_date", 1)],
    [("location", 1)],
    [("is_published", 1)],
    [("created_at", -1)]
] 
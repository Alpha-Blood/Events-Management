# app/routes/events.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from app.core.config import settings
from app.database import Database
from app.auth.utils import get_current_active_user, get_current_admin_user
from app.auth.models import UserModel
from .models import Event, EventCreate, EventUpdate, EventCategory, EventResponse
from app.tickets.models import TicketModel
import logging

router = APIRouter(prefix="/events", tags=["events"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=Event)
async def create_event(
    event: EventCreate,
    current_user: UserModel = Depends(get_current_active_user)
) -> Event:
    """
    Create a new event
    """
    db = await Database.get_db()
    
    # Check if event with same title exists
    existing_event = await db.events.find_one({"title": event.title})
    if existing_event:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event with this title already exists"
        )
    
    # Create event dictionary
    event_dict = event.model_dump()
    event_dict.update({
        "organizer_id": str(current_user.id),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_published": False,
        "total_tickets_sold": 0,
        "total_revenue": 0.0
    })
    
    # Insert event into database
    result = await db.events.insert_one(event_dict)
    event_dict["id"] = str(result.inserted_id)
    
    return Event(**event_dict)

@router.get("/", response_model=EventResponse)
async def get_events(
    category: Optional[EventCategory] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
) -> EventResponse:
    """
    Get all events with optional filtering
    """
    db = await Database.get_db()
    
    # Build query
    query = {}
    if category:
        query["category"] = category
    if start_date:
        query["start_date"] = {"$gte": start_date}
    if end_date:
        query["end_date"] = {"$lte": end_date}
    if min_price is not None or max_price is not None:
        query["ticket_types.price"] = {}
        if min_price is not None:
            query["ticket_types.price"]["$gte"] = min_price
        if max_price is not None:
            query["ticket_types.price"]["$lte"] = max_price
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"venue": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await db.events.count_documents(query)
    
    # Get events with pagination
    skip = (page - 1) * size
    events = await db.events.find(query).skip(skip).limit(size).to_list(length=size)
    events = [Event(**event) for event in events]
    
    return EventResponse(
        events=events,
        total=total,
        page=page,
        size=size
    )

@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str) -> Event:
    """
    Get event by ID
    """
    db = await Database.get_db()
    event = await db.events.find_one({"_id": event_id})
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return Event(**event)

@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    event_update: EventUpdate,
    current_user: UserModel = Depends(get_current_active_user)
) -> Event:
    """
    Update event
    """
    db = await Database.get_db()
    
    # Check if event exists and user is organizer
    event = await db.events.find_one({"_id": event_id})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if str(event["organizer_id"]) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this event"
        )
    
    # Update event
    update_data = event_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.events.update_one(
        {"_id": event_id},
        {"$set": update_data}
    )
    
    # Get updated event
    updated_event = await db.events.find_one({"_id": event_id})
    return Event(**updated_event)

@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    current_user: UserModel = Depends(get_current_active_user)
) -> dict:
    """
    Delete event
    """
    db = await Database.get_db()
    
    # Check if event exists and user is organizer
    event = await db.events.find_one({"_id": event_id})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if str(event["organizer_id"]) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this event"
        )
    
    # Check if tickets have been sold
    tickets_sold = await db.tickets.count_documents({"event_id": event_id})
    if tickets_sold > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete event with sold tickets"
        )
    
    # Delete event
    await db.events.delete_one({"_id": event_id})
    return {"message": "Event deleted successfully"}

@router.get("/categories", response_model=List[str])
async def get_categories() -> List[str]:
    """
    Get all available event categories
    """
    return [category.value for category in EventCategory]

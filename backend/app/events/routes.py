# app/routes/events.py
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import cloudinary
import cloudinary.uploader
from app.core.config import settings
from app.database import Database, get_database
from app.auth.utils import get_current_active_user, get_current_admin_user
from app.auth.models import UserModel
from .models import Event, EventCreate, EventUpdate, EventCategory, EventResponse
from app.tickets.models import TicketModel
from bson import ObjectId
import logging
import json

router = APIRouter(prefix="/events", tags=["events"])
logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def upload_image_to_cloudinary(file: UploadFile) -> str:
    try:
        # Read the file content
        contents = await file.read()
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder="event_images",
            resource_type="auto"
        )
        
        return result["secure_url"]
    except Exception as e:
        logger.error(f"Error uploading image to Cloudinary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image"
        )

@router.post("/", response_model=Event)
async def create_event(
    title: str = Form(...),
    description: str = Form(...),
    start_date: datetime = Form(...),
    end_date: datetime = Form(...),
    venue: str = Form(...),
    location: str = Form(...),
    category: EventCategory = Form(...),
    ticket_types: str = Form(...),  # Will be parsed as JSON
    organizer_name: str = Form(...),
    organizer_email: str = Form(...),
    organizer_phone: str = Form(...),
    featured: str = Form(default="false"),  # Accept as string
    image: Optional[UploadFile] = File(None),
    current_user: UserModel = Depends(get_current_active_user)
) -> Event:
    """
    Create a new event with optional image upload
    """
    db = await Database.get_db()
    
    # Check if event with same title exists
    existing_event = await db.events.find_one({"title": title})
    if existing_event:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event with this title already exists"
        )
    
    # Upload image if provided
    image_url = None
    if image:
        image_url = await upload_image_to_cloudinary(image)
    
    try:
        # Parse ticket_types from JSON string
        ticket_types_list = json.loads(ticket_types)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ticket types format"
        )
    
    # Convert featured string to boolean
    # Handle various string representations of true
    featured_bool = str(featured).lower().strip() in ['true', '"true"', '1', 'yes']
    logger.info(f"Featured value received: {featured}, converted to: {featured_bool}")
    
    # Create event dictionary
    event_dict = {
        "title": title,
        "description": description,
        "start_date": start_date,
        "end_date": end_date,
        "venue": venue,
        "location": location,
        "category": category,
        "ticket_types": ticket_types_list,
        "organizer_id": str(current_user.id),
        "organizer_name": organizer_name,
        "organizer_email": organizer_email,
        "organizer_phone": organizer_phone,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_published": False,
        "featured": featured_bool,  # Use the converted boolean value
        "total_tickets_sold": 0,
        "total_revenue": 0.0,
        "image_url": image_url
    }
    
    # Insert event into database
    result = await db.events.insert_one(event_dict)
    event_dict["id"] = str(result.inserted_id)
    
    return Event(**event_dict)

@router.get("/", response_model=EventResponse)
async def get_events(
    db: Database = Depends(get_database),
    category: Optional[EventCategory] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    try:
        logger.info(f"Fetching events with page={page}, size={size}")
        
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
            query["$text"] = {"$search": search}

        # Get total count
        total = await db.events.count_documents(query)
        logger.info(f"Total events found: {total}")

        # Get paginated results
        skip = (page - 1) * size
        cursor = db.events.find(query).skip(skip).limit(size)
        events = []
        async for event in cursor:
            try:
                # Convert MongoDB document to Event instance
                event_dict = dict(event)
                if '_id' in event_dict:
                    event_dict['id'] = str(event_dict.pop('_id'))
                # Convert datetime fields to strings
                for field in ['start_date', 'end_date', 'created_at', 'updated_at']:
                    if field in event_dict and isinstance(event_dict[field], datetime):
                        event_dict[field] = event_dict[field].isoformat()
                # Convert nested objects
                if 'ticket_types' in event_dict:
                    for ticket_type in event_dict['ticket_types']:
                        if '_id' in ticket_type:
                            ticket_type['id'] = str(ticket_type.pop('_id'))
                events.append(Event(**event_dict))
            except Exception as e:
                logger.error(f"Error converting event document: {str(e)}")
                continue

        if not events:
            logger.warning("No events found")
            return EventResponse(
                events=[],
                total=0,
                page=page,
                size=size
            )

        logger.info(f"Returning {len(events)} events")
        return EventResponse(
            events=events,
            total=total,
            page=page,
            size=size
        )
    except Exception as e:
        logger.error(f"Error fetching events: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch events"
        )

@router.get("/featured", response_model=EventResponse)
async def get_featured_events(
    db: Database = Depends(get_database),
    page: int = Query(1, ge=1),
    size: int = Query(8, ge=1, le=100)
):
    """
    Get featured events
    """
    try:
        logger.info(f"Fetching featured events with page={page}, size={size}")
        
        # Build query for featured events - only check featured status
        query = {"featured": True}
        
        # Get total count
        total = await db.events.count_documents(query)
        logger.info(f"Total featured events: {total}")
        
        # Get paginated results
        skip = (page - 1) * size
        cursor = db.events.find(query).skip(skip).limit(size)
        events = []
        async for event in cursor:
            try:
                # Convert MongoDB document to Event instance
                event_dict = dict(event)
                if '_id' in event_dict:
                    event_dict['id'] = str(event_dict.pop('_id'))
                # Convert datetime fields to strings
                for field in ['start_date', 'end_date', 'created_at', 'updated_at']:
                    if field in event_dict and isinstance(event_dict[field], datetime):
                        event_dict[field] = event_dict[field].isoformat()
                # Convert nested objects
                if 'ticket_types' in event_dict:
                    for ticket_type in event_dict['ticket_types']:
                        if '_id' in ticket_type:
                            ticket_type['id'] = str(ticket_type.pop('_id'))
                # Ensure image_url is present
                if 'image_url' not in event_dict:
                    event_dict['image_url'] = 'https://via.placeholder.com/300x200?text=Event+Image'
                events.append(Event(**event_dict))
            except Exception as e:
                logger.error(f"Error converting event document: {str(e)}")
                continue
        
        if not events:
            logger.warning("No featured events found")
            return EventResponse(
                events=[],
                total=0,
                page=page,
                size=size
            )
        
        logger.info(f"Returning {len(events)} featured events")
        return EventResponse(
            events=events,
            total=total,
            page=page,
            size=size
        )
    except Exception as e:
        logger.error(f"Error fetching featured events: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch featured events"
        )


@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str) -> Event:
    """
    Get event by ID
    """
    try:
        event_id = ObjectId(event_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID format"
        )
    
    db = await Database.get_db()
    event = await db.events.find_one({"_id": event_id})
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Convert MongoDB document to Event instance
    event_dict = dict(event)
    if '_id' in event_dict:
        event_dict['id'] = str(event_dict.pop('_id'))
    
    return Event(**event_dict)

@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    event_update: EventUpdate,
    image: Optional[UploadFile] = File(None),
    current_user: UserModel = Depends(get_current_active_user)
) -> Event:
    """
    Update an event with optional image upload
    """
    try:
        event_id = ObjectId(event_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID format"
        )
    
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
    
    # Upload new image if provided
    image_url = event.get("image_url")
    if image:
        image_url = await upload_image_to_cloudinary(image)
    
    # Update event
    update_data = event_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    if image_url:
        update_data["image_url"] = image_url
    
    await db.events.update_one(
        {"_id": event_id},
        {"$set": update_data}
    )
    
    # Get updated event
    updated_event = await db.events.find_one({"_id": event_id})
    event_dict = dict(updated_event)
    if '_id' in event_dict:
        event_dict['id'] = str(event_dict.pop('_id'))
    return Event(**event_dict)

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


@router.patch("/{event_id}/featured", response_model=Event)
async def update_event_featured_status(
    event_id: str,
    featured: bool,
    db: Database = Depends(get_database),
    current_user: UserModel = Depends(get_current_admin_user)
):
    """
    Update event featured status (admin only)
    """
    try:
        event_id = ObjectId(event_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID format"
        )
    
    # Check if event exists
    event = await db.events.find_one({"_id": event_id})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Update featured status
    await db.events.update_one(
        {"_id": event_id},
        {"$set": {"featured": featured, "updated_at": datetime.utcnow()}}
    )
    
    # Get updated event
    updated_event = await db.events.find_one({"_id": event_id})
    event_dict = dict(updated_event)
    if '_id' in event_dict:
        event_dict['id'] = str(event_dict.pop('_id'))
    return Event(**event_dict)

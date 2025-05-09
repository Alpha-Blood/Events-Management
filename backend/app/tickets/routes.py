from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from typing import List, Optional
from datetime import datetime
from app.core.config import settings
from app.database import get_database
from app.auth.utils import get_current_active_user, get_current_admin_user, get_current_user
from app.auth.models import UserModel
from app.events.models import Event
from .models import (
    Ticket, TicketCreate, TicketUpdate, TicketStatus,
    PaymentMethod, TicketResponse
)
from app.payments.paystack import PaystackService
from app.services.email import EmailService
from app.services.twilio_service import TwilioService
from bson import ObjectId

router = APIRouter(prefix="/tickets", tags=["tickets"])
paystack_service = PaystackService()
email_service = EmailService()
twilio_service = TwilioService()

async def process_payment_confirmation(
    ticket_id: str,
    payment_reference: str
):
    """
    Process payment confirmation and send notifications
    """
    try:
        db = await get_database()
        
        # Get ticket and event details
        ticket = await db.tickets.find_one({"_id": ticket_id})
        if not ticket:
            return
            
        event = await db.events.find_one({"_id": ticket["event_id"]})
        if not event:
            return

        # Update ticket status
        await db.tickets.update_one(
            {"_id": ticket_id},
            {
                "$set": {
                    "payment_status": "success",
                    "payment_reference": payment_reference,
                    "status": TicketStatus.PAID,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        # Send notifications
        await email_service.send_payment_confirmation(ticket, event)
        await email_service.send_ticket_email(ticket, event)
        
        if ticket.get("buyer_phone"):
            await twilio_service.send_ticket_confirmation(
                ticket["buyer_phone"],
                event["title"],
                str(ticket["_id"])
            )
            
    except Exception as e:
        print(f"Error processing payment confirmation: {str(e)}")

@router.post("/", response_model=Ticket)
async def create_ticket(
    ticket: TicketCreate,
    current_user: UserModel = Depends(get_current_active_user)
) -> Ticket:
    """
    Create a new ticket
    """
    db = await get_database()
    
    try:
        # Convert event_id to ObjectId
        event_id = ObjectId(ticket.event_id)
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
    
    # Check if ticket type exists in event
    ticket_type = next(
        (tt for tt in event["ticket_types"] if tt["name"] == ticket.ticket_type_name),
        None
    )
    if not ticket_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ticket type for this event"
        )
    
    # Check if ticket type is available
    if not ticket_type["is_available"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This ticket type is not available"
        )
    
    # Check if there are enough tickets available
    if ticket_type["quantity"] < ticket.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough tickets available"
        )
    
    # Calculate total price
    total_price = ticket_type["price"] * ticket.quantity
    
    # Create ticket dictionary
    ticket_dict = ticket.model_dump()
    ticket_dict.update({
        "user_id": str(current_user.id),
        "event_id": str(event_id),
        "total_price": total_price,
        "status": TicketStatus.PENDING,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    # Insert ticket into database
    result = await db.tickets.insert_one(ticket_dict)
    ticket_dict["id"] = str(result.inserted_id)
    
    # Update event ticket sales
    await db.events.update_one(
        {
            "_id": event_id,
            "ticket_types.name": ticket.ticket_type_name
        },
        {
            "$inc": {
                "ticket_types.$.quantity": -ticket.quantity,
                "total_tickets_sold": ticket.quantity,
                "total_revenue": total_price
            }
        }
    )
    
    return Ticket(**ticket_dict)

@router.post("/{ticket_id}/verify-payment")
async def verify_payment(
    ticket_id: str,
    background_tasks: BackgroundTasks,
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Verify payment status and process ticket
    """
    try:
        db = await get_database()
        ticket = await db.tickets.find_one({"_id": ticket_id})
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )

        # Verify payment
        if ticket.get("payment_method") == PaymentMethod.CARD:
            payment_status = await paystack_service.verify_transaction(ticket.get("payment_reference"))
        else:
            payment_status = await paystack_service.check_mpesa_status(ticket.get("payment_reference"))

        if payment_status.get("status") == "success":
            # Process payment confirmation in background
            background_tasks.add_task(
                process_payment_confirmation,
                ticket_id,
                ticket.get("payment_reference")
            )
            return {"status": "success", "message": "Payment verified successfully"}
        else:
            return {"status": "pending", "message": "Payment verification pending"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket(
    ticket_id: str,
    current_user: UserModel = Depends(get_current_active_user)
) -> Ticket:
    """
    Get ticket by ID
    """
    db = await get_database()
    ticket = await db.tickets.find_one({"_id": ticket_id})
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user is authorized to view this ticket
    if str(ticket["user_id"]) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this ticket"
        )
    
    return Ticket(**ticket)

@router.get("/event/{event_id}", response_model=TicketResponse)
async def get_event_tickets(
    event_id: str,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get tickets for a specific event.
    """
    db = await get_database()
    
    # Build query
    query = {"event_id": event_id}
    
    # If not admin, only show user's tickets
    if not current_user.is_admin:
        query["user_id"] = str(current_user.id)
    
    # Get total count
    total = await db.tickets.count_documents(query)
    
    # Get tickets with pagination
    skip = (page - 1) * size
    tickets = await db.tickets.find(query).skip(skip).limit(size).to_list(length=size)
    tickets = [Ticket(**ticket) for ticket in tickets]
    
    return TicketResponse(
        tickets=tickets,
        total=total,
        page=page,
        size=size
    )

@router.get("/buyer/{buyer_email}", response_model=TicketResponse)
async def get_buyer_tickets(
    buyer_email: str,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get tickets purchased by a specific buyer.
    """
    db = await get_database()
    
    # Build query
    query = {"buyer_email": buyer_email}
    
    # If not admin, only show user's tickets
    if not current_user.is_admin:
        query["user_id"] = str(current_user.id)
    
    # Get total count
    total = await db.tickets.count_documents(query)
    
    # Get tickets with pagination
    skip = (page - 1) * size
    tickets = await db.tickets.find(query).skip(skip).limit(size).to_list(length=size)
    
    # Format tickets and fetch event details
    formatted_tickets = []
    for ticket in tickets:
        # Convert ObjectId to string for id field
        ticket["id"] = str(ticket.pop("_id"))
        
        # Get event details
        try:
            event = await db.events.find_one({"_id": ObjectId(ticket["event_id"])})
            if event:
                # Convert event ObjectId to string
                event["id"] = str(event.pop("_id"))
                
                # Convert datetime fields in event to ISO format
                for field in ['start_date', 'end_date', 'created_at', 'updated_at']:
                    if field in event and isinstance(event[field], datetime):
                        event[field] = event[field].isoformat()
                
                # Convert ticket types ObjectIds if present
                if 'ticket_types' in event:
                    for ticket_type in event['ticket_types']:
                        if '_id' in ticket_type:
                            ticket_type['id'] = str(ticket_type.pop('_id'))
                
                # Add event details to ticket
                ticket["event"] = event
        except Exception as e:
            print(f"Error fetching event details: {str(e)}")
            ticket["event"] = None
        
        # Convert status to lowercase if present
        if "status" in ticket:
            ticket["status"] = ticket["status"].lower()
        
        # Convert datetime fields in ticket to ISO format
        for field in ['created_at', 'updated_at']:
            if field in ticket and isinstance(ticket[field], datetime):
                ticket[field] = ticket[field].isoformat()
            
        formatted_tickets.append(Ticket(**ticket))
    
    return TicketResponse(
        tickets=formatted_tickets,
        total=total,
        page=page,
        size=size
    )

@router.put("/{ticket_id}", response_model=Ticket)
async def update_ticket(
    ticket_id: str,
    ticket_update: TicketUpdate,
    current_user: UserModel = Depends(get_current_active_user)
) -> Ticket:
    """
    Update ticket
    """
    db = await get_database()
    
    # Check if ticket exists
    ticket = await db.tickets.find_one({"_id": ticket_id})
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user is authorized to update this ticket
    if str(ticket["user_id"]) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this ticket"
        )
    
    # Update ticket
    update_data = ticket_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.tickets.update_one(
        {"_id": ticket_id},
        {"$set": update_data}
    )
    
    # Get updated ticket
    updated_ticket = await db.tickets.find_one({"_id": ticket_id})
    return Ticket(**updated_ticket)

@router.put("/{ticket_id}/status", response_model=Ticket)
async def update_ticket_status(
    ticket_id: str,
    status: TicketStatus,
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Update ticket status.
    """
    db = await get_database()
    
    # Check if ticket exists
    ticket = await db.tickets.find_one({"_id": ticket_id})
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user is authorized to update this ticket
    if str(ticket["user_id"]) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this ticket"
        )
    
    # Update ticket status
    await db.tickets.update_one(
        {"_id": ticket_id},
        {
            "$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Get updated ticket
    updated_ticket = await db.tickets.find_one({"_id": ticket_id})
    return Ticket(**updated_ticket)

@router.put("/{ticket_id}/payment", response_model=Ticket)
async def update_ticket_payment(
    ticket_id: str,
    payment_status: str,
    payment_reference: str,
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Update ticket payment information.
    """
    db = await get_database()
    
    # Check if ticket exists
    ticket = await db.tickets.find_one({"_id": ticket_id})
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user is authorized to update this ticket
    if str(ticket["user_id"]) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this ticket"
        )
    
    # Update payment information
    await db.tickets.update_one(
        {"_id": ticket_id},
        {
            "$set": {
                "payment_status": payment_status,
                "payment_reference": payment_reference,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Get updated ticket
    updated_ticket = await db.tickets.find_one({"_id": ticket_id})
    return Ticket(**updated_ticket)

@router.put("/{ticket_id}/qr-code", response_model=Ticket)
async def update_ticket_qr_code(
    ticket_id: str,
    qr_code_url: str,
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Update ticket QR code URL.
    """
    db = await get_database()
    
    # Check if ticket exists
    ticket = await db.tickets.find_one({"_id": ticket_id})
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user is authorized to update this ticket
    if str(ticket["user_id"]) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this ticket"
        )
    
    # Update QR code URL
    await db.tickets.update_one(
        {"_id": ticket_id},
        {
            "$set": {
                "qr_code_url": qr_code_url,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Get updated ticket
    updated_ticket = await db.tickets.find_one({"_id": ticket_id})
    return Ticket(**updated_ticket)

@router.get("/my-tickets", response_model=List[Ticket])
async def get_my_tickets(
    current_user: UserModel = Depends(get_current_active_user)
) -> List[Ticket]:
    """
    Get all tickets for the current user
    """
    db = await get_database()
    
    # Get all tickets for the current user
    tickets = await db.tickets.find({"user_id": str(current_user.id)}).to_list(length=None)
    
    # Convert to Ticket models
    return [Ticket(**ticket) for ticket in tickets]

@router.get("/", response_model=TicketResponse)
async def get_tickets(
    event_id: Optional[str] = None,
    status: Optional[TicketStatus] = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: UserModel = Depends(get_current_active_user)
) -> TicketResponse:
    """
    Get tickets with optional filtering
    """
    db = await get_database()
    
    # Build query
    query = {}
    if event_id:
        try:
            query["event_id"] = ObjectId(event_id)
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid event ID format"
            )
    if status:
        query["status"] = status
    
    # If not admin, only show user's tickets
    if not current_user.is_admin:
        query["user_id"] = str(current_user.id)
    
    # Get total count
    total = await db.tickets.count_documents(query)
    
    # Get tickets with pagination
    skip = (page - 1) * size
    cursor = db.tickets.find(query).skip(skip).limit(size)
    tickets = []
    async for ticket in cursor:
        # Convert MongoDB document to Ticket instance
        ticket_dict = dict(ticket)
        if '_id' in ticket_dict:
            ticket_dict['id'] = str(ticket_dict.pop('_id'))
        tickets.append(Ticket(**ticket_dict))
    
    return TicketResponse(
        tickets=tickets,
        total=total,
        page=page,
        size=size
    )
@router.delete("/{ticket_id}")
async def delete_ticket(
    ticket_id: str,
    current_user: UserModel = Depends(get_current_active_user)
) -> dict:
    """
    Delete ticket
    """
    db = await get_database()
    
    # Check if ticket exists
    ticket = await db.tickets.find_one({"_id": ticket_id})
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user is authorized to delete this ticket
    if str(ticket["user_id"]) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this ticket"
        )
    
    # Check if ticket can be deleted
    if ticket["status"] != TicketStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a non-pending ticket"
        )
    
    # Delete ticket
    await db.tickets.delete_one({"_id": ticket_id})
    
    # Update event ticket sales
    await db.events.update_one(
        {
            "_id": ticket["event_id"],
            "ticket_types.name": ticket["ticket_type_name"]
        },
        {
            "$inc": {
                "ticket_types.$.quantity": ticket["quantity"],
                "total_tickets_sold": -ticket["quantity"],
                "total_revenue": -ticket["total_price"]
            }
        }
    )
    
    return {"message": "Ticket deleted successfully"}


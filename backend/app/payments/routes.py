from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from ..database import get_database
from ..auth.utils import get_current_user
from ..auth.models import UserModel
from .models import Payment, PaymentCreate, PaymentUpdate, PaymentStatus
from .paystack import PaystackService
from bson import ObjectId
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)

# Create router with prefix
router = APIRouter(prefix="/payments", tags=["payments"])

# Debug print for router initialization
logger.info("Initializing payment router")

paystack_service = PaystackService()

# Debug route to test router registration
@router.get("/test")
async def test_payment_router():
    """Test endpoint for payment router"""
    logger.info("Test endpoint hit")
    return {"message": "Payment router is working!"}

@router.post("/", response_model=Payment)
async def create_payment(
    payment: PaymentCreate,
    request: Request,
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    # Verify event exists
    event = await db.events.find_one({"_id": ObjectId(payment.event_id)})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Generate a unique reference for this payment
    reference = str(uuid.uuid4())

    # Prepare ticket types data
    ticket_types = []
    for ticket in payment.tickets:
        ticket_type = next(
            (tt for tt in event["ticket_types"] if tt["name"] == ticket.name),
            None
        )
        if not ticket_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid ticket type: {ticket.name}"
            )
        
        if ticket_type["quantity_available"] < ticket.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough tickets available for {ticket.name}"
            )
        
        ticket_types.append({
            "name": ticket.name,
            "price": ticket_type["price"],
            "quantity": ticket.quantity
        })

    # Initialize Paystack payment
    paystack_response = await paystack_service.initialize_transaction(
        email=payment.email,
        amount=payment.amount,
        reference=reference,
        callback_url=payment.callback_url,
        metadata={
            "user_id": str(current_user.id),
            "event_id": payment.event_id,
            "event_title": event.get("title", "")
        }
    )

    if not paystack_response.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to initialize payment"
        )

    # Create payment record
    payment_data = {
        "user_id": str(current_user.id),
        "event_id": payment.event_id,
        "amount": payment.amount,
        "status": PaymentStatus.PENDING,
        "payment_method": payment.payment_method,
        "payment_details": {
            "email": payment.email,
            "callback_url": payment.callback_url,
            "reference": reference
        },
        "ticket_types": ticket_types,
        "name": payment.name,
        "email": payment.email,
        "phone": payment.phone,
        "paystack_reference": reference,
        "paystack_authorization_url": paystack_response["data"]["authorization_url"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = await db.payments.insert_one(payment_data)
    payment_data["_id"] = str(result.inserted_id)

    return Payment(**payment_data)

@router.post("/verify/{reference}")
async def verify_payment(
    reference: str,
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    # Verify payment with Paystack
    paystack_response = await paystack_service.verify_transaction(reference)
    
    if not paystack_response.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed"
        )

    # Update payment status
    payment = await db.payments.find_one({"paystack_reference": reference})
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    print(f"Payment data: {payment}")  # Debug log

    if payment["user_id"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to verify this payment"
        )

    # Only proceed with ticket creation if payment is successful
    if paystack_response["data"]["status"] == "success":
        # Update payment status to completed
        await db.payments.update_one(
            {"_id": payment["_id"]},
            {
                "$set": {
                    "status": PaymentStatus.COMPLETED,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        # Get event details
        event = await db.events.find_one({"_id": ObjectId(payment["event_id"])})
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )

        print(f"Event data: {event}")  # Debug log

        # Create tickets and update quantities
        tickets = []
        for ticket_type in payment.get("ticket_types", []):
            print(f"Processing ticket type: {ticket_type}")  # Debug log

            # Update ticket type quantity
            update_result = await db.events.update_one(
                {
                    "_id": ObjectId(payment["event_id"]),
                    "ticket_types.name": ticket_type["name"]
                },
                {
                    "$inc": {
                        "ticket_types.$.quantity_available": -ticket_type["quantity"]
                    }
                }
            )
            print(f"Update result: {update_result.modified_count}")  # Debug log

            # Create ticket record
            ticket_data = {
                "user_id": str(current_user.id),
                "event_id": payment["event_id"],
                "payment_id": str(payment["_id"]),
                "ticket_type_name": ticket_type["name"],
                "quantity": ticket_type["quantity"],
                "total_price": ticket_type["price"] * ticket_type["quantity"],
                "buyer_name": payment["name"],
                "buyer_email": payment["email"],
                "buyer_phone": payment.get("phone"),
                "status": "PAID",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            print(f"Creating ticket with data: {ticket_data}")  # Debug log
            result = await db.tickets.insert_one(ticket_data)
            ticket_data["_id"] = str(result.inserted_id)
            tickets.append(ticket_data)
            print(f"Ticket created with ID: {result.inserted_id}")  # Debug log

        return {
            "status": "success",
            "message": "Payment verified and tickets created successfully",
            "tickets": tickets
        }
    else:
        # Update payment status to failed
        await db.payments.update_one(
            {"_id": payment["_id"]},
            {
                "$set": {
                    "status": PaymentStatus.FAILED,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed"
        )

@router.get("/", response_model=List[Payment])
async def get_user_payments(
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    payments = await db.payments.find({"user_id": str(current_user.id)}).to_list(length=None)
    return [Payment(**payment) for payment in payments]

@router.get("/{payment_id}", response_model=Payment)
async def get_payment(
    payment_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    payment = await db.payments.find_one({"_id": ObjectId(payment_id)})
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if payment["user_id"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this payment"
        )
    
    return Payment(**payment)

@router.put("/{payment_id}", response_model=Payment)
async def update_payment(
    payment_id: str,
    payment_update: PaymentUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    payment = await db.payments.find_one({"_id": ObjectId(payment_id)})
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if payment["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this payment"
        )
    
    update_data = payment_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.payments.update_one(
        {"_id": ObjectId(payment_id)},
        {"$set": update_data}
    )
    
    updated_payment = await db.payments.find_one({"_id": ObjectId(payment_id)})
    return Payment(**updated_payment)

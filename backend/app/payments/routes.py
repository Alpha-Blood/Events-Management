from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from typing import List
from ..database import get_database
from ..auth.utils import get_current_user
from ..auth.models import UserModel
from .models import Payment, PaymentCreate, PaymentUpdate, PaymentStatus, PaymentMethod
from .paystack import PaystackService
from ..services.email import EmailService
from ..services.twilio_service import TwilioService
from ..services.qr_service import QRService
from bson import ObjectId
from datetime import datetime
import uuid
import logging
from ..email import send_ticket_email

logger = logging.getLogger(__name__)

# Create router with prefix
router = APIRouter(prefix="/payments", tags=["payments"])

# Debug print for router initialization
logger.info("Initializing payment router")

paystack_service = PaystackService()
email_service = EmailService()
twilio_service = TwilioService()
qr_service = QRService()

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
        
        if ticket_type["quantity"] < ticket.quantity:
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
    try:
        if payment.payment_method == PaymentMethod.PAYSTACK:
            paystack_response = await paystack_service.initialize_transaction(
                email=payment.email,
                amount=payment.amount,
                reference=reference,
                callback_url=payment.callback_url,
                metadata={
                    "user_id": str(current_user.id),
                    "event_id": payment.event_id,
                    "event_title": event.get("title", ""),
                    "ticket_types": ticket_types
                }
            )
        else:
            paystack_response = await paystack_service.initialize_mobile_money(
                email=payment.email,
                amount=payment.amount,
                reference=reference,
                phone=payment.phone,
                provider="mpesa",
                metadata={
                    "user_id": str(current_user.id),
                    "event_id": payment.event_id,
                    "event_title": event.get("title", ""),
                    "ticket_types": ticket_types
                }
            )

        if not paystack_response.get("status"):
            error_message = paystack_response.get("message", "Failed to initialize payment")
            logger.error(f"Paystack initialization failed: {error_message}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
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
                "reference": reference,
                "phone": payment.phone if payment.payment_method == PaymentMethod.MPESA else None
            },
            "ticket_types": ticket_types,
            "name": payment.name,
            "email": payment.email,
            "phone": payment.phone,
            "paystack_reference": reference,
            "paystack_authorization_url": paystack_response.get("data", {}).get("authorization_url"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = await db.payments.insert_one(payment_data)
        payment_data["_id"] = str(result.inserted_id)

        return Payment(**payment_data)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your payment. Please try again."
        )

async def process_payment_confirmation(
    payment_id: str,
    ticket_id: str,
    background_tasks: BackgroundTasks
):
    """
    Process payment confirmation and send notifications
    """
    try:
        logger.info(f"Starting payment confirmation process for payment {payment_id} and ticket {ticket_id}")
        
        db = await get_database()
        
        # Get payment and ticket details
        payment = await db.payments.find_one({"_id": ObjectId(payment_id)})
        ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
        event = await db.events.find_one({"_id": ObjectId(ticket["event_id"])})
        
        if not all([payment, ticket, event]):
            logger.error("Missing payment, ticket, or event data")
            return
            
        logger.info("Retrieved payment, ticket, and event data")
        
        # Generate QR code
        logger.info("Generating QR code...")
        qr_code_url = qr_service.generate_qr_code(str(ticket["_id"]), str(event["_id"]))
        logger.info("QR code generated successfully")
        
        # Update ticket with QR code
        await db.tickets.update_one(
            {"_id": ObjectId(ticket_id)},
            {
                "$set": {
                    "qr_code_url": qr_code_url,
                    "status": "paid",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        logger.info("Updated ticket with QR code")
        
        # Send email notification with QR code
        logger.info("Sending email notification...")
        background_tasks.add_task(
            email_service.send_ticket_qr_code,
            ticket,
            event,
            qr_code_url,
            ticket["buyer_email"]
        )
        
        # Send SMS notification
        if ticket.get("buyer_phone"):
            logger.info("Sending SMS notification...")
            background_tasks.add_task(
                twilio_service.send_ticket_confirmation,
                ticket["buyer_phone"],
                event["title"],
                str(ticket["_id"]),
                qr_code_url
            )
            
        logger.info("Payment confirmation process completed")
            
    except Exception as e:
        logger.error(f"Error in payment confirmation process: {str(e)}", exc_info=True)

@router.post("/verify/{reference}")
async def verify_payment(
    reference: str,
    background_tasks: BackgroundTasks,
    request: Request,
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Verify a payment with Paystack and create tickets if successful
    """
    try:
        logger.info(f"Starting payment verification for reference: {reference}")
        
        # Get payment details
        payment = await db.payments.find_one({"paystack_reference": reference})
        if not payment:
            logger.error(f"Payment not found for reference: {reference}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        logger.info(f"Found payment: {payment}")

        # Check if payment is already completed
        if payment["status"] == PaymentStatus.COMPLETED:
            logger.info("Payment already completed, skipping verification")
            return {"status": "success", "message": "Payment already verified"}

        # Verify payment with Paystack
        logger.info("Verifying payment with Paystack...")
        paystack_response = await paystack_service.verify_transaction(reference)
        logger.info(f"Paystack verification response: {paystack_response}")
        
        if paystack_response.get("status") and paystack_response["data"]["status"] == "success":
            logger.info("Payment verification successful")
            
            # Update payment status
            await db.payments.update_one(
                {"_id": payment["_id"]},
                {
                    "$set": {
                        "status": PaymentStatus.COMPLETED,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            logger.info("Updated payment status to COMPLETED")

            # Get event details
            event = await db.events.find_one({"_id": ObjectId(payment["event_id"])})
            if not event:
                logger.error(f"Event not found for ID: {payment['event_id']}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Event not found"
                )
            logger.info(f"Found event: {event['title']}")

            # Create tickets for each ticket type
            for ticket_type in payment["ticket_types"]:
                logger.info(f"Processing ticket type: {ticket_type}")
                
                # Check if ticket already exists
                existing_ticket = await db.tickets.find_one({
                    "user_id": payment["user_id"],
                    "event_id": payment["event_id"],
                    "ticket_type_name": ticket_type["name"],
                    "status": "paid"
                })
                
                if existing_ticket:
                    logger.info(f"Ticket already exists for type: {ticket_type['name']}")
                    continue

                # Create ticket
                ticket_data = {
                    "user_id": payment["user_id"],
                    "event_id": payment["event_id"],
                    "ticket_type_name": ticket_type["name"],
                    "quantity": ticket_type["quantity"],
                    "total_price": ticket_type["price"] * ticket_type["quantity"],
                    "status": "paid",
                    "buyer_name": payment["name"],
                    "buyer_email": payment["email"],
                    "buyer_phone": payment["phone"],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                logger.info(f"Creating ticket with data: {ticket_data}")
                
                result = await db.tickets.insert_one(ticket_data)
                ticket_id = str(result.inserted_id)
                logger.info(f"Created ticket with ID: {ticket_id}")
                
                # Update event ticket quantities
                await db.events.update_one(
                    {"_id": ObjectId(payment["event_id"]), "ticket_types.name": ticket_type["name"]},
                    {
                        "$inc": {
                            "ticket_types.$.quantity": -ticket_type["quantity"]
                        }
                    }
                )
                logger.info(f"Updated event ticket quantities")

                # Process payment confirmation in background
                logger.info("Adding payment confirmation task to background tasks")
                background_tasks.add_task(
                    process_payment_confirmation,
                    str(payment["_id"]),
                    ticket_id,
                    background_tasks
                )

            logger.info("Payment verification and ticket creation completed successfully")
            return {"status": "success", "message": "Payment verified and tickets created"}
        else:
            logger.error(f"Payment verification failed: {paystack_response}")
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

    except HTTPException as e:
        logger.error(f"HTTP Exception in payment verification: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Error in payment verification: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while verifying your payment"
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

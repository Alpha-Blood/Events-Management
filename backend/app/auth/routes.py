from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from typing import Any
from app.core.config import settings
from app.database import Database
from app.auth.models import UserCreate, UserModel, Token, UserLogin
from app.auth.utils import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_active_user,
    get_current_admin_user,
    add_token_to_blacklist
)
from app.auth.social_auth import (
    get_google_auth_url,
    get_google_user_info,
    get_facebook_auth_url,
    get_facebook_user_info
)
from app.auth.email import send_verification_email
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserModel)
async def register(user_data: UserCreate) -> Any:
    """
    Register a new user
    """
    db = await Database.get_db()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user_data.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_data.password)
    del user_dict["password"]
    
    # Add additional fields
    user_dict.update({
        "is_active": True,
        "is_admin": False,
        "is_verified": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    # Insert user into database
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    return UserModel(**user_dict)

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin) -> Any:
    """
    Login user and return access token
    """
    db = await Database.get_db()
    user = await db.users.find_one({"email": user_data.email})
    
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(
    request: Request,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Logout endpoint that blacklists the current token.
    The client should also remove the token from storage.
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        await add_token_to_blacklist(token)
    
    return {
        "message": "Successfully logged out",
        "detail": "Token has been invalidated"
    }

@router.get("/me", response_model=UserModel)
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)) -> Any:
    """
    Get current user information
    """
    return current_user

@router.post("/verify-email")
async def verify_email(token: str, current_user: UserModel = Depends(get_current_active_user)) -> Any:
    """
    Verify user's email
    """
    db = await Database.get_db()
    await db.users.update_one(
        {"email": current_user.email},
        {"$set": {"is_verified": True, "updated_at": datetime.utcnow()}}
    )
    return {"message": "Email verified successfully"}

@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: UserModel = Depends(get_current_active_user)
) -> Any:
    """
    Change user's password
    """
    db = await Database.get_db()
    user = await db.users.find_one({"email": current_user.email})
    
    if not verify_password(current_password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    await db.users.update_one(
        {"email": current_user.email},
        {
            "$set": {
                "hashed_password": get_password_hash(new_password),
                "updated_at": datetime.utcnow()
            }
        }
    )
    return {"message": "Password changed successfully"}

@router.get("/google")
async def google_auth():
    """
    Redirect to Google OAuth page
    """
    auth_url = await get_google_auth_url()
    return {"auth_url": auth_url}

@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    try:
        user_info = await get_google_user_info(code)
        
        # Check if user exists
        user = db.query(UserModel).filter(UserModel.email == user_info["email"]).first()
        
        if not user:
            # Create new user
            user = UserModel(
                email=user_info["email"],
                full_name=user_info["name"],
                is_active=True,
                is_superuser=False,
                is_verified=True  # Google-verified email
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Generate access token
        access_token = create_access_token(data={"sub": user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_superuser": user.is_superuser
            }
        }
    except Exception as e:
        print(f"Google callback error: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=400,
            detail=f"Google authentication failed: {str(e)}"
        )

@router.get("/facebook")
async def facebook_auth():
    """
    Redirect to Facebook OAuth page
    """
    auth_url = await get_facebook_auth_url()
    return {"auth_url": auth_url}

@router.get("/facebook/callback")
async def facebook_callback(code: str):
    """
    Handle Facebook OAuth callback
    """
    try:
        user_info = await get_facebook_user_info(code)
        db = await Database.get_db()
        
        # Check if user exists
        user = await db.users.find_one({"email": user_info["email"]})
        if not user:
            # Create new user
            user_data = {
                "email": user_info["email"],
                "full_name": user_info["name"],
                "is_active": True,
                "is_verified": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = await db.users.insert_one(user_data)
            user_data["_id"] = str(result.inserted_id)
            user = user_data
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserModel(**user)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/send-verification-email")
async def send_verification_email_endpoint(
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Send verification email to user
    """
    try:
        await send_verification_email(current_user.email)
        return {"message": "Verification email sent successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/reset-password")
async def reset_password(email: str):
    """
    Send password reset email
    """
    try:
        db = await Database.get_db()
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate reset token
        reset_token = create_access_token(
            data={"sub": email},
            expires_delta=timedelta(minutes=15)
        )
        
        # Send reset email
        await send_password_reset_email(email, reset_token)
        return {"message": "Password reset email sent successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/reset-password/confirm")
async def reset_password_confirm(token: str, new_password: str):
    """
    Reset password with token
    """
    try:
        db = await Database.get_db()
        # Verify token
        email = verify_token(token)
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired token"
            )
        
        # Update password
        hashed_password = get_password_hash(new_password)
        await db.users.update_one(
            {"email": email},
            {"$set": {"hashed_password": hashed_password}}
        )
        
        return {"message": "Password reset successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

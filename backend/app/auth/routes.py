from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Any
from ..core.config import settings
from ..database import Database
from .models import UserCreate, UserModel, Token, UserLogin
from .utils import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_active_user,
    get_current_admin_user,
    add_token_to_blacklist
)

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
    user_dict["id"] = str(result.inserted_id)
    
    return UserModel(**user_dict)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    Login user and return access token
    """
    db = await Database.get_db()
    user = await db.users.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
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

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from bson import ObjectId
from app.core.utils.objectid import PyObjectId
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: str
    hashed_password: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    is_superuser: bool = False

class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
    is_superuser: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    full_name: str
    email: EmailStr
    hashed_password: Optional[str] = None
    is_admin: bool = False
    is_verified: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: bool = True

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "full_name": "Jane Doe",
                "email": "jane@example.com",
                "hashed_password": "hashedpassword",
                "is_admin": False,
                "is_verified": False,
            }
        }
    )

    @classmethod
    def from_mongo(cls, data: dict):
        """Convert MongoDB document to UserModel"""
        if not data:
            return None
        id = data.pop('_id', None)
        return cls(**dict(data, id=str(id)))

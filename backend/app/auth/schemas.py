from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class RegisterUser(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class LoginUser(BaseModel):
    email: EmailStr
    password: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    is_admin: bool
    is_verified: bool

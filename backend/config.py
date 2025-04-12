# core/config.py

import os
from dotenv import load_dotenv
from pydantic import BaseSettings, Field, validator
from typing import Optional
import secrets

load_dotenv()  # Load environment variables from a .env file

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Eventify"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    API_V1_STR: str = "/api/v1"

    # MongoDB
    MONGO_URI: str = Field(..., env="MONGO_URI")
    DB_NAME: str = Field(..., env="DB_NAME")

    # JWT settings
    JWT_SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Email settings
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_PORT: int = 587
    MAIL_SERVER: Optional[str] = None
    MAIL_TLS: bool = True
    MAIL_SSL: bool = False

    # SMS settings
    SMS_USERNAME: Optional[str] = None
    SMS_API_KEY: Optional[str] = None
    SMS_SENDER_ID: str = "EVENTIFY"

    # Payment settings
    PAYSTACK_SECRET_KEY: Optional[str] = None
    PAYSTACK_BASE_URL: str = "https://api.paystack.co"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    @validator("MONGO_URI", pre=True)
    def validate_mongo_uri(cls, v):
        if not v:
            raise ValueError("MONGO_URI must be set")
        return v

    @validator("DB_NAME", pre=True)
    def validate_db_name(cls, v):
        if not v:
            raise ValueError("DB_NAME must be set")
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

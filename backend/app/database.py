from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging
from fastapi import Depends

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_to_mongo(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGO_URI)
            cls.db = cls.client[settings.DATABASE_NAME]
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Could not connect to MongoDB: {e}")
            raise e

    @classmethod
    async def close_mongo_connection(cls):
        """Close MongoDB connection"""
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            cls.db = None
            logger.info("Closed MongoDB connection")

    @classmethod
    async def get_db(cls):
        """Get database instance"""
        if cls.db is None:
            await cls.connect_to_mongo()
        return cls.db

async def get_database() -> AsyncIOMotorClient:
    """FastAPI dependency for getting database instance"""
    return await Database.get_db() 
"""
Intelligent AI Editor - Async SQLite Database Setup with WAL Mode
"""
import os
import sqlalchemy
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
from app.core.logging import logger

# Ensure local data directory exists
os.makedirs("./data", exist_ok=True)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Initializes SQLite schema and enables WAL mode for high concurrent throughput."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Enable WAL mode for SQLite
        try:
            await conn.execute(sqlalchemy.text("PRAGMA journal_mode=WAL;"))
            await conn.execute(sqlalchemy.text("PRAGMA synchronous=NORMAL;"))
        except Exception as e:
            logger.warning(f"WAL pragma configuration skipped: {e}")
    logger.info("SQLite Database initialized successfully.")

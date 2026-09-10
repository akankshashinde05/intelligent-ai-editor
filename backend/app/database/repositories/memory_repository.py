"""
Intelligent AI Editor - AI Memory Repository
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import AIMemory

class MemoryRepository:
    @staticmethod
    async def add_message(
        session: AsyncSession,
        session_id: str,
        role: str,
        content: str,
        command_generated: Optional[str] = None
    ) -> AIMemory:
        msg = AIMemory(
            session_id=session_id,
            role=role,
            content=content,
            command_generated=command_generated
        )
        session.add(msg)
        await session.commit()
        return msg

    @staticmethod
    async def get_session_history(session: AsyncSession, session_id: str, limit: int = 20) -> List[AIMemory]:
        stmt = select(AIMemory).where(AIMemory.session_id == session_id).order_by(AIMemory.timestamp.asc()).limit(limit)
        result = await session.execute(stmt)
        return list(result.scalars().all())

memory_repository = MemoryRepository()

"""
Intelligent AI Editor - Context & Memory Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.schemas.common import BaseResponse
from app.database.repositories.memory_repository import memory_repository

router = APIRouter(prefix="/memory", tags=["AI Memory"])

@router.get("/history/{session_id}")
async def get_session_history(session_id: str, limit: int = 20, db: AsyncSession = Depends(get_db)):
    msgs = await memory_repository.get_session_history(db, session_id, limit=limit)
    return BaseResponse(success=True, data=msgs)

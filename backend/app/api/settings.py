"""
Intelligent AI Editor - Settings & Configuration Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Dict, Any
from app.database.database import get_db
from app.schemas.common import BaseResponse
from app.database.repositories.settings_repository import settings_repository

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingUpdateRequest(BaseModel):
    key: str
    value: str
    description: str = None

@router.get("/{key}")
async def get_setting(key: str, db: AsyncSession = Depends(get_db)):
    val = await settings_repository.get_setting(db, key)
    return BaseResponse(success=True, data={"key": key, "value": val})

@router.post("/set")
async def set_setting(req: SettingUpdateRequest, db: AsyncSession = Depends(get_db)):
    await settings_repository.set_setting(db, req.key, req.value, req.description)
    return BaseResponse(success=True, message=f"Setting '{req.key}' updated.")

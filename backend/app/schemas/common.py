"""
Intelligent AI Editor - Common Pydantic Schemas
"""
from pydantic import BaseModel
from typing import Optional, Generic, TypeVar, Any
from datetime import datetime

T = TypeVar("T")

class BaseResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

class SystemHealth(BaseModel):
    status: str
    version: str
    gemini_connected: bool = False
    active_model: str
    default_shell: str
    database_connected: bool
    cpu_percent: float
    memory_percent: float
    disk_percent: float

"""
Intelligent AI Editor - Settings Repository
"""
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import AppSettings

class SettingsRepository:
    @staticmethod
    async def get_setting(session: AsyncSession, key: str) -> Optional[str]:
        stmt = select(AppSettings).where(AppSettings.key == key)
        result = await session.execute(stmt)
        item = result.scalar_one_or_none()
        return item.value if item else None

    @staticmethod
    async def set_setting(session: AsyncSession, key: str, value: str, description: Optional[str] = None):
        stmt = select(AppSettings).where(AppSettings.key == key)
        result = await session.execute(stmt)
        item = result.scalar_one_or_none()
        if item:
            item.value = value
            if description:
                item.description = description
        else:
            item = AppSettings(key=key, value=value, description=description)
            session.add(item)
        await session.commit()

settings_repository = SettingsRepository()

"""
Intelligent AI Editor - Project Repository
"""
from typing import List, Optional
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import Project

class ProjectRepository:
    @staticmethod
    async def create_project(
        session: AsyncSession,
        name: str,
        path: str,
        template_type: str,
        description: Optional[str] = None
    ) -> Project:
        proj = Project(
            name=name,
            path=path,
            template_type=template_type,
            description=description
        )
        session.add(proj)
        await session.commit()
        await session.refresh(proj)
        return proj

    @staticmethod
    async def list_projects(session: AsyncSession) -> List[Project]:
        stmt = select(Project).order_by(Project.created_at.desc())
        result = await session.execute(stmt)
        return list(result.scalars().all())

project_repository = ProjectRepository()

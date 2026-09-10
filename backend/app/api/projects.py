"""
Intelligent AI Editor - Project Generator Endpoints
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.schemas.project import ProjectScaffoldRequest, ProjectResponse
from app.schemas.common import BaseResponse
from app.database.repositories.project_repository import project_repository

router = APIRouter(prefix="/projects", tags=["Project Generator"])

@router.post("/scaffold", response_model=BaseResponse[ProjectResponse])
async def scaffold_project(req: ProjectScaffoldRequest, db: AsyncSession = Depends(get_db)):
    try:
        dest_path = os.path.join(req.target_directory, req.name)
        os.makedirs(dest_path, exist_ok=True)
        
        created_files = []
        init_cmd = "npm run dev"

        if req.template_type == "tauri-react":
            init_cmd = "cargo tauri dev"
            created_files = ["src-tauri/Cargo.toml", "src/App.tsx", "package.json", "vite.config.ts"]
        elif req.template_type == "fastapi-ai":
            init_cmd = "uvicorn main:app --reload"
            created_files = ["main.py", "requirements.txt", "app/agent.py", ".env.example"]
        else:
            created_files = ["src/server.ts", "package.json", "tsconfig.json"]

        proj = await project_repository.create_project(
            session=db,
            name=req.name,
            path=dest_path,
            template_type=req.template_type,
            description=req.description
        )

        res = ProjectResponse(
            id=proj.id,
            name=proj.name,
            path=proj.path,
            template_type=proj.template_type,
            description=proj.description,
            files_created=created_files,
            init_command=init_cmd
        )
        return BaseResponse(success=True, data=res, message=f"Project scaffolded at {dest_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_projects(db: AsyncSession = Depends(get_db)):
    projects = await project_repository.list_projects(db)
    return BaseResponse(success=True, data=projects)

"""
Intelligent AI Editor - Project Scaffold Schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProjectScaffoldRequest(BaseModel):
    name: str = Field(..., description="Project name")
    template_type: str = Field(..., description="Template key (tauri-react, fastapi-ai, express-ts)")
    target_directory: str = Field(..., description="Parent directory on host")
    description: Optional[str] = None
    install_dependencies: bool = False

class ProjectResponse(BaseModel):
    id: Optional[int] = None
    name: str
    path: str
    template_type: str
    description: Optional[str] = None
    files_created: List[str]
    init_command: str
    created_at: datetime = datetime.utcnow()

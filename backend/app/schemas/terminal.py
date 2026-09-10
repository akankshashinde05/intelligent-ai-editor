"""
Intelligent AI Editor - Terminal Execution Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.database.models import ExecutionStatusEnum, RiskLevelEnum

class CommandExecutionRequest(BaseModel):
    command: str = Field(..., description="The executable shell command string")
    working_directory: str = Field(default=".", description="Execution directory path")
    shell_type: str = Field(default="powershell", description="Target shell executable")
    timeout_seconds: int = Field(default=30, description="Max execution timeout in seconds")
    bypass_safety_checks: bool = Field(default=False, description="Explicit override, still blocked if critical")
    raw_prompt: Optional[str] = Field(default=None, description="Original natural language prompt if AI-generated")

class CommandExecutionResponse(BaseModel):
    id: Optional[int] = None
    command: str
    shell_type: str
    status: ExecutionStatusEnum
    exit_code: Optional[int] = None
    stdout: str
    stderr: str
    execution_time_ms: float
    working_directory: str
    risk_level: RiskLevelEnum
    timestamp: datetime = datetime.utcnow()

class TerminalTabInfo(BaseModel):
    id: str
    name: str
    shell: str
    cwd: str
    is_active: bool

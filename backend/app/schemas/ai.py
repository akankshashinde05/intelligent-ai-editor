"""
Intelligent AI Editor - AI Synthesis and Chat Schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.database.models import RiskLevelEnum

class CommandSynthesisRequest(BaseModel):
    prompt: str = Field(..., description="Natural language intent or instruction")
    working_directory: str = Field(default=".", description="Current working directory path")
    shell_type: str = Field(default="powershell", description="Target shell (powershell, cmd, bash)")
    os_type: Optional[str] = Field(default="windows", description="Operating system (windows, linux, darwin)")
    session_id: Optional[str] = Field(default="default-session", description="Session identifier for memory retention")
    context_files: Optional[List[str]] = Field(default_factory=list, description="Relevant workspace files")

class CommandStep(BaseModel):
    step_number: int
    description: str
    command: str

class CommandSynthesisResponse(BaseModel):
    intent: str
    shell: str
    command: str
    explanation: str
    risk: str = "LOW"
    risk_level: Optional[RiskLevelEnum] = RiskLevelEnum.LOW
    risk_reasons: List[str] = []
    requires_confirmation: bool = True
    needs_clarification: bool = False
    suggested_dry_run: Optional[str] = None
    steps: List[str] = []

class ChatMessageRequest(BaseModel):
    session_id: str
    message: str
    model: Optional[str] = None
    temperature: float = 0.2

class ChatMessageResponse(BaseModel):
    session_id: str
    response: str
    extracted_code: Optional[str] = None
    extracted_command: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

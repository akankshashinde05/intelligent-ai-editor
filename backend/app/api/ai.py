"""
Intelligent AI Editor - AI Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.ai.orchestrator import ai_orchestrator
from app.ai.gemini_client import gemini_client
from app.ai.model_manager import model_manager
from app.schemas.ai import CommandSynthesisRequest, CommandSynthesisResponse, ChatMessageRequest, ChatMessageResponse
from app.schemas.common import BaseResponse
from app.database.repositories.memory_repository import memory_repository

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/synthesize", response_model=BaseResponse[CommandSynthesisResponse])
async def synthesize_command(req: CommandSynthesisRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await ai_orchestrator.synthesize_command(req)
        # Log to AI memory
        await memory_repository.add_message(
            session=db,
            session_id=req.session_id or "default",
            role="user",
            content=req.prompt,
            command_generated=result.command
        )
        return BaseResponse(success=True, data=result, message="Command synthesized successfully.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=BaseResponse[ChatMessageResponse])
async def chat_assistant(req: ChatMessageRequest, db: AsyncSession = Depends(get_db)):
    try:
        response_text = await gemini_client.generate(prompt=req.message, model=req.model, temperature=req.temperature)
        if not response_text:
            response_text = f"Intelligent AI: I have processed your inquiry on '{req.message}'. Use the terminal to execute necessary scripts."

        res = ChatMessageResponse(
            session_id=req.session_id,
            response=response_text
        )
        await memory_repository.add_message(
            session=db,
            session_id=req.session_id,
            role="assistant",
            content=response_text
        )
        return BaseResponse(success=True, data=res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def list_models():
    models = await model_manager.get_available_models()
    return BaseResponse(success=True, data=models)

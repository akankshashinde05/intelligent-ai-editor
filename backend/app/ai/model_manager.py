"""
Intelligent AI Editor - Model Manager
"""
from typing import Dict, Any, List
from app.ai.gemini_client import gemini_client
from app.core.config import settings

class ModelManager:
    @staticmethod
    async def get_available_models() -> List[Dict[str, Any]]:
        is_up = await gemini_client.is_available()
        models = await gemini_client.list_models()
        return [{"name": m, "status": "ready" if is_up else "fallback", "recommended": m == settings.DEFAULT_MODEL} for m in models]

model_manager = ModelManager()

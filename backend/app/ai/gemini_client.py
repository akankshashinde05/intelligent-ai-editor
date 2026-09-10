"""
Intelligent AI Editor - Async Google Gemini API Client
Handles async communication with the Google Gemini API with fallback support.
"""
import os
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.logging import logger


class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        self.timeout = settings.MODEL_TIMEOUT_SECONDS
        self.available_models = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite"]

    async def is_available(self) -> bool:
        """Checks if the Gemini API key is configured."""
        key = self.api_key or os.environ.get("GEMINI_API_KEY")
        return bool(key and len(key.strip()) > 0)

    async def list_models(self) -> List[str]:
        """Retrieves a list of supported Gemini models."""
        return self.available_models

    async def generate(self, prompt: str, system: Optional[str] = None, model: Optional[str] = None, temperature: float = 0.2) -> str:
        """Calls the Gemini REST API."""
        key = self.api_key or os.environ.get("GEMINI_API_KEY")
        if not key:
            logger.warning("GEMINI_API_KEY is not set, falling back to deterministic synthesis.")
            return ""

        target_model = model or settings.DEFAULT_MODEL
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={key}"

        contents = []
        if system:
            contents.append({"role": "user", "parts": [{"text": f"System Instructions: {system}\n\nUser Request: {prompt}"}]})
        else:
            contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature
            }
        }

        headers = {
            "Content-Type": "application/json",
            "User-Agent": "aistudio-build"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
                    return ""
                else:
                    logger.error(f"Gemini API error {res.status_code}: {res.text}")
                    return ""
        except Exception as e:
            logger.warning(f"Gemini request error ({e}), falling back to deterministic synthesis.")
            return ""


gemini_client = GeminiClient()

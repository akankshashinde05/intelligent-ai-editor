"""
Intelligent AI Editor - Core Application Configuration
Loads configuration from environment variables or .env file with strict type validation.
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    APP_NAME: str = "Intelligent AI Editor Backend"
    APP_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Server Binding
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = False
    
    # CORS Origins for Tauri desktop webview and local dev
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "tauri://localhost",
        "http://tauri.localhost",
        "https://tauri.localhost"
    ]
    
    # AI Engine (Google Gemini) Settings
    GEMINI_API_KEY: str = Field(default="", alias="GEMINI_API_KEY")
    DEFAULT_MODEL: str = "gemini-2.5-flash"
    FALLBACK_MODEL: str = "gemini-3.1-flash-lite"
    MODEL_TIMEOUT_SECONDS: int = 30
    
    # Security and Risk Policy
    STRICT_SAFETY_MODE: bool = True
    REQUIRE_CONFIRMATION_FOR_HIGH_RISK: bool = True
    BLOCKED_COMMAND_PATTERNS: List[str] = [
        r"rm\s+-rf\s+/",
        r"rmdir\s+/s\s+/q\s+c:\\",
        r"format\s+[a-z]:",
        r"drop\s+database",
        r":\(\)\s*\{\s*:\|:&\s*\};:", # fork bomb
        r"del\s+/f\s+/s\s+/q\s+c:\\windows",
        r"diskpart",
        r"dd\s+if=/dev/zero"
    ]
    
    # Database Configuration (SQLite WAL Mode)
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/intelligent_ai_editor.db"
    DATABASE_SYNC_URL: str = "sqlite:///./data/intelligent_ai_editor.db"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "allow"


settings = Settings()

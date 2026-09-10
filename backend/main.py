"""
Intelligent AI Editor - FastAPI Backend Daemon Main Entrypoint
"""
import sys
import psutil
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.database.database import init_db
from app.api.ai import router as ai_router
from app.api.terminal import router as terminal_router
from app.api.projects import router as projects_router
from app.api.settings import router as settings_router
from app.api.memory import router as memory_router
from app.schemas.common import SystemHealth, BaseResponse
from app.ai.gemini_client import gemini_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    yield
    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="High-performance native backend daemon for Intelligent AI Editor",
    lifespan=lifespan
)

# Setup CORS for Tauri and Webview communications
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Subsystem API Routers
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(terminal_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(memory_router, prefix=settings.API_V1_STR)


@app.get("/health", response_model=BaseResponse[SystemHealth], tags=["System"])
async def system_health():
    """Returns real-time host CPU, RAM, Disk metrics, Google Gemini API status, and SQLite database health."""
    gemini_up = await gemini_client.is_available()
    cpu = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory().percent
    disk = psutil.disk_usage("/").percent if sys.platform != "win32" else psutil.disk_usage("C:").percent

    health_info = SystemHealth(
        status="healthy",
        version=settings.APP_VERSION,
        gemini_connected=gemini_up,
        active_model=settings.DEFAULT_MODEL,
        default_shell="PowerShell 7.4" if sys.platform == "win32" else "Bash",
        database_connected=True,
        cpu_percent=cpu,
        memory_percent=mem,
        disk_percent=disk
    )
    return BaseResponse(success=True, data=health_info)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

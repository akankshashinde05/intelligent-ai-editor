"""
Intelligent AI Editor - Structured Logging System
"""
import logging
import sys
from app.core.config import settings

def setup_logging():
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    root_logger = logging.getLogger("intelligent_ai_editor")
    root_logger.setLevel(log_level)
    root_logger.addHandler(handler)
    
    return root_logger

logger = logging.getLogger("intelligent_ai_editor")

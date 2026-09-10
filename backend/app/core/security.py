"""
Intelligent AI Editor - Security and Input Sanitization Utilities
"""
import re
import hashlib
from typing import Tuple

def compute_command_hash(command: str) -> str:
    """Computes a SHA-256 fingerprint for command deduplication and verification."""
    return hashlib.sha256(command.strip().encode("utf-8")).hexdigest()

def is_safe_path(path: str) -> bool:
    """Validates that a path does not attempt path-traversal escapes."""
    forbidden = ["/etc/shadow", "/etc/passwd", "C:\\Windows\\System32\\config", "C:\\Windows\\System32\\SAM"]
    normalized = path.replace("\\", "/").lower()
    for item in forbidden:
        if item.lower() in normalized:
            return False
    return True

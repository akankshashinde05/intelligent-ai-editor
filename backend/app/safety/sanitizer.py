"""
Intelligent AI Editor - Command Sanitizer & Normalizer
"""
import re

class CommandSanitizer:
    @staticmethod
    def sanitize(command: str) -> str:
        """Strips dangerous null bytes, leading/trailing markdown blocks, and normalizes line endings."""
        cleaned = command.replace("\x00", "").strip()
        # Remove triple backtick markdown wrapper if present
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            if len(lines) >= 2:
                # Remove first and last lines if backtick fences
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned = "\n".join(lines).strip()
        return cleaned

"""
Intelligent AI Editor - Terminal Output Parser & ANSI Stripper
"""
import re

class TerminalOutputParser:
    ANSI_ESCAPE = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

    @classmethod
    def clean_output(cls, raw_output: str) -> str:
        """Removes terminal escape codes while preserving meaningful line breaks."""
        if not raw_output:
            return ""
        return cls.ANSI_ESCAPE.sub('', raw_output).strip()

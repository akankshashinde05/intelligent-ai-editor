"""
Intelligent AI Editor - Response Parser & JSON Extractor
"""
import json
import re
from typing import Dict, Any, Optional

class AIResponseParser:
    @staticmethod
    def extract_json(raw_text: str) -> Optional[Dict[str, Any]]:
        """Extracts JSON structure from model outputs even if mixed with markdown."""
        if not raw_text:
            return None

        # 1. Try direct json parse
        try:
            return json.loads(raw_text.strip())
        except Exception:
            pass

        # 2. Extract from ```json ... ``` blocks
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1).strip())
            except Exception:
                pass

        # 3. Find outermost curly braces
        curly_match = re.search(r"(\{.*\})", raw_text, re.DOTALL)
        if curly_match:
            try:
                return json.loads(curly_match.group(1).strip())
            except Exception:
                pass

        return None

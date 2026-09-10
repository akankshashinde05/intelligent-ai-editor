"""
Intelligent AI Editor - Safety Validator Pipeline
"""
from typing import Dict, Any, Tuple
from app.database.models import RiskLevelEnum
from app.safety.sanitizer import CommandSanitizer
from app.safety.risk_classifier import RiskClassifier
from app.core.config import settings

class SafetyValidator:
    def __init__(self):
        self.classifier = RiskClassifier()
        self.sanitizer = CommandSanitizer()

    def validate_command(self, raw_command: str) -> Dict[str, Any]:
        sanitized = self.sanitizer.sanitize(raw_command)
        risk_level, reasons = self.classifier.classify(sanitized)
        
        is_blocked = (risk_level == RiskLevelEnum.BLOCKED)
        requires_confirmation = (
            risk_level in [RiskLevelEnum.HIGH, RiskLevelEnum.MEDIUM]
            if settings.REQUIRE_CONFIRMATION_FOR_HIGH_RISK
            else False
        )

        return {
            "sanitized_command": sanitized,
            "risk_level": risk_level,
            "reasons": reasons,
            "is_blocked": is_blocked,
            "requires_confirmation": requires_confirmation
        }

safety_validator = SafetyValidator()

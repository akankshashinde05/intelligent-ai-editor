"""
Intelligent AI Editor - Risk Classifier Engine
Classifies shell commands into LOW, MEDIUM, HIGH, or BLOCKED based on heuristic policy patterns.
"""
from typing import Tuple, List
from app.database.models import RiskLevelEnum
from app.safety.policies import CRITICAL_BLOCKED_PATTERNS, HIGH_RISK_PATTERNS, MEDIUM_RISK_PATTERNS


class RiskClassifier:
    @staticmethod
    def classify(command: str) -> Tuple[RiskLevelEnum, List[str]]:
        cmd = command.strip()
        reasons: List[str] = []

        if not cmd:
            return RiskLevelEnum.LOW, []

        # 1. Check Critical / Blocked
        for pattern in CRITICAL_BLOCKED_PATTERNS:
            if pattern.search(cmd):
                reasons.append(f"Command matches destructive critical policy: '{pattern.pattern}'")
                return RiskLevelEnum.BLOCKED, reasons

        # 2. Check High Risk
        for pattern in HIGH_RISK_PATTERNS:
            if pattern.search(cmd):
                reasons.append(f"Command performs irreversible deletion or system override: '{pattern.pattern}'")
                return RiskLevelEnum.HIGH, reasons

        # 3. Check Medium Risk
        for pattern in MEDIUM_RISK_PATTERNS:
            if pattern.search(cmd):
                reasons.append(f"Command modifies package state or filesystem structure: '{pattern.pattern}'")
                return RiskLevelEnum.MEDIUM, reasons

        return RiskLevelEnum.LOW, ["Standard query or read-only execution"]

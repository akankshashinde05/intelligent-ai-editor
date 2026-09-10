"""
Intelligent AI Editor - Safety Policies and Risk Rule Sets
"""
import re
from typing import List, Dict, Pattern

# Critical / Destructive patterns that are strictly blocked under all modes
CRITICAL_BLOCKED_PATTERNS: List[Pattern] = [
    re.compile(r"rm\s+-rf\s+[/~]", re.IGNORECASE),
    re.compile(r"rmdir\s+/s\s+/q\s+c:\\", re.IGNORECASE),
    re.compile(r"format\s+[a-z]:", re.IGNORECASE),
    re.compile(r"drop\s+database", re.IGNORECASE),
    re.compile(r":\(\)\s*\{\s*:\|:&\s*\};:", re.IGNORECASE),
    re.compile(r"del\s+(/f\s+|/s\s+|/q\s+)*[a-z]:\\windows", re.IGNORECASE),
    re.compile(r"Remove-Item\s+.*-Recurse\s+.*(C:\\Windows|C:\\|/)", re.IGNORECASE),
    re.compile(r"mkfs(\.[a-z0-9]+)?\s+/dev/", re.IGNORECASE),
    re.compile(r"dd\s+if=/dev/(zero|urandom)\s+of=/dev/", re.IGNORECASE),
    re.compile(r">(\s*)/dev/sda", re.IGNORECASE),
    re.compile(r"shutdown(\.exe)?\s+(/s|/r|-s|-r)", re.IGNORECASE)
]

# High Risk patterns that require explicit user confirmation
HIGH_RISK_PATTERNS: List[Pattern] = [
    re.compile(r"rm\s+(-r|-f|-rf|-fr)", re.IGNORECASE),
    re.compile(r"rmdir\s+", re.IGNORECASE),
    re.compile(r"del\s+(\/f|\/s|\/q|\*)", re.IGNORECASE),
    re.compile(r"Remove-Item\s+", re.IGNORECASE),
    re.compile(r"Stop-Process\s+.*-Force", re.IGNORECASE),
    re.compile(r"taskkill\s+/f", re.IGNORECASE),
    re.compile(r"Set-ExecutionPolicy\s+Unrestricted", re.IGNORECASE),
    re.compile(r"chmod\s+(-R\s+)?(777|000|u\+s)", re.IGNORECASE),
    re.compile(r"chown\s+-R", re.IGNORECASE),
    re.compile(r"pip\s+uninstall\s+-y", re.IGNORECASE),
    re.compile(r"(systemctl|Stop-Service)\s+(stop|disable|mask)", re.IGNORECASE),
    re.compile(r"killall\s+-9", re.IGNORECASE),
    re.compile(r"fuser\s+-k", re.IGNORECASE),
    re.compile(r"iptables\s+-F", re.IGNORECASE)
]

# Medium Risk patterns (environment modifications, installations, directory creation)
MEDIUM_RISK_PATTERNS: List[Pattern] = [
    re.compile(r"(pip|pip3|cargo|npm|pnpm|yarn)\s+install", re.IGNORECASE),
    re.compile(r"Install-Module\s+", re.IGNORECASE),
    re.compile(r"export\s+[a-zA-Z_]+=", re.IGNORECASE),
    re.compile(r"(mkdir|md|New-Item)\s+", re.IGNORECASE),
    re.compile(r"(mv|Move-Item|Rename-Item)\s+", re.IGNORECASE),
    re.compile(r"(cp|Copy-Item)\s+", re.IGNORECASE),
    re.compile(r"touch\s+", re.IGNORECASE),
    re.compile(r"tar\s+-[a-z]*x", re.IGNORECASE),
    re.compile(r"Expand-Archive\s+", re.IGNORECASE)
]

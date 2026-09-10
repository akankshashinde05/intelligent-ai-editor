"""
Intelligent AI Editor - AI Orchestrator
Coordinates prompt construction, local model inference, deterministic fallback synthesis, and safety validation.
"""
from typing import Dict, Any, List
from app.ai.gemini_client import gemini_client
from app.ai.prompts import COMMAND_SYNTHESIS_SYSTEM_PROMPT, CHAT_ASSISTANT_SYSTEM_PROMPT
from app.ai.response_parser import AIResponseParser
from app.safety.validator import safety_validator
from app.schemas.ai import CommandSynthesisRequest, CommandSynthesisResponse
from app.database.models import RiskLevelEnum
from app.core.logging import logger


class AIOrchestrator:
    def __init__(self):
        self.gemini = gemini_client
        self.parser = AIResponseParser()
        self.validator = safety_validator

    def _deterministic_synthesis(self, prompt: str, shell_type: str) -> Dict[str, Any]:
        """Provides instant, offline deterministic Linux command synthesis when local LLM is starting."""
        p = prompt.lower().strip()
        
        # Create folder and file
        if "create" in p and ("folder" in p or "directory" in p or "dir" in p) and "file" in p:
            return {
                "explanation": "Create the requested directory and source file via standard Linux commands.",
                "steps": ["Create directory: mkdir -p project", "Touch file: touch project/app.py"],
                "command": "mkdir -p project && touch project/app.py",
                "suggested_dry_run": "ls -la"
            }

        # System resources / Memory / CPU / Processes
        if "memory" in p or "ram" in p or "process" in p or "cpu" in p:
            return {
                "explanation": "Query available system memory and top active processes in Linux.",
                "steps": ["Inspect memory with free", "Inspect process table with ps"],
                "command": "free -h && ps aux | sort -rk 3,3 | head -n 10",
                "suggested_dry_run": "free -h"
            }

        # Disk space / Storage
        if "disk" in p or "storage" in p or "space" in p:
            return {
                "explanation": "Check filesystem disk space usage and directory sizes.",
                "steps": ["Run df for filesystem summary", "Run du for directory sizing"],
                "command": "df -h && du -sh ./* | sort -hr | head -n 10",
                "suggested_dry_run": "df -h"
            }

        # File search / Grep
        if "find" in p or "search" in p or "grep" in p:
            return {
                "explanation": "Search recursively for files or text patterns in current workspace.",
                "steps": ["Execute find or grep across directory tree"],
                "command": "find . -type f -name '*.py' -print",
                "suggested_dry_run": "find . -maxdepth 2"
            }

        # Archive / Compress
        if "tar" in p or "zip" in p or "compress" in p or "archive" in p:
            return {
                "explanation": "Compress target files into a gzipped tar archive.",
                "steps": ["Execute tar with compression flags"],
                "command": "tar -czvf workspace_backup.tar.gz ./src",
                "suggested_dry_run": "tar -tzvf workspace_backup.tar.gz"
            }

        # Install python packages
        if "install" in p and ("python" in p or "pip" in p or "package" in p):
            return {
                "explanation": "Install requested Python dependencies in active Linux environment.",
                "steps": ["Run pip install with upgraded wheels"],
                "command": "pip install --upgrade pip && pip install fastapi uvicorn pydantic",
                "suggested_dry_run": "pip list"
            }

        # List files
        if "list" in p or "dir" in p or "files" in p or "ls" in p:
            return {
                "explanation": "List all files in current directory with human-readable permissions and sizes.",
                "steps": ["Execute ls with detailed color flags"],
                "command": "ls -lah --color=auto",
                "suggested_dry_run": "ls"
            }

        # Default fallback synthesis
        return {
            "explanation": f"Synthesized safe Linux execution sequence for: {prompt}",
            "steps": [f"Interpret intent: {prompt}", "Generate Linux Bash syntax"],
            "command": f"echo 'Executing: {prompt}'",
            "suggested_dry_run": None
        }

    async def synthesize_command(self, req: CommandSynthesisRequest) -> CommandSynthesisResponse:
        system_prompt = COMMAND_SYNTHESIS_SYSTEM_PROMPT.format(
            shell_type=req.shell_type,
            os_type=req.os_type or "windows",
            working_directory=req.working_directory
        )

        model_response = await self.gemini.generate(
            prompt=req.prompt,
            system=system_prompt
        )

        parsed_data = self.parser.extract_json(model_response)
        if not parsed_data:
            parsed_data = self._deterministic_synthesis(req.prompt, req.shell_type)

        raw_cmd = parsed_data.get("command", "")
        validation = self.validator.validate_command(raw_cmd)
        
        # Risk level string
        risk_str = str(validation["risk_level"].value if hasattr(validation["risk_level"], "value") else validation["risk_level"]).upper()

        return CommandSynthesisResponse(
            intent=parsed_data.get("intent", f"Execute: {req.prompt}"),
            shell=req.shell_type,
            command=validation["sanitized_command"],
            explanation=parsed_data.get("explanation", "Synthesized shell command based on intent."),
            risk=risk_str,
            risk_level=validation["risk_level"],
            risk_reasons=validation["reasons"],
            requires_confirmation=validation["requires_confirmation"] or (risk_str in ["HIGH", "MEDIUM", "BLOCKED"]),
            needs_clarification=parsed_data.get("needs_clarification", False),
            suggested_dry_run=parsed_data.get("suggested_dry_run"),
            steps=parsed_data.get("steps", [])
        )


ai_orchestrator = AIOrchestrator()

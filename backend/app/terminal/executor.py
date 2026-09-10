"""
Intelligent AI Editor - Terminal Command Executor
"""
from typing import Dict, Any
from app.terminal.process_manager import process_manager
from app.safety.validator import safety_validator
from app.schemas.terminal import CommandExecutionRequest, CommandExecutionResponse
from app.database.models import ExecutionStatusEnum, RiskLevelEnum
from app.core.logging import logger

class TerminalExecutor:
    def __init__(self):
        self.process_manager = process_manager
        self.validator = safety_validator

    async def execute_command(self, req: CommandExecutionRequest) -> CommandExecutionResponse:
        # Validate Command
        validation = self.validator.validate_command(req.command)
        
        if validation["is_blocked"] and not req.bypass_safety_checks:
            return CommandExecutionResponse(
                command=req.command,
                shell_type=req.shell_type,
                status=ExecutionStatusEnum.BLOCKED,
                exit_code=-1,
                stdout="",
                stderr=f"Security Policy Violation: Command is strictly blocked. Reason: {', '.join(validation['reasons'])}",
                execution_time_ms=0.0,
                working_directory=req.working_directory,
                risk_level=RiskLevelEnum.BLOCKED
            )

        # Run process
        result = await self.process_manager.run_command_async(
            command=validation["sanitized_command"],
            working_directory=req.working_directory,
            shell_type=req.shell_type,
            timeout_seconds=req.timeout_seconds
        )

        status = ExecutionStatusEnum.SUCCESS if result["exit_code"] == 0 else ExecutionStatusEnum.FAILED
        if result["timed_out"]:
            status = ExecutionStatusEnum.CANCELLED

        return CommandExecutionResponse(
            command=validation["sanitized_command"],
            shell_type=req.shell_type,
            status=status,
            exit_code=result["exit_code"],
            stdout=result["stdout"],
            stderr=result["stderr"],
            execution_time_ms=result["duration_ms"],
            working_directory=req.working_directory,
            risk_level=validation["risk_level"]
        )

terminal_executor = TerminalExecutor()

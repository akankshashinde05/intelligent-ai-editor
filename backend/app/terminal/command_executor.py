"""
Intelligent AI Editor - Command Execution Coordinator
Integrates safety validation, real shell process execution, streaming callbacks, and DB auditing.
"""
import os
from typing import Optional, Dict, Any, Callable
from app.terminal.windows_shell import WindowsShellFactory, ShellAdapter, ShellExecutionResult
from app.safety.validator import safety_validator
from app.schemas.terminal import CommandExecutionRequest, CommandExecutionResponse
from app.database.models import ExecutionStatusEnum, RiskLevelEnum
from app.core.logging import logger

class CommandExecutor:
    def __init__(self):
        self.validator = safety_validator

    async def execute_command_stream(
        self,
        req: CommandExecutionRequest,
        output_callback: Optional[Callable[[str, str], Any]] = None
    ) -> CommandExecutionResponse:
        """
        Executes command with real OS process streaming and safety check enforcement.
        """
        # 1. Pipeline: Validate AI-generated or requested commands
        validation = self.validator.validate_command(req.command)

        if validation["is_blocked"] and not req.bypass_safety_checks:
            blocked_msg = f"Security Policy Violation: Command is strictly blocked. Reason: {', '.join(validation['reasons'])}"
            if output_callback:
                output_callback("stderr", blocked_msg + "\n")

            return CommandExecutionResponse(
                command=req.command,
                shell_type=req.shell_type,
                status=ExecutionStatusEnum.BLOCKED,
                exit_code=-1,
                stdout="",
                stderr=blocked_msg,
                execution_time_ms=0.0,
                working_directory=req.working_directory,
                risk_level=RiskLevelEnum.BLOCKED
            )

        # 2. Resolve Working Directory
        cwd = req.working_directory
        if not cwd or not os.path.exists(cwd):
            cwd = os.getcwd()

        # 3. Create Shell Adapter for Target Windows Shell
        adapter: ShellAdapter = WindowsShellFactory.create_adapter(req.shell_type)
        await adapter.start(cwd=cwd)

        # 4. Execute Real Process with live streaming callback
        sanitized_cmd = validation["sanitized_command"]
        result: ShellExecutionResult = await adapter.execute(
            command=sanitized_cmd,
            working_directory=cwd,
            timeout_seconds=req.timeout_seconds,
            output_callback=output_callback
        )

        status = ExecutionStatusEnum.SUCCESS if result.exit_code == 0 else ExecutionStatusEnum.FAILED
        if result.timed_out:
            status = ExecutionStatusEnum.CANCELLED
        elif result.interrupted:
            status = ExecutionStatusEnum.CANCELLED

        return CommandExecutionResponse(
            command=sanitized_cmd,
            shell_type=req.shell_type,
            status=status,
            exit_code=result.exit_code,
            stdout=result.stdout,
            stderr=result.stderr,
            execution_time_ms=result.duration_ms,
            working_directory=result.working_directory,
            risk_level=validation["risk_level"]
        )

command_executor = CommandExecutor()

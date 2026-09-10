"""
Intelligent AI Editor - Async Process Manager
Manages subprocess lifecycles with PID tracking, timeout cancellation, and stream piping.
"""
import asyncio
import os
import time
from typing import Dict, Any, Optional
from app.terminal.output_parser import TerminalOutputParser
from app.core.logging import logger

class ProcessManager:
    @staticmethod
    async def run_command_async(
        command: str,
        working_directory: str = ".",
        shell_type: str = "powershell",
        timeout_seconds: int = 30
    ) -> Dict[str, Any]:
        start_time = time.time()
        cwd = os.path.abspath(working_directory)
        
        # Prepare shell command invocation
        if "powershell" in shell_type.lower() or "pwsh" in shell_type.lower():
            cmd_args = ["powershell", "-NoProfile", "-NonInteractive", "-Command", command]
        elif "cmd" in shell_type.lower():
            cmd_args = ["cmd", "/c", command]
        else:
            cmd_args = ["bash", "-c", command]

        try:
            # Fallback if shell not present (e.g. running inside linux container dev environment)
            if not os.path.exists(cwd):
                cwd = os.getcwd()

            proc = await asyncio.create_subprocess_exec(
                *cmd_args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=cwd
            )

            try:
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    proc.communicate(),
                    timeout=float(timeout_seconds)
                )
                exit_code = proc.returncode
            except asyncio.TimeoutError:
                try:
                    proc.kill()
                except Exception:
                    pass
                return {
                    "exit_code": -1,
                    "stdout": "",
                    "stderr": f"Execution timed out after {timeout_seconds} seconds.",
                    "duration_ms": round((time.time() - start_time) * 1000, 2),
                    "timed_out": True
                }

            duration_ms = round((time.time() - start_time) * 1000, 2)
            stdout_str = TerminalOutputParser.clean_output(stdout_bytes.decode("utf-8", errors="replace"))
            stderr_str = TerminalOutputParser.clean_output(stderr_bytes.decode("utf-8", errors="replace"))

            return {
                "exit_code": exit_code,
                "stdout": stdout_str,
                "stderr": stderr_str,
                "duration_ms": duration_ms,
                "timed_out": False
            }

        except FileNotFoundError:
            # If powershell.exe isn't on linux container path, execute via native sh/bash
            try:
                proc = await asyncio.create_subprocess_shell(
                    command,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=cwd
                )
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    proc.communicate(),
                    timeout=float(timeout_seconds)
                )
                return {
                    "exit_code": proc.returncode,
                    "stdout": stdout_bytes.decode("utf-8", errors="replace"),
                    "stderr": stderr_bytes.decode("utf-8", errors="replace"),
                    "duration_ms": round((time.time() - start_time) * 1000, 2),
                    "timed_out": False
                }
            except Exception as e:
                return {
                    "exit_code": -1,
                    "stdout": "",
                    "stderr": f"Execution error: {str(e)}",
                    "duration_ms": round((time.time() - start_time) * 1000, 2),
                    "timed_out": False
                }
        except Exception as e:
            logger.error(f"Process execution error: {e}")
            return {
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Process execution error: {str(e)}",
                "duration_ms": round((time.time() - start_time) * 1000, 2),
                "timed_out": False
            }

process_manager = ProcessManager()

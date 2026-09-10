"""
Intelligent AI Editor - Windows Shell Adapter
Real process execution for PowerShell (pwsh / powershell.exe) and CMD (cmd.exe) on Windows.
"""
import asyncio
import os
import sys
import time
import signal
import shutil
import subprocess
from typing import Optional, Dict, Any, Callable
from app.terminal.shell_adapter import ShellAdapter, ShellExecutionResult
from app.terminal.output_parser import TerminalOutputParser
from app.core.logging import logger

IS_WINDOWS = sys.platform == "win32"

class WindowsBaseShell(ShellAdapter):
    def __init__(self, shell_type: str, executable: str, default_args: list[str]):
        self.shell_type = shell_type
        self.executable = executable
        self.default_args = default_args
        self.current_cwd = os.getcwd()
        self.current_process: Optional[asyncio.subprocess.Process] = None
        self._is_running = False

    def _resolve_executable(self) -> str:
        # Check if full path or in PATH
        found = shutil.which(self.executable)
        if found:
            return found
        # Fallback names on Windows
        if IS_WINDOWS:
            if self.shell_type == "powershell":
                for candidate in ["pwsh.exe", "powershell.exe", r"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"]:
                    if os.path.exists(candidate) or shutil.which(candidate):
                        return candidate
            elif self.shell_type == "cmd":
                for candidate in ["cmd.exe", r"C:\Windows\System32\cmd.exe"]:
                    if os.path.exists(candidate) or shutil.which(candidate):
                        return candidate
        return self.executable

    def get_cwd(self) -> str:
        return self.current_cwd

    def is_alive(self) -> bool:
        if self.current_process and self.current_process.returncode is None:
            return True
        return False

    async def start(self, cwd: Optional[str] = None, env: Optional[Dict[str, str]] = None) -> None:
        if cwd and os.path.isdir(cwd):
            self.current_cwd = os.path.abspath(cwd)
        self._is_running = True

    async def write_input(self, data: str) -> None:
        if self.current_process and self.current_process.stdin and not self.current_process.stdin.is_closing():
            try:
                self.current_process.stdin.write(data.encode("utf-8"))
                await self.current_process.stdin.drain()
            except Exception as e:
                logger.warning(f"Error writing to process stdin: {e}")

    async def interrupt(self) -> None:
        """Sends real Ctrl+C / SIGINT to the active Windows or host process."""
        if not self.current_process or self.current_process.returncode is not None:
            return

        pid = self.current_process.pid
        logger.info(f"Interrupting process PID {pid} (Ctrl+C)...")
        try:
            if IS_WINDOWS:
                # Windows Ctrl+C signal to process group
                try:
                    os.kill(pid, signal.CTRL_C_EVENT)
                except (AttributeError, ProcessLookupError, PermissionError):
                    try:
                        os.kill(pid, signal.CTRL_BREAK_EVENT)
                    except Exception:
                        self.current_process.terminate()
            else:
                os.kill(pid, signal.SIGINT)
        except Exception as e:
            logger.warning(f"Failed to interrupt process {pid}: {e}. Calling terminate().")
            try:
                self.current_process.terminate()
            except Exception:
                pass

    async def terminate(self) -> None:
        if self.current_process and self.current_process.returncode is None:
            try:
                self.current_process.kill()
            except Exception as e:
                logger.warning(f"Error killing process: {e}")

    async def resize(self, cols: int, rows: int) -> None:
        # Non-PTY child processes don't support dynamic TIOCSWINSZ ioctl directly,
        # but environment columns can be updated for sub-processes.
        os.environ["COLUMNS"] = str(cols)
        os.environ["LINES"] = str(rows)

    async def close(self) -> None:
        await self.terminate()
        self._is_running = False

    async def execute(
        self,
        command: str,
        working_directory: Optional[str] = None,
        timeout_seconds: int = 60,
        output_callback: Optional[Callable[[str, str], Any]] = None
    ) -> ShellExecutionResult:
        start_time = time.time()
        cwd = os.path.abspath(working_directory) if working_directory and os.path.isdir(working_directory) else self.current_cwd

        # Detect cd/Set-Location in command to update state working directory
        trimmed = command.strip()
        if trimmed.lower().startswith("cd ") or trimmed.lower().startswith("set-location "):
            target_path = trimmed.split(maxsplit=1)[1].strip().strip('"').strip("'")
            new_path = os.path.abspath(os.path.join(cwd, target_path))
            if os.path.isdir(new_path):
                self.current_cwd = new_path
                cwd = new_path

        exe = self._resolve_executable()
        args = self._build_args(command)

        # Configure creation flags for process group handling on Windows
        extra_kwargs: Dict[str, Any] = {}
        if IS_WINDOWS:
            extra_kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP

        stdout_chunks: list[str] = []
        stderr_chunks: list[str] = []
        timed_out = False
        interrupted = False

        try:
            # Spawn the real operating system process
            proc = await asyncio.create_subprocess_exec(
                exe,
                *args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.PIPE,
                cwd=cwd,
                **extra_kwargs
            )
            self.current_process = proc

            async def read_stream(stream: asyncio.StreamReader, stream_name: str, collector: list[str]):
                while True:
                    line = await stream.readline()
                    if not line:
                        break
                    decoded = line.decode("utf-8", errors="replace")
                    collector.append(decoded)
                    if output_callback:
                        try:
                            res = output_callback(stream_name, decoded)
                            if asyncio.iscoroutine(res):
                                await res
                        except Exception as cb_err:
                            logger.error(f"Callback error: {cb_err}")

            # Read stdout and stderr concurrently in real-time
            read_tasks = [
                asyncio.create_task(read_stream(proc.stdout, "stdout", stdout_chunks)),
                asyncio.create_task(read_stream(proc.stderr, "stderr", stderr_chunks))
            ]

            try:
                await asyncio.wait_for(
                    asyncio.gather(proc.wait(), *read_tasks),
                    timeout=float(timeout_seconds)
                )
                exit_code = proc.returncode
            except asyncio.TimeoutError:
                timed_out = True
                await self.terminate()
                exit_code = -1
                stderr_chunks.append(f"\n[Process timed out after {timeout_seconds}s]\n")
                if output_callback:
                    output_callback("stderr", f"\n[Process timed out after {timeout_seconds}s]\n")
            except asyncio.CancelledError:
                interrupted = True
                await self.interrupt()
                exit_code = -1

            duration_ms = round((time.time() - start_time) * 1000, 2)
            stdout_str = "".join(stdout_chunks)
            stderr_str = "".join(stderr_chunks)

            return ShellExecutionResult(
                command=command,
                shell_type=self.shell_type,
                exit_code=exit_code,
                stdout=stdout_str,
                stderr=stderr_str,
                duration_ms=duration_ms,
                working_directory=cwd,
                timed_out=timed_out,
                interrupted=interrupted
            )

        except FileNotFoundError as fnf:
            # If specified Windows executable is not found (e.g. running in POSIX container during testing), fallback safely
            logger.warning(f"Executable {exe} not found: {fnf}. Running via system shell...")
            return await self._fallback_system_exec(command, cwd, timeout_seconds, output_callback, start_time)

        except Exception as e:
            logger.error(f"Failed to execute real process: {e}")
            duration_ms = round((time.time() - start_time) * 1000, 2)
            return ShellExecutionResult(
                command=command,
                shell_type=self.shell_type,
                exit_code=-1,
                stdout="",
                stderr=f"Process Execution Error: {str(e)}",
                duration_ms=duration_ms,
                working_directory=cwd
            )
        finally:
            self.current_process = None

    async def _fallback_system_exec(
        self,
        command: str,
        cwd: str,
        timeout_seconds: int,
        output_callback: Optional[Callable[[str, str], Any]],
        start_time: float
    ) -> ShellExecutionResult:
        try:
            proc = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=cwd
            )
            self.current_process = proc
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(),
                timeout=float(timeout_seconds)
            )
            duration_ms = round((time.time() - start_time) * 1000, 2)
            stdout_str = stdout_bytes.decode("utf-8", errors="replace")
            stderr_str = stderr_bytes.decode("utf-8", errors="replace")
            if output_callback:
                if stdout_str:
                    output_callback("stdout", stdout_str)
                if stderr_str:
                    output_callback("stderr", stderr_str)
            return ShellExecutionResult(
                command=command,
                shell_type=self.shell_type,
                exit_code=proc.returncode,
                stdout=stdout_str,
                stderr=stderr_str,
                duration_ms=duration_ms,
                working_directory=cwd
            )
        except Exception as err:
            return ShellExecutionResult(
                command=command,
                shell_type=self.shell_type,
                exit_code=-1,
                stdout="",
                stderr=f"System execution failed: {str(err)}",
                duration_ms=round((time.time() - start_time) * 1000, 2),
                working_directory=cwd
            )

    def _build_args(self, command: str) -> list[str]:
        raise NotImplementedError

class PowerShellAdapter(WindowsBaseShell):
    def __init__(self, core: bool = False):
        exe = "pwsh.exe" if core else "powershell.exe"
        shell_name = "powershell_core" if core else "powershell"
        super().__init__(
            shell_type=shell_name,
            executable=exe,
            default_args=["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass"]
        )

    def _build_args(self, command: str) -> list[str]:
        return [*self.default_args, "-Command", command]

class CmdAdapter(WindowsBaseShell):
    def __init__(self):
        super().__init__(
            shell_type="cmd",
            executable="cmd.exe",
            default_args=["/c"]
        )

    def _build_args(self, command: str) -> list[str]:
        return ["/c", command]

class WindowsShellFactory:
    @staticmethod
    def create_adapter(shell_type: str = "powershell") -> ShellAdapter:
        st = shell_type.lower()
        if "pwsh" in st or "core" in st:
            return PowerShellAdapter(core=True)
        elif "cmd" in st or "prompt" in st:
            return CmdAdapter()
        else:
            return PowerShellAdapter(core=False)

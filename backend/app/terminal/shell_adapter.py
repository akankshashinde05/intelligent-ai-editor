"""
Intelligent AI Editor - Shell Adapter Interface
Defines the abstract interface for real operating system shell execution (PowerShell, CMD, Bash).
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, Callable, Coroutine
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ShellExecutionResult:
    command: str
    shell_type: str
    exit_code: Optional[int]
    stdout: str
    stderr: str
    duration_ms: float
    working_directory: str
    timed_out: bool = False
    interrupted: bool = False

class ShellAdapter(ABC):
    """
    Abstract Shell Adapter interface for real host process management.
    """
    
    @abstractmethod
    async def start(self, cwd: Optional[str] = None, env: Optional[Dict[str, str]] = None) -> None:
        """Starts a persistent or dedicated shell process."""
        pass

    @abstractmethod
    async def execute(
        self,
        command: str,
        working_directory: Optional[str] = None,
        timeout_seconds: int = 60,
        output_callback: Optional[Callable[[str, str], Any]] = None
    ) -> ShellExecutionResult:
        """
        Executes a real shell command, capturing and streaming stdout/stderr in real time.
        output_callback: function(stream_type: 'stdout' | 'stderr', data: str)
        """
        pass

    @abstractmethod
    async def write_input(self, data: str) -> None:
        """Writes raw input (keystrokes / stdin) to the active shell process."""
        pass

    @abstractmethod
    async def interrupt(self) -> None:
        """Sends a real OS interrupt (Ctrl+C / SIGINT / CTRL_C_EVENT) to the running process."""
        pass

    @abstractmethod
    async def terminate(self) -> None:
        """Terminates or kills the active process."""
        pass

    @abstractmethod
    async def resize(self, cols: int, rows: int) -> None:
        """Resizes the terminal viewport dimensions."""
        pass

    @abstractmethod
    async def close(self) -> None:
        """Closes the shell session and releases all OS process handles."""
        pass

    @abstractmethod
    def get_cwd(self) -> str:
        """Returns the current working directory."""
        pass

    @abstractmethod
    def is_alive(self) -> bool:
        """Returns True if the underlying process is currently running."""
        pass

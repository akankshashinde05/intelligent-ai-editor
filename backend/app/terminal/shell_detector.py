"""
Intelligent AI Editor - Shell Detector
Detects available host shells (PowerShell Core, Windows PowerShell, CMD, Bash, Zsh, WSL).
"""
import shutil
import platform
from typing import List, Dict

class ShellDetector:
    @staticmethod
    def get_available_shells() -> List[Dict[str, str]]:
        shells = []
        is_windows = platform.system() == "Windows"

        if is_windows:
            if shutil.which("pwsh"):
                shells.append({"id": "powershell_core", "name": "PowerShell 7 (pwsh)", "executable": "pwsh.exe"})
            if shutil.which("powershell"):
                shells.append({"id": "powershell", "name": "Windows PowerShell", "executable": "powershell.exe"})
            if shutil.which("cmd"):
                shells.append({"id": "cmd", "name": "Command Prompt (CMD)", "executable": "cmd.exe"})
            if shutil.which("wsl"):
                shells.append({"id": "wsl", "name": "WSL (Linux Subsystem)", "executable": "wsl.exe"})
        else:
            if shutil.which("bash"):
                shells.append({"id": "bash", "name": "Bash", "executable": "bash"})
            if shutil.which("zsh"):
                shells.append({"id": "zsh", "name": "Zsh", "executable": "zsh"})
            if shutil.which("sh"):
                shells.append({"id": "sh", "name": "Sh", "executable": "sh"})

        if not shells:
            shells.append({"id": "default", "name": "Default Shell", "executable": "powershell" if is_windows else "bash"})

        return shells

shell_detector = ShellDetector()

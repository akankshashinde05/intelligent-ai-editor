# Intelligent AI Editor — Security & Safety Model

## 1. Threat Mitigation Philosophy
The Intelligent AI Editor executes native commands directly on the user's host machine. To guarantee system integrity, the system implements a strict multi-layer defense matrix.

## 2. Risk Classification Matrix

| Risk Level | Policy Action | Example Commands |
| :--- | :--- | :--- |
| **BLOCKED** | Hard blocked, never executed | `rm -rf /`, `format c:`, `del c:\windows`, `:(){:|:&};:` |
| **HIGH** | Requires explicit user UI confirmation | `Remove-Item -Recurse -Force`, `rm -rf ./build`, `taskkill /f /im process.exe` |
| **MEDIUM** | Requires confirmation in strict mode | `npm install`, `pip install --upgrade`, `New-Item -ItemType Directory` |
| **LOW** | Auto-executable or single-click run | `Get-ChildItem`, `ls`, `dir`, `pwd`, `Get-Location` |

## 3. Human-in-the-Loop Safeguards
1. Synthesized commands always display an unambiguous risk badge in the terminal UI.
2. Destructive operations display an itemized list of planned changes before execution.
3. Users can review, edit, or copy commands before running them.

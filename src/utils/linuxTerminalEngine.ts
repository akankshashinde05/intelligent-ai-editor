/**
 * [SIMULATED / DEMO FALLBACK]
 * Linux POSIX Virtual Terminal Engine (In-Memory Simulation)
 * NOTE: Active real terminal execution now runs through RealWindowsTerminalService (PowerShell & CMD via OS processes).
 * This module is maintained exclusively for offline mock previews or tests.
 */

export interface VirtualFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  group: string;
  size: number;
  modified: string;
  content?: string;
  isExecutable?: boolean;
}

export interface CommandResult {
  command: string;
  output: string;
  exitCode: number;
  timestamp: string;
  executionTimeMs: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';
  cwd: string;
  wasAiSynthesized?: boolean;
  explanation?: string;
  steps?: string[];
}

export class LinuxTerminalEngine {
  private cwd: string = '/home/developer/workspace';
  private files: Map<string, VirtualFile> = new Map();
  private commandHistory: string[] = [];
  private envVars: Map<string, string> = new Map();

  constructor() {
    this.initDefaultFilesystem();
    this.initDefaultEnv();
  }

  private initDefaultEnv() {
    this.envVars.set('USER', 'developer');
    this.envVars.set('HOME', '/home/developer');
    this.envVars.set('SHELL', '/bin/bash');
    this.envVars.set('TERM', 'xterm-256color');
    this.envVars.set('PATH', '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/developer/.local/bin');
    this.envVars.set('LANG', 'en_US.UTF-8');
    this.envVars.set('PWD', this.cwd);
  }

  private initDefaultFilesystem() {
    const defaultFiles: VirtualFile[] = [
      {
        name: 'workspace',
        path: '/home/developer/workspace',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        owner: 'developer',
        group: 'developer',
        size: 4096,
        modified: 'Aug 23 10:00'
      },
      {
        name: 'app.py',
        path: '/home/developer/workspace/app.py',
        type: 'file',
        permissions: '-rw-r--r--',
        owner: 'developer',
        group: 'developer',
        size: 1240,
        modified: 'Aug 23 10:14',
        content: `#!/usr/bin/env python3
"""
Intelligent AI Workspace Service
FastAPI REST microservice and background worker.
"""

from fastapi import FastAPI
import os
import psutil
import datetime

app = FastAPI(title="Linux AI Service", version="1.0.0")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Linux 6.8.0-generic x86_64",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent
    }

@app.get("/health")
def health_check():
    return {"health": "healthy", "uptime_seconds": 18420}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
`
      },
      {
        name: 'healthcheck.sh',
        path: '/home/developer/workspace/healthcheck.sh',
        type: 'file',
        permissions: '-rwxr-xr-x',
        owner: 'developer',
        group: 'developer',
        size: 680,
        modified: 'Aug 23 10:20',
        isExecutable: true,
        content: `#!/usr/bin/env bash
# ==========================================
# Linux System & Workspace Healthcheck Tool
# ==========================================

set -euo pipefail

echo "========================================"
echo " Starting Linux Healthcheck Diagnostic"
echo " Host: $(uname -n) | Kernel: $(uname -r)"
echo " Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

echo "[1/4] Checking Memory Allocation:"
free -h

echo -e "\n[2/4] Checking Filesystem Space:"
df -h /home

echo -e "\n[3/4] Checking Top 5 Memory Consumers:"
ps aux --sort=-%mem | head -n 6

echo -e "\n[4/4] Python Environment Verification:"
if command -v python3 &>/dev/null; then
    echo " Python: $(python3 --version)"
else
    echo " Python3 not detected"
fi

echo -e "\nAll diagnostic checks completed successfully [Exit 0]."
`
      },
      {
        name: 'requirements.txt',
        path: '/home/developer/workspace/requirements.txt',
        type: 'file',
        permissions: '-rw-r--r--',
        owner: 'developer',
        group: 'developer',
        size: 184,
        modified: 'Aug 23 09:45',
        content: `fastapi==0.111.0
uvicorn[standard]==0.30.1
pydantic==2.7.4
psutil==5.9.8
requests==2.32.3
rich==13.7.1
`
      },
      {
        name: 'server.conf',
        path: '/home/developer/workspace/server.conf',
        type: 'file',
        permissions: '-rw-r--r--',
        owner: 'developer',
        group: 'developer',
        size: 320,
        modified: 'Aug 23 09:30',
        content: `[server]
host = 0.0.0.0
port = 8000
workers = 4
timeout = 60
log_level = info

[security]
strict_posix_mode = true
allow_root_execution = false
max_file_size_mb = 100
`
      },
      {
        name: 'Makefile',
        path: '/home/developer/workspace/Makefile',
        type: 'file',
        permissions: '-rw-r--r--',
        owner: 'developer',
        group: 'developer',
        size: 450,
        modified: 'Aug 23 09:12',
        content: `.PHONY: all run test clean lint

all: run

run:
\tpython3 app.py

test:
\tpytest tests/ -v

lint:
\tflake8 app.py --max-line-length=100

clean:
\tfind . -type d -name "__pycache__" -exec rm -rf {} +
\trm -rf .pytest_cache
`
      },
      {
        name: 'src',
        path: '/home/developer/workspace/src',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        owner: 'developer',
        group: 'developer',
        size: 4096,
        modified: 'Aug 23 10:05'
      },
      {
        name: 'utils.py',
        path: '/home/developer/workspace/src/utils.py',
        type: 'file',
        permissions: '-rw-r--r--',
        owner: 'developer',
        group: 'developer',
        size: 780,
        modified: 'Aug 23 10:06',
        content: `"""Helper utilities for file handling and string hashing."""
import hashlib
import json

def calculate_sha256(filepath: str) -> str:
    sha = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            sha.update(chunk)
    return sha.hexdigest()

def safe_load_json(filepath: str) -> dict:
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)
`
      },
      {
        name: 'logs',
        path: '/home/developer/workspace/logs',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        owner: 'developer',
        group: 'developer',
        size: 4096,
        modified: 'Aug 23 10:10'
      },
      {
        name: 'system.log',
        path: '/home/developer/workspace/logs/system.log',
        type: 'file',
        permissions: '-rw-r--r--',
        owner: 'developer',
        group: 'developer',
        size: 2150,
        modified: 'Aug 23 10:28',
        content: `[2026-08-23 10:00:01] [INFO] [kernel] Linux 6.8.0-generic #28-Ubuntu SMP PREEMPT_DYNAMIC x86_64
[2026-08-23 10:00:02] [INFO] [systemd] Starting Intelligent AI Linux Terminal Virtual Daemon...
[2026-08-23 10:00:04] [INFO] [workspace] Initialized workspace filesystem in /home/developer/workspace
[2026-08-23 10:00:05] [INFO] [bash] Session allocated on pts/0 for UID 1000 (developer)
[2026-08-23 10:14:22] [INFO] [python3] Virtual environment initialized in /home/developer/workspace/venv
[2026-08-23 10:20:10] [INFO] [healthcheck] Diagnostic probe passed: 0 errors, 4.2GB RAM available
[2026-08-23 10:28:45] [INFO] [posix-guard] Security policy active: POSIX strictly enforced (0 violations)
`
      }
    ];

    for (const f of defaultFiles) {
      this.files.set(f.path, f);
    }
  }

  public getCwd(): string {
    return this.cwd;
  }

  public getFileList(): VirtualFile[] {
    return Array.from(this.files.values());
  }

  public getWorkspaceFiles(): VirtualFile[] {
    return Array.from(this.files.values()).filter(f => f.path.startsWith(this.cwd) && f.path !== this.cwd);
  }

  public getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  public execute(rawCommand: string): CommandResult {
    const startTime = performance.now();
    const trimmed = rawCommand.trim();
    this.commandHistory.push(trimmed);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Enforce environment boundaries for non-supported external tools
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('git ') || lower === 'git' || lower.includes(' git ') || lower.startsWith('docker') || lower.includes('docker ') || lower.includes('docker-compose')) {
      return {
        command: trimmed,
        output: `bash: ${trimmed.split(' ')[0]}: command not supported in this environment. Only standard shell utilities are available.`,
        exitCode: 127,
        timestamp: nowStr,
        executionTimeMs: Math.round(performance.now() - startTime),
        riskLevel: 'BLOCKED',
        cwd: this.cwd
      };
    }

    if (!trimmed) {
      return {
        command: '',
        output: '',
        exitCode: 0,
        timestamp: nowStr,
        executionTimeMs: 1,
        riskLevel: 'LOW',
        cwd: this.cwd
      };
    }

    // Process piped or chained commands simply
    if (trimmed.includes('&&')) {
      const parts = trimmed.split('&&').map(p => p.trim());
      let combinedOutput = '';
      let lastExit = 0;
      for (const part of parts) {
        const res = this.executeSingle(part);
        if (combinedOutput) combinedOutput += '\n';
        combinedOutput += res.output;
        if (res.exitCode !== 0) {
          lastExit = res.exitCode;
          break;
        }
      }
      return {
        command: trimmed,
        output: combinedOutput,
        exitCode: lastExit,
        timestamp: nowStr,
        executionTimeMs: Math.round(performance.now() - startTime),
        riskLevel: lastExit === 0 ? 'LOW' : 'MEDIUM',
        cwd: this.cwd
      };
    }

    const res = this.executeSingle(trimmed);
    return {
      ...res,
      command: trimmed,
      timestamp: nowStr,
      executionTimeMs: Math.round(performance.now() - startTime),
      cwd: this.cwd
    };
  }

  private executeSingle(cmd: string): { output: string; exitCode: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED' } {
    const parts = cmd.split(/\s+/).filter(Boolean);
    const main = parts[0];
    const args = parts.slice(1);

    switch (main) {
      case 'clear':
        return { output: '__CLEAR__', exitCode: 0, riskLevel: 'LOW' };

      case 'pwd':
        return { output: this.cwd, exitCode: 0, riskLevel: 'LOW' };

      case 'whoami':
        return { output: 'developer', exitCode: 0, riskLevel: 'LOW' };

      case 'id':
        return { output: 'uid=1000(developer) gid=1000(developer) groups=1000(developer),27(sudo),100(users)', exitCode: 0, riskLevel: 'LOW' };

      case 'hostname':
        return { output: 'linux-ai-devbox', exitCode: 0, riskLevel: 'LOW' };

      case 'uptime':
        return { output: ` ${new Date().toLocaleTimeString()} up 4 days, 12:45,  1 user,  load average: 0.14, 0.08, 0.03`, exitCode: 0, riskLevel: 'LOW' };

      case 'date':
        return { output: new Date().toUTCString(), exitCode: 0, riskLevel: 'LOW' };

      case 'uname': {
        if (args.includes('-a') || args.includes('-r')) {
          return { output: 'Linux linux-ai-devbox 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux', exitCode: 0, riskLevel: 'LOW' };
        }
        return { output: 'Linux', exitCode: 0, riskLevel: 'LOW' };
      }

      case 'cd': {
        const target = args[0] || '/home/developer';
        if (target === '~' || target === '/home/developer') {
          this.cwd = '/home/developer';
          this.envVars.set('PWD', this.cwd);
          return { output: '', exitCode: 0, riskLevel: 'LOW' };
        }
        if (target === '..' || target === '../') {
          const parent = this.cwd.substring(0, this.cwd.lastIndexOf('/')) || '/';
          this.cwd = parent;
          this.envVars.set('PWD', this.cwd);
          return { output: '', exitCode: 0, riskLevel: 'LOW' };
        }
        if (target === '.' || target === './') {
          return { output: '', exitCode: 0, riskLevel: 'LOW' };
        }

        let resolved = target.startsWith('/') ? target : `${this.cwd}/${target}`.replace(/\/+/g, '/');
        if (resolved.endsWith('/') && resolved.length > 1) resolved = resolved.slice(0, -1);

        const exists = this.files.get(resolved);
        if (exists && exists.type === 'directory') {
          this.cwd = resolved;
          this.envVars.set('PWD', this.cwd);
          return { output: '', exitCode: 0, riskLevel: 'LOW' };
        }
        return { output: `bash: cd: ${target}: No such file or directory`, exitCode: 1, riskLevel: 'LOW' };
      }

      case 'ls': {
        const showAll = args.some(a => a.includes('a'));
        const showLong = args.some(a => a.includes('l'));
        const showHuman = args.some(a => a.includes('h'));

        // Collect matching entries inside this.cwd
        const entries: VirtualFile[] = [];
        for (const [path, file] of this.files.entries()) {
          const parentDir = path.substring(0, path.lastIndexOf('/')) || '/';
          if (parentDir === this.cwd) {
            entries.push(file);
          }
        }

        if (entries.length === 0) {
          return { output: showLong ? 'total 0' : '', exitCode: 0, riskLevel: 'LOW' };
        }

        if (showLong) {
          const lines = [`total ${entries.length * 4}`];
          if (showAll) {
            lines.push(`drwxr-xr-x 4 developer developer 4096 Aug 23 10:00 .`);
            lines.push(`drwxr-xr-x 3 developer developer 4096 Aug 23 09:00 ..`);
          }
          for (const f of entries) {
            const sizeStr = showHuman 
              ? (f.size > 1024 ? `${(f.size / 1024).toFixed(1)}K` : `${f.size}B`) 
              : f.size.toString().padStart(6, ' ');
            const nameDisplay = f.type === 'directory' ? `\x1b[1;34m${f.name}/\x1b[0m` : (f.isExecutable ? `\x1b[1;32m${f.name}*\x1b[0m` : f.name);
            lines.push(`${f.permissions} 1 ${f.owner} ${f.group} ${sizeStr.padStart(6, ' ')} ${f.modified} ${nameDisplay}`);
          }
          return { output: lines.join('\n'), exitCode: 0, riskLevel: 'LOW' };
        }

        const names = entries.map(f => f.type === 'directory' ? `${f.name}/` : (f.isExecutable ? `${f.name}*` : f.name));
        return { output: names.join('  '), exitCode: 0, riskLevel: 'LOW' };
      }

      case 'cat': {
        if (!args[0]) return { output: 'cat: missing file operand', exitCode: 1, riskLevel: 'LOW' };
        const path = this.resolvePath(args[0]);
        const file = this.files.get(path);
        if (!file) return { output: `cat: ${args[0]}: No such file or directory`, exitCode: 1, riskLevel: 'LOW' };
        if (file.type === 'directory') return { output: `cat: ${args[0]}: Is a directory`, exitCode: 1, riskLevel: 'LOW' };
        return { output: file.content || '', exitCode: 0, riskLevel: 'LOW' };
      }

      case 'head': {
        const count = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10;
        const target = args.find(a => !a.startsWith('-') && isNaN(Number(a))) || '';
        const path = this.resolvePath(target);
        const file = this.files.get(path);
        if (!file) return { output: `head: cannot open '${target}': No such file or directory`, exitCode: 1, riskLevel: 'LOW' };
        const lines = (file.content || '').split('\n').slice(0, count);
        return { output: lines.join('\n'), exitCode: 0, riskLevel: 'LOW' };
      }

      case 'tail': {
        const count = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10;
        const target = args.find(a => !a.startsWith('-') && isNaN(Number(a))) || '';
        const path = this.resolvePath(target);
        const file = this.files.get(path);
        if (!file) return { output: `tail: cannot open '${target}': No such file or directory`, exitCode: 1, riskLevel: 'LOW' };
        const allLines = (file.content || '').split('\n');
        const lines = allLines.slice(Math.max(0, allLines.length - count));
        return { output: lines.join('\n'), exitCode: 0, riskLevel: 'LOW' };
      }

      case 'mkdir': {
        const target = args.find(a => !a.startsWith('-'));
        if (!target) return { output: 'mkdir: missing operand', exitCode: 1, riskLevel: 'LOW' };
        const path = this.resolvePath(target);
        const name = path.substring(path.lastIndexOf('/') + 1);
        this.files.set(path, {
          name,
          path,
          type: 'directory',
          permissions: 'drwxr-xr-x',
          owner: 'developer',
          group: 'developer',
          size: 4096,
          modified: 'Just now'
        });
        return { output: '', exitCode: 0, riskLevel: 'LOW' };
      }

      case 'touch': {
        if (!args[0]) return { output: 'touch: missing file operand', exitCode: 1, riskLevel: 'LOW' };
        for (const target of args.filter(a => !a.startsWith('-'))) {
          const path = this.resolvePath(target);
          const name = path.substring(path.lastIndexOf('/') + 1);
          if (this.files.has(path)) {
            const existing = this.files.get(path)!;
            existing.modified = 'Just now';
          } else {
            this.files.set(path, {
              name,
              path,
              type: 'file',
              permissions: '-rw-r--r--',
              owner: 'developer',
              group: 'developer',
              size: 0,
              modified: 'Just now',
              content: ''
            });
          }
        }
        return { output: '', exitCode: 0, riskLevel: 'LOW' };
      }

      case 'rm': {
        const isRecurse = args.includes('-r') || args.includes('-rf') || args.includes('-fr');
        const target = args.find(a => !a.startsWith('-'));
        if (!target) return { output: 'rm: missing operand', exitCode: 1, riskLevel: 'LOW' };
        const path = this.resolvePath(target);
        if (!this.files.has(path)) {
          return { output: `rm: cannot remove '${target}': No such file or directory`, exitCode: 1, riskLevel: 'LOW' };
        }
        const f = this.files.get(path)!;
        if (f.type === 'directory' && !isRecurse) {
          return { output: `rm: cannot remove '${target}': Is a directory`, exitCode: 1, riskLevel: 'LOW' };
        }
        // Delete item and any nested items if directory
        for (const [key] of this.files.entries()) {
          if (key === path || key.startsWith(path + '/')) {
            this.files.delete(key);
          }
        }
        return { output: '', exitCode: 0, riskLevel: isRecurse ? 'HIGH' : 'LOW' };
      }

      case 'free': {
        return {
          output: `               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       2.4Gi       3.6Gi       120Mi       1.8Gi       5.1Gi
Swap:          2.0Gi          0B       2.0Gi`,
          exitCode: 0,
          riskLevel: 'LOW'
        };
      }

      case 'df': {
        return {
          output: `Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/nvme0n1p2 491410740 157251436 309142920  34% /
/dev/nvme0n1p1    523248      6212    517036   2% /boot/efi
tmpfs            4089856      4120   4085736   1% /run
/dev/nvme0n1p3 982821480 294846444 637958652  32% /home`,
          exitCode: 0,
          riskLevel: 'LOW'
        };
      }

      case 'ps': {
        return {
          output: `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1 169380 12892 ?        Ss   10:00   0:02 /sbin/init
developer   1420  0.2  0.6 845200 48200 ?        Sl   10:01   0:15 /usr/bin/python3 app.py
developer   1890  0.1  0.3 325400 24100 pts/0    Ss   10:05   0:01 /bin/bash
developer   2412  0.0  0.2 120400 16200 pts/0    R+   10:48   0:00 ps aux`,
          exitCode: 0,
          riskLevel: 'LOW'
        };
      }

      case 'top':
      case 'htop': {
        return {
          output: `top - 10:48:22 up 4 days, 12:45,  1 user,  load average: 0.18, 0.12, 0.08
Tasks: 182 total,   1 running, 181 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.4 us,  1.1 sy,  0.0 ni, 96.2 id,  0.2 wa,  0.0 hi,  0.1 si,  0.0 st
MiB Mem :   7980.2 total,   3680.4 free,   2450.6 used,   1849.2 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5210.8 avail Mem 

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1420 developer 20   0  845200  48200  18400 S   3.2   0.6   0:15.42 python3
 1890 developer 20   0  325400  24100  12200 S   0.5   0.3   0:01.12 bash
 2412 developer 20   0  120400  16200   9800 R   0.2   0.2   0:00.08 top`,
          exitCode: 0,
          riskLevel: 'LOW'
        };
      }

      case 'grep': {
        const pattern = args.find(a => !a.startsWith('-')) || '';
        if (!pattern) return { output: 'grep: missing pattern', exitCode: 1, riskLevel: 'LOW' };
        const cleanPattern = pattern.replace(/^["']|["']$/g, '');
        const matches: string[] = [];

        for (const [, file] of this.files.entries()) {
          if (file.type === 'file' && file.content) {
            const lines = file.content.split('\n');
            lines.forEach((line, idx) => {
              if (line.toLowerCase().includes(cleanPattern.toLowerCase())) {
                const relPath = file.path.replace(this.cwd + '/', '');
                matches.push(`\x1b[35m${relPath}\x1b[0m:\x1b[32m${idx + 1}\x1b[0m: ${line}`);
              }
            });
          }
        }
        return {
          output: matches.length > 0 ? matches.join('\n') : '',
          exitCode: matches.length > 0 ? 0 : 1,
          riskLevel: 'LOW'
        };
      }

      case 'find': {
        const nameIdx = args.indexOf('-name');
        const namePattern = nameIdx !== -1 ? args[nameIdx + 1]?.replace(/^["']|["']$/g, '') : null;
        const results: string[] = [];

        for (const [path] of this.files.entries()) {
          if (path.startsWith(this.cwd)) {
            const rel = '.' + path.slice(this.cwd.length);
            if (!namePattern || (namePattern.startsWith('*') && rel.endsWith(namePattern.slice(1)))) {
              results.push(rel || '.');
            }
          }
        }
        return { output: results.join('\n'), exitCode: 0, riskLevel: 'LOW' };
      }

      case 'chmod': {
        const mode = args[0];
        const target = args[1];
        if (!mode || !target) return { output: 'chmod: missing operand', exitCode: 1, riskLevel: 'LOW' };
        const path = this.resolvePath(target);
        const file = this.files.get(path);
        if (!file) return { output: `chmod: cannot access '${target}': No such file or directory`, exitCode: 1, riskLevel: 'LOW' };
        if (mode === '+x' || mode === '755' || mode === '775') {
          file.isExecutable = true;
          file.permissions = file.type === 'directory' ? 'drwxr-xr-x' : '-rwxr-xr-x';
        }
        return { output: '', exitCode: 0, riskLevel: 'LOW' };
      }

      case 'tar': {
        const isCreate = args.some(a => a.includes('c'));
        const isList = args.some(a => a.includes('t'));
        const archiveName = args.find(a => a.endsWith('.tar.gz') || a.endsWith('.tar')) || 'archive.tar.gz';

        if (isCreate) {
          const path = this.resolvePath(archiveName);
          this.files.set(path, {
            name: archiveName,
            path,
            type: 'file',
            permissions: '-rw-r--r--',
            owner: 'developer',
            group: 'developer',
            size: 14280,
            modified: 'Just now',
            content: '[Binary Gzip Tarball]'
          });
          return { output: `a ${archiveName}\na app.py\na healthcheck.sh\na requirements.txt\na Makefile`, exitCode: 0, riskLevel: 'LOW' };
        }
        if (isList) {
          return { output: `app.py\nhealthcheck.sh\nrequirements.txt\nMakefile\nsrc/utils.py`, exitCode: 0, riskLevel: 'LOW' };
        }
        return { output: 'tar: archive operation completed.', exitCode: 0, riskLevel: 'LOW' };
      }

      case 'python3':
      case 'python': {
        if (args.includes('-m') && args.includes('venv')) {
          const venvName = args[args.indexOf('venv') + 1] || 'venv';
          const path = this.resolvePath(venvName);
          this.files.set(path, {
            name: venvName,
            path,
            type: 'directory',
            permissions: 'drwxr-xr-x',
            owner: 'developer',
            group: 'developer',
            size: 4096,
            modified: 'Just now'
          });
          return { output: `Created virtualenv '${venvName}' at ${path}`, exitCode: 0, riskLevel: 'LOW' };
        }
        if (args[0] === '--version' || args[0] === '-V') {
          return { output: 'Python 3.12.3', exitCode: 0, riskLevel: 'LOW' };
        }
        if (args[0] === 'app.py' || args[0] === './app.py') {
          return {
            output: `INFO:     Started server process [1420]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)`,
            exitCode: 0,
            riskLevel: 'LOW'
          };
        }
        if (args.includes('-c')) {
          return { output: 'Linux AI Workspace Engine Active', exitCode: 0, riskLevel: 'LOW' };
        }
        return { output: 'Python 3.12.3 (main, Apr 15 2026, 12:00:00) [GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.', exitCode: 0, riskLevel: 'LOW' };
      }

      case 'pip':
      case 'pip3': {
        if (args[0] === 'install') {
          const pkg = args.slice(1).filter(a => !a.startsWith('-')).join(' ') || 'fastapi';
          return {
            output: `Collecting ${pkg}
  Downloading ${pkg}-latest-py3-none-any.whl (245 kB)
Installing collected packages: ${pkg}
Successfully installed ${pkg}`,
            exitCode: 0,
            riskLevel: 'MEDIUM'
          };
        }
        if (args[0] === 'list') {
          return {
            output: `Package           Version
----------------- -------
fastapi           0.111.0
pip               24.0
pydantic          2.7.4
psutil            5.9.8
requests          2.32.3
setuptools        69.5.1
uvicorn           0.30.1`,
            exitCode: 0,
            riskLevel: 'LOW'
          };
        }
        return { output: 'pip 24.0 from /usr/lib/python3/dist-packages/pip (python 3.12)', exitCode: 0, riskLevel: 'LOW' };
      }

      case 'echo': {
        const text = args.join(' ').replace(/^["']|["']$/g, '');
        return { output: text, exitCode: 0, riskLevel: 'LOW' };
      }

      case 'env':
      case 'printenv': {
        const vars: string[] = [];
        for (const [k, v] of this.envVars.entries()) {
          vars.push(`${k}=${v}`);
        }
        return { output: vars.join('\n'), exitCode: 0, riskLevel: 'LOW' };
      }

      case 'history': {
        const lines = this.commandHistory.map((cmd, i) => `  ${(i + 1).toString().padStart(4, ' ')}  ${cmd}`);
        return { output: lines.join('\n'), exitCode: 0, riskLevel: 'LOW' };
      }

      case 'help': {
        return {
          output: `Linux AI Virtual Terminal - Available Standard Utilities:
  File Operations : ls, cat, head, tail, touch, mkdir, rm, cp, mv, chmod, find, grep, tar
  System Status   : pwd, whoami, id, hostname, uptime, date, uname, free, df, ps, top/htop
  Developer Tools : python3, pip, make, env, echo, clear, history
  Constraints     : Strict POSIX Linux utilities`,
          exitCode: 0,
          riskLevel: 'LOW'
        };
      }

      default:
        return {
          output: `bash: ${main}: command not found. Type 'help' to view available Linux commands.`,
          exitCode: 127,
          riskLevel: 'LOW'
        };
    }
  }

  private resolvePath(target: string): string {
    if (target.startsWith('/')) return target;
    if (target.startsWith('./')) target = target.slice(2);
    return `${this.cwd}/${target}`.replace(/\/+/g, '/');
  }
}

export const terminalEngine = new LinuxTerminalEngine();

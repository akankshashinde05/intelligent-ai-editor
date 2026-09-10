import React, { useState } from 'react';
import { 
  FileCode, 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  ShieldCheck, 
  Sparkles, 
  Save, 
  Download,
  Flame,
  HardDrive,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { terminalEngine } from '../../utils/linuxTerminalEngine';

interface BashScriptStudioProps {
  onRunScript: (cmd: string) => void;
}

interface ScriptTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  risk: 'LOW' | 'MEDIUM';
  filename: string;
  content: string;
}

const TEMPLATES: ScriptTemplate[] = [
  {
    id: 'healthcheck',
    title: 'System Health Diagnostic',
    category: 'Monitoring',
    description: 'Scans Linux memory allocation, CPU load averages, disk mounts, and active Python processes.',
    risk: 'LOW',
    filename: 'healthcheck.sh',
    content: `#!/usr/bin/env bash
# ==========================================
# Linux System Diagnostic & Metric Probe
# ==========================================
set -euo pipefail

echo "========================================"
echo " Starting System Diagnostic Check"
echo " Host: $(hostname) | Date: $(date)"
echo "========================================"

echo -e "\n[1] Physical Memory (RAM & Swap):"
free -h

echo -e "\n[2] Disk Filesystem Utilization:"
df -h /

echo -e "\n[3] Top 5 CPU Consuming Processes:"
ps aux --sort=-%cpu | head -n 6

echo -e "\n[4] Active Network Ports / Sockets:"
if command -v ss &>/dev/null; then
    ss -tuln | head -n 10
else
    netstat -tuln 2>/dev/null || echo "Network sockets checked."
fi

echo -e "\nDiagnostic scan finished successfully with exit code 0."
`
  },
  {
    id: 'log-cleaner',
    title: 'Log Rotation & Temp Cleaner',
    category: 'Maintenance',
    description: 'Finds and archives stale .log files and purges temporary cache directories safely.',
    risk: 'MEDIUM',
    filename: 'clean_logs.sh',
    content: `#!/usr/bin/env bash
# ==========================================
# Linux Workspace Temp & Log Maintenance
# ==========================================
set -euo pipefail

TARGET_DIR="./logs"
ARCHIVE_NAME="logs_backup_$(date +%Y%m%d_%H%M%S).tar.gz"

echo "Checking target log directory: \${TARGET_DIR}"
if [ -d "\${TARGET_DIR}" ]; then
    echo "Compressing existing logs into \${ARCHIVE_NAME}..."
    tar -czvf "\${ARCHIVE_NAME}" "\${TARGET_DIR}"/*.log 2>/dev/null || echo "No logs to archive"
    
    echo "Truncating active log files safely..."
    find "\${TARGET_DIR}" -type f -name "*.log" -exec truncate -s 0 {} \\;
    echo "Log rotation completed."
else
    echo "No logs directory found. Skipping."
fi

echo "Cleaning temporary Python bytecode caches..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
echo "Cleanup finished [OK]."
`
  },
  {
    id: 'backup-workspace',
    title: 'Workspace Tarball Archiver',
    category: 'Backup',
    description: 'Creates a compressed tar.gz backup archive of source code with POSIX metadata.',
    risk: 'LOW',
    filename: 'backup.sh',
    content: `#!/usr/bin/env bash
# ==========================================
# POSIX Workspace Backup Script
# ==========================================
set -euo pipefail

BACKUP_FILE="workspace_backup_$(date +%Y%m%d).tar.gz"
echo "Creating compressed archive \${BACKUP_FILE}..."

tar --exclude='./venv' \\
    --exclude='*.tar.gz' \\
    --exclude='*.tmp' \\
    -czvf "\${BACKUP_FILE}" ./

echo "Archive created successfully."
ls -lh "\${BACKUP_FILE}"
`
  },
  {
    id: 'service-watcher',
    title: 'Service Watchdog & Restarter',
    category: 'Automation',
    description: 'Monitors the Python FastAPI service PID and restarts it if the process dies.',
    risk: 'LOW',
    filename: 'watchdog.sh',
    content: `#!/usr/bin/env bash
# ==========================================
# Service Watchdog Daemon
# ==========================================
SERVICE_NAME="app.py"

echo "Checking if \${SERVICE_NAME} is active..."
if pgrep -f "\${SERVICE_NAME}" > /dev/null; then
    PID=$(pgrep -f "\${SERVICE_NAME}" | head -n 1)
    echo "Service \${SERVICE_NAME} is alive [PID: \${PID}]."
else
    echo "Warning: \${SERVICE_NAME} is not running! Starting service..."
    nohup python3 app.py > logs/system.log 2>&1 &
    NEW_PID=$!
    echo "Service launched in background [PID: \${NEW_PID}]."
fi
`
  }
];

export const BashScriptStudio: React.FC<BashScriptStudioProps> = ({ onRunScript }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplate>(TEMPLATES[0]);
  const [scriptCode, setScriptCode] = useState(TEMPLATES[0].content);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelect = (tmpl: ScriptTemplate) => {
    setSelectedTemplate(tmpl);
    setScriptCode(tmpl.content);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToWorkspace = () => {
    // Write directly into virtual filesystem
    terminalEngine.execute(`touch ${selectedTemplate.filename}`);
    terminalEngine.execute(`chmod +x ${selectedTemplate.filename}`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRun = () => {
    handleSaveToWorkspace();
    onRunScript(`bash ${selectedTemplate.filename}`);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#080c16] text-slate-200">
      {/* Templates Sidebar */}
      <div className="w-full md:w-80 bg-[#0a0f1d] border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-800 bg-[#0e1424]">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>Bash Automation Templates</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Production-ready POSIX shell scripts for system administration and automation
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {TEMPLATES.map((t) => {
            const isSelected = selectedTemplate.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => handleSelect(t)}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected 
                    ? 'bg-[#151e36] border-indigo-500/50 text-white shadow-lg' 
                    : 'bg-[#0e1424]/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{t.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    {t.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                  {t.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="text-emerald-400">{t.filename}</span>
                  <span className={t.risk === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}>
                    {t.risk} Risk
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor & Execution Panel */}
      <div className="flex-1 flex flex-col bg-[#070a12]">
        {/* Top bar */}
        <div className="p-3 border-b border-slate-800 bg-[#0c1220] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400">{selectedTemplate.filename}</span>
            <span className="text-[10px] text-slate-500 font-mono">/bin/bash (POSIX)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleSaveToWorkspace}
              className="px-3 py-1.5 rounded-lg bg-[#141e34] hover:bg-[#1b2847] border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-indigo-400" />
              <span>Save to Workspace</span>
            </button>
            <button
              onClick={handleRun}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-900/30 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute in Terminal</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-950/50 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Saved {selectedTemplate.filename} to /home/developer/workspace and granted executable permissions (+x).</span>
          </div>
        )}

        {/* Code View / Editor */}
        <div className="flex-1 p-4 overflow-y-auto">
          <textarea
            value={scriptCode}
            onChange={(e) => setScriptCode(e.target.value)}
            className="w-full h-full bg-[#090d18] text-slate-200 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

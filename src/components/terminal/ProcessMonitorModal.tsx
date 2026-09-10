import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  X, 
  RefreshCw, 
  Square, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { SystemMetrics } from '../../types';

interface ProcessItem {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  vsz: string;
  rss: string;
  stat: string;
  time: string;
  command: string;
}

interface ProcessMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: SystemMetrics;
  onRunCommand: (cmd: string) => void;
}

export const ProcessMonitorModal: React.FC<ProcessMonitorModalProps> = ({
  isOpen,
  onClose,
  metrics,
  onRunCommand
}) => {
  const [processes, setProcesses] = useState<ProcessItem[]>([
    { pid: 1, user: 'root', cpu: 0.1, mem: 0.1, vsz: '169M', rss: '12M', stat: 'Ss', time: '0:02', command: '/sbin/init splash' },
    { pid: 382, user: 'systemd', cpu: 0.0, mem: 0.2, vsz: '89M', rss: '16M', stat: 'S', time: '0:01', command: '/lib/systemd/systemd-journald' },
    { pid: 820, user: 'root', cpu: 0.0, mem: 0.1, vsz: '45M', rss: '8M', stat: 'S', time: '0:00', command: '/usr/sbin/cron -f -P' },
    { pid: 1420, user: 'developer', cpu: 2.8, mem: 0.6, vsz: '845M', rss: '48M', stat: 'Sl', time: '0:15', command: 'python3 app.py --workers 4' },
    { pid: 1890, user: 'developer', cpu: 0.4, mem: 0.3, vsz: '325M', rss: '24M', stat: 'Ss', time: '0:01', command: '/bin/bash (pts/0)' },
    { pid: 2110, user: 'developer', cpu: 0.1, mem: 0.2, vsz: '110M', rss: '18M', stat: 'S', time: '0:00', command: '/usr/bin/node dist/server.cjs' },
    { pid: 2412, user: 'developer', cpu: 0.2, mem: 0.2, vsz: '120M', rss: '16M', stat: 'R+', time: '0:00', command: 'ps aux --sort=-%cpu' }
  ]);

  const [filter, setFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKill = (pid: number, name: string) => {
    if (pid === 1 || pid === 382) {
      alert("Cannot kill critical Linux system initialization processes.");
      return;
    }
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    setStatusMessage(`SIGTERM sent to PID ${pid} (${name})`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSpawnWorker = () => {
    const newPid = Math.floor(Math.random() * 8000) + 3000;
    const newProc: ProcessItem = {
      pid: newPid,
      user: 'developer',
      cpu: Number((Math.random() * 3 + 0.5).toFixed(1)),
      mem: 0.4,
      vsz: '210M',
      rss: '32M',
      stat: 'Sl',
      time: '0:00',
      command: 'python3 -m worker.background_task'
    };
    setProcesses(prev => [newProc, ...prev]);
    setStatusMessage(`Spawned new Linux worker process [PID ${newPid}]`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const filtered = processes.filter(p => 
    p.command.toLowerCase().includes(filter.toLowerCase()) || 
    p.user.toLowerCase().includes(filter.toLowerCase()) ||
    p.pid.toString().includes(filter)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0b101e] border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0e1528] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Linux Process Monitor & Resource Telemetry (top / ps aux)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Host: linux-ai-devbox | Kernel: 6.8.0-40-generic x86_64
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Header Bar */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-[#080c16] border-b border-slate-800/80">
          <div className="p-3 rounded-xl bg-[#0f1629] border border-slate-800 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total CPU Load</div>
              <div className="text-sm font-bold text-slate-100 font-mono">{metrics.cpuUsage}% (4 Cores)</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0f1629] border border-slate-800 flex items-center gap-3">
            <Database className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Linux Physical RAM</div>
              <div className="text-sm font-bold text-slate-100 font-mono">{metrics.memoryUsedGB}GB / {metrics.memoryTotalGB}GB</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0f1629] border border-slate-800 flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Filesystem (/)</div>
              <div className="text-sm font-bold text-slate-100 font-mono">{metrics.diskUsagePercent}% NVMe SSD</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-slate-800 bg-[#0e1424] flex items-center justify-between gap-3">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by PID, command, or user..."
            className="flex-1 bg-[#090d18] border border-slate-700/80 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpawnWorker}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Spawn Background Worker</span>
            </button>
            <button
              onClick={() => {
                onRunCommand('ps aux --sort=-%cpu | head -n 10');
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Inspect in Terminal</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Process Table */}
        <div className="flex-1 overflow-y-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0c1222] text-slate-400 border-b border-slate-800 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">%CPU</th>
                <th className="py-2.5 px-3">%MEM</th>
                <th className="py-2.5 px-3">VSZ</th>
                <th className="py-2.5 px-3">RSS</th>
                <th className="py-2.5 px-3">STAT</th>
                <th className="py-2.5 px-3">Command</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((proc) => (
                <tr key={proc.pid} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-indigo-400 font-semibold">{proc.pid}</td>
                  <td className="py-2 px-3 text-slate-400">{proc.user}</td>
                  <td className={`py-2 px-3 ${proc.cpu > 2 ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}>{proc.cpu}%</td>
                  <td className="py-2 px-3">{proc.mem}%</td>
                  <td className="py-2 px-3 text-slate-500">{proc.vsz}</td>
                  <td className="py-2 px-3 text-slate-500">{proc.rss}</td>
                  <td className="py-2 px-3 text-emerald-400 font-semibold">{proc.stat}</td>
                  <td className="py-2 px-3 text-slate-100 max-w-xs truncate">{proc.command}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleKill(proc.pid, proc.command)}
                      className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 text-[10px] cursor-pointer"
                    >
                      SIGKILL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-[#0e1424] text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            POSIX Process isolation active. Restricted execution policies in place.
          </span>
          <span>Showing {filtered.length} active processes</span>
        </div>
      </div>
    </div>
  );
};

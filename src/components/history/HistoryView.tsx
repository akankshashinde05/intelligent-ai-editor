import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Play, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Calendar,
  Terminal,
  RefreshCw
} from 'lucide-react';

interface CommandLog {
  id: string | number;
  command: string;
  type: 'ai-synthesized' | 'direct';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  timestamp: string;
  durationMs: number;
  shell: string;
  outputPreview: string;
  prompt?: string;
}

export const HistoryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [logs, setLogs] = useState<CommandLog[]>([]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/history?limit=100&risk=${filterRisk}&search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: CommandLog[] = json.data.map((r: any) => ({
            id: r.id,
            command: r.command,
            type: r.prompt ? 'ai-synthesized' : 'direct',
            riskLevel: r.risk_level || 'LOW',
            status: r.status === 'SUCCESS' ? 'SUCCESS' : (r.status === 'BLOCKED' ? 'BLOCKED' : 'FAILED'),
            timestamp: r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            durationMs: Math.round(r.execution_time_ms || 0),
            shell: r.shell || 'PowerShell',
            outputPreview: r.stdout ? r.stdout.slice(0, 100) : (r.stderr ? r.stderr.slice(0, 100) : 'No output'),
            prompt: r.prompt
          }));
          setLogs(mapped);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not fetch SQLite logs:', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [filterRisk]);

  const handleClearHistory = async () => {
    try {
      await fetch('/api/v1/history/clear', { method: 'POST' });
      setLogs([]);
    } catch (e) {
      console.warn('Clear history error:', e);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.command.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.outputPreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (log.prompt && log.prompt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRisk = filterRisk === 'ALL' || log.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const handleCopy = (id: string | number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#070b14] p-6 max-w-6xl mx-auto w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-indigo-400" />
            <span>Command & Audit History (SQLite)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable SQLite transaction logs of all synthesized and executed terminal commands with risk categorization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search command logs..."
              className="bg-[#0f162a] border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-56 font-mono"
            />
          </div>

          {/* Risk Level Filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-[#0f162a] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Risks</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <button
            onClick={fetchHistory}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh logs from SQLite"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
            title="Clear SQLite history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* History Log Table / Cards */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredLogs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
            <HistoryIcon className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
            <p>No command logs in SQLite database.</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div 
              key={log.id}
              className="rounded-2xl bg-[#0c1224] border border-slate-800/80 p-4 space-y-3 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                    log.riskLevel === 'BLOCKED'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : log.riskLevel === 'HIGH'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : log.riskLevel === 'MEDIUM'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {log.riskLevel} RISK
                  </span>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {log.type === 'ai-synthesized' ? 'AI SYNTHESIZED' : 'DIRECT SHELL'}
                  </span>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {log.shell} • {log.durationMs}ms
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  <button
                    onClick={() => handleCopy(log.id, log.command)}
                    className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Copy command"
                  >
                    {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {log.prompt && (
                <div className="text-[11px] text-slate-400 italic">
                  Prompt: &quot;{log.prompt}&quot;
                </div>
              )}

              {/* Command Code Block */}
              <div className="rounded-xl bg-[#070b14] border border-slate-800/90 p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
                <code>{log.command}</code>
              </div>

              {/* Execution Status & Output Preview */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  {log.status === 'SUCCESS' ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Exit Code 0</span>
                    </span>
                  ) : log.status === 'BLOCKED' ? (
                    <span className="flex items-center gap-1 text-purple-400 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Blocked by Policy</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Failed (Non-zero)</span>
                    </span>
                  )}
                </div>
                <span className="text-slate-500 font-mono text-[11px] truncate max-w-md">
                  {log.outputPreview}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

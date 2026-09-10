import React from 'react';
import { 
  Terminal, 
  MessageSquare, 
  Box, 
  ShieldCheck, 
  Clock, 
  Folder, 
  TrendingUp 
} from 'lucide-react';
import { SystemMetrics } from '../../types';

interface StatusBarProps {
  metrics: SystemMetrics;
}

export const StatusBar: React.FC<StatusBarProps> = ({ metrics }) => {
  return (
    <footer id="app-status-bar" className="shrink-0 flex flex-col select-none z-20">
      {/* Upper Developer Telemetry Metrics (5 Cards matching reference image) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-3 bg-[#080d19] border-t border-slate-800/80">
        {/* Metric 1: Commands Executed */}
        <div className="glass-panel-subtle rounded-xl p-2.5 flex items-center gap-3 border border-slate-800/80 hover:border-indigo-500/40 transition-colors">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Commands Executed</p>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">{metrics.commandsExecuted}</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />+12% this week
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: AI Conversations */}
        <div className="glass-panel-subtle rounded-xl p-2.5 flex items-center gap-3 border border-slate-800/80 hover:border-blue-500/40 transition-colors">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">AI Conversations</p>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">{metrics.conversationsCount}</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />+10% this week
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Projects Generated */}
        <div className="glass-panel-subtle rounded-xl p-2.5 flex items-center gap-3 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Projects Generated</p>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">{metrics.projectsGenerated}</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />+25% this month
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Errors Resolved */}
        <div className="glass-panel-subtle rounded-xl p-2.5 flex items-center gap-3 border border-slate-800/80 hover:border-purple-500/40 transition-colors">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Errors Resolved</p>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">{metrics.errorsResolved}</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />+30% this week
              </span>
            </div>
          </div>
        </div>

        {/* Metric 5: Time Saved */}
        <div className="glass-panel-subtle rounded-xl p-2.5 flex items-center gap-3 border border-slate-800/80 hover:border-pink-500/40 transition-colors">
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Time Saved</p>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">{metrics.timeSavedHours} hrs</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />+20% this month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Status Strip (Terminal status indicators) */}
      <div className="h-7 bg-[#060a14] border-t border-slate-800/80 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
        {/* Left Side indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Connected</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Shell:</span>
            <span className="text-slate-300">{metrics.activeShell}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate max-w-xs md:max-w-md">
            <Folder className="w-3.5 h-3.5 text-indigo-400 inline" />
            <span className="text-slate-500">Directory:</span>
            <span className="text-slate-300 truncate">{metrics.currentDirectory}</span>
          </div>
        </div>

        {/* Right Side Editor Coordinates & Engine Badge */}
        <div className="flex items-center gap-4 text-slate-500">
          <span className="hover:text-slate-300 transition-colors">Ln 1, Col 1</span>
          <span className="px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 text-[10px]">
            UTF-8
          </span>
        </div>
      </div>
    </footer>
  );
};

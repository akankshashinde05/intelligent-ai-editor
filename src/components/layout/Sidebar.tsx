import React from 'react';
import { 
  Terminal, 
  Bot, 
  Code2, 
  FolderPlus, 
  History, 
  Settings, 
  Activity,
  Cpu,
  HardDrive,
  Database
} from 'lucide-react';
import { NavigationTab, SystemMetrics } from '../../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  metrics: SystemMetrics;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  metrics 
}) => {
  const navItems = [
    {
      id: 'terminal' as NavigationTab,
      label: 'Terminal',
      sublabel: 'AI-Assisted Terminal',
      icon: Terminal,
      highlightColor: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/40'
    },
    {
      id: 'ai-assistant' as NavigationTab,
      label: 'AI Assistant',
      sublabel: 'Chat with Intelligent AI',
      icon: Bot,
      highlightColor: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/40'
    },
    {
      id: 'code-assistant' as NavigationTab,
      label: 'Code Assistant',
      sublabel: 'Generate & Explain Code',
      icon: Code2,
      highlightColor: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/40'
    },
    {
      id: 'project-generator' as NavigationTab,
      label: 'Project Generator',
      sublabel: 'Scaffold New Projects',
      icon: FolderPlus,
      highlightColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40'
    },
    {
      id: 'history' as NavigationTab,
      label: 'History',
      sublabel: 'Command & Chat History',
      icon: History,
      highlightColor: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/40'
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      sublabel: 'Preferences & API Keys',
      icon: Settings,
      highlightColor: 'from-slate-500/20 to-slate-400/20 text-slate-300 border-slate-500/40'
    }
  ];

  return (
    <aside 
      id="main-sidebar"
      className="w-72 bg-[#0c1220]/95 border-r border-slate-800/80 flex flex-col justify-between p-3 select-none shrink-0 overflow-y-auto"
    >
      {/* Navigation List */}
      <div className="space-y-1.5">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Workspace Navigation
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all group relative cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-[#172038] to-[#12192d] text-white border border-indigo-500/40 shadow-lg shadow-indigo-950/40' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#12192b]/70 border border-transparent'
              }`}
            >
              <div 
                className={`p-2 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-inner' 
                    : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-300 group-hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {item.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* System Status HUD & Hardware Telemetry Card */}
      <div 
        id="sidebar-system-status-card"
        className="mt-4 rounded-2xl bg-gradient-to-b from-[#11182c]/90 to-[#0b101e]/90 border border-slate-800/90 p-3.5 shadow-xl relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Status Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">System Status</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Operational
          </span>
        </div>

        {/* Neural Hologram Brain Animation Icon */}
        <div className="my-2 py-2 rounded-xl bg-[#090d18] border border-slate-800/70 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="absolute -inset-1 rounded-full border border-indigo-500/30 animate-spin" style={{ animationDuration: '8s' }}></div>
          </div>
          <span className="text-[10px] font-mono text-indigo-300 mt-1 tracking-wider uppercase font-semibold">
            AI-CORE ACTIVE
          </span>
        </div>

        {/* Hardware Telemetry Progress Bars */}
        <div className="space-y-2.5 pt-1">
          {/* CPU Usage */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-indigo-400" /> CPU Usage
              </span>
              <span className="text-slate-200 font-semibold">{metrics.cpuUsage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${metrics.cpuUsage}%` }}
              ></div>
            </div>
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-purple-400" /> Memory Usage
              </span>
              <span className="text-slate-200 font-semibold">{metrics.memoryUsedGB}GB/{metrics.memoryTotalGB}GB</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${(metrics.memoryUsedGB / metrics.memoryTotalGB) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Disk Usage */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3 h-3 text-cyan-400" /> Disk Usage
              </span>
              <span className="text-slate-200 font-semibold">{metrics.diskUsagePercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${metrics.diskUsagePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

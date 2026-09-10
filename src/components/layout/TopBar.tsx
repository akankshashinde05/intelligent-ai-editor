import React, { useState } from 'react';
import { 
  Terminal, 
  Sparkles, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Settings as SettingsIcon, 
  Minus, 
  Square, 
  X,
  Cpu
} from 'lucide-react';
import { windowControls, isTauriEnvironment } from '../../utils/tauriBridge';

interface TopBarProps {
  onSearchSubmit?: (query: string) => void;
  onOpenSettings?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearchSubmit, onOpenSettings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header 
      id="top-bar-container"
      className="h-14 border-b border-slate-800/80 bg-[#0d1322]/90 backdrop-blur-xl flex items-center justify-between px-4 select-none shrink-0 z-30"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Brand Identity */}
      <div className="flex items-center gap-3 w-72 shrink-0" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20">
          <div className="h-full w-full bg-[#0d1322] rounded-[11px] flex items-center justify-center">
            <Terminal className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
              Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI Editor</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-medium border border-indigo-500/30">
              v0.1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">Desktop AI Terminal & Coding Environment</p>
        </div>
      </div>

      {/* Central Omnibar Search */}
      <div 
        className="flex-1 max-w-2xl mx-4"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            id="omnibar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI in natural language or type a command (e.g. 'Show me all Python files', 'Get-ChildItem')..."
            className="w-full bg-[#121a2e]/90 text-sm text-slate-200 pl-10 pr-28 py-2 rounded-xl border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none placeholder:text-slate-500 transition-all shadow-inner"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <kbd className="hidden sm:inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700 font-mono">
              Ctrl+K
            </kbd>
            <button
              id="omnibar-ask-ai-button"
              onClick={() => searchQuery.trim() && onSearchSubmit?.(searchQuery)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Action Tools & Window Controls */}
      <div 
        className="flex items-center gap-3 shrink-0"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Quick Utilities */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button 
            id="topbar-theme-toggle"
            onClick={() => setIsDark(!isDark)}
            title="Toggle theme"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            id="topbar-settings-button"
            onClick={onOpenSettings}
            title="Settings & API Preferences"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <button 
            id="topbar-notifications-button"
            title="Notifications"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          </button>
        </div>

        {/* User Profile Badge */}
        <div 
          id="user-profile-badge"
          className="h-8 w-8 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-950 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300 shadow-sm"
        >
          AI
        </div>

        {/* Window Control Buttons (Native / Desktop Shell) */}
        <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
          <button
            id="window-minimize-btn"
            onClick={windowControls.minimize}
            title="Minimize"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            id="window-maximize-btn"
            onClick={windowControls.toggleMaximize}
            title="Maximize"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            id="window-close-btn"
            onClick={windowControls.close}
            title="Close"
            className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

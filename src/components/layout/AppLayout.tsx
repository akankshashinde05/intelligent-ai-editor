import React, { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { Workspace } from './Workspace';
import { StatusBar } from './StatusBar';
import { NavigationTab, SystemMetrics } from '../../types';
import { getDesktopSystemInfo } from '../../utils/tauriBridge';

export const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('terminal');
  const [omnibarPrompt, setOmnibarPrompt] = useState<string>('');
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 14,
    memoryUsedGB: 2.6,
    memoryTotalGB: 8.0,
    diskUsagePercent: 32,
    isAiReady: true,
    activeShell: 'PowerShell',
    currentDirectory: 'C:\\Users\\Developer\\workspace',
    osName: 'Windows 11 / PowerShell 7',
    commandsExecuted: 142,
    conversationsCount: 51,
    projectsGenerated: 9,
    errorsResolved: 26,
    timeSavedHours: 7.2
  });

  useEffect(() => {
    // Check desktop shell capabilities on startup
    const initSystem = async () => {
      const info = await getDesktopSystemInfo() as { default_shell?: string; os?: string };
      if (info && info.default_shell) {
        setMetrics(prev => ({
          ...prev,
          activeShell: info.default_shell === 'cmd.exe' ? 'CMD' : 'PowerShell',
          osName: info.os === 'win32' ? 'Windows 11 (WinPS/CMD)' : 'Windows PowerShell Architecture'
        }));
      }
    };
    initSystem();
  }, []);

  const handleSearchSubmit = (query: string) => {
    setActiveTab('terminal');
    setOmnibarPrompt(query);
    // Reset after dispatch
    setTimeout(() => setOmnibarPrompt(''), 100);
  };

  const handleOpenSettings = () => {
    setActiveTab('settings');
  };

  return (
    <div id="desktop-app-container" className="h-screen w-screen flex flex-col bg-[#070b14] text-slate-100 overflow-hidden select-none border border-slate-800/70 shadow-2xl">
      {/* Top Application Bar with Window Controls */}
      <TopBar 
        onSearchSubmit={handleSearchSubmit} 
        onOpenSettings={handleOpenSettings} 
      />

      {/* Primary Workspace Viewport (Sidebar + Main Workspace) */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={setActiveTab} 
          metrics={metrics} 
        />
        <Workspace 
          activeTab={activeTab} 
          metrics={metrics} 
          externalPrompt={omnibarPrompt}
        />
      </div>

      {/* Bottom Status Bar and Telemetry Analytics */}
      <StatusBar metrics={metrics} />
    </div>
  );
};

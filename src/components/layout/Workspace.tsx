import React from 'react';
import { NavigationTab, SystemMetrics } from '../../types';
import { TerminalView } from '../terminal/TerminalView';
import { CodeAssistantView } from '../editor/CodeAssistantView';
import { ProjectGeneratorView } from '../projects/ProjectGeneratorView';
import { HistoryView } from '../history/HistoryView';
import { SettingsView } from '../settings/SettingsView';

interface WorkspaceProps {
  activeTab: NavigationTab;
  metrics: SystemMetrics;
  externalPrompt?: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({ activeTab, metrics, externalPrompt }) => {
  return (
    <div id="main-workspace-area" className="flex-1 flex overflow-hidden bg-[#070b14] relative">
      {activeTab === 'terminal' && <TerminalView metrics={metrics} externalPrompt={externalPrompt} />}
      {activeTab === 'ai-assistant' && <TerminalView metrics={metrics} externalPrompt={externalPrompt} />}
      {activeTab === 'code-assistant' && <CodeAssistantView />}
      {activeTab === 'project-generator' && <ProjectGeneratorView />}
      {activeTab === 'history' && <HistoryView />}
      {activeTab === 'settings' && <SettingsView />}
    </div>
  );
};

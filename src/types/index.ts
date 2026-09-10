export type NavigationTab = 
  | 'terminal' 
  | 'ai-assistant' 
  | 'code-assistant' 
  | 'project-generator' 
  | 'history' 
  | 'settings';

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsedGB: number;
  memoryTotalGB: number;
  diskUsagePercent: number;
  isAiReady: boolean;
  activeShell: string;
  currentDirectory: string;
  osName: string;
  commandsExecuted: number;
  conversationsCount: number;
  projectsGenerated: number;
  errorsResolved: number;
  timeSavedHours: number;
}

export interface WindowState {
  isMaximized: boolean;
  isMinimized: boolean;
  isNativeTauri: boolean;
}

export interface QuickActionPrompt {
  id: string;
  label: string;
  iconName: string;
  action: () => void;
}

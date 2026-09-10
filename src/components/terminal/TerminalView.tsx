import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Plus, 
  Trash2, 
  Copy, 
  Sparkles, 
  Play, 
  Edit3, 
  Check, 
  X, 
  Send,
  HelpCircle,
  FileCode,
  FolderSearch,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Activity,
  FolderTree,
  Code2,
  HardDrive,
  Cpu,
  Layers,
  ChevronDown,
  Info,
  Server,
  Zap
} from 'lucide-react';
import { SystemMetrics } from '../../types';
import { realWindowsTerminalService } from '../../utils/realWindowsTerminalEngine';
import { aiService, AISynthesizeResponse, AIStatusInfo } from '../../utils/aiService';
import { XTermTerminal, XTermTerminalHandle } from './XTermTerminal';
import { WorkspaceExplorer } from './WorkspaceExplorer';
import { ProcessMonitorModal } from './ProcessMonitorModal';

interface TerminalViewProps {
  metrics: SystemMetrics;
  onCommandRun?: (cmd: string) => void;
  externalPrompt?: string;
}

interface TerminalTab {
  id: string;
  label: string;
  shellType: 'powershell' | 'cmd';
  shellName: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ metrics, onCommandRun, externalPrompt }) => {
  const [terminalTabs, setTerminalTabs] = useState<TerminalTab[]>([
    { id: 'term-1', label: 'PowerShell', shellType: 'powershell', shellName: 'PowerShell 7.4 / WinPS' },
    { id: 'term-2', label: 'CMD', shellType: 'cmd', shellName: 'Command Prompt (CMD)' }
  ]);
  const [activeTabId, setActiveTabId] = useState('term-1');
  const [currentCwd, setCurrentCwd] = useState<string>(realWindowsTerminalService.getCwd());
  
  const [aiAssistantOpen, setAiAssistantOpen] = useState(true);
  const [workspaceExplorerOpen, setWorkspaceExplorerOpen] = useState(true);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  
  const [commandInput, setCommandInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // AI Synthesis State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [pendingAiCard, setPendingAiCard] = useState<AISynthesizeResponse | null>(null);
  const [clarificationInput, setClarificationInput] = useState('');
  
  // AI Model Status
  const [aiStatus, setAiStatus] = useState<AIStatusInfo | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const xtermRef = useRef<XTermTerminalHandle>(null);

  const activeTab = terminalTabs.find(t => t.id === activeTabId) || terminalTabs[0];

  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; code?: string; timestamp: string }[]>([
    {
      sender: 'user',
      text: 'Show me all Python files',
      timestamp: '10:40 AM'
    },
    {
      sender: 'ai',
      text: 'In Windows PowerShell, you can recursively search for all Python scripts in the current directory and subfolders with:',
      code: 'Get-ChildItem -Recurse -Filter *.py',
      timestamp: '10:40 AM'
    }
  ]);

  // Load AI status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await aiService.getStatus();
      setAiStatus(status);
    };
    fetchStatus();
  }, []);

  // Handle external prompt dispatched from Omnibar
  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      handleSynthesize(externalPrompt.trim());
    }
  }, [externalPrompt]);

  const addNewTerminalTab = (type: 'powershell' | 'cmd' = 'powershell') => {
    const newId = `term-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newId,
      label: type === 'powershell' ? `PowerShell ${terminalTabs.length + 1}` : `CMD ${terminalTabs.length + 1}`,
      shellType: type,
      shellName: type === 'powershell' ? 'PowerShell 7 / WinPS' : 'Command Prompt (CMD)'
    };
    setTerminalTabs([...terminalTabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTerminalTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (terminalTabs.length <= 1) return;
    const filtered = terminalTabs.filter(t => t.id !== id);
    setTerminalTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
    }
  };

  const handleCopyCommand = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Direct Execution into Real Windows xterm
  const executeRealCommand = (cmd: string) => {
    if (xtermRef.current) {
      xtermRef.current.executeCommand(cmd);
    }
    if (onCommandRun) {
      onCommandRun(cmd);
    }
  };

  // Trigger Real AI Synthesis Pipeline
  const handleSynthesize = async (userPrompt: string) => {
    setIsSynthesizing(true);
    setPendingAiCard(null);

    try {
      const response = await aiService.synthesize({
        prompt: userPrompt,
        shell_type: activeTab.shellType,
        working_directory: currentCwd,
        os_type: 'windows'
      });

      setPendingAiCard(response);
    } catch (err: any) {
      setPendingAiCard({
        intent: userPrompt,
        shell: activeTab.shellType,
        command: activeTab.shellType === 'cmd' ? `echo "${userPrompt}"` : `Write-Output "${userPrompt}"`,
        explanation: 'Gemini AI API is operating in offline fallback mode.',
        risk: 'LOW',
        requires_confirmation: true,
        ai_online: false,
        gemini_online: false
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  // AI Prompt Bar Submission: Routes through Natural Language Pipeline or Direct Execution
  const handleCommandBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const query = commandInput.trim();
    setCommandInput('');

    // Check if query is direct raw shell command or natural language
    const isDirectShell = 
      query.startsWith('Get-') || 
      query.startsWith('Set-') || 
      query.startsWith('Write-') || 
      query.startsWith('New-') ||
      query.startsWith('Remove-') ||
      query.startsWith('Select-') ||
      query.startsWith('Stop-') ||
      query.startsWith('Start-') ||
      query.startsWith('dir ') || 
      query === 'dir' ||
      query.startsWith('cd ') || 
      query === 'cd' ||
      query === 'cls' || 
      query === 'clear' || 
      query === 'pwd' ||
      query.startsWith('echo ') || 
      query.startsWith('python ') || 
      query === 'python' ||
      query.startsWith('node ') || 
      query.startsWith('npm ') ||
      query.startsWith('cargo ') ||
      query.startsWith('pip ') ||
      query.startsWith('findstr ') ||
      query.startsWith('tasklist') ||
      query.includes('|') ||
      query.includes(';') ||
      query.includes('&&');

    if (isDirectShell) {
      executeRealCommand(query);
      return;
    }

    // Natural Language Input -> Google Gemini API Synthesis
    handleSynthesize(query);
  };

  // Run the validated AI command in real terminal
  const handleRunAiCommand = () => {
    if (!pendingAiCard || pendingAiCard.is_blocked || !pendingAiCard.command) return;
    executeRealCommand(pendingAiCard.command);
    setPendingAiCard(null);
  };

  // Edit command: transfers generated command back to the command input
  const handleEditAiCommand = () => {
    if (!pendingAiCard) return;
    setCommandInput(pendingAiCard.command);
    setPendingAiCard(null);
  };

  // Clarification reply
  const handleClarificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationInput.trim()) return;
    const refinedPrompt = `${pendingAiCard?.intent || ''} specifically: ${clarificationInput.trim()}`;
    setClarificationInput('');
    handleSynthesize(refinedPrompt);
  };

  // AI Assistant Chat Submission
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const text = chatInput.trim();
    setChatInput('');
    
    setChatMessages(prev => [...prev, {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    setIsChatLoading(true);

    try {
      const reply = await aiService.chat(text, activeTab.shellType, currentCwd);
      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: reply.response,
        code: reply.extracted_command,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Gemini AI API is currently operating in offline fallback mode.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div id="terminal-view-container" className="flex-1 flex flex-col h-full overflow-hidden bg-[#070b14] relative">
      {/* Top Windows Shell Control Bar */}
      <div id="terminal-control-bar" className="h-10 bg-[#0a0f1d] border-b border-slate-800/90 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* Active Shell Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#11172a] border border-slate-800 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-200">
              {activeTab.shellName}
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">REAL PROCESS</span>
          </div>

          {/* AI Model Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0f172a] border border-slate-800 text-[11px] text-slate-400">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>AI: <strong className="text-purple-300 font-mono">{aiStatus?.default_model || 'gemini-2.5-flash'}</strong></span>
            {(aiStatus?.online || aiStatus?.gemini_online) ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-400" title="Deterministic fallback active">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Fallback Mode
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-explorer"
            onClick={() => setWorkspaceExplorerOpen(!workspaceExplorerOpen)}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              workspaceExplorerOpen 
                ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-200' 
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle File Explorer"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Files</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Dock: Workspace File Explorer */}
        {workspaceExplorerOpen && (
          <WorkspaceExplorer 
            onInsertCommand={(cmd) => {
              executeRealCommand(cmd);
            }} 
          />
        )}

        {/* Central Terminal Canvas (Tabs + xterm.js + AI Confirmation Layer) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800/80 overflow-hidden bg-[#070b14]">
          {/* Terminal Tabs Header */}
          <div className="h-9 bg-[#080d18] border-b border-slate-800/80 flex items-center justify-between px-3 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {terminalTabs.map((tab) => {
                const isActive = activeTabId === tab.id;
                return (
                  <div
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-[#151f38] text-white border border-indigo-500/40 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{tab.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      ({tab.shellType.toUpperCase()})
                    </span>
                    {terminalTabs.length > 1 && (
                      <button
                        onClick={(e) => closeTerminalTab(tab.id, e)}
                        className="hover:text-rose-400 p-0.5 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Tab Dropdown */}
              <div className="flex items-center gap-1">
                <button
                  id="btn-add-powershell-tab"
                  onClick={() => addNewTerminalTab('powershell')}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                  title="New PowerShell Tab"
                >
                  <Plus className="w-3 h-3" />
                  <span>PowerShell</span>
                </button>
                <button
                  id="btn-add-cmd-tab"
                  onClick={() => addNewTerminalTab('cmd')}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                  title="New CMD Tab"
                >
                  <Plus className="w-3 h-3" />
                  <span>CMD</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                id="btn-clear-terminal"
                onClick={() => xtermRef.current?.clear()}
                title="Clear Terminal Canvas (cls / clear)"
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors flex items-center gap-1 text-xs cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden md:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* AI Synthesizing Status Bar */}
          {isSynthesizing && (
            <div id="ai-synthesizing-banner" className="px-4 py-2 bg-[#12182d] border-b border-indigo-500/30 flex items-center gap-3 shrink-0">
              <div className="h-5 w-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-spin">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-indigo-200 font-medium">Understanding intent & synthesizing shell command with Qwen 2.5 Coder...</p>
                <p className="text-[10px] text-slate-400 font-mono">Shell: {activeTab.shellType.toUpperCase()} | Validating Safety Rules</p>
              </div>
            </div>
          )}

          {/* AI Safety Confirmation Card (Pipeline Output) */}
          {pendingAiCard && !isSynthesizing && (
            <div id="ai-generated-command-card" className="p-3 bg-[#0d1326] border-b border-indigo-500/40 shrink-0">
              <div className="rounded-xl bg-[#111933] border border-indigo-500/40 p-4 shadow-xl max-w-3xl">
                {/* Header with Badges */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white tracking-wide">AI Generated Command</h4>
                      <span className="text-[10px] text-slate-400 font-mono">Intent: {pendingAiCard.intent}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Shell Badge */}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                      {pendingAiCard.shell.toUpperCase()}
                    </span>

                    {/* Risk Level Badge */}
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border flex items-center gap-1 ${
                      pendingAiCard.risk === 'BLOCKED'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-600'
                        : pendingAiCard.risk === 'HIGH' 
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                        : pendingAiCard.risk === 'MEDIUM'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {pendingAiCard.risk === 'BLOCKED' ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      <span>{pendingAiCard.risk} RISK</span>
                    </span>

                    <button
                      onClick={() => setPendingAiCard(null)}
                      className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Ambiguity / Clarification UI */}
                {pendingAiCard.needs_clarification ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{pendingAiCard.explanation}</p>
                        <p className="text-[11px] text-amber-300/80 mt-1">To protect your files, please clarify the exact target directory or file pattern.</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleClarificationSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={clarificationInput}
                        onChange={(e) => setClarificationInput(e.target.value)}
                        placeholder="e.g. 'all files in C:\workspace\temp' or '*.log files'"
                        className="flex-1 bg-[#070b14] text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                      >
                        Clarify & Generate
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    {/* Explanation */}
                    <p className="text-xs text-slate-300 mb-2.5 font-normal leading-relaxed">
                      {pendingAiCard.explanation}
                    </p>

                    {/* Security reasons if blocked or high risk */}
                    {pendingAiCard.risk_reasons && pendingAiCard.risk_reasons.length > 0 && pendingAiCard.risk !== 'LOW' && (
                      <div className="mb-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Safety Policy Note: </span>
                        {pendingAiCard.risk_reasons.join(', ')}
                      </div>
                    )}

                    {/* Command Display Snippet */}
                    <div className="rounded-xl bg-[#070b14] border border-slate-800/90 p-3 mb-3 flex items-center justify-between shadow-inner">
                      <code className="text-xs text-emerald-400 font-mono font-medium overflow-x-auto select-text">
                        {pendingAiCard.command}
                      </code>
                      <button
                        id="btn-copy-ai-command"
                        onClick={() => handleCopyCommand(pendingAiCard.intent, pendingAiCard.command)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors ml-2 shrink-0 cursor-pointer"
                        title="Copy command string"
                      >
                        {copiedId === pendingAiCard.intent ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Action Buttons: [ Run Command ] [ Edit ] [ Cancel ] */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-500">
                        {(pendingAiCard.ai_online === false || pendingAiCard.gemini_online === false || pendingAiCard.fallback_active) && (
                          <span className="text-amber-400/90 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Operating in offline deterministic fallback mode.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id="btn-cancel-ai-command"
                          onClick={() => setPendingAiCard(null)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        
                        <button
                          id="btn-edit-ai-command"
                          onClick={handleEditAiCommand}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-[#16203c] hover:bg-[#1f2d54] border border-indigo-500/30 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Load into command bar for manual edits"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          id="btn-run-ai-command"
                          onClick={handleRunAiCommand}
                          disabled={pendingAiCard.is_blocked || !pendingAiCard.command}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-900/40 cursor-pointer transition-all active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Run Command</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Real XTerm.js Canvas Viewport */}
          <div className="flex-1 min-h-0 relative">
            <XTermTerminal
              ref={xtermRef}
              shellType={activeTab.shellType}
              currentCwd={currentCwd}
              onCwdChange={(newCwd) => setCurrentCwd(newCwd)}
              onInterrupt={() => {
                // Interruption notification
              }}
            />
          </div>

          {/* AI Command Synthesizer Bar (Bottom Input) */}
          <div id="ai-command-bar" className="p-3 bg-[#0a0f1d] border-t border-slate-800/90 shrink-0">
            <form onSubmit={handleCommandBarSubmit} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-mono shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">AI / Command:</span>
              </div>
              <input
                id="main-ai-command-input"
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder='Type natural language (e.g. "Show me all Python files", "Check my Python version") or shell commands...'
                className="flex-1 bg-[#070b14] text-slate-100 text-xs px-3.5 py-2 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none font-mono placeholder:text-slate-500 transition-all shadow-inner"
              />
              <button
                id="btn-submit-command-bar"
                type="submit"
                disabled={isSynthesizing || !commandInput.trim()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-950/40 transition-all active:scale-95"
              >
                {isSynthesizing ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI / Run</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right AI Assistant Sidebar Panel */}
        {aiAssistantOpen && (
          <div 
            id="ai-assistant-side-panel"
            className="w-80 lg:w-96 bg-[#0a0f1d]/95 border-l border-slate-800/80 flex flex-col justify-between select-none shrink-0"
          >
            {/* Header */}
            <div className="h-9 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-xs text-slate-200">Windows AI Assistant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-mono">QWEN 2.5 CODER</span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans text-xs">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`p-3 rounded-xl max-w-[90%] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-950/50' 
                      : 'bg-[#111728] border border-slate-800 text-slate-300 rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Runnable Code Block */}
                    {msg.code && (
                      <div className="mt-2 rounded-lg bg-[#070b14] border border-slate-800 p-2.5">
                        <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800/60">
                          <span className="text-[10px] text-slate-500 font-mono uppercase">{activeTab.shellType}</span>
                          <button
                            onClick={() => executeRealCommand(msg.code!)}
                            className="px-2 py-0.5 rounded bg-indigo-600/80 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Run</span>
                          </button>
                        </div>
                        <code className="text-emerald-400 font-mono text-[11px] block overflow-x-auto select-text">
                          {msg.code}
                        </code>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>AI is thinking...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-slate-800/80 bg-[#0a0f1d] shrink-0">
              <div className="flex items-center gap-2">
                <input
                  id="ai-assistant-chat-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask a question or request a script..."
                  className="flex-1 bg-[#070b14] text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:border-purple-500 focus:outline-none placeholder:text-slate-600"
                />
                <button
                  id="btn-send-chat"
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl cursor-pointer transition-colors shadow-md shadow-purple-950/40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real Process Monitor Modal */}
      {processModalOpen && (
        <ProcessMonitorModal 
          isOpen={processModalOpen} 
          onClose={() => setProcessModalOpen(false)} 
        />
      )}
    </div>
  );
};

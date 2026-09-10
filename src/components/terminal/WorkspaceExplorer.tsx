import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  FileCode, 
  FileSpreadsheet, 
  Trash2, 
  Plus, 
  Terminal as TerminalIcon, 
  Eye, 
  Check, 
  Copy, 
  ShieldCheck,
  HardDrive,
  RefreshCw,
  X,
  FilePlus,
  FolderPlus,
  Play
} from 'lucide-react';
import { realWindowsTerminalService } from '../../utils/realWindowsTerminalEngine';

interface WorkspaceExplorerProps {
  onInsertCommand: (cmd: string) => void;
  onRefreshFiles?: () => void;
}

interface ProjectFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: string;
  modified: string;
}

export const WorkspaceExplorer: React.FC<WorkspaceExplorerProps> = ({ onInsertCommand }) => {
  const currentCwd = realWindowsTerminalService.getCwd();
  
  const [files, setFiles] = useState<ProjectFile[]>([
    { name: 'src', path: 'src', type: 'directory', size: '4.0 KB', modified: 'Today, 10:15 AM' },
    { name: 'backend', path: 'backend', type: 'directory', size: '4.0 KB', modified: 'Today, 10:18 AM' },
    { name: 'app.py', path: 'app.py', type: 'file', size: '1.2 KB', modified: 'Today, 10:20 AM' },
    { name: 'package.json', path: 'package.json', type: 'file', size: '845 B', modified: 'Today, 10:22 AM' },
    { name: 'vite.config.ts', path: 'vite.config.ts', type: 'file', size: '512 B', modified: 'Today, 10:00 AM' },
    { name: 'server.ts', path: 'server.ts', type: 'file', size: '4.6 KB', modified: 'Today, 10:30 AM' },
    { name: 'README.md', path: 'README.md', type: 'file', size: '2.1 KB', modified: 'Today, 09:45 AM' }
  ]);

  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<'file' | 'dir' | null>(null);
  const [newEntityName, setNewEntityName] = useState('');

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 1500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;
    const name = newEntityName.trim();
    if (showCreateModal === 'file') {
      onInsertCommand(`New-Item -ItemType File -Path "${name}" -Force`);
      setFiles(prev => [...prev, { name, path: name, type: 'file', size: '0 B', modified: 'Just now' }]);
    } else if (showCreateModal === 'dir') {
      onInsertCommand(`New-Item -ItemType Directory -Path "${name}" -Force`);
      setFiles(prev => [...prev, { name, path: name, type: 'directory', size: '4.0 KB', modified: 'Just now' }]);
    }
    setNewEntityName('');
    setShowCreateModal(null);
  };

  const getFileIcon = (file: ProjectFile) => {
    if (file.type === 'directory') {
      return <Folder className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
    if (file.name.endsWith('.py') || file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js')) {
      return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (file.name.endsWith('.json') || file.name.endsWith('.md')) {
      return <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  return (
    <div className="h-full flex flex-col bg-[#090d18] border-r border-slate-800/80 w-64 shrink-0 text-xs">
      {/* Header */}
      <div className="p-2.5 border-b border-slate-800 flex items-center justify-between bg-[#0e1424]">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200 tracking-wide">Workspace Files</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCreateModal('file')}
            title="New File (New-Item)"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowCreateModal('dir')}
            title="New Directory (mkdir / New-Item)"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Directory location indicator */}
      <div className="px-3 py-1.5 bg-[#0b101f] border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-mono truncate" title={currentCwd}>
          {currentCwd}
        </span>
      </div>

      {/* Create Entity Modal */}
      {showCreateModal && (
        <form onSubmit={handleCreate} className="p-2.5 bg-[#12192e] border-b border-indigo-500/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-indigo-300">
              Create {showCreateModal === 'file' ? 'New File' : 'New Directory'}
            </span>
            <button
              type="button"
              onClick={() => setShowCreateModal(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              placeholder={showCreateModal === 'file' ? 'script.py' : 'my_folder'}
              className="flex-1 bg-[#090d18] border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-bold cursor-pointer"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {files.map((file) => {
          const isSelected = selectedFile?.path === file.path;
          return (
            <div
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isSelected ? 'bg-[#151f38] text-white border border-indigo-500/30' : 'hover:bg-slate-800/50 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getFileIcon(file)}
                <span className="truncate font-mono text-[11px]">{file.name}</span>
              </div>

              {/* Quick Actions Hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {file.type === 'file' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsertCommand(`Get-Content ${file.name}`);
                    }}
                    title="View Content (Get-Content)"
                    className="p-1 hover:text-indigo-400 text-slate-400 rounded"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsertCommand(`Set-Location ${file.name}`);
                    }}
                    title="Change Directory (cd)"
                    className="p-1 hover:text-indigo-400 text-slate-400 rounded"
                  >
                    <TerminalIcon className="w-3 h-3" />
                  </button>
                )}

                {file.name.endsWith('.py') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsertCommand(`python ${file.name}`);
                    }}
                    title="Run with Python"
                    className="p-1 hover:text-emerald-400 text-slate-400 rounded"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyPath(file.path);
                  }}
                  title="Copy Path"
                  className="p-1 hover:text-slate-200 text-slate-400 rounded"
                >
                  {copiedPath === file.path ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Status Footer */}
      <div className="p-2 border-t border-slate-800/80 bg-[#0c1220] flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>{files.length} items</span>
        <button
          onClick={() => onInsertCommand('Get-ChildItem')}
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

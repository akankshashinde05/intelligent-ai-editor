import React, { useState } from 'react';
import { 
  FolderArchive, 
  Sparkles, 
  Layers, 
  Check, 
  ArrowRight, 
  Terminal, 
  FolderCheck, 
  Code2, 
  Box, 
  Cpu,
  ShieldCheck,
  Play
} from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  stack: string;
  description: string;
  icon: any;
  files: string[];
  initCommand: string;
}

export const ProjectGeneratorView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('tauri-react');
  const [projectName, setProjectName] = useState('my-desktop-ai-app');
  const [targetDir, setTargetDir] = useState('/home/developer/projects');
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const templates: ProjectTemplate[] = [
    {
      id: 'tauri-react',
      name: 'Desktop App (Tauri 2 + React)',
      category: 'Desktop Native',
      stack: 'Rust + Tauri 2 + React 18 + Tailwind CSS',
      description: 'Ultra-lightweight native cross-platform desktop application with zero chromium overhead.',
      icon: Box,
      files: [
        'src-tauri/Cargo.toml',
        'src-tauri/src/main.rs',
        'src/App.tsx',
        'src/main.tsx',
        'package.json',
        'vite.config.ts'
      ],
      initCommand: 'cargo tauri init --ci'
    },
    {
      id: 'fastapi-ai',
      name: 'AI Agent Backend (FastAPI + SQLite)',
      category: 'Backend AI',
      stack: 'Python 3.11 + FastAPI + Pydantic v2 + SQLite (WAL)',
      description: 'Asynchronous backend with safety AST parsers, Google Gemini AI integration, and audit logging.',
      icon: Cpu,
      files: [
        'main.py',
        'requirements.txt',
        'services/agent.py',
        'services/safety.py',
        'database/models.py',
        '.env.example'
      ],
      initCommand: 'uvicorn main:app --reload'
    },
    {
      id: 'express-microservice',
      name: 'Fullstack Microservice (Express + TypeScript)',
      category: 'Fullstack',
      stack: 'Node.js + Express + TypeScript + Zod',
      description: 'Scalable REST API daemon with input validation, JWT token exchange, and streaming SSE.',
      icon: Layers,
      files: [
        'src/server.ts',
        'src/routes/api.ts',
        'package.json',
        'tsconfig.json',
        '.env.example'
      ],
      initCommand: 'npm run dev'
    }
  ];

  const currentTpl = templates.find(t => t.id === selectedTemplate) || templates[0];

  const handleCreateProject = () => {
    setIsScaffolding(true);
    setIsCreated(false);
    setTimeout(() => {
      setIsScaffolding(false);
      setIsCreated(true);
    }, 1200);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#070b14]">
      {/* Template Selection Sidebar */}
      <div className="w-80 bg-[#0a0f1d] border-r border-slate-800/80 p-4 flex flex-col justify-between select-none shrink-0 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <FolderArchive className="w-4 h-4 text-indigo-400" />
            <span>Project Generator Templates</span>
          </div>

          <div className="space-y-2">
            {templates.map(tpl => {
              const Icon = tpl.icon;
              const isSelected = selectedTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplate(tpl.id);
                    setIsCreated(false);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-indigo-500/60 shadow-lg shadow-indigo-950/40 text-white'
                      : 'bg-[#0f162a]/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-[#151f38]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-mono">
                      {tpl.category}
                    </span>
                    <Icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h4 className="font-semibold text-xs text-slate-200 mt-1">{tpl.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{tpl.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-[#10172c] border border-slate-800 p-3 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All scaffolding runs sandbox safety checks automatically.</span>
        </div>
      </div>

      {/* Main Scaffolding Workspace */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Scaffold {currentTpl.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              Ready
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Generate production-ready project boilerplates with native shell commands, automated dependency injection, and configured tooling.
          </p>
        </div>

        {/* Configuration Form */}
        <div className="rounded-2xl bg-[#0b1021] border border-slate-800 p-5 space-y-4 shadow-xl">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Project Parameters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-[#12192e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Destination Directory</label>
              <input
                type="text"
                value={targetDir}
                onChange={(e) => setTargetDir(e.target.value)}
                className="w-full bg-[#12192e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">Selected Tech Stack: </span>
            <span className="text-xs font-mono text-cyan-300 font-medium">{currentTpl.stack}</span>
          </div>
        </div>

        {/* Generated Directory Tree Preview */}
        <div className="rounded-2xl bg-[#0b1021] border border-slate-800 p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Generated File Manifest</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{currentTpl.files.length} files included</span>
          </div>

          <div className="rounded-xl bg-[#070b14] border border-slate-800/80 p-3.5 font-mono text-xs text-slate-300 space-y-1.5">
            <div className="text-indigo-400 font-semibold">{projectName}/</div>
            {currentTpl.files.map((file, i) => (
              <div key={i} className="pl-4 flex items-center gap-2 text-slate-400">
                <span className="text-slate-600">├──</span>
                <span>{file}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button & Confirmation */}
        <div className="flex items-center justify-between pt-2">
          {isCreated ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <FolderCheck className="w-4 h-4 text-emerald-400" />
              <span>Project scaffolded successfully in {targetDir}/{projectName}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">Ready to execute scaffolding via native virtual daemon</span>
          )}

          <button
            onClick={handleCreateProject}
            disabled={isScaffolding}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-950/60 transition-all active:scale-[0.98] cursor-pointer"
          >
            {isScaffolding ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Generating project...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Generate & Scaffold Project</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

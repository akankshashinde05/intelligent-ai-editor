import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  ShieldAlert, 
  Terminal, 
  Database, 
  Save, 
  Check, 
  Key, 
  Sliders, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [defaultShell, setDefaultShell] = useState('powershell');
  const [strictSafety, setStrictSafety] = useState(true);
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#070b14] p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <span>Environment & AI Engine Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure Google Gemini AI models, shell environments, safety policies, and system telemetry.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-950/50 transition-all cursor-pointer"
        >
          {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Google Gemini AI Model Section */}
        <div className="rounded-2xl bg-[#0c1224] border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">AI Inference Engine (Google Gemini)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Active Gemini Model</label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full bg-[#12192e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Default - Fast & Multimodal)</option>
                <option value="gemini-3.7-flash">gemini-3.7-flash (Hybrid Reasoning)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-low Latency)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Backend Authentication</label>
              <div className="w-full bg-[#12192e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono flex items-center justify-between">
                <span>GEMINI_API_KEY (Server-side)</span>
                <span className="text-[10px] text-emerald-400 font-sans font-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Safety Engine */}
        <div className="rounded-2xl bg-[#0c1224] border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Safety & Confirmation Matrix</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080d18] border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">Strict AST Safety Parsing</p>
                <p className="text-[11px] text-slate-400">Block dangerous destructive shell commands (rm -rf, format, drop database).</p>
              </div>
              <button 
                onClick={() => setStrictSafety(!strictSafety)}
                className="cursor-pointer text-indigo-400"
              >
                {strictSafety ? <ToggleRight className="w-7 h-7 text-indigo-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080d18] border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">Human-In-The-Loop Confirmation</p>
                <p className="text-[11px] text-slate-400">Always require clicking "Run Commands" for Medium & High risk actions.</p>
              </div>
              <button 
                onClick={() => setRequireConfirmation(!requireConfirmation)}
                className="cursor-pointer text-indigo-400"
              >
                {requireConfirmation ? <ToggleRight className="w-7 h-7 text-indigo-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Shell Execution Daemon */}
        <div className="rounded-2xl bg-[#0c1224] border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Default Shell & Environment</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'bash', label: 'Bash (/bin/bash)', desc: 'Standard GNU Bourne-Again Shell' },
              { id: 'zsh', label: 'Zsh (/bin/zsh)', desc: 'Z Shell with Extended Globbing' },
              { id: 'sh', label: 'POSIX Sh (/bin/sh)', desc: 'Lightweight POSIX System Shell' }
            ].map(shell => (
              <div
                key={shell.id}
                onClick={() => setDefaultShell(shell.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  defaultShell === shell.id
                    ? 'bg-indigo-950/50 border-indigo-500/60 text-white shadow-md'
                    : 'bg-[#080d18] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{shell.label}</span>
                  {defaultShell === shell.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{shell.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

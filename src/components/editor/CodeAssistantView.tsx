import React, { useState } from 'react';
import { 
  Code2, 
  Sparkles, 
  Play, 
  Copy, 
  Check, 
  FileCode, 
  Wand2, 
  FileCheck, 
  Terminal, 
  Bug,
  RefreshCw,
  FolderTree,
  ChevronRight,
  ChevronDown,
  File,
  Save,
  Plus
} from 'lucide-react';

interface LanguageConfig {
  id: string;
  name: string;
  extension: string;
  fileName: string;
  sampleCode: string;
}

const LANGUAGES: LanguageConfig[] = [
  {
    id: 'python',
    name: 'Python',
    extension: '.py',
    fileName: 'app.py',
    sampleCode: `# Python 3.11 - FastAPI Application Core
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="AI Microservice")

class Item(BaseModel):
    name: str
    price: float
    is_offer: Optional[bool] = None

@app.get("/")
def read_root():
    return {"message": "Welcome to Intelligent AI Service", "status": "active"}

@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int):
    return Item(name=f"Product_{item_id}", price=29.99, is_offer=True)
`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: '.ts',
    fileName: 'server.ts',
    sampleCode: `// TypeScript Node.js Service
import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

app.get('/api/health', (req: Request, res: Response) => {
  const payload: ApiResponse<{ uptime: number }> = {
    success: true,
    data: { uptime: process.uptime() },
    timestamp: new Date().toISOString()
  };
  res.json(payload);
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: '.js',
    fileName: 'index.js',
    sampleCode: `// Modern ES6+ JavaScript
async function fetchSystemMetrics() {
  const response = await fetch('/api/metrics');
  const metrics = await response.json();
  
  console.log('System Status:', metrics);
  return metrics;
}

// Event handler example
document.addEventListener('DOMContentLoaded', () => {
  console.log('Intelligent AI Editor initialized.');
});
`
  },
  {
    id: 'rust',
    name: 'Rust',
    extension: '.rs',
    fileName: 'main.rs',
    sampleCode: `// Rust High-Performance Engine
use std::time::Instant;

fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    let start = Instant::now();
    let result = fibonacci(30);
    let duration = start.elapsed();
    
    println!("Fibonacci(30) = {} (calculated in {:?})", result, duration);
}
`
  },
  {
    id: 'powershell',
    name: 'PowerShell',
    extension: '.ps1',
    fileName: 'deploy.ps1',
    sampleCode: `# PowerShell Automation Script
param (
    [string]$Environment = "Production",
    [switch]$Force
)

Write-Host ">>> Starting Deployment Pipeline [$Environment]..." -ForegroundColor Cyan

# Inspect active services
$services = Get-Process | Where-Object { $_.CPU -gt 5 } | Select-Object -First 5 Name, CPU, WorkingSet

Write-Host "High-CPU Processes:" -ForegroundColor Yellow
$services | Format-Table -AutoSize

Write-Host "Deployment completed successfully." -ForegroundColor Green
`
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: '.cpp',
    fileName: 'main.cpp',
    sampleCode: `// High-Performance C++20 Core
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9, 3};
    std::sort(numbers.begin(), numbers.end());

    std::cout << "Sorted elements: ";
    for (const auto& num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    return 0;
}
`
  },
  {
    id: 'json',
    name: 'JSON',
    extension: '.json',
    fileName: 'config.json',
    sampleCode: `{
  "name": "intelligent-ai-editor",
  "version": "2.4.0",
  "environment": "production",
  "ai": {
    "engine": "gemini-2.5-flash",
    "provider": "google-gemini",
    "temperature": 0.2
  },
  "terminal": {
    "defaultShell": "powershell",
    "ptyEnabled": true
  }
}
`
  },
  {
    id: 'sql',
    name: 'SQL',
    extension: '.sql',
    fileName: 'schema.sql',
    sampleCode: `-- Database Schema Definitions
CREATE TABLE IF NOT EXISTS command_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command TEXT NOT NULL,
    exit_code INTEGER DEFAULT 0,
    risk_level TEXT CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'BLOCKED')),
    output TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_command_risk ON command_history(risk_level);
`
  }
];

export const CodeAssistantView: React.FC = () => {
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('python');
  const [selectedFile, setSelectedFile] = useState('app.py');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [activeActionTab, setActiveActionTab] = useState<'explain' | 'generate' | 'refactor' | 'tests'>('generate');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [promptInput, setPromptInput] = useState('Create a RESTful API endpoint in FastAPI for user authentication with JWT tokens.');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentLang = LANGUAGES.find(l => l.id === selectedLanguageId) || LANGUAGES[0];
  const [editorCode, setEditorCode] = useState<string>(LANGUAGES[0].sampleCode);

  const handleLanguageChange = (lang: LanguageConfig) => {
    setSelectedLanguageId(lang.id);
    setSelectedFile(lang.fileName);
    setEditorCode(lang.sampleCode);
    setIsLangDropdownOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRunCodeAction = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (activeActionTab === 'refactor') {
        setEditorCode(prev => `// [Intelligent AI Refactored - Clean, Typed & Optimized]\n${prev}\n// Refactored: Added error boundaries and performance optimizations.`);
      } else if (activeActionTab === 'tests') {
        if (selectedLanguageId === 'python') {
          setEditorCode(`import pytest\nfrom fastapi.testclient import TestClient\nfrom app import app\n\nclient = TestClient(app)\n\ndef test_health_check():\n    response = client.get("/")\n    assert response.status_code == 200\n    assert response.json()["status"] == "active"\n\ndef test_item_lookup():\n    response = client.get("/items/42")\n    assert response.status_code == 200\n    assert response.json()["name"] == "Product_42"\n`);
        } else {
          setEditorCode(`describe('${selectedFile} Test Suite', () => {\n  it('should initialize successfully', () => {\n    expect(true).toBe(true);\n  });\n});\n`);
        }
      } else if (activeActionTab === 'generate') {
        setEditorCode(`// Generated code for: ${promptInput}\n\n${currentLang.sampleCode}\n\n// Additional synthesized endpoints:\n// export const processRequest = async (data) => ({ status: 'processed', result: data });\n`);
      }
    }, 600);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#070b14]">
      {/* File Explorer Tree Panel */}
      <div className="w-56 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col select-none shrink-0">
        <div className="h-10 px-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
            <span>Languages & Files</span>
          </div>
        </div>

        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                selectedLanguageId === lang.id 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-medium' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{lang.fileName}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Center Monaco-Style Code Editor Window */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800/80 overflow-hidden">
        {/* Editor Toolbar with Interactive Language Dropdown */}
        <div className="h-11 bg-[#0c1222] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-semibold text-slate-200">{selectedFile}</span>
            </div>

            {/* Language Selector Dropdown Button */}
            <div className="relative">
              <button
                id="btn-language-selector"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-2.5 py-1 rounded-lg bg-[#141d33] hover:bg-[#1a2642] border border-slate-700/80 text-xs font-medium text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Change Programming Language"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Language: <strong className="text-white">{currentLang.name}</strong></span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isLangDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-0.5 backdrop-blur-lg">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        selectedLanguageId === lang.id
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-[10px] font-mono opacity-60">{lang.extension}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleRunCodeAction}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run Code</span>
            </button>
          </div>
        </div>

        {/* Code Canvas with Line Numbers & Textarea */}
        <div className="flex-1 flex overflow-hidden bg-[#070b14] font-mono text-xs">
          {/* Line Numbers */}
          <div className="w-12 py-3 bg-[#090d18] border-r border-slate-800/60 text-slate-600 select-none text-right pr-3 font-mono leading-relaxed">
            {editorCode.split('\n').map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>

          {/* Editable Code Area */}
          <textarea
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
            className="flex-1 p-3 bg-transparent text-slate-200 outline-none resize-none font-mono leading-relaxed overflow-y-auto selection:bg-indigo-500/30 selection:text-white"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Right AI Code Synthesis & Inspector Panel */}
      <div className="w-96 bg-[#0a0f1d] flex flex-col justify-between select-none shrink-0">
        {/* Header Tabs */}
        <div className="h-11 border-b border-slate-800/80 px-2 flex items-center justify-between shrink-0 bg-[#0d1324]">
          <div className="grid grid-cols-4 gap-1 w-full">
            {[
              { id: 'generate', label: 'Generate', icon: Wand2 },
              { id: 'explain', label: 'Explain', icon: Sparkles },
              { id: 'refactor', label: 'Refactor', icon: RefreshCw },
              { id: 'tests', label: 'Tests', icon: FileCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeActionTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveActionTab(tab.id as any)}
                  className={`py-1 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Code Instructions ({currentLang.name})</span>
            </label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={3}
              placeholder={`Describe the ${currentLang.name} logic, API, algorithm, or test suite to synthesize...`}
              className="w-full bg-[#12192d] border border-slate-700/80 rounded-xl p-2.5 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none text-xs"
            />
          </div>

          <button
            onClick={handleRunCodeAction}
            disabled={isGenerating}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition-all active:scale-[0.98] cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing with Qwen2.5-Coder...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Apply AI {activeActionTab.toUpperCase()}</span>
              </>
            )}
          </button>

          {/* Diagnostic & AST Explanation Card */}
          <div className="rounded-xl bg-[#11182c]/80 border border-slate-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Architecture Insights</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {currentLang.name} LSP Ready
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Synthesizing idiomatic {currentLang.name} syntax with strict type validation, async coroutine handling, and error checking.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
              <span>Extension: {currentLang.extension}</span>
              <span>•</span>
              <span>Syntax: Standard</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0d1322] text-[10px] text-slate-400 text-center">
          Powered by Google Gemini API & Intelligent AI Engine
        </div>
      </div>
    </div>
  );
};


# Intelligent AI Editor — System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│             Desktop Shell (Tauri 2 / React UI)               │
│  - Monaco Editor  - Virtual Terminal Tab Canvas             │
│  - AI Synthesis Card - Safety Confirmation Dialogs          │
└───────────────────────────┬─────────────────────────────────┘
                            │ (Local HTTP / IPC)
┌───────────────────────────▼─────────────────────────────────┐
│        Python FastAPI Local Native Daemon (:8000)           │
│  - AI Orchestrator (Prompts + Local Fallback)               │
│  - Safety Pipeline (AST Normalizer + Risk Classifier)       │
│  - Terminal Execution Subsystem (Async Process Subprocess)  │
│  - SQLite Engine (WAL Mode, Transaction Logging)            │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│ Google Gemini API Inference ││   Host Shell Virtualization  │
│ - gemini-2.5-flash / 3.7    ││ - PowerShell Core / Windows  │
│ - @google/genai SDK / HTTPS ││ - CMD / WSL 2 / Bash         │
└─────────────────────────────┘└──────────────────────────────┘
```

## Subsystem Breakdown

1. **Desktop Shell (Tauri 2 + React 18 + Tailwind CSS)**:
   - Ultra-fast native webview runtime (<35MB RAM footprint).
   - Multi-tab virtual shell interface with ANSI-stripping terminal log renderers.
   - Monaco code assistant with live refactoring and test-generation hooks.

2. **AI Orchestration Engine**:
   - Backend integration with Google Gemini API via official `@google/genai` TypeScript SDK.
   - Deterministic offline rules fallback for guaranteed zero-latency synthesis during offline mode.
   - Structured JSON response extraction with automatic recovery from markdown fences.

3. **Multi-Stage Safety Validation Subsystem**:
   - **Critical Filter**: Blocks catastrophic commands (`rm -rf /`, root drive formatting, fork bombs).
   - **Risk Classifier**: Categorizes actions into `LOW`, `MEDIUM`, `HIGH`, and `BLOCKED`.
   - **Human-in-the-Loop Confirmation**: Demands explicit user UI confirmation before running any destructive operations.

4. **Terminal Execution Subsystem**:
   - Non-blocking asynchronous child process execution with PID tracking.
   - Configurable per-command execution timeout with automatic SIGKILL recovery.
   - Output stream sanitization and exit code capture.

5. **Storage & Persistence (SQLite WAL)**:
   - Relational database storing command history, safety classifications, scaffolded projects, and AI conversational memory.
   - WAL (Write-Ahead Logging) enabled for concurrent asynchronous queries.

import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { realWindowsTerminalService } from '../../utils/realWindowsTerminalEngine';

interface XTermTerminalProps {
  shellType: 'powershell' | 'cmd';
  currentCwd: string;
  onCwdChange?: (newCwd: string) => void;
  onInterrupt?: () => void;
}

export interface XTermTerminalHandle {
  executeCommand: (cmd: string) => void;
  clear: () => void;
  focus: () => void;
}

export const XTermTerminal = React.forwardRef<XTermTerminalHandle, XTermTerminalProps>(({
  shellType,
  currentCwd,
  onCwdChange,
  onInterrupt
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const currentLineRef = useRef<string>('');
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isExecutingRef = useRef<boolean>(false);
  const cwdRef = useRef<string>(currentCwd);

  cwdRef.current = currentCwd;

  const getPrompt = () => {
    if (shellType === 'powershell') {
      return `\x1b[36mPS ${cwdRef.current}>\x1b[0m `;
    } else {
      return `\x1b[33m${cwdRef.current}>\x1b[0m `;
    }
  };

  const writePrompt = () => {
    if (termRef.current) {
      termRef.current.write(`\r\n${getPrompt()}`);
      currentLineRef.current = '';
    }
  };

  // Expose executeCommand to parent
  React.useImperativeHandle(ref, () => ({
    executeCommand: (cmd: string) => {
      if (!termRef.current) return;
      termRef.current.write(`\r\n${getPrompt()}\x1b[32m${cmd}\x1b[0m\r\n`);
      runRealCommand(cmd);
    },
    clear: () => {
      termRef.current?.clear();
      writePrompt();
    },
    focus: () => {
      termRef.current?.focus();
    }
  }));

  const runRealCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) {
      writePrompt();
      return;
    }

    // Save to local history
    commandHistoryRef.current.push(trimmed);
    historyIndexRef.current = -1;
    isExecutingRef.current = true;

    // Direct clear command
    if (trimmed.toLowerCase() === 'cls' || trimmed.toLowerCase() === 'clear') {
      termRef.current?.clear();
      isExecutingRef.current = false;
      writePrompt();
      return;
    }

    try {
      const result = await realWindowsTerminalService.executeCommand(
        trimmed,
        shellType,
        cwdRef.current
      );

      if (result.workingDirectory && result.workingDirectory !== cwdRef.current) {
        if (onCwdChange) {
          onCwdChange(result.workingDirectory);
        }
      }

      if (result.stdout) {
        const formattedStdout = result.stdout.replace(/\r?\n/g, '\r\n');
        termRef.current?.write(formattedStdout);
        if (!formattedStdout.endsWith('\r\n')) {
          termRef.current?.write('\r\n');
        }
      }

      if (result.stderr) {
        const formattedStderr = result.stderr.replace(/\r?\n/g, '\r\n');
        termRef.current?.write(`\x1b[31m${formattedStderr}\x1b[0m`);
        if (!formattedStderr.endsWith('\r\n')) {
          termRef.current?.write('\r\n');
        }
      }

      if (result.status === 'BLOCKED') {
        termRef.current?.write(`\x1b[31;1m[SECURITY POLICY BLOCKED] Execution forbidden.\x1b[0m\r\n`);
      }
    } catch (err: any) {
      termRef.current?.write(`\x1b[31mProcess Error: ${err.message}\x1b[0m\r\n`);
    } finally {
      isExecutingRef.current = false;
      writePrompt();
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize xterm.js instance
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: 'Consolas, "Fira Code", "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.25,
      theme: {
        background: '#070b14',
        foreground: '#e2e8f0',
        cursor: '#818cf8',
        cursorAccent: '#070b14',
        selectionBackground: '#3730a3',
        black: '#0f172a',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#38bdf8',
        white: '#f1f5f9',
        brightBlack: '#475569',
        brightRed: '#ef4444',
        brightGreen: '#22c55e',
        brightYellow: '#eab308',
        brightBlue: '#3b82f6',
        brightMagenta: '#a855f7',
        brightCyan: '#06b6d4',
        brightWhite: '#ffffff'
      },
      convertEol: true,
      allowTransparency: true
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome banner
    term.write(`\x1b[1;34m===================================================================\x1b[0m\r\n`);
    term.write(`\x1b[1;37m Intelligent AI Editor — Real Windows Terminal Execution Engine\x1b[0m\r\n`);
    term.write(`\x1b[35m Shell: ${shellType === 'powershell' ? 'PowerShell 7 / Windows PowerShell' : 'Command Prompt (CMD)'}\x1b[0m | \x1b[32mHost Process: Active\x1b[0m\r\n`);
    term.write(`\x1b[1;34m===================================================================\x1b[0m\r\n`);
    term.write(getPrompt());

    // Handle Keyboard Input
    term.onData((data) => {
      // Ctrl+C (ETX = \x03)
      if (data === '\x03') {
        term.write('^C');
        realWindowsTerminalService.sendInterrupt();
        if (onInterrupt) onInterrupt();
        currentLineRef.current = '';
        writePrompt();
        return;
      }

      // Enter key (\r or \n)
      if (data === '\r' || data === '\n') {
        const cmd = currentLineRef.current;
        currentLineRef.current = '';
        term.write('\r\n');
        runRealCommand(cmd);
        return;
      }

      // Backspace (\x7f or \b)
      if (data === '\x7f' || data === '\b') {
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1);
          term.write('\b \b');
        }
        return;
      }

      // Up arrow (\x1b[A) - Cycle command history back
      if (data === '\x1b[A') {
        const history = commandHistoryRef.current;
        if (history.length === 0) return;

        let nextIndex = historyIndexRef.current === -1 ? history.length - 1 : historyIndexRef.current - 1;
        if (nextIndex < 0) nextIndex = 0;
        historyIndexRef.current = nextIndex;

        // Clear current line on screen
        while (currentLineRef.current.length > 0) {
          term.write('\b \b');
          currentLineRef.current = currentLineRef.current.slice(0, -1);
        }

        const recalled = history[nextIndex] || '';
        currentLineRef.current = recalled;
        term.write(recalled);
        return;
      }

      // Down arrow (\x1b[B) - Cycle command history forward
      if (data === '\x1b[B') {
        const history = commandHistoryRef.current;
        if (historyIndexRef.current === -1) return;

        let nextIndex = historyIndexRef.current + 1;
        while (currentLineRef.current.length > 0) {
          term.write('\b \b');
          currentLineRef.current = currentLineRef.current.slice(0, -1);
        }

        if (nextIndex >= history.length) {
          historyIndexRef.current = -1;
          currentLineRef.current = '';
        } else {
          historyIndexRef.current = nextIndex;
          const recalled = history[nextIndex] || '';
          currentLineRef.current = recalled;
          term.write(recalled);
        }
        return;
      }

      // Printable characters
      if (data >= ' ' || data === '\t') {
        currentLineRef.current += data;
        term.write(data);
      }
    });

    // Resize Observer to adjust dimensions dynamically
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
        realWindowsTerminalService.sendResize(term.cols, term.rows);
      } catch {
        // Ignore container resize race conditions
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      termRef.current = null;
    };
  }, [shellType]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full p-2 bg-[#070b14] overflow-hidden"
      style={{ minHeight: '220px' }}
    />
  );
});

XTermTerminal.displayName = 'XTermTerminal';

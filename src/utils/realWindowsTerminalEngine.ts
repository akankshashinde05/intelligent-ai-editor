/**
 * Real Windows Terminal Engine & WebSocket Streaming Client
 * Connects directly to real OS processes (PowerShell / CMD) via backend WebSocket / HTTP APIs.
 */

export interface RealExecutionResult {
  command: string;
  shellType: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  workingDirectory: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'CANCELLED';
}

export type TerminalStreamCallback = (data: string, isError?: boolean) => void;

class RealWindowsTerminalService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private listeners: Set<(event: any) => void> = new Set();
  private cwd: string = 'C:\\Users\\Developer\\workspace';
  private activeShell: string = 'powershell';
  private isWindowsHost: boolean = false;

  constructor() {
    this.detectHost();
  }

  private async detectHost() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        this.isWindowsHost = data.platform === 'win32';
        if (data.cwd) {
          this.cwd = data.cwd;
        }
      }
    } catch {
      // Offline fallback
    }
  }

  public getCwd(): string {
    return this.cwd;
  }

  public setCwd(newCwd: string) {
    this.cwd = newCwd;
  }

  public getActiveShell(): string {
    return this.activeShell;
  }

  public setActiveShell(shell: string) {
    this.activeShell = shell;
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ action: 'START', shell, cwd: this.cwd }));
    }
  }

  /**
   * Initializes or returns the active WebSocket stream connection
   */
  public connectWebSocket(onMessage?: (event: any) => void): WebSocket {
    if (onMessage) {
      this.listeners.add(onMessage);
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return this.ws;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/v1/terminal/session`;

    const socket = new WebSocket(wsUrl);
    this.ws = socket;

    socket.onopen = () => {
      this.isConnected = true;
      socket.send(JSON.stringify({
        action: 'START',
        shell: this.activeShell,
        cwd: this.cwd
      }));
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.cwd) {
          this.cwd = msg.cwd;
        }
        this.listeners.forEach((listener) => listener(msg));
      } catch {
        this.listeners.forEach((listener) => listener({ type: 'OUTPUT', data: event.data }));
      }
    };

    socket.onclose = () => {
      this.isConnected = false;
      this.listeners.forEach((listener) => listener({
        type: 'STATUS',
        status: 'DISCONNECTED',
        message: 'Terminal session disconnected. Reconnecting when next command is submitted.'
      }));
    };

    socket.onerror = (err) => {
      console.warn('Terminal WS notice:', err);
    };

    return socket;
  }

  public removeListener(onMessage: (event: any) => void) {
    this.listeners.delete(onMessage);
  }

  /**
   * Sends raw user keystrokes / input to the running process
   */
  public sendInput(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'INPUT', data: text }));
    } else {
      // Connect and send
      const s = this.connectWebSocket();
      s.addEventListener('open', () => {
        s.send(JSON.stringify({ action: 'INPUT', data: text }));
      }, { once: true });
    }
  }

  /**
   * Real Ctrl+C interruption dispatched to the OS process
   */
  public sendInterrupt() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'INTERRUPT' }));
    }
  }

  /**
   * Resizes the terminal columns & rows
   */
  public sendResize(cols: number, rows: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'RESIZE', cols, rows }));
    }
  }

  /**
   * Executes a command via HTTP POST with full response capture
   */
  public async executeCommand(
    command: string,
    shellType: string = this.activeShell,
    workingDirectory: string = this.cwd
  ): Promise<RealExecutionResult> {
    try {
      const res = await fetch('/api/v1/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          shell_type: shellType,
          working_directory: workingDirectory
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const data = json.data || {};

      if (data.working_directory) {
        this.cwd = data.working_directory;
      }

      return {
        command: data.command || command,
        shellType: data.shell_type || shellType,
        exitCode: typeof data.exit_code === 'number' ? data.exit_code : 0,
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        durationMs: data.execution_time_ms || 0,
        workingDirectory: data.working_directory || workingDirectory,
        riskLevel: data.risk_level || 'LOW',
        status: data.status || (data.exit_code === 0 ? 'SUCCESS' : 'FAILED')
      };
    } catch (err: any) {
      return {
        command,
        shellType,
        exitCode: -1,
        stdout: '',
        stderr: `Process Communication Error: ${err.message}`,
        durationMs: 0,
        workingDirectory,
        riskLevel: 'LOW',
        status: 'FAILED'
      };
    }
  }
}

export const realWindowsTerminalService = new RealWindowsTerminalService();

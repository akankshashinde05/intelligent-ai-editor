/**
 * Intelligent AI Editor - AI Synthesis & Google Gemini API Client
 * Connects the frontend natural language UI to backend AI orchestrator & Google Gemini API.
 */

export interface AISynthesizeRequest {
  prompt: string;
  shell_type?: string;
  working_directory?: string;
  os_type?: string;
  model?: string;
  session_id?: string;
}

export interface AISynthesizeResponse {
  intent: string;
  shell: string;
  command: string;
  explanation: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';
  risk_reasons?: string[];
  requires_confirmation: boolean;
  needs_clarification?: boolean;
  clarification_question?: string | null;
  is_blocked?: boolean;
  provider?: string;
  ai_online?: boolean;
  gemini_online?: boolean;
  fallback_active?: boolean;
  model?: string;
  working_directory?: string;
}

export interface AIChatResponse {
  session_id: string;
  response: string;
  extracted_command?: string;
  provider?: string;
  ai_online?: boolean;
  gemini_online?: boolean;
  fallback_active?: boolean;
}

export interface AIStatusInfo {
  provider: string;
  online: boolean;
  available: boolean;
  gemini_online?: boolean;
  default_model: string;
  model?: string;
  fallback_active?: boolean;
  available_models: string[];
  target_platform: string;
}

class AIService {
  public async getStatus(): Promise<AIStatusInfo> {
    try {
      const res = await fetch('/api/v1/ai/status');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('AI status check error:', e);
    }
    return {
      provider: 'gemini',
      online: false,
      available: false,
      gemini_online: false,
      default_model: 'gemini-2.5-flash',
      model: 'gemini-2.5-flash',
      fallback_active: true,
      available_models: ['gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite'],
      target_platform: 'windows'
    };
  }

  public async getModels(): Promise<string[]> {
    try {
      const res = await fetch('/api/v1/ai/models');
      if (res.ok) {
        const json = await res.json();
        return json.data?.models || ['gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite'];
      }
    } catch {
      // fallback
    }
    return ['gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite'];
  }

  public async synthesize(req: AISynthesizeRequest): Promise<AISynthesizeResponse> {
    try {
      const res = await fetch('/api/v1/ai/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: req.prompt,
          shell_type: req.shell_type || 'powershell',
          working_directory: req.working_directory,
          os_type: req.os_type || 'windows',
          model: req.model || 'gemini-2.5-flash',
          session_id: req.session_id || 'default'
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      throw new Error(json.error || 'Failed to synthesize command');
    } catch (err: any) {
      console.warn('AI synthesize API error, using safe fallback format:', err);
      return {
        intent: `Execute: ${req.prompt}`,
        shell: req.shell_type || 'powershell',
        command: req.shell_type === 'cmd' ? `echo "${req.prompt}"` : `Write-Output "${req.prompt}"`,
        explanation: 'Gemini AI API is operating in offline fallback mode.',
        risk: 'LOW',
        requires_confirmation: true,
        needs_clarification: false,
        provider: 'gemini',
        ai_online: false,
        gemini_online: false,
        fallback_active: true,
        model: 'gemini-2.5-flash'
      };
    }
  }

  public async chat(message: string, shellType: string = 'powershell', cwd: string = '.'): Promise<AIChatResponse> {
    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          shell_type: shellType,
          working_directory: cwd
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return {
        session_id: 'default',
        response: `Gemini AI API is currently operating in offline fallback mode.\n\nCommand suggestion for "${message}":\n\`\`\`${shellType}\nGet-ChildItem\n\`\`\``,
        extracted_command: 'Get-ChildItem',
        provider: 'gemini',
        ai_online: false,
        gemini_online: false,
        fallback_active: true
      };
    }
  }
}

export const aiService = new AIService();

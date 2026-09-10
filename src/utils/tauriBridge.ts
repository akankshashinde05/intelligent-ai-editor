/**
 * Desktop Shell Tauri 2 Bridge & Environment Detector
 * Seamlessly integrates with Tauri native APIs when running as a packaged desktop app
 * and provides safe browser emulation during development preview.
 */

export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const getDesktopSystemInfo = async () => {
  if (isTauriEnvironment()) {
    try {
      // Use dynamic import if available in Tauri bundle
      const { invoke } = (window as unknown as { __TAURI__: { core: { invoke: (cmd: string) => Promise<unknown> } } }).__TAURI__.core;
      return await invoke('get_system_info');
    } catch (e) {
      console.warn('Tauri invoke error, using standard fallback:', e);
    }
  }

  // Fallback desktop telemetry representation
  return {
    os: 'linux',
    arch: 'x86_64',
    default_shell: 'bash',
    status: 'ready'
  };
};

export const windowControls = {
  minimize: async () => {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = (window as unknown as { __TAURI__: { core: { invoke: (cmd: string) => Promise<unknown> } } }).__TAURI__.core;
        await invoke('minimize_window');
        return;
      } catch (e) {
        console.warn('Failed to minimize window via Tauri:', e);
      }
    }
    console.log('[Desktop Shell] Window Minimize triggered.');
  },

  toggleMaximize: async () => {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = (window as unknown as { __TAURI__: { core: { invoke: (cmd: string) => Promise<unknown> } } }).__TAURI__.core;
        await invoke('toggle_maximize_window');
        return;
      } catch (e) {
        console.warn('Failed to toggle maximize window via Tauri:', e);
      }
    }
    console.log('[Desktop Shell] Window Toggle Maximize triggered.');
  },

  close: async () => {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = (window as unknown as { __TAURI__: { core: { invoke: (cmd: string) => Promise<unknown> } } }).__TAURI__.core;
        await invoke('close_window');
        return;
      } catch (e) {
        console.warn('Failed to close window via Tauri:', e);
      }
    }
    console.log('[Desktop Shell] Window Close requested.');
  }
};

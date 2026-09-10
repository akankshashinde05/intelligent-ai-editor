use tauri::{AppHandle, Manager, Runtime};

#[tauri::command]
fn get_system_info() -> serde_json::Value {
    serde_json::json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "default_shell": if cfg!(target_os = "windows") { "powershell.exe" } else { "bash" },
        "status": "ready"
    })
}

#[tauri::command]
async fn minimize_window<R: Runtime>(_app: AppHandle<R>, window: tauri::Window<R>) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
async fn toggle_maximize_window<R: Runtime>(_app: AppHandle<R>, window: tauri::Window<R>) -> Result<(), String> {
    if window.is_maximized().map_err(|e| e.to_string())? {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}

#[tauri::command]
async fn close_window<R: Runtime>(_app: AppHandle<R>, window: tauri::Window<R>) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            minimize_window,
            toggle_maximize_window,
            close_window
        ])
        .setup(|app| {
            let window = app.get_webview_window("main");
            if let Some(w) = window {
                #[cfg(debug_assertions)]
                {
                    // Open devtools automatically in debug mode if needed
                    // w.open_devtools();
                }
                println!("NeuroTerm AI Desktop Window initialized successfully.");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running NeuroTerm AI desktop application");
}

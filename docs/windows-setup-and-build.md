# Intelligent AI Editor - Windows Local Setup & Desktop Build Guide

This guide walks you through exporting the codebase and running or compiling the **Intelligent AI Editor** on a Windows 10/11 machine.

---

## 1. Exporting the Project to Your Local Windows PC

1. In the Google AI Studio top-right menu, select **Export / Download ZIP** (or push to a GitHub repository).
2. Extract the downloaded ZIP archive to a folder on your Windows PC (e.g., `C:\Projects\intelligent-ai-editor`).

---

## 2. Prerequisites on Windows

Install the following software on your Windows machine:

### A. Node.js
- Download and install **Node.js (LTS version, v20 or v22)** from [nodejs.org](https://nodejs.org/).
- Verify in PowerShell:
  ```powershell
  node --version
  npm --version
  ```

### B. Google Gemini API Key (AI Engine)
1. Get a Gemini API key from Google AI Studio.
2. Create a `.env` file in the project root with:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
3. The server automatically uses the API key for natural language command synthesis and developer chat assistance.

### C. Rust Toolchain (Required ONLY for Desktop `.exe`/`.msi` Build)
If you want to compile the native desktop installer:
1. Download and run `rustup-init.exe` from [rustup.rs](https://rustup.rs/).
2. Follow the prompt to install the default toolchain (and the **C++ Build Tools** for Visual Studio if prompted).
3. Verify in PowerShell:
   ```powershell
   rustc --version
   cargo --version
   ```

---

## 3. Running in Web/Local Mode (Instant Start)

You can run the full-featured application immediately in your browser:

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd C:\Projects\intelligent-ai-editor
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the local server:
   ```powershell
   npm run dev
   ```
4. Open your browser to `http://localhost:3000`.

---

## 4. Compiling the Native Windows Desktop Application (.exe / .msi)

To build the native desktop executable using Tauri 2:

1. Navigate to the project root:
   ```powershell
   cd C:\Projects\intelligent-ai-editor
   ```
2. Run the automated PowerShell build script:
   ```powershell
   .\scripts\build-desktop.ps1
   ```
   *Alternatively, run:*
   ```powershell
   npm run build
   npx @tauri-apps/cli build
   ```

### Output Location:
Once the build completes, your installers will be ready in:
- **NSIS Standalone Installer (.exe)**:  
  `src-tauri\target\release\bundle\nsis\Intelligent AI Editor_0.1.0_x64-setup.exe`
- **Windows MSI Installer (.msi)**:  
  `src-tauri\target\release\bundle\msi\Intelligent AI Editor_0.1.0_x64_en-US.msi`
- **Direct Standalone Binary**:  
  `src-tauri\target\release\intelligent-ai-editor.exe`

---

## 5. Verification Checklist on Windows

After installing/launching the application on Windows:

1. **Terminal**: Confirm PowerShell and CMD tabs open with active interactive prompts.
2. **AI Synthesis**: Type a natural language command (e.g., `"Show all files in this folder"`) and confirm it generates `Get-ChildItem`.
3. **Safety Engine**: Test with `Get-ChildItem` (LOW risk) and `Remove-Item` (triggers safety confirmation).
4. **Execution & History**: Click **Run** and verify execution output, execution timing, and entries logged to SQLite history.
5. **AI Status**: The status indicator in the top header displays **Online** when the Gemini API is configured (or **Fallback Mode** if working offline).

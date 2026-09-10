# Intelligent AI Editor - Environment Setup Script (PowerShell)
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Intelligent AI Editor Environment Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Check Python installation
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "[✓] Python detected: $(python --version)" -ForegroundColor Green
} else {
    Write-Host "[!] Python 3.10+ required. Please install Python." -ForegroundColor Red
}

# 2. Check Node.js and NPM
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "[✓] Node.js & NPM detected: $(node --version)" -ForegroundColor Green
} else {
    Write-Host "[!] Node.js 18+ required." -ForegroundColor Red
}

# 3. Check Rust and Cargo
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    Write-Host "[✓] Rust & Cargo detected: $(cargo --version)" -ForegroundColor Green
} else {
    Write-Host "[i] Cargo not found. Required for Tauri native compilation." -ForegroundColor Yellow
}

# 4. Check Google Gemini API Key
if ($env:GEMINI_API_KEY) {
    Write-Host "[✓] GEMINI_API_KEY environment variable detected." -ForegroundColor Green
} else {
    Write-Host "[i] GEMINI_API_KEY not set. Falling back to deterministic command synthesis." -ForegroundColor Yellow
}

# 5. Create Python Virtualenv and Install Backend Dependencies
Write-Host "`nSetting up Python virtual environment..." -ForegroundColor Cyan
if (-not (Test-Path "backend\venv")) {
    python -m venv backend\venv
}
& "backend\venv\Scripts\pip.exe" install -r backend\requirements.txt

# 6. Install Frontend Dependencies
Write-Host "`nInstalling UI dependencies..." -ForegroundColor Cyan
npm install

Write-Host "`n[✓] Setup completed successfully! Run scripts\start-backend.ps1 to start the daemon." -ForegroundColor Green

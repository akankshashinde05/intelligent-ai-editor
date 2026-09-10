# Intelligent AI Editor - Start FastAPI Backend Daemon
Write-Host "Starting Intelligent AI Editor Execution Daemon on http://127.0.0.1:8000..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\..\backend"

if (Test-Path "venv\Scripts\uvicorn.exe") {
    & "venv\Scripts\uvicorn.exe" main:app --host 127.0.0.1 --port 8000 --reload
} else {
    uvicorn main:app --host 127.0.0.1 --port 8000 --reload
}

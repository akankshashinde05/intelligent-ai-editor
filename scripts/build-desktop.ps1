# Intelligent AI Editor - Desktop Native Packaging Script
Write-Host "Building Intelligent AI Editor Desktop Binary (Tauri 2)..." -ForegroundColor Cyan

# 1. Build Vite UI bundle
npm run build

# 2. Package Tauri binary
npm run tauri:build

Write-Host "[✓] Desktop installer generated in src-tauri\target\release\bundle\msi" -ForegroundColor Green

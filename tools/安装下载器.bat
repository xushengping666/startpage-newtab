@echo off
setlocal
cd /d "%~dp0"
echo Installing PclBridge...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-host.ps1"
echo.
echo Done. Fully close Edge (Task Manager: no msedge), then reopen it.
pause

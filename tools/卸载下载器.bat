@echo off
setlocal
cd /d "%~dp0"
echo Removing PclBridge registration...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall-host.ps1"
echo.
pause

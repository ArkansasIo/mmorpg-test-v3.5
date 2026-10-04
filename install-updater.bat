@echo off
setlocal
cd /d "%~dp0"
if not exist "tools\UniverseUpdater\bin\Release\net8.0-windows\win-x64\publish\UniverseUpdater.exe" call tools\UniverseUpdater\build-updater.bat
if errorlevel 1 exit /b %errorlevel%
echo UniverseUpdater is ready.
echo Run tools\UniverseUpdater\update-now.bat to update from GitHub.
pause

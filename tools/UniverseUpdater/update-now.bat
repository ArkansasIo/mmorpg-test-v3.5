@echo off
setlocal EnableExtensions
cd /d "%~dp0..\.."
set "UPDATER=tools\UniverseUpdater\bin\Release\net8.0-windows\win-x64\publish\UniverseUpdater.exe"
if not exist "%UPDATER%" (
  call tools\UniverseUpdater\build-updater.bat
  if errorlevel 1 exit /b %errorlevel%
)
set "TMP=%TEMP%\UniverseUpdater-%RANDOM%%RANDOM%"
mkdir "%TMP%" >nul 2>&1
copy /y "%UPDATER%" "%TMP%\UniverseUpdater.exe" >nul
if errorlevel 1 (
  echo [ERROR] Could not stage updater executable.
  exit /b 1
)
echo [OK] Starting updater from temporary location.
start "" "%TMP%\UniverseUpdater.exe" "%CD%"
exit /b 0

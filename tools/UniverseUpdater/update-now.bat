@echo off
setlocal
cd /d "%~dp0..\.."
set "UPDATER=tools\UniverseUpdater\bin\Release\net8.0-windows\win-x64\publish\UniverseUpdater.exe"
if not exist "%UPDATER%" call tools\UniverseUpdater\build-updater.bat
if errorlevel 1 exit /b %errorlevel%
set "TMP=%TEMP%\UniverseUpdater"
if exist "%TMP%" rmdir /s /q "%TMP%"
mkdir "%TMP%"
copy /y "%UPDATER%" "%TMP%\UniverseUpdater.exe" >nul
start "" "%TMP%\UniverseUpdater.exe" "%CD%"

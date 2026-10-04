@echo off
setlocal EnableExtensions
title Universe Civilization: Empire at War - Installer and Setup
color 0B

rem Always run from the directory containing this installer.
cd /d "%~dp0"

echo ====================================================================
echo  UNIVERSE CIVILIZATION: EMPIRE AT WAR - INSTALLER AND SETUP SYSTEM
echo ====================================================================
echo.
echo [INFO] Workspace: %CD%
echo.

node -v >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not found in PATH.
  echo Install Node.js 22 LTS and run this installer again.
  echo.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [ERROR] package.json was not found in %CD%.
  echo This installer must be inside the project root.
  pause
  exit /b 1
)

if not exist "tsconfig.server.json" (
  echo [ERROR] tsconfig.server.json is missing.
  echo Your local project copy is incomplete or out of date.
  echo Pull/sync the latest repository files before continuing.
  pause
  exit /b 1
)

if not exist "src\cronData.ts" (
  echo [ERROR] src\cronData.ts is missing.
  echo Your local project copy is incomplete or out of date.
  pause
  exit /b 1
)

if not exist "src\ogameData.ts" (
  echo [ERROR] src\ogameData.ts is missing.
  echo Your local project copy is incomplete or out of date.
  pause
  exit /b 1
)

echo [1/3] Running automated setup orchestrator (dependencies, builds, env)...
call node scripts\setup.cjs
if errorlevel 1 (
  echo.
  echo [ERROR] Setup failed. The project was NOT reported as successfully installed.
  echo Fix the reported error and run install-setup.bat again.
  pause
  exit /b 1
)

echo.
echo ====================================================================
echo  SETUP COMPLETE - SELECT ACTION
echo ====================================================================
echo  [1] Start Full-Stack System (Server + Web Client) [Default]
echo  [2] Launch Environment Variable Configuration Manager
echo  [3] Start Frontend Web App Only (Port 3000)
echo  [4] Start Game Backend API Only (Port 5001)
echo  [5] Run TypeScript Compiler and Typecheck
echo  [6] Exit
echo ====================================================================
echo.

set "choice="
set /p "choice=Choose an option [1-6] (Press Enter for 1): "
if not defined choice set "choice=1"

if "%choice%"=="1" goto launch_fullstack
if "%choice%"=="2" goto launch_env_config
if "%choice%"=="3" goto launch_client
if "%choice%"=="4" goto launch_server
if "%choice%"=="5" goto run_lint
if "%choice%"=="6" goto finish

echo [ERROR] Invalid option.
goto finish

:launch_fullstack
echo Starting Full-Stack Universe Civilization...
call "%~dp0start-fullstack.bat"
goto finish

:launch_env_config
echo Opening Environment Variable Manager...
call "%~dp0env-config.bat"
goto finish

:launch_client
echo Launching Vite Frontend...
call npm run dev
goto finish

:launch_server
echo Launching Backend Server...
call "%~dp0start-server.bat"
goto finish

:run_lint
echo Running TypeScript checks...
call npm run typecheck
set "lint_error=%errorlevel%"
if not "%lint_error%"=="0" echo [ERROR] Typecheck failed with exit code %lint_error%.
pause
goto finish

:finish
echo Exiting setup.
endlocal
exit /b 0

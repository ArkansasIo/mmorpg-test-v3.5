@echo off
setlocal enabledelayedexpansion
title Universe Civilization & BSAT - Automated Installer & Setup
color 0B

echo ====================================================================
echo  UNIVERSE CIVILIZATION: EMPIRE AT WAR - INSTALLER & SETUP SYSTEM
echo ====================================================================
echo.

node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Node.js is not installed or not found in system PATH!
  echo Please install Node.js 20+ from https://nodejs.org/ and retry.
  echo.
  pause
  exit /b 1
)

echo [1/3] Running automated setup orchestrator (dependencies, builds, env)...
call node scripts/setup.cjs
if %ERRORLEVEL% NEQ 0 (
  echo [WARN] Setup script completed with warnings. Continuing to menu...
)

echo.
echo ====================================================================
echo  SETUP COMPLETE - SELECT ACTION
echo ====================================================================
echo  [1] Start Full-Stack System (Server + Web Client) [Default]
echo  [2] Launch Environment Variable Configuration Manager
echo  [3] Start Frontend Web App Only (Port 3000)
echo  [4] Start Game Backend API Only (Port 5001)
echo  [5] Run TypeScript Compiler & Typecheck (Lint)
echo  [6] Exit
echo ====================================================================
echo.

set /p choice="Choose an option [1-6] (Press Enter for 1): "
if "%choice%"=="" set choice=1
if "%choice%"=="1" goto launch_fullstack
if "%choice%"=="2" goto launch_env_config
if "%choice%"=="3" goto launch_client
if "%choice%"=="4" goto launch_server
if "%choice%"=="5" goto run_lint
if "%choice%"=="6" goto finish

:launch_fullstack
echo Starting Full-Stack Universe Civilization...
call start-fullstack.bat
goto finish

:launch_env_config
echo Opening Environment Variable Manager...
call env-config.bat
goto finish

:launch_client
echo Launching Vite Frontend...
call npm run dev
goto finish

:launch_server
echo Launching Backend Server...
call start-server.bat
goto finish

:run_lint
echo Running TypeScript checks...
call npm run lint
pause
goto finish

:finish
echo Exiting setup.

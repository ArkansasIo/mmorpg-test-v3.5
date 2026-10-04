@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: BSAT: Windows Dev Watcher for Live TypeScript Recompilation & Server Reload
:: Uses tsx or tsc --watch to automatically restart on changes.
:: ============================================================================

title BSAT TypeScript Live Watcher
color 0B

echo ============================================================================
echo   [BSAT] TypeScript Live Watch & Auto-Restart Server
echo ============================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is required. Install from https://nodejs.org/
    pause
    exit /b 1
)

echo [*] Starting TypeScript live file watcher and auto-restarting server...
echo [*] Watching directory: server/
echo [*] Press Ctrl+C at any time to stop.
echo.

:: Use tsx watch (instant TypeScript execution and live reload)
call npx tsx watch server/index.ts

if %ERRORLEVEL% neq 0 (
    echo.
    echo [*] Falling back to nodemon / tsc watch pipeline...
    call npx nodemon --watch "server/**/*.ts" --exec "npx tsc -p tsconfig.server.json && node dist-server/index.js"
)

pause
endlocal

@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

title Universe Civilization TypeScript Node.js Server Supervisor
color 0A

echo ============================================================================
echo   [UNIVERSE] TypeScript Node.js Server Supervisor
echo ============================================================================

where node >nul 2>nul
if errorlevel 1 (
    color 0C
    echo [ERROR] Node.js is not found in PATH.
    echo Please install Node.js 20-24 and restart this terminal.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node -v') do set "NODE_VERSION=%%v"
echo [OK] Detected Node.js: !NODE_VERSION!

if not exist "node_modules\.bin\tsc.cmd" (
    echo [*] Installing dependencies...
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        color 0C
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:COMPILE_STEP
echo.
echo [*] Cleaning previous generated server output...
if exist "dist-server" (
    rmdir /s /q "dist-server"
    if exist "dist-server" (
        color 0C
        echo [ERROR] Could not remove the old dist-server directory.
        echo [ERROR] Close any running Node.js process using dist-server and retry.
        pause
        exit /b 1
    )
)

echo [*] Compiling TypeScript server...
if not exist "tsconfig.server.json" (
    color 0C
    echo [ERROR] Missing tsconfig.server.json.
    exit /b 1
)

call "node_modules\.bin\tsc.cmd" -p "tsconfig.server.json" --pretty false
if errorlevel 1 (
    color 0C
    echo.
    echo [ERROR] TypeScript compilation failed.
    choice /C RQ /N /M "Retry compilation or quit (R/Q): "
    if errorlevel 2 exit /b 1
    goto COMPILE_STEP
)

if not exist "dist-server\index.js" (
    color 0C
    echo [ERROR] Compilation reported success but dist-server/index.js was not generated.
    exit /b 1
)

echo [*] Validating generated JavaScript...
node --check "dist-server\index.js"
if errorlevel 1 (
    color 0C
    echo [ERROR] Generated server JavaScript failed Node.js syntax validation.
    echo [ERROR] The generated file is not executable JavaScript.
    exit /b 1
)

echo [OK] TypeScript compilation and Node.js syntax validation succeeded.

rem The Vite client uses port 3000 by default. Keep the Node API on 5001 unless the caller explicitly supplied PORT.
if not defined PORT set "PORT=5001"
echo [CONFIG] Node API PORT=!PORT!

rem Fail clearly instead of entering an auto-restart loop when the API port is already occupied.
set "PORT_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":!PORT! .*LISTENING"') do set "PORT_PID=%%P"
if defined PORT_PID (
    color 0C
    echo [ERROR] Port !PORT! is already in use by PID !PORT_PID!.
    echo [ERROR] Stop that process or choose another PORT before starting the server.
    echo [INFO] Windows command: taskkill /PID !PORT_PID! /F
    pause
    exit /b 2
)

set "RESTART_COUNT=0"
set "MAX_RAPID_CRASHES=5"

:SERVER_LOOP
echo.
echo ============================================================================
echo   [RUNNING] Starting Node.js Server
echo   Target: dist-server/index.js
echo   Press Ctrl+C to terminate.
echo ============================================================================

node "dist-server/index.js"
set "EXIT_CODE=%ERRORLEVEL%"

echo.
echo [ALERT] Node.js server stopped at %TIME% with exit code: !EXIT_CODE!

if "!EXIT_CODE!"=="0" (
    color 0A
    echo [INFO] Server stopped gracefully.
    choice /C RCQ /N /M "Restart, recompile, or quit (R/C/Q): "
    if errorlevel 3 exit /b 0
    if errorlevel 2 goto COMPILE_STEP
    goto SERVER_LOOP
)

color 0E
set /a RESTART_COUNT+=1
echo [WARNING] Server crashed or closed unexpectedly. Crash #!RESTART_COUNT!

if !RESTART_COUNT! GEQ !MAX_RAPID_CRASHES! (
    color 0C
    echo [CRITICAL] Reached !MAX_RAPID_CRASHES! crashes. Halting auto-restart.
    choice /C CRQ /N /M "Recompile, force restart, or quit (C/R/Q): "
    if errorlevel 3 exit /b 1
    if errorlevel 2 (
        set "RESTART_COUNT=0"
        color 0A
        goto SERVER_LOOP
    )
    set "RESTART_COUNT=0"
    color 0A
    goto COMPILE_STEP
)

echo [AUTO-RESTART] Restarting Node.js server in 3 seconds...
timeout /t 3 /nobreak >nul
color 0A
goto SERVER_LOOP

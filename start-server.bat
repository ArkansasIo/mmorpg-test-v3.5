@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: BSAT: Windows Batch Program for TypeScript Node.js Auto-Start & Compilation
:: Description: Auto-compiles TypeScript into Node.js and starts server with
::              crash supervision, auto-recovery loop, and dependency check.
:: ============================================================================

title BSAT TypeScript to Node.js Server Supervisor
color 0A

echo ============================================================================
echo   [BSAT] TypeScript to Node.js Auto-Compiler and Server Supervisor
echo ============================================================================
echo.

:: Step 1: Check Node.js installation
echo [*] Checking Node.js runtime environment...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js from https://nodejs.org/ and restart your terminal.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Detected Node.js: %NODE_VERSION%

:: Step 2: Check for npm and project dependencies
if not exist "node_modules\.bin\tsc.cmd" (
    echo [*] 'node_modules' folder not found. Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo [ERROR] Failed to install npm dependencies.
        pause
        exit /b 1
    )
    if not exist "node_modules\.bin\tsc.cmd" (
        color 0C
        echo [ERROR] npm install completed without the TypeScript compiler.
        echo Delete node_modules and run npm install again.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
)

:: Step 3: Compile TypeScript into Node.js
:COMPILE_STEP
echo.
echo [*] Compiling TypeScript source (server/index.ts -^> dist-server/)...
if exist "tsconfig.server.json" (
    call "node_modules\.bin\tsc.cmd" -p tsconfig.server.json
) else (
    call "node_modules\.bin\tsc.cmd" server/index.ts --outDir dist-server --target ES2022 --module NodeNext --moduleResolution NodeNext --esModuleInterop
)

if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] TypeScript compilation failed!
    echo Check the error logs above and fix syntax/type issues.
    echo.
    echo Press [R] to retry compilation, or [Q] to quit.
    choice /C RQ /N /M "Choose an option (R/Q): "
    if errorlevel 2 exit /b 1
    if errorlevel 1 (
        color 0A
        goto COMPILE_STEP
    )
)

echo [OK] TypeScript compilation succeeded! Output in dist-server/

:: Step 4: Server Auto-Start and Crash Recovery Loop
set RESTART_COUNT=0
set MAX_RAPID_CRASHES=5

:SERVER_LOOP
echo.
echo ============================================================================
echo   [RUNNING] Starting Node.js Server (PID will be assigned)
echo   Target: dist-server/index.js
echo   Press Ctrl+C to terminate the supervisor
echo ============================================================================
echo.

set START_TIME=%TIME%
node dist-server/index.js

:: If the server process terminates, capture error level
set EXIT_CODE=%ERRORLEVEL%
echo.
echo [ALERT] Node.js server stopped at %TIME% with exit code: %EXIT_CODE%

if %EXIT_CODE% equ 0 (
    echo [INFO] Server stopped gracefully (exit code 0).
    echo.
    echo Press [R] to restart server, [C] to recompile and restart, [Q] to quit.
    choice /C RCQ /N /M "Select option (R/C/Q): "
    if errorlevel 3 exit /b 0
    if errorlevel 2 goto COMPILE_STEP
    if errorlevel 1 goto SERVER_LOOP
) else (
    color 0E
    set /a RESTART_COUNT+=1
    echo [WARNING] Server crashed or closed unexpectedly! (Crash #!RESTART_COUNT!)
    
    if !RESTART_COUNT! geq !MAX_RAPID_CRASHES! (
        color 0C
        echo [CRITICAL] Reached !MAX_RAPID_CRASHES! crashes. Halting auto-restart loop.
        echo Please inspect server logs, check port conflicts, or recompile code.
        echo.
        echo Press [C] to recompile and retry, [R] to force restart, [Q] to quit.
        choice /C CRQ /N /M "Select option (C/R/Q): "
        if errorlevel 3 exit /b 1
        if errorlevel 2 (
            set RESTART_COUNT=0
            color 0A
            goto SERVER_LOOP
        )
        if errorlevel 1 (
            set RESTART_COUNT=0
            color 0A
            goto COMPILE_STEP
        )
    )

    echo [AUTO-RESTART] Restarting Node.js server in 3 seconds...
    timeout /t 3 /nobreak >nul
    color 0A
    goto SERVER_LOOP
)

endlocal

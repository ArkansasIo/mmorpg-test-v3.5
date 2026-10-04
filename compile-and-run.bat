@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: BSAT: Compile TypeScript to Node.js & Execute Immediately
:: ============================================================================

title BSAT TypeScript Compiler & Runner
color 0F

echo [*] Compiling server/index.ts -> dist-server/index.js...
if not exist "node_modules\.bin\tsc.cmd" (
    color 0C
    echo [ERROR] TypeScript compiler is not installed. Run npm install successfully first.
    pause
    exit /b 1
)
call "node_modules\.bin\tsc.cmd" -p tsconfig.server.json

if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] TypeScript compilation encountered errors.
    pause
    exit /b 1
)

echo [OK] Compilation complete! Launching Node.js...
echo ----------------------------------------------------
node dist-server/index.js

pause
endlocal

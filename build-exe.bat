@echo off
setlocal enabledelayedexpansion

title BSAT Win64 Executable Builder
color 0A

echo ============================================================================
echo   [BSAT] Building Standalone Win64 .EXE Executables
echo ============================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is required to assemble the PE binary headers!
    pause
    exit /b 1
)

echo [*] Assembling PE32+ binaries via scripts/generate-pe-exe.cjs...
call node scripts/generate-pe-exe.cjs

if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Failed to assemble .exe binaries.
    pause
    exit /b 1
)

echo [*] Validating generated PE32+ binaries...
call node scripts/validate-exe.cjs

if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Executable validation found errors.
    pause
    exit /b 1
)

echo.
echo [OK] All .exe binaries generated successfully in the root directory (outside src/):
echo   - .\bsat-studio.exe
echo   - .\bsat-compiler.exe
echo   - .\bsat-supervisor.exe
echo   (also mirrored in dist-exe\ and public\)
echo.
pause
endlocal

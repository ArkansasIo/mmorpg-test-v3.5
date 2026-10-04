@echo off
title Universe Civilization & BSAT - Environment Variable Manager
color 0A

echo ====================================================================
echo  UNIVERSE CIVILIZATION: ENVIRONMENT VARIABLE CONFIGURATION SYSTEM
echo ====================================================================
echo.

node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Node.js is required to run the environment configurator.
  pause
  exit /b 1
)

echo Loading interactive configuration console...
node scripts/env-config.cjs interactive
pause

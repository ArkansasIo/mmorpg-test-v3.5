@echo off
title Universe Civilization: Empire at War - Full-Stack Launcher
color 09

echo ====================================================================
echo  LAUNCHING UNIVERSE CIVILIZATION FULL-STACK SYSTEM
echo ====================================================================
echo.
echo [1/2] Starting Game Backend Server (Express + Database API)...
start "Universe Backend API" cmd.exe /k "start-server.bat"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Game Frontend Client (Vite Web App on Port 3000)...
start "Universe Frontend Web Client" cmd.exe /k "npm run dev"

echo.
echo ====================================================================
echo  FULL-STACK INSTANCES LAUNCHED!
echo  Backend Server:  http://localhost:5001/api/status/health
echo  Web Frontend:    http://localhost:3000/
echo ====================================================================

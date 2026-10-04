#!/usr/bin/env bash
set -e

echo "===================================================================="
echo " UNIVERSE CIVILIZATION: EMPIRE AT WAR - INSTALLER & SETUP SYSTEM"
echo "===================================================================="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is not installed or not in PATH."
  echo "Please install Node.js 20+ from https://nodejs.org/ and retry."
  exit 1
fi

echo "[1/3] Running automated setup orchestrator..."
node scripts/setup.cjs

echo ""
echo "===================================================================="
echo " SETUP COMPLETE - SELECT ACTION"
echo "===================================================================="
echo " 1) Start Full-Stack System (Server + Web Client) [Default]"
echo " 2) Launch Environment Variable Configuration Manager"
echo " 3) Start Frontend Web App Only (Port 3000)"
echo " 4) Start Game Backend API Only (Port 5001)"
echo " 5) Run TypeScript Compiler & Typecheck"
echo " 6) Exit"
echo "===================================================================="
echo ""

read -r -p "Choose an option [1-6] (default: 1): " choice
choice=${choice:-1}

case "$choice" in
  1)
    bash start-fullstack.sh
    ;;
  2)
    bash env-config.sh
    ;;
  3)
    npm run dev
    ;;
  4)
    bash start-server.sh
    ;;
  5)
    npm run lint
    ;;
  *)
    echo "Exiting."
    ;;
esac

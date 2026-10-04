#!/usr/bin/env bash
echo "===================================================================="
echo " UNIVERSE CIVILIZATION: ENVIRONMENT VARIABLE CONFIGURATION SYSTEM"
echo "===================================================================="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is required to run the environment configurator."
  exit 1
fi

node scripts/env-config.cjs interactive

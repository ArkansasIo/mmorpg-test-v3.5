#!/usr/bin/env bash
set -e

echo "===================================================="
echo "⚡ BSAT Toolchain: Building Windows .EXE Binaries"
echo "===================================================="

node scripts/generate-pe-exe.cjs
node scripts/validate-exe.cjs

echo "[OK] Generated ./bsat-studio.exe (Root - Outside src/)"
echo "[OK] Generated ./bsat-compiler.exe (Root - Outside src/)"
echo "[OK] Generated ./bsat-supervisor.exe (Root - Outside src/)"

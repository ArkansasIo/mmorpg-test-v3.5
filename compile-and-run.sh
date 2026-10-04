#!/usr/bin/env bash
set -e

echo "[*] Compiling TypeScript: server/index.ts -> dist-server/index.js"
npx tsc -p tsconfig.server.json
echo "[OK] Compilation complete. Launching Node.js..."
node dist-server/index.js

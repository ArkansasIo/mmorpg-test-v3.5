#!/usr/bin/env bash

# ==============================================================================
# BSAT: Linux / macOS Bash Program for TypeScript Node.js Auto-Start & Compile
# Description: Auto-compiles TypeScript into Node.js and starts server with
#              supervisor daemon loop and graceful signal handling.
# ==============================================================================

set -e

# Terminal Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}============================================================================${NC}"
echo -e "${CYAN}${BOLD}   [BSAT] TypeScript to Node.js Auto-Compiler & Supervisor (Bash)           ${NC}"
echo -e "${CYAN}${BOLD}============================================================================${NC}"
echo ""

# Handle Graceful Exit
SERVER_PID=""
cleanup() {
    echo -e "\n${YELLOW}[!] Caught termination signal. Shutting down supervisor...${NC}"
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        echo -e "${YELLOW}[*] Stopping Node.js server (PID: $SERVER_PID)...${NC}"
        kill -SIGTERM "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}[OK] Supervisor cleanly stopped.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# Step 1: Check Node.js runtime
echo -e "${CYAN}[*] Verifying Node.js and npm...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed or not in PATH!${NC}"
    exit 1
fi

NODE_VER=$(node -v)
echo -e "${GREEN}[OK] Detected Node.js: ${NODE_VER}${NC}"

# Step 2: Check dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[*] Installing dependencies...${NC}"
    npm install
fi

# Step 3: TypeScript Compile Function
compile_typescript() {
    echo -e "\n${CYAN}[*] Compiling TypeScript source (server/index.ts -> dist-server/)...${NC}"
    if [ -f "tsconfig.server.json" ]; then
        npx tsc -p tsconfig.server.json
    else
        npx tsc server/index.ts --outDir dist-server --target ES2022 --module NodeNext --moduleResolution NodeNext --esModuleInterop
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[OK] TypeScript compiled successfully!${NC}"
        return 0
    else
        echo -e "${RED}[ERROR] TypeScript compilation failed!${NC}"
        return 1
    fi
}

# Run initial compile
if ! compile_typescript; then
    echo -e "${RED}[FATAL] Aborting server launch due to compilation errors.${NC}"
    exit 1
fi

# Step 4: Supervisor Auto-Restart Loop
RESTART_COUNT=0
MAX_RAPID_CRASHES=5

echo -e "\n${CYAN}${BOLD}============================================================================${NC}"
echo -e "${CYAN}${BOLD}   Starting Supervisor Daemon Loop (Target: dist-server/index.js)          ${NC}"
echo -e "${CYAN}${BOLD}   Press Ctrl+C to terminate both supervisor and server                     ${NC}"
echo -e "${CYAN}${BOLD}============================================================================${NC}\n"

while true; do
    echo -e "${GREEN}[RUNNING] Spawning Node.js server at $(date '+%Y-%m-%d %H:%M:%S')...${NC}"
    
    # Run node server in background and wait for it to capture PID
    node dist-server/index.js &
    SERVER_PID=$!
    
    wait $SERVER_PID || EXIT_CODE=$?
    EXIT_CODE=${EXIT_CODE:-0}
    
    echo -e "\n${YELLOW}[ALERT] Node.js server exited at $(date '+%Y-%m-%d %H:%M:%S') with code: ${EXIT_CODE}${NC}"
    
    if [ "$EXIT_CODE" -eq 0 ]; then
        echo -e "${GREEN}[INFO] Server terminated normally.${NC}"
        break
    else
        RESTART_COUNT=$((RESTART_COUNT + 1))
        echo -e "${RED}[WARNING] Server crashed unexpectedly! (Crash #${RESTART_COUNT})${NC}"
        
        if [ "$RESTART_COUNT" -ge "$MAX_RAPID_CRASHES" ]; then
            echo -e "${RED}[CRITICAL] Exceeded maximum restart limit (${MAX_RAPID_CRASHES}). Pausing supervisor.${NC}"
            read -p "Press [Enter] to recompile and retry, or Ctrl+C to quit..."
            RESTART_COUNT=0
            compile_typescript || true
            continue
        fi
        
        echo -e "${YELLOW}[AUTO-RESTART] Restarting Node.js in 3 seconds...${NC}"
        sleep 3
    fi
done

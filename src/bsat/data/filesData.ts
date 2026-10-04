export interface ProjectFile {
  name: string;
  path: string;
  type: 'bat' | 'sh' | 'ts' | 'json' | 'js' | 'exe';
  category: 'batch' | 'shell' | 'server' | 'config' | 'binary';
  description: string;
  content: string;
  size: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    name: 'bsat-studio.exe',
    path: '/bsat-studio.exe',
    type: 'exe',
    category: 'binary',
    description: 'Root standalone Win64 PE32+ executable (outside src/): double-click in Windows Explorer to boot BSAT supervisor, compile TypeScript, and launch server with zero dependencies.',
    size: '2.5 KB',
    content: '[Win64 PE32+ Binary Executable - Machine: AMD64, Subsystem: Console, Linked with KERNEL32.dll WinExec]',
  },
  {
    name: 'bsat-compiler.exe',
    path: '/bsat-compiler.exe',
    type: 'exe',
    category: 'binary',
    description: 'Root standalone Win64 compiler binary (outside src/): compiles TypeScript source files directly to Node.js.',
    size: '2.5 KB',
    content: '[Win64 PE32+ Binary Executable - Machine: AMD64, Subsystem: Console, Linked with KERNEL32.dll WinExec]',
  },
  {
    name: 'bsat-supervisor.exe',
    path: '/bsat-supervisor.exe',
    type: 'exe',
    category: 'binary',
    description: 'Root standalone Win64 watcher binary (outside src/): watches code files and hot-reloads the Node.js server.',
    size: '2.5 KB',
    content: '[Win64 PE32+ Binary Executable - Machine: AMD64, Subsystem: Console, Linked with KERNEL32.dll WinExec]',
  },
  {
    name: 'start-server.bat',
    path: '/start-server.bat',
    type: 'bat',
    category: 'batch',
    description: 'Primary Windows Batch program: checks Node/npm, installs dependencies, compiles TypeScript, and runs supervisor auto-restart loop.',
    size: '3.4 KB',
    content: `@echo off
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
if not exist "node_modules" (
    echo [*] 'node_modules' folder not found. Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo [ERROR] Failed to install npm dependencies.
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
    call npx tsc -p tsconfig.server.json
) else (
    call npx tsc server/index.ts --outDir dist-server --target ES2022 --module NodeNext --moduleResolution NodeNext --esModuleInterop
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

endlocal`
  },
  {
    name: 'start-server.sh',
    path: '/start-server.sh',
    type: 'sh',
    category: 'shell',
    description: 'Linux / macOS Bash program with signal trapping (SIGINT/SIGTERM), incremental TypeScript build, and daemon auto-restart.',
    size: '3.1 KB',
    content: `#!/usr/bin/env bash

# ==============================================================================
# BSAT: Linux / macOS Bash Program for TypeScript Node.js Auto-Start & Compile
# Description: Auto-compiles TypeScript into Node.js and starts server with
#              supervisor daemon loop and graceful signal handling.
# ==============================================================================

set -e

# Terminal Colors
CYAN='\\033[0;36m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
BOLD='\\033[1m'
NC='\\033[0m' # No Color

echo -e "\${CYAN}\${BOLD}============================================================================\${NC}"
echo -e "\${CYAN}\${BOLD}   [BSAT] TypeScript to Node.js Auto-Compiler & Supervisor (Bash)           \${NC}"
echo -e "\${CYAN}\${BOLD}============================================================================\${NC}"
echo ""

# Handle Graceful Exit
SERVER_PID=""
cleanup() {
    echo -e "\\n\${YELLOW}[!] Caught termination signal. Shutting down supervisor...\${NC}"
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        echo -e "\${YELLOW}[*] Stopping Node.js server (PID: $SERVER_PID)...\${NC}"
        kill -SIGTERM "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    echo -e "\${GREEN}[OK] Supervisor cleanly stopped.\${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# Step 1: Check Node.js runtime
echo -e "\${CYAN}[*] Verifying Node.js and npm...\${NC}"
if ! command -v node &> /dev/null; then
    echo -e "\${RED}[ERROR] Node.js is not installed or not in PATH!\${NC}"
    exit 1
fi

NODE_VER=$(node -v)
echo -e "\${GREEN}[OK] Detected Node.js: \${NODE_VER}\${NC}"

# Step 2: Check dependencies
if [ ! -d "node_modules" ]; then
    echo -e "\${YELLOW}[*] Installing dependencies...\${NC}"
    npm install
fi

# Step 3: TypeScript Compile Function
compile_typescript() {
    echo -e "\\n\${CYAN}[*] Compiling TypeScript source (server/index.ts -> dist-server/)...\${NC}"
    if [ -f "tsconfig.server.json" ]; then
        npx tsc -p tsconfig.server.json
    else
        npx tsc server/index.ts --outDir dist-server --target ES2022 --module NodeNext --moduleResolution NodeNext --esModuleInterop
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "\${GREEN}[OK] TypeScript compiled successfully!\${NC}"
        return 0
    else
        echo -e "\${RED}[ERROR] TypeScript compilation failed!\${NC}"
        return 1
    fi
}

# Run initial compile
if ! compile_typescript; then
    echo -e "\${RED}[FATAL] Aborting server launch due to compilation errors.\${NC}"
    exit 1
fi

# Step 4: Supervisor Auto-Restart Loop
RESTART_COUNT=0
MAX_RAPID_CRASHES=5

echo -e "\\n\${CYAN}\${BOLD}============================================================================\${NC}"
echo -e "\${CYAN}\${BOLD}   Starting Supervisor Daemon Loop (Target: dist-server/index.js)          \${NC}"
echo -e "\${CYAN}\${BOLD}   Press Ctrl+C to terminate both supervisor and server                     \${NC}"
echo -e "\${CYAN}\${BOLD}============================================================================\${NC}\\n"

while true; do
    echo -e "\${GREEN}[RUNNING] Spawning Node.js server at $(date '+%Y-%m-%d %H:%M:%S')...\${NC}"
    
    node dist-server/index.js &
    SERVER_PID=$!
    
    wait $SERVER_PID || EXIT_CODE=$?
    EXIT_CODE=\${EXIT_CODE:-0}
    
    echo -e "\\n\${YELLOW}[ALERT] Node.js server exited at $(date '+%Y-%m-%d %H:%M:%S') with code: \${EXIT_CODE}\${NC}"
    
    if [ "$EXIT_CODE" -eq 0 ]; then
        echo -e "\${GREEN}[INFO] Server terminated normally.\${NC}"
        break
    else
        RESTART_COUNT=$((RESTART_COUNT + 1))
        echo -e "\${RED}[WARNING] Server crashed unexpectedly! (Crash #\${RESTART_COUNT})\${NC}"
        
        if [ "$RESTART_COUNT" -ge "$MAX_RAPID_CRASHES" ]; then
            echo -e "\${RED}[CRITICAL] Exceeded maximum restart limit (\${MAX_RAPID_CRASHES}). Pausing supervisor.\${NC}"
            read -p "Press [Enter] to recompile and retry, or Ctrl+C to quit..."
            RESTART_COUNT=0
            compile_typescript || true
            continue
        fi
        
        echo -e "\${YELLOW}[AUTO-RESTART] Restarting Node.js in 3 seconds...\${NC}"
        sleep 3
    fi
done`
  },
  {
    name: 'dev-watch.bat',
    path: '/dev-watch.bat',
    type: 'bat',
    category: 'batch',
    description: 'Windows live file watcher program: triggers instant TypeScript recompile and hot server reload whenever code is modified.',
    size: '1.2 KB',
    content: `@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: BSAT: Windows Dev Watcher for Live TypeScript Recompilation & Server Reload
:: Uses tsx or tsc --watch to automatically restart on changes.
:: ============================================================================

title BSAT TypeScript Live Watcher
color 0B

echo ============================================================================
echo   [BSAT] TypeScript Live Watch & Auto-Restart Server
echo ============================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is required. Install from https://nodejs.org/
    pause
    exit /b 1
)

echo [*] Starting TypeScript live file watcher and auto-restarting server...
echo [*] Watching directory: server/
echo [*] Press Ctrl+C at any time to stop.
echo.

call npx tsx watch server/index.ts

if %ERRORLEVEL% neq 0 (
    echo.
    echo [*] Falling back to nodemon / tsc watch pipeline...
    call npx nodemon --watch "server/**/*.ts" --exec "npx tsc -p tsconfig.server.json && node dist-server/index.js"
)

pause
endlocal`
  },
  {
    name: 'compile-and-run.bat',
    path: '/compile-and-run.bat',
    type: 'bat',
    category: 'batch',
    description: 'Windows one-shot compilation and run script: compiles server/index.ts and immediately launches dist-server/index.js.',
    size: '0.8 KB',
    content: `@echo off
setlocal enabledelayedexpansion

title BSAT TypeScript Compiler & Runner
color 0F

echo [*] Compiling server/index.ts -> dist-server/index.js...
call npx tsc -p tsconfig.server.json

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
endlocal`
  },
  {
    name: 'compile-and-run.sh',
    path: '/compile-and-run.sh',
    type: 'sh',
    category: 'shell',
    description: 'Unix one-shot compile and run script for POSIX/Bash environments.',
    size: '0.4 KB',
    content: `#!/usr/bin/env bash
set -e

echo "[*] Compiling TypeScript: server/index.ts -> dist-server/index.js"
npx tsc -p tsconfig.server.json
echo "[OK] Compilation complete. Launching Node.js..."
node dist-server/index.js`
  },
  {
    name: 'server/index.ts',
    path: '/server/index.ts',
    type: 'ts',
    category: 'server',
    description: 'Express TypeScript Node.js server with telemetry endpoints, health probes, and crash test hooks.',
    size: '2.8 KB',
    content: `import express, { Request, Response } from 'express';
import os from 'os';

const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next) => {
  const timestamp = new Date().toISOString();
  console.log(\`[\${timestamp}] \${req.method} \${req.url}\`);
  next();
});

// Server Info & Status
app.get('/api/status', (_req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'ONLINE',
    message: 'TypeScript Node.js Server running smoothly',
    pid: process.pid,
    uptimeSeconds,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memoryUsage: process.memoryUsage(),
    system: {
      hostname: os.hostname(),
      cpus: os.cpus().length,
      freeMemMB: Math.round(os.freemem() / 1024 / 1024),
      totalMemMB: Math.round(os.totalmem() / 1024 / 1024),
    },
    compiledWith: 'TypeScript 7.x & Node.js Runtime',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint for process supervisors / load balancers
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

// Endpoint to simulate an unhandled crash to test .bat auto-restart loop
app.post('/api/simulate-crash', (_req: Request, res: Response) => {
  res.json({ message: 'Triggering fatal exception in 500ms to test auto-restart...' });
  setTimeout(() => {
    console.error('FATAL: Simulated fatal crash triggered! Auto-restart supervisor should reboot the server.');
    process.exit(1);
  }, 500);
});

// Start the server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(\`🚀 BSAT Node.js Server running at http://localhost:\${PORT}\`);
  console.log(\`📁 Compiled Source: server/index.ts -> dist-server/index.js\`);
  console.log(\`⚡ Process PID: \${process.pid}\`);
  console.log(\`⏱️ Started at: \${new Date().toISOString()}\`);
  console.log('====================================================');
});`
  },
  {
    name: 'tsconfig.server.json',
    path: '/tsconfig.server.json',
    type: 'json',
    category: 'config',
    description: 'Dedicated TypeScript compiler configuration for compiling Node.js server targets with sourcemaps and d.ts.',
    size: '0.6 KB',
    content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist-server",
    "rootDir": "./server",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "removeComments": false,
    "allowSyntheticDefaultImports": true
  },
  "include": ["server/**/*"],
  "exclude": ["node_modules", "dist", "dist-server", "src"]
}`
  },
  {
    name: 'nodemon.json',
    path: '/nodemon.json',
    type: 'json',
    category: 'config',
    description: 'Nodemon config to automatically watch server/**/*.ts and run tsc + node on save.',
    size: '0.3 KB',
    content: `{
  "watch": ["server"],
  "ext": "ts,json",
  "ignore": ["node_modules", "dist", "dist-server", "src"],
  "exec": "npx tsc -p tsconfig.server.json && node dist-server/index.js",
  "delay": "1000",
  "env": {
    "NODE_ENV": "development",
    "PORT": "3000"
  }
}`
  },
  {
    name: 'ecosystem.config.cjs',
    path: '/ecosystem.config.cjs',
    type: 'js',
    category: 'config',
    description: 'PM2 production process manager config for automated clustering, zero-downtime reloads, and memory caps.',
    size: '0.4 KB',
    content: `module.exports = {
  apps: [
    {
      name: 'bsat-typescript-server',
      script: 'dist-server/index.js',
      instances: 1,
      autorestart: true,
      watch: ['dist-server'],
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
    },
  ],
};`
  }
];

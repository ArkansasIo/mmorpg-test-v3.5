import React, { useState } from 'react';
import { Check, Copy, Download, FileTerminal, Sliders, Sparkles } from 'lucide-react';

export const ScriptGenerator: React.FC = () => {
  const [format, setFormat] = useState<'bat' | 'sh' | 'ps1' | 'nodemon' | 'pm2'>('bat');
  const [port, setPort] = useState<number>(3000);
  const [sourcePath, setSourcePath] = useState<string>('server/index.ts');
  const [distPath, setDistPath] = useState<string>('dist-server/index.js');
  const [compilerTool, setCompilerTool] = useState<'tsc' | 'tsx' | 'esbuild'>('tsc');
  const [restartDelay, setRestartDelay] = useState<number>(3);
  const [maxCrashes, setMaxCrashes] = useState<number>(5);
  const [checkNode, setCheckNode] = useState<boolean>(true);
  const [colorOutput, setColorOutput] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const generateScript = (): string => {
    if (format === 'bat') {
      return `@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: BSAT: Windows Batch Auto-Start & TypeScript Compiler Supervisor
:: Target: ${sourcePath} -> ${distPath}
:: Port: ${port} | Restart Delay: ${restartDelay}s | Max Crashes: ${maxCrashes}
:: ============================================================================

title BSAT TypeScript Server Supervisor
${colorOutput ? 'color 0A' : ''}

echo ============================================================================
echo   [BSAT] TypeScript to Node.js Auto-Compiler and Server Supervisor
echo   Port: ${port} ^| Toolchain: ${compilerTool}
echo ============================================================================
echo.

set PORT=${port}

${
  checkNode
    ? `:: Check Node.js runtime environment
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    ${colorOutput ? 'color 0C' : ''}
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/ and restart your terminal.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Detected Node.js: %NODE_VERSION%

if not exist "node_modules" (
    echo [*] Installing npm dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)
`
    : ''
}
:COMPILE_STEP
echo.
echo [*] Compiling TypeScript (${sourcePath} -^> ${distPath})...
${
  compilerTool === 'tsc'
    ? `call npx tsc -p tsconfig.server.json`
    : compilerTool === 'tsx'
    ? `echo [*] tsx will execute TypeScript directly with JIT compilation.`
    : `call npx esbuild ${sourcePath} --bundle --platform=node --target=node20 --outfile=${distPath}`
}

if %ERRORLEVEL% neq 0 (
    ${colorOutput ? 'color 0C' : ''}
    echo [ERROR] TypeScript compilation encountered errors!
    echo Press [R] to retry compilation, or [Q] to quit.
    choice /C RQ /N /M "Choose an option (R/Q): "
    if errorlevel 2 exit /b 1
    if errorlevel 1 goto COMPILE_STEP
)

echo [OK] Compilation succeeded!

set RESTART_COUNT=0

:SERVER_LOOP
echo.
echo ============================================================================
echo   [RUNNING] Launching Node.js Server on port %PORT%...
echo   Press Ctrl+C to terminate supervisor
echo ============================================================================
echo.

${
  compilerTool === 'tsx'
    ? `call npx tsx ${sourcePath}`
    : `node ${distPath}`
}

set EXIT_CODE=%ERRORLEVEL%
echo.
echo [ALERT] Server stopped at %TIME% with code: %EXIT_CODE%

if %EXIT_CODE% equ 0 (
    echo [INFO] Server stopped gracefully.
    echo Press [R] to restart server, [C] to recompile, [Q] to quit.
    choice /C RCQ /N /M "Select (R/C/Q): "
    if errorlevel 3 exit /b 0
    if errorlevel 2 goto COMPILE_STEP
    if errorlevel 1 goto SERVER_LOOP
) else (
    ${colorOutput ? 'color 0E' : ''}
    set /a RESTART_COUNT+=1
    echo [WARNING] Server crashed unexpectedly! (Crash #!RESTART_COUNT!/${maxCrashes})
    
    if !RESTART_COUNT! geq ${maxCrashes} (
        ${colorOutput ? 'color 0C' : ''}
        echo [CRITICAL] Reached ${maxCrashes} crashes! Halting automatic reboot.
        choice /C CRQ /N /M "Select [C]ompile, [R]estart, [Q]uit: "
        if errorlevel 3 exit /b 1
        if errorlevel 2 (
            set RESTART_COUNT=0
            goto SERVER_LOOP
        )
        if errorlevel 1 (
            set RESTART_COUNT=0
            goto COMPILE_STEP
        )
    )

    echo [AUTO-RESTART] Restarting Node.js in ${restartDelay} seconds...
    timeout /t ${restartDelay} /nobreak >nul
    ${colorOutput ? 'color 0A' : ''}
    goto SERVER_LOOP
)

endlocal`;
    }

    if (format === 'sh') {
      return `#!/usr/bin/env bash
# ==============================================================================
# BSAT: Linux / macOS Bash Auto-Start & TypeScript Compiler Supervisor
# Target: ${sourcePath} -> ${distPath}
# Port: ${port} | Restart Delay: ${restartDelay}s | Max Crashes: ${maxCrashes}
# ==============================================================================

set -e

export PORT=${port}
${
  colorOutput
    ? `CYAN='\\033[0;36m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
NC='\\033[0m'`
    : `CYAN=''
GREEN=''
YELLOW=''
RED=''
NC=''`
}

echo -e "\${CYAN}============================================================================\${NC}"
echo -e "\${CYAN}   [BSAT] TypeScript to Node.js Supervisor (Bash)                           \${NC}"
echo -e "\${CYAN}   Port: ${port} | Toolchain: ${compilerTool}                                \${NC}"
echo -e "\${CYAN}============================================================================\${NC}"

SERVER_PID=""
cleanup() {
    echo -e "\\n\${YELLOW}[!] Caught SIGINT/SIGTERM. Terminating server supervisor...\${NC}"
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill -SIGTERM "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    echo -e "\${GREEN}[OK] Clean exit.\${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

${
  checkNode
    ? `if ! command -v node &> /dev/null; then
    echo -e "\${RED}[ERROR] Node.js is not installed!\${NC}"
    exit 1
fi
echo -e "\${GREEN}[OK] Node.js: $(node -v)\${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "\${YELLOW}[*] Installing dependencies...\${NC}"
    npm install
fi`
    : ''
}

compile_ts() {
    echo -e "\\n\${CYAN}[*] Compiling TypeScript source (${sourcePath} -> ${distPath})...\${NC}"
    ${
      compilerTool === 'tsc'
        ? `npx tsc -p tsconfig.server.json`
        : compilerTool === 'tsx'
        ? `return 0`
        : `npx esbuild ${sourcePath} --bundle --platform=node --target=node20 --outfile=${distPath}`
    }
}

compile_ts || { echo -e "\${RED}[ERROR] Initial compilation failed.\${NC}"; exit 1; }

RESTART_COUNT=0

while true; do
    echo -e "\${GREEN}[RUNNING] Spawning Node.js on port \${PORT} at $(date '+%H:%M:%S')...\${NC}"
    ${
      compilerTool === 'tsx'
        ? `npx tsx ${sourcePath} &`
        : `node ${distPath} &`
    }
    SERVER_PID=$!
    wait $SERVER_PID || EXIT_CODE=$?
    EXIT_CODE=\${EXIT_CODE:-0}

    if [ "$EXIT_CODE" -eq 0 ]; then
        echo -e "\${GREEN}[INFO] Server stopped gracefully.\${NC}"
        break
    else
        RESTART_COUNT=$((RESTART_COUNT + 1))
        echo -e "\${RED}[WARNING] Server crashed with exit code \${EXIT_CODE} (#\${RESTART_COUNT}/${maxCrashes})\${NC}"
        if [ "$RESTART_COUNT" -ge "${maxCrashes}" ]; then
            echo -e "\${RED}[FATAL] Max crash limit reached. Halting.\${NC}"
            read -p "Press [Enter] to recompile and retry..."
            RESTART_COUNT=0
            compile_ts || true
            continue
        fi
        echo -e "\${YELLOW}[AUTO-RESTART] Rebooting server in ${restartDelay}s...\${NC}"
        sleep ${restartDelay}
    fi
done`;
    }

    if (format === 'ps1') {
      return `# ==============================================================================
# BSAT: Windows PowerShell Auto-Start & TypeScript Compiler Supervisor
# Target: ${sourcePath} -> ${distPath}
# ==============================================================================

$env:PORT = "${port}"
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   [BSAT] PowerShell TypeScript Server Supervisor" -ForegroundColor Cyan
Write-Host "   Port: $env:PORT | Compiler: ${compilerTool}" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

function Compile-TypeScript {
    Write-Host "[*] Compiling TypeScript..." -ForegroundColor Cyan
    ${
      compilerTool === 'tsc'
        ? 'npx tsc -p tsconfig.server.json'
        : `npx esbuild ${sourcePath} --bundle --platform=node --outfile=${distPath}`
    }
    return $LASTEXITCODE -eq 0
}

if (-not (Compile-TypeScript)) {
    Write-Host "[ERROR] TypeScript build failed!" -ForegroundColor Red
    exit 1
}

$restartCount = 0
while ($true) {
    Write-Host "[RUNNING] Starting Node.js server..." -ForegroundColor Green
    ${compilerTool === 'tsx' ? `npx tsx ${sourcePath}` : `node ${distPath}`}
    $exitCode = $LASTEXITCODE

    if ($exitCode -eq 0) {
        Write-Host "[INFO] Server stopped cleanly." -ForegroundColor Green
        break
    } else {
        $restartCount++
        Write-Host "[ALERT] Server crashed with exit code $exitCode (#$restartCount/${maxCrashes})" -ForegroundColor Red
        if ($restartCount -ge ${maxCrashes}) {
            Write-Host "[CRITICAL] Crash threshold exceeded." -ForegroundColor Red
            Pause
            $restartCount = 0
        }
        Write-Host "[AUTO-RESTART] Rebooting in ${restartDelay}s..." -ForegroundColor Yellow
        Start-Sleep -Seconds ${restartDelay}
    }
}`;
    }

    if (format === 'nodemon') {
      return JSON.stringify(
        {
          watch: ['server'],
          ext: 'ts,json',
          ignore: ['node_modules', 'dist', 'dist-server', 'src'],
          exec:
            compilerTool === 'tsx'
              ? `npx tsx ${sourcePath}`
              : `npx tsc -p tsconfig.server.json && node ${distPath}`,
          delay: `${restartDelay * 1000}`,
          env: {
            NODE_ENV: 'development',
            PORT: `${port}`,
          },
        },
        null,
        2
      );
    }

    // pm2
    return `module.exports = {
  apps: [
    {
      name: 'bsat-typescript-server',
      script: '${distPath}',
      instances: 1,
      autorestart: true,
      max_restarts: ${maxCrashes},
      restart_delay: ${restartDelay * 1000},
      watch: ['dist-server'],
      env: {
        NODE_ENV: 'production',
        PORT: ${port},
      },
    },
  ],
};`;
  };

  const scriptContent = generateScript();

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensionMap = {
      bat: 'start-server.bat',
      sh: 'start-server.sh',
      ps1: 'start-server.ps1',
      nodemon: 'nodemon.json',
      pm2: 'ecosystem.config.cjs',
    };
    const filename = extensionMap[format];
    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <FileTerminal className="w-3.5 h-3.5" />
              <span>INTERACTIVE SCRIPT GENERATOR</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Generate Auto-Start & Compile Scripts</h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize parameters to tailor Windows Batch (<code className="text-emerald-400 font-mono">.bat</code>), Unix Shell (<code className="text-emerald-400 font-mono">.sh</code>), PowerShell, Nodemon, or PM2 scripts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Format Selector Pills (Segmented Control) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-950/80 border border-slate-800 rounded-lg mt-6">
          <button
            onClick={() => setFormat('bat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              format === 'bat'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Windows Batch (.bat)
          </button>
          <button
            onClick={() => setFormat('sh')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              format === 'sh'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Linux / macOS Bash (.sh)
          </button>
          <button
            onClick={() => setFormat('ps1')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              format === 'ps1'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PowerShell (.ps1)
          </button>
          <button
            onClick={() => setFormat('nodemon')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              format === 'nodemon'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            nodemon.json
          </button>
          <button
            onClick={() => setFormat('pm2')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              format === 'pm2'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ecosystem.config.cjs
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters + Live Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Sliders and Inputs */}
        <div className="lg:col-span-4 border border-slate-800 bg-slate-900/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Script Settings</span>
          </div>

          {/* Port */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 block font-medium">Server HTTP Port</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value) || 3000)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Compiler Toolchain */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 block font-medium">Compiler Toolchain</label>
            <select
              value={compilerTool}
              onChange={(e) => setCompilerTool(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="tsc">tsc (Standard TypeScript Compiler)</option>
              <option value="tsx">tsx (Instant JIT TypeScript runner)</option>
              <option value="esbuild">esbuild (Ultra-fast bundler)</option>
            </select>
          </div>

          {/* Source Path */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 block font-medium">TypeScript Source Entry</label>
            <input
              type="text"
              value={sourcePath}
              onChange={(e) => setSourcePath(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Output Path */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 block font-medium">Compiled Node.js Output</label>
            <input
              type="text"
              value={distPath}
              onChange={(e) => setDistPath(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Restart Delay */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Restart Delay</span>
              <span className="font-mono text-emerald-400">{restartDelay}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={restartDelay}
              onChange={(e) => setRestartDelay(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Max Rapid Crashes */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Max Crash Limit</span>
              <span className="font-mono text-emerald-400">{maxCrashes} attempts</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              value={maxCrashes}
              onChange={(e) => setMaxCrashes(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={checkNode}
                onChange={(e) => setCheckNode(e.target.checked)}
                className="rounded border-slate-800 accent-emerald-500"
              />
              <span>Verify Node.js & node_modules</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={colorOutput}
                onChange={(e) => setColorOutput(e.target.checked)}
                className="rounded border-slate-800 accent-emerald-500"
              />
              <span>ANSI Color Output & Banners</span>
            </label>
          </div>
        </div>

        {/* Right: Live Script Preview */}
        <div className="lg:col-span-8 border border-slate-800 bg-[#090d16] rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2">
                {format === 'bat'
                  ? 'start-server.bat'
                  : format === 'sh'
                  ? 'start-server.sh'
                  : format === 'ps1'
                  ? 'start-server.ps1'
                  : format === 'nodemon'
                  ? 'nodemon.json'
                  : 'ecosystem.config.cjs'}
              </span>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              {scriptContent.split('\n').length} lines · {new Blob([scriptContent]).size} bytes
            </span>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto overflow-y-auto max-h-[500px] leading-relaxed selection:bg-emerald-500/30">
            <code>{scriptContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

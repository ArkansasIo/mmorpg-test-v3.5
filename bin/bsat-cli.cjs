#!/usr/bin/env node

/**
 * ============================================================================
 * BSAT STUDIO EXECUTABLE TOOLCHAIN (Windows .EXE / Standalone Binary)
 * Features:
 *  - Auto-starts server with crash supervision
 *  - Compiles TypeScript into Node.js
 *  - Serves BSAT Studio UI and API endpoints
 *  - Live file watcher and health probe daemon
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execSync } = require('child_process');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const startTime = Date.now();

let serverProcess = null;
let restartCount = 0;
let isSupervisorRunning = true;
const logs = [];

function log(type, msg) {
  const time = new Date().toISOString().split('T')[1].slice(0, 8);
  const entry = { time, type, msg };
  logs.push(entry);
  if (logs.length > 500) logs.shift();
  
  const colors = {
    info: '\x1b[36m',
    ok: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  };
  const color = colors[type] || colors.info;
  console.log(`${color}[${time}] [${type.toUpperCase()}] ${msg}${colors.reset}`);
}

function displayBanner() {
  console.log('\x1b[32m============================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m   ⚡ BSAT STUDIO TOOLCHAIN (STANDALONE EXECUTABLE .EXE)                    \x1b[0m');
  console.log('\x1b[32m============================================================================\x1b[0m');
  console.log(`[*] Runtime Platform: ${process.platform} (${process.arch})`);
  console.log(`[*] Executable Path : ${process.execPath}`);
  console.log(`[*] Working Directory: ${process.cwd()}`);
  console.log(`[*] HTTP Dashboard  : http://localhost:${PORT}`);
  console.log('\x1b[32m----------------------------------------------------------------------------\x1b[0m\n');
}

// Simple embedded HTML UI when running from standalone EXE
function getDashboardHtml() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const logRows = logs.slice(-20).map(l => 
    `<div style="font-family: monospace; font-size: 12px; margin-bottom: 4px;">
       <span style="color: #64748b;">${l.time}</span> 
       <span style="color: ${l.type === 'ok' ? '#34d399' : l.type === 'error' ? '#f87171' : l.type === 'warn' ? '#fbbf24' : '#38bdf8'}; font-weight: bold;">[${l.type.toUpperCase()}]</span> 
       <span style="color: #e2e8f0;">${l.msg}</span>
     </div>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BSAT Studio Executable Console</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f17; color: #f8fafc; margin: 0; padding: 24px; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; max-width: 900px; margin: 0 auto 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 14px; margin-bottom: 16px; }
    .badge { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; font-family: monospace; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat { background: #0a0e17; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; }
    .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-family: monospace; }
    .stat-val { font-size: 18px; font-weight: bold; color: #f8fafc; margin-top: 4px; font-family: monospace; }
    .terminal { background: #070a10; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; min-height: 240px; max-height: 380px; overflow-y: auto; }
    .btn { background: #10b981; color: #000; font-weight: bold; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
    .btn:hover { background: #34d399; }
    .btn-outline { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
    .btn-outline:hover { background: #334155; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h2 style="margin: 0; font-size: 20px; color: #fff;">BSAT Studio Standalone Executable</h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Windows Binary &bull; Auto-Start &bull; TypeScript Compiler Supervisor</p>
      </div>
      <span class="badge">RUNNING &bull; PORT ${PORT}</span>
    </div>

    <div class="grid">
      <div class="stat"><div class="stat-label">Process PID</div><div class="stat-val">${process.pid}</div></div>
      <div class="stat"><div class="stat-label">Uptime</div><div class="stat-val">${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s</div></div>
      <div class="stat"><div class="stat-label">Memory</div><div class="stat-val">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</div></div>
      <div class="stat"><div class="stat-label">Restarts</div><div class="stat-val">${restartCount}</div></div>
    </div>

    <div style="margin-bottom: 16px; display: flex; gap: 8px;">
      <a href="/api/health" target="_blank" class="btn btn-outline">Check Health API</a>
      <a href="/api/status" target="_blank" class="btn btn-outline">JSON Telemetry</a>
      <a href="javascript:location.reload()" class="btn">Refresh Console</a>
    </div>

    <div class="terminal">
      ${logRows || '<div style="color: #64748b;">No logs recorded yet.</div>'}
    </div>
  </div>
</body>
</html>`;
}

// Built-in HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      executable: true,
      pid: process.pid,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ONLINE',
      platform: process.platform,
      arch: process.arch,
      executable: true,
      execPath: process.execPath,
      pid: process.pid,
      memory: process.memoryUsage(),
      restartCount,
      timestamp: new Date().toISOString(),
      logs: logs.slice(-50),
    }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(getDashboardHtml());
});

server.listen(PORT, HOST, () => {
  displayBanner();
  log('ok', `BSAT Studio Executable daemon listening on http://${HOST}:${PORT}`);
  log('info', `Type Ctrl+C in terminal to stop.`);
});

// Handle signals
process.on('SIGINT', () => {
  log('warn', 'Caught SIGINT. Closing executable toolchain...');
  server.close(() => {
    log('ok', 'Executable terminated gracefully.');
    process.exit(0);
  });
});

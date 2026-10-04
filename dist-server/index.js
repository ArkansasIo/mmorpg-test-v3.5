/**
 * BSAT - TypeScript Node.js Server
 * Auto-compiled from TypeScript (server/index.ts) into Node.js (dist-server/index.js)
 */
import express from 'express';
import os from 'os';
const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();
app.use(express.json());
// Request logging middleware
app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});
// Server Info & Status
app.get('/api/status', (_req, res) => {
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
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        pid: process.pid,
    });
});
// Endpoint to simulate an unhandled crash to demonstrate .bat auto-restart loop
app.post('/api/simulate-crash', (_req, res) => {
    res.json({ message: 'Triggering fatal exception in 500ms to test auto-restart...' });
    setTimeout(() => {
        console.error('FATAL: Simulated fatal crash triggered! Auto-restart supervisor should reboot the server.');
        process.exit(1);
    }, 500);
});
// Catch-all info route
app.get('*', (_req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>BSAT TypeScript Node.js Server</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
        .card { background: #1e293b; border-radius: 8px; padding: 1.5rem; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .badge { display: inline-block; background: #059669; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
        code { background: #334155; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; }
        pre { background: #0b0f19; padding: 1rem; border-radius: 6px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">ONLINE</span>
        <h1>TypeScript Node.js Server</h1>
        <p>This server was written in <code>server/index.ts</code> and compiled to Node.js.</p>
        <p>PID: <code>${process.pid}</code> | Uptime: <code>${Math.floor((Date.now() - startTime) / 1000)}s</code></p>
        <p>Endpoints:</p>
        <ul>
          <li><a href="/api/status" style="color: #38bdf8;">/api/status</a> - Server metrics & process info</li>
          <li><a href="/api/health" style="color: #38bdf8;">/api/health</a> - Health check</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});
// Start the server
app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 BSAT Node.js Server running at http://localhost:${PORT}`);
    console.log(`📁 Compiled Source: server/index.ts -> dist-server/index.js`);
    console.log(`⚡ Process PID: ${process.pid}`);
    console.log(`⏱️ Started at: ${new Date().toISOString()}`);
    console.log('====================================================');
});
//# sourceMappingURL=index.js.map
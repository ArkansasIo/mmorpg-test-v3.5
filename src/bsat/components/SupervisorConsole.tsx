import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Play, RefreshCw, Square, Terminal as TerminalIcon, Zap } from 'lucide-react';

interface LogEntry {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'supervisor';
  text: string;
}

export const SupervisorConsole: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [serverStatus, setServerStatus] = useState<'ONLINE' | 'RESTARTING' | 'CRASHED' | 'OFFLINE'>('ONLINE');
  const [pid, setPid] = useState<number>(48291);
  const [uptime, setUptime] = useState<number>(14);
  const [restartCount, setRestartCount] = useState<number>(0);
  const [memoryMB, setMemoryMB] = useState<number>(38);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      time: '14:40:02',
      type: 'supervisor',
      text: '[BSAT] Windows Batch Supervisor initiated. Checking Node.js runtime...',
    },
    {
      id: '2',
      time: '14:40:03',
      type: 'success',
      text: '[OK] Detected Node.js v22.14.0 (x64) and npm 10.9.0',
    },
    {
      id: '3',
      time: '14:40:04',
      type: 'info',
      text: '[*] Compiling TypeScript source: server/index.ts -> dist-server/index.js...',
    },
    {
      id: '4',
      time: '14:40:06',
      type: 'success',
      text: '[OK] TypeScript compilation succeeded! Zero errors.',
    },
    {
      id: '5',
      time: '14:40:07',
      type: 'supervisor',
      text: '[RUNNING] Spawning Node.js server (PID: 48291) on port 3000...',
    },
    {
      id: '6',
      time: '14:40:08',
      type: 'info',
      text: '🚀 BSAT Node.js Server running at http://localhost:3000',
    },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Uptime counter
  useEffect(() => {
    let timer: any;
    if (serverStatus === 'ONLINE') {
      timer = setInterval(() => {
        setUptime((prev) => prev + 1);
        // Small fluctuation in memory
        setMemoryMB((prev) => Math.min(65, Math.max(32, prev + (Math.random() > 0.5 ? 1 : -1))));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [serverStatus]);

  const addLog = (type: LogEntry['type'], text: string) => {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    setLogs((prev) => [...prev, { id: Math.random().toString(), time, type, text }]);
  };

  const handleStart = () => {
    if (serverStatus === 'ONLINE') return;
    const newPid = Math.floor(20000 + Math.random() * 70000);
    setPid(newPid);
    setUptime(0);
    setServerStatus('ONLINE');
    setIsRunning(true);
    addLog('supervisor', `[*] Starting Node.js server supervisor loop...`);
    addLog('info', `[*] Compiling server/index.ts via tsc -p tsconfig.server.json...`);
    setTimeout(() => {
      addLog('success', `[OK] Compiled into dist-server/index.js`);
      addLog('supervisor', `[RUNNING] Node.js server active on PID ${newPid} (port 3000)`);
    }, 400);
  };

  const handleSimulateFileChange = () => {
    if (serverStatus !== 'ONLINE') return;
    addLog('info', `[WATCHER] Detected file modification: server/index.ts`);
    addLog('info', `[*] Triggering incremental TypeScript recompile...`);
    setTimeout(() => {
      addLog('success', `[OK] Recompile finished in 184ms.`);
      addLog('supervisor', `[*] Restarting Node.js process to reload changes...`);
      const newPid = Math.floor(20000 + Math.random() * 70000);
      setPid(newPid);
      setUptime(0);
      addLog('supervisor', `[RUNNING] Node.js server rebooted (PID: ${newPid})`);
    }, 500);
  };

  const handleSimulateCrash = () => {
    if (serverStatus !== 'ONLINE') return;
    setServerStatus('CRASHED');
    addLog('error', `FATAL ERROR: Uncaught exception in server/index.ts line 42: Simulated crash`);
    addLog('error', `[ALERT] Node.js process PID ${pid} terminated with exit code: 1`);

    const nextRestart = restartCount + 1;
    setRestartCount(nextRestart);
    addLog('warn', `[WARNING] Server crashed unexpectedly! (Crash #${nextRestart}/5)`);

    setServerStatus('RESTARTING');
    addLog('supervisor', `[AUTO-RESTART] Windows Batch supervisor auto-recovering in 3 seconds...`);

    setTimeout(() => {
      const newPid = Math.floor(20000 + Math.random() * 70000);
      setPid(newPid);
      setUptime(0);
      setServerStatus('ONLINE');
      addLog('success', `[OK] TypeScript verified. Launching replacement Node.js process...`);
      addLog('supervisor', `[RUNNING] Node.js server restored online (PID: ${newPid}) on port 3000`);
    }, 3000);
  };

  const handleStop = () => {
    if (serverStatus === 'OFFLINE') return;
    setServerStatus('OFFLINE');
    setIsRunning(false);
    addLog('warn', `[SIGINT] Caught termination signal. Gracefully shutting down PID ${pid}...`);
    addLog('info', `[OK] Node.js server exited with code 0.`);
    addLog('supervisor', `[HALTED] Supervisor loop idle.`);
  };

  const handleHealthProbe = () => {
    if (serverStatus !== 'ONLINE') {
      addLog('error', `[HTTP PROBE] Connection refused at http://localhost:3000/api/health (Server is ${serverStatus})`);
      return;
    }
    addLog(
      'success',
      `[HTTP 200 OK] GET /api/health -> {"status":"healthy","pid":${pid},"uptimeSeconds":${uptime},"memoryMB":${memoryMB}}`
    );
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Telemetry Dashboard */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>LIVE SUPERVISOR DAEMON SIMULATOR</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Process Supervisor Console</h2>
            <p className="text-xs text-slate-400 mt-1">
              Visual simulation of <code className="text-emerald-400 font-mono">start-server.bat</code> and <code className="text-emerald-400 font-mono">start-server.sh</code> process management.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  serverStatus === 'ONLINE'
                    ? 'bg-emerald-400 animate-pulse'
                    : serverStatus === 'RESTARTING'
                    ? 'bg-amber-400 animate-bounce'
                    : serverStatus === 'CRASHED'
                    ? 'bg-rose-500'
                    : 'bg-slate-600'
                }`}
              />
              <span className="text-xs font-bold font-mono tracking-wide text-white">
                {serverStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800 font-mono">
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Process PID</span>
            <span className="text-sm font-bold text-white">{serverStatus === 'OFFLINE' ? '-' : pid}</span>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Active Port</span>
            <span className="text-sm font-bold text-emerald-400">3000</span>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Uptime</span>
            <span className="text-sm font-bold text-white tabular-nums">
              {Math.floor(uptime / 60)}m {uptime % 60}s
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Crash Count</span>
            <span className={`text-sm font-bold ${restartCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {restartCount} / 5
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block">Heap Memory</span>
            <span className="text-sm font-bold text-purple-400 tabular-nums">
              {serverStatus === 'OFFLINE' ? '-' : `${memoryMB} MB`}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Action Controls */}
      <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {serverStatus === 'OFFLINE' ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Server</span>
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop (SIGINT)</span>
            </button>
          )}

          <button
            onClick={handleSimulateFileChange}
            disabled={serverStatus !== 'ONLINE'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-blue-400" />
            <span>Simulate File Save (Watch)</span>
          </button>

          <button
            onClick={handleSimulateCrash}
            disabled={serverStatus !== 'ONLINE'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 text-rose-300 text-xs font-medium rounded-lg border border-rose-500/30 transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Simulate Crash (Test Auto-Restart)</span>
          </button>

          <button
            onClick={handleHealthProbe}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3 text-teal-400" />
            <span>Probe /api/health</span>
          </button>
        </div>

        <button
          onClick={handleClearLogs}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Clear Logs
        </button>
      </div>

      {/* Terminal Output */}
      <div className="border border-slate-800 bg-[#080c14] rounded-xl overflow-hidden flex flex-col font-mono text-xs shadow-2xl">
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Terminal — start-server.bat (PID Supervisor)</span>
          </div>
          <span className="text-[11px] text-slate-500">Live stream</span>
        </div>

        <div className="p-4 h-[380px] overflow-y-auto space-y-1.5 leading-relaxed">
          {logs.map((log) => {
            let color = 'text-slate-300';
            if (log.type === 'success') color = 'text-emerald-400';
            if (log.type === 'warn') color = 'text-amber-400';
            if (log.type === 'error') color = 'text-rose-400 font-semibold';
            if (log.type === 'supervisor') color = 'text-cyan-400';

            return (
              <div key={log.id} className="flex items-start gap-2.5">
                <span className="text-slate-600 select-none text-[11px]">{log.time}</span>
                <span className={`${color} break-all`}>{log.text}</span>
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};

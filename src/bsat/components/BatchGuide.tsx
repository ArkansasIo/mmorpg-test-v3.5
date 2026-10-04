import React from 'react';
import { BookOpen, CheckCircle, HelpCircle, Terminal, Zap } from 'lucide-react';

export const BatchGuide: React.FC = () => {
  const batchCommands = [
    {
      syntax: '@echo off',
      purpose: 'Suppresses command printing',
      detail: 'Prevents the command prompt from printing every command line before execution, creating a clean terminal interface.',
    },
    {
      syntax: 'setlocal enabledelayedexpansion',
      purpose: 'Enables dynamic loop variables',
      detail: 'Allows variables like !RESTART_COUNT! to evaluate at execution time inside IF and FOR blocks instead of parse time.',
    },
    {
      syntax: 'where node >nul 2>nul',
      purpose: 'Silent binary path lookup',
      detail: 'Checks if Node.js is installed in the system PATH and redirects all stdout (>nul) and stderr (2>nul) to silence output.',
    },
    {
      syntax: 'call npx tsc -p tsconfig.server.json',
      purpose: 'Transpile TypeScript into Node.js',
      detail: 'The "call" keyword is required in batch scripts so that control returns to the caller script after running another batch/cmd file.',
    },
    {
      syntax: 'if %ERRORLEVEL% neq 0 ( ... )',
      purpose: 'Exit code condition check',
      detail: 'Checks if the compiler or server failed. If exit code is not equal (neq) to 0, triggers error recovery or pause.',
    },
    {
      syntax: 'timeout /t 3 /nobreak >nul',
      purpose: 'Crash backoff delay',
      detail: 'Pauses for 3 seconds before attempting an auto-restart, preventing continuous rapid restart loops that peg CPU.',
    },
    {
      syntax: 'choice /C RQ /N /M "Choose (R/Q): "',
      purpose: 'Interactive single-key prompt',
      detail: 'Prompts user for keyboard options: R (Retry) or Q (Quit) without requiring Enter.',
    },
    {
      syntax: 'goto SERVER_LOOP',
      purpose: 'Infinite supervisor loop',
      detail: 'Jumps execution back to the server start label, maintaining an immortal process supervisor until user terminates.',
    },
  ];

  const comparisonRows = [
    {
      tool: 'Windows Batch (.bat)',
      install: 'Zero (Native to Windows)',
      bestFor: 'Double-click instant start on Windows PCs, CI/CD runners, desktop deployments',
      pros: 'No global npm packages needed, handles crash recovery loop, works on any Windows machine',
    },
    {
      tool: 'Unix Bash (.sh)',
      install: 'Zero (Native to Linux/macOS)',
      bestFor: 'Production servers, Docker containers, Mac developers, Linux VPS',
      pros: 'Full POSIX signal traps (SIGTERM), process daemonization, colored terminal output',
    },
    {
      tool: 'tsx watch',
      install: 'npm i -D tsx',
      bestFor: 'Rapid local development with instant TypeScript hot-reloading',
      pros: 'Sub-millisecond JIT compilation, zero configuration needed, watches files out-of-the-box',
    },
    {
      tool: 'nodemon + tsc',
      install: 'npm i -D nodemon',
      bestFor: 'Custom file watching with multi-step build pipelines',
      pros: 'Configurable delay, debounce, file extension filters (ts, json, env)',
    },
    {
      tool: 'PM2',
      install: 'npm i -g pm2',
      bestFor: 'Production multi-core clustering and background daemon management',
      pros: 'Zero-downtime reloads, memory limits, automatic startup on OS boot',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>TECHNICAL SPECIFICATION & DOCUMENTATION</span>
        </div>
        <h2 className="text-2xl font-bold text-white">How Batch & Shell Supervisors Work</h2>
        <p className="text-xs text-slate-400 mt-1">
          Comprehensive reference explaining Windows Batch (<code className="text-emerald-400 font-mono">.bat</code>) and Linux Shell (<code className="text-emerald-400 font-mono">.sh</code>) program architecture.
        </p>
      </div>

      {/* Windows Batch Command Anatomy */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Windows Batch (.bat) Command Breakdown</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {batchCommands.map((cmd) => (
            <div
              key={cmd.syntax}
              className="border border-slate-800 bg-slate-900/50 rounded-xl p-4 space-y-1.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {cmd.syntax}
                </code>
                <span className="text-[11px] font-semibold text-slate-400">{cmd.purpose}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">{cmd.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>Toolchain Comparison Matrix</span>
        </h3>
        <div className="border border-slate-800 bg-slate-900/30 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3">Tool / Program</th>
                <th className="px-4 py-3">Prerequisites</th>
                <th className="px-4 py-3">Primary Use Case</th>
                <th className="px-4 py-3">Key Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {comparisonRows.map((row) => (
                <tr key={row.tool} className="hover:bg-slate-900/50 transition-colors font-sans">
                  <td className="px-4 py-3 font-semibold text-white font-mono text-xs">{row.tool}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{row.install}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{row.bestFor}</td>
                  <td className="px-4 py-3 text-emerald-400 text-xs font-medium">{row.pros}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Practices */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Production Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Backoff Restart Delays</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Never restart a crashed server immediately in a 0ms loop. Always enforce a 2-5 second delay to avoid rapid thrashing and CPU starvation if a port is blocked.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Dedicated tsconfig.server.json</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Separate your Node.js server compilation from frontend React configs to avoid DOM/Node type collisions and ensure proper NodeNext module resolution.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Signal Traps for Clean Shutdown</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              On Unix systems, always trap SIGINT and SIGTERM to send graceful shutdown signals to the underlying child Node.js PID so database connections can close cleanly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

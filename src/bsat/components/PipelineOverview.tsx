import React from 'react';
import { ArrowRight, Cpu, FileCode2, Play, RefreshCw, ShieldCheck, Zap } from 'lucide-react';

interface PipelineOverviewProps {
  onNavigate: (tab: string) => void;
}

export const PipelineOverview: React.FC<PipelineOverviewProps> = ({ onNavigate }) => {
  const steps = [
    {
      num: '01',
      title: 'TypeScript Codebase',
      subtitle: 'server/index.ts',
      desc: 'Type-safe server logic with Express, route handlers, async middlewares, and strict typings.',
      icon: FileCode2,
      accent: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
    },
    {
      num: '02',
      title: 'TypeScript Compiler',
      subtitle: 'npx tsc -p tsconfig.server.json',
      desc: 'Transpiles TS into clean JavaScript (ES2022/NodeNext), generating declaration maps and source maps.',
      icon: Cpu,
      accent: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
    },
    {
      num: '03',
      title: 'Compiled Node.js Bundle',
      subtitle: 'dist-server/index.js',
      desc: 'Production-ready JavaScript executed directly by the Node.js V8 engine with zero runtime overhead.',
      icon: Zap,
      accent: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    },
    {
      num: '04',
      title: 'Auto-Start Supervisor',
      subtitle: 'start-server.bat / .sh',
      desc: 'Monitors process PID, catches crashes (%ERRORLEVEL% != 0), logs timestamps, and auto-restarts within 3s.',
      icon: RefreshCw,
      accent: 'text-purple-400 border-purple-500/20 bg-purple-500/10',
    },
    {
      num: '05',
      title: 'HTTP Port & Health Probe',
      subtitle: 'http://localhost:3000/api/health',
      desc: 'Exposes telemetry, memory statistics, and uptime probes for automated uptime guarantees.',
      icon: ShieldCheck,
      accent: 'text-teal-400 border-teal-500/20 bg-teal-500/10',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Intro */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span>BSAT AUTOMATION PIPELINE</span>
              <span aria-hidden="true">·</span>
              <span>WINDOWS BATCH & UNIX BASH</span>
              <span aria-hidden="true">·</span>
              <span>TYPESCRIPT 7.x</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              TypeScript to Node.js Auto-Start & Compilation
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
              Complete automated toolchain to compile TypeScript server code into Node.js runtime files and auto-start the server with crash-resilient supervision loops on Windows (<code className="text-emerald-400 font-mono text-xs">.bat</code>) and Linux/macOS (<code className="text-emerald-400 font-mono text-xs">.sh</code>).
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigate('exe')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <span>Download Windows .EXE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('supervisor')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors border border-slate-700"
            >
              <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
              <span>Launch Live Daemon</span>
            </button>
            <button
              onClick={() => onNavigate('generator')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors border border-slate-700"
            >
              <span>Configure .BAT / .SH</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div>
            <div className="text-xs text-slate-500">Auto-Recovery</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">3 Seconds</div>
            <div className="text-[11px] text-slate-400">Automatic backoff restart</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Type Compilation</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">ES2022 NodeNext</div>
            <div className="text-[11px] text-slate-400">Strict mode enabled</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Platform Support</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">Win + POSIX</div>
            <div className="text-[11px] text-slate-400">.bat, .cmd, .sh, .ps1</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Telemetry Ready</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">/api/health</div>
            <div className="text-[11px] text-slate-400">Memory & PID metrics</div>
          </div>
        </div>
      </div>

      {/* Step by step pipeline */}
      <div className="max-w-5xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-white">How the Auto-Start & Compiler Pipeline Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="border border-slate-800/90 bg-slate-900/60 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-500 font-semibold">{step.num}</span>
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${step.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{step.title}</h3>
                    <code className="text-[11px] text-slate-400 font-mono block mt-1 break-all bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
                      {step.subtitle}
                    </code>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CLI Quick Reference */}
      <div className="max-w-5xl mx-auto border border-slate-800 bg-slate-900/40 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-4">Quick CLI Commands</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-xs font-semibold text-emerald-400 mb-1">Windows Batch Auto-Start</div>
            <code className="text-xs font-mono text-slate-300 block select-all">.\start-server.bat</code>
            <p className="text-[11px] text-slate-500 mt-1">Compiles TS, checks env, restarts on crash</p>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-xs font-semibold text-emerald-400 mb-1">Windows Watch Mode</div>
            <code className="text-xs font-mono text-slate-300 block select-all">.\dev-watch.bat</code>
            <p className="text-[11px] text-slate-500 mt-1">Watches server/*.ts and reloads instantly</p>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-xs font-semibold text-emerald-400 mb-1">Linux / macOS Bash Start</div>
            <code className="text-xs font-mono text-slate-300 block select-all">bash start-server.sh</code>
            <p className="text-[11px] text-slate-500 mt-1">Trap signals, run daemon, auto-reboot</p>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-xs font-semibold text-cyan-400 mb-1">NPM Server Dev</div>
            <code className="text-xs font-mono text-slate-300 block select-all">npm run server:dev</code>
            <p className="text-[11px] text-slate-500 mt-1">Runs tsx watch with zero configuration</p>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-xs font-semibold text-cyan-400 mb-1">NPM Server Build</div>
            <code className="text-xs font-mono text-slate-300 block select-all">npm run server:build</code>
            <p className="text-[11px] text-slate-500 mt-1">Executes tsc with tsconfig.server.json</p>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-xs font-semibold text-cyan-400 mb-1">PM2 Production Start</div>
            <code className="text-xs font-mono text-slate-300 block select-all">npx pm2 start ecosystem.config.cjs</code>
            <p className="text-[11px] text-slate-500 mt-1">Background cluster process manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

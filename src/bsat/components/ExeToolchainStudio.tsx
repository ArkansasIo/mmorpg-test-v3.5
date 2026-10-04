import React, { useState } from 'react';
import { EXE_BINARIES, ExeBinaryInfo, downloadExeBinary } from '../data/exeBinaries';
import {
  Download,
  Terminal,
  Cpu,
  Layers,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Copy,
  Check,
  FileCode,
  Shield,
  Zap,
  HardDrive,
  Settings2
} from 'lucide-react';

export const ExeToolchainStudio: React.FC = () => {
  const [selectedExe, setSelectedExe] = useState<ExeBinaryInfo>(EXE_BINARIES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildStep, setBuildStep] = useState<string>('');
  const [buildProgress, setBuildProgress] = useState<number>(0);
  const [customCommand, setCustomCommand] = useState<string>('cmd.exe /k start-server.bat');
  const [customSubsystem, setCustomSubsystem] = useState<'console' | 'gui'>('console');
  const [customArch, setCustomArch] = useState<'x86_64' | 'arm64'>('x86_64');
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  // Terminal Simulator State
  const [simRunning, setSimRunning] = useState<boolean>(true);
  const [simPid, setSimPid] = useState<number>(84920);
  const [simLogs, setSimLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'ok' | 'warn' | 'error' }>>([
    { time: '14:55:01', text: '[EXE LAUNCHER] bsat-studio.exe initialized by user.', type: 'info' },
    { time: '14:55:02', text: '[WIN64 PE] Validating Portable Executable header and machine type AMD64...', type: 'ok' },
    { time: '14:55:02', text: '[KERNEL32] WinExec dispatched: cmd.exe /k start-server.bat', type: 'info' },
    { time: '14:55:03', text: '[SUPERVISOR] Node.js runtime environment verified (v22.23.2)', type: 'ok' },
    { time: '14:55:04', text: '[COMPILER] Compiling server/index.ts -> dist-server/index.js...', type: 'info' },
    { time: '14:55:05', text: '[OK] TypeScript compilation succeeded with 0 errors.', type: 'ok' },
    { time: '14:55:06', text: '🚀 [HTTP SERVER] Live on http://localhost:3000 (PID: 84920)', type: 'ok' },
  ]);

  const addSimLog = (text: string, type: 'info' | 'ok' | 'warn' | 'error' = 'info') => {
    const time = new Date().toTimeString().split(' ')[0];
    setSimLogs((prev) => [...prev, { time, text, type }]);
  };

  const handleDownload = (exe: ExeBinaryInfo) => {
    downloadExeBinary(exe);
    setDownloadSuccessNotice(`Downloaded ${exe.filename} (Win64 Executable)!`);
    setTimeout(() => setDownloadSuccessNotice(null), 3500);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(selectedExe.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRebuildExe = () => {
    setIsBuilding(true);
    setBuildProgress(15);
    setBuildStep('Parsing PE32+ header template & section tables...');

    setTimeout(() => {
      setBuildProgress(45);
      setBuildStep(`Injecting command payload: "${customCommand}"...`);
    }, 400);

    setTimeout(() => {
      setBuildProgress(75);
      setBuildStep('Aligning sections (.text RVA 0x1000, .rdata RVA 0x2000) & IAT thunks...');
    }, 800);

    setTimeout(() => {
      setBuildProgress(100);
      setBuildStep('Win64 PE binary successfully assembled! Outputting executable...');
      setIsBuilding(false);

      // Trigger download of the built binary
      const customExe: ExeBinaryInfo = {
        ...selectedExe,
        command: customCommand,
        filename: selectedExe.filename,
      };
      downloadExeBinary(customExe);
      setDownloadSuccessNotice(`Built and downloaded ${selectedExe.filename}!`);
      setTimeout(() => setDownloadSuccessNotice(null), 3500);
    }, 1300);
  };

  const handleSimFileSave = () => {
    addSimLog('[WATCHER] Detected file change in server/index.ts', 'info');
    setTimeout(() => {
      addSimLog('[COMPILER] Incremental compilation finished in 142ms.', 'ok');
      const newPid = Math.floor(10000 + Math.random() * 80000);
      setSimPid(newPid);
      addSimLog(`[SUPERVISOR] Reloaded server instance (New PID: ${newPid})`, 'ok');
    }, 300);
  };

  const handleSimCrash = () => {
    addSimLog('[ALERT] Process crashed with exit code 1!', 'error');
    addSimLog('[SUPERVISOR] Executable supervisor caught failure. Rebooting in 3s...', 'warn');
    setTimeout(() => {
      const newPid = Math.floor(10000 + Math.random() * 80000);
      setSimPid(newPid);
      addSimLog(`[RESTORED] Node.js server back online (PID: ${newPid})`, 'ok');
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Desktop Window Container Chrome */}
      <div className="border border-slate-700/80 bg-[#0d121f] rounded-xl overflow-hidden shadow-2xl">
        {/* Windows OS Window Titlebar */}
        <div className="px-4 py-2.5 bg-[#080c14] border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-3 h-3" />
            </div>
            <span className="text-xs font-semibold text-slate-200 font-mono tracking-tight">
              BSAT Studio Toolchain — Standalone Executable Hub (Win64 PE32+)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ● STANDALONE EXE READY
            </span>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center gap-2">
            <button className="w-3.5 h-3.5 rounded-sm hover:bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
              _
            </button>
            <button className="w-3.5 h-3.5 rounded-sm hover:bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
              □
            </button>
            <button className="w-3.5 h-3.5 rounded-sm hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center text-[10px]">
              ✕
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 space-y-6">
          {/* Header Overview Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>NATIVE WINDOWS EXECUTABLE TOOLCHAIN</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Standalone Executable Binaries (.EXE)
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Pre-built, zero-dependency Windows PE32+ binaries located directly in the root filesystem directory (outside <code className="text-emerald-400 font-mono">src/</code>: <code className="text-emerald-300 font-mono">./bsat-studio.exe</code>, <code className="text-emerald-300 font-mono">./bsat-compiler.exe</code>, <code className="text-emerald-300 font-mono">./bsat-supervisor.exe</code>). Double-click in Windows Explorer to instantly auto-start the server, compile TypeScript, and engage the immortal supervisor daemon.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDownload(selectedExe)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-lg shadow-emerald-900/40"
              >
                <Download className="w-4 h-4" />
                <span>Download {selectedExe.filename}</span>
              </button>
            </div>
          </div>

          {/* Download Notification Toast */}
          {downloadSuccessNotice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{downloadSuccessNotice}</span>
            </div>
          )}

          {/* Three Executable Binary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXE_BINARIES.map((exe) => {
              const isSelected = selectedExe.filename === exe.filename;
              return (
                <div
                  key={exe.filename}
                  onClick={() => setSelectedExe(exe)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900/90 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="font-mono text-xs font-bold text-white">{exe.filename}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{exe.sizeFormatted}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-300">{exe.name}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{exe.description}</p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">{exe.target}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(exe);
                      }}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium border border-slate-700 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two-Column Grid: Configurator & Windows Terminal Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Executable Builder & Configurator */}
            <div className="lg:col-span-5 border border-slate-800 bg-slate-900/40 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 pb-2 border-b border-slate-800">
                <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Executable Packager Options</span>
              </div>

              {/* Target File */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-medium">Selected Executable</label>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400">
                  {selectedExe.filename} ({selectedExe.format})
                </div>
              </div>

              {/* Command Embedded */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-medium">Embedded Execution Command</label>
                <input
                  type="text"
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Subsystem & Architecture */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-medium">PE Subsystem</label>
                  <select
                    value={customSubsystem}
                    onChange={(e) => setCustomSubsystem(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="console">Console (CUI 0x03)</option>
                    <option value="gui">Windows GUI (0x02)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-medium">Target Machine</label>
                  <select
                    value={customArch}
                    onChange={(e) => setCustomArch(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="x86_64">AMD64 (0x8664)</option>
                    <option value="arm64">ARM64 (0xAA64)</option>
                  </select>
                </div>
              </div>

              {/* Binary Specifications */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1.5 font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Entry Point RVA:</span>
                  <span className="text-white">0x1000 (.text)</span>
                </div>
                <div className="flex justify-between">
                  <span>Import Table:</span>
                  <span className="text-white">KERNEL32.dll (WinExec)</span>
                </div>
                <div className="flex justify-between">
                  <span>ImageBase:</span>
                  <span className="text-white">0x140000000</span>
                </div>
                <div className="flex justify-between">
                  <span>File Alignment:</span>
                  <span className="text-white">512 bytes (0x200)</span>
                </div>
              </div>

              {/* Build Button */}
              <div className="pt-2">
                <button
                  onClick={handleRebuildExe}
                  disabled={isBuilding}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBuilding ? 'animate-spin' : ''}`} />
                  <span>{isBuilding ? 'Assembling PE Executable...' : `Rebuild & Download ${selectedExe.filename}`}</span>
                </button>
              </div>

              {/* Build Step indicator */}
              {isBuilding && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">{buildStep}</span>
                    <span className="text-emerald-400 font-bold">{buildProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${buildProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Windows Executable Console Simulator */}
            <div className="lg:col-span-7 border border-slate-800 bg-[#060a12] rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    C:\Windows\System32\cmd.exe — {selectedExe.filename}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">PID: {simPid}</span>
              </div>

              {/* Simulated Terminal Screen */}
              <div className="p-4 h-[280px] overflow-y-auto space-y-1.5 font-mono text-xs leading-relaxed">
                {simLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-600 select-none text-[11px]">{log.time}</span>
                    <span
                      className={`break-all ${
                        log.type === 'ok'
                          ? 'text-emerald-400'
                          : log.type === 'error'
                          ? 'text-rose-400 font-bold'
                          : log.type === 'warn'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interactive Simulation Controls */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimFileSave}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 text-blue-400" />
                    <span>Simulate Code Save</span>
                  </button>

                  <button
                    onClick={handleSimCrash}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium rounded border border-rose-500/30 transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Simulate Crash</span>
                  </button>
                </div>

                <button
                  onClick={() => setSimLogs([])}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear Screen
                </button>
              </div>
            </div>
          </div>

          {/* Quick Installation & Deployment Guide */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>How to Run and Deploy the Standalone .EXE</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-400">1. Instant Double-Click</div>
                <p className="text-slate-400 leading-relaxed">
                  Download <code className="text-white font-mono">bsat-studio.exe</code> and double-click. It will launch the console supervisor, compile TypeScript, and open port 3000.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-400">2. Windows Startup Folder</div>
                <p className="text-slate-400 leading-relaxed">
                  Press <code className="text-white font-mono">Win + R</code>, type <code className="text-white font-mono">shell:startup</code>, and place a shortcut to the .exe to auto-boot on PC startup.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-400">3. Windows Service (Daemon)</div>
                <p className="text-slate-400 leading-relaxed">
                  Use NSSM or <code className="text-white font-mono">sc create BSAT binPath=...</code> to run the executable as an immortal background system service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

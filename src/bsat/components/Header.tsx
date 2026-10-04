import React from 'react';
import { Download, Terminal } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDownloadAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadAll,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0b0f17]/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
            BSAT Studio
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`transition-colors text-left hover:text-white ${
              activeTab === 'pipeline' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Pipeline Flow
          </button>
          <button
            onClick={() => setActiveTab('env-config')}
            className={`transition-colors text-left hover:text-white flex items-center gap-1.5 ${
              activeTab === 'env-config' ? 'text-cyan-400 font-bold' : ''
            }`}
          >
            <span>Environment & Setup Suite</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">ENV/EXE</span>
          </button>
          <button
            onClick={() => setActiveTab('exe')}
            className={`transition-colors text-left hover:text-white flex items-center gap-1.5 ${
              activeTab === 'exe' ? 'text-emerald-400 font-bold' : ''
            }`}
          >
            <span>EXE Toolchain (.EXE)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">WIN</span>
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`transition-colors text-left hover:text-white ${
              activeTab === 'generator' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Script Generator (.BAT/.SH)
          </button>
          <button
            onClick={() => setActiveTab('compiler')}
            className={`transition-colors text-left hover:text-white ${
              activeTab === 'compiler' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            TS Transpiler
          </button>
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`transition-colors text-left hover:text-white ${
              activeTab === 'supervisor' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Process Daemon
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`transition-colors text-left hover:text-white ${
              activeTab === 'files' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            File Catalog
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`transition-colors text-left hover:text-white ${
              activeTab === 'guide' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Batch Guide
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-900/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All Scripts</span>
          </button>
        </div>
      </div>
    </header>
  );
};

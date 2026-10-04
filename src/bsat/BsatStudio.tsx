import React, { useState } from 'react';
import { Header } from './components/Header';
import { PipelineOverview } from './components/PipelineOverview';
import { ScriptGenerator } from './components/ScriptGenerator';
import { LiveCompiler } from './components/LiveCompiler';
import { SupervisorConsole } from './components/SupervisorConsole';
import { FileCatalog } from './components/FileCatalog';
import { BatchGuide } from './components/BatchGuide';
import { ExeToolchainStudio } from './components/ExeToolchainStudio';
import { EnvironmentConfigSystemView } from '../components/views/EnvironmentConfigSystemView';
import { PROJECT_FILES } from './data/filesData';

interface BsatStudioProps {
  onClose?: () => void;
}

export const BsatStudio: React.FC<BsatStudioProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadAll = () => {
    const keyFiles = PROJECT_FILES.filter((f) =>
      ['start-server.bat', 'start-server.sh', 'dev-watch.bat', 'tsconfig.server.json'].includes(f.name)
    );

    keyFiles.forEach((file, index) => {
      setTimeout(() => {
        const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, index * 200);
    });

    setDownloadNotice('Downloaded start-server.bat, start-server.sh, dev-watch.bat, & tsconfig.server.json!');
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadAll={handleDownloadAll}
      />

      {/* Download Alert Toast */}
      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-semibold px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2">
          <span>✓</span>
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'pipeline' && (
          <PipelineOverview onNavigate={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'env-config' && <EnvironmentConfigSystemView />}
        {activeTab === 'exe' && <ExeToolchainStudio />}
        {activeTab === 'generator' && <ScriptGenerator />}
        {activeTab === 'compiler' && <LiveCompiler />}
        {activeTab === 'supervisor' && <SupervisorConsole />}
        {activeTab === 'files' && <FileCatalog />}
        {activeTab === 'guide' && <BatchGuide />}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080c14] py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400 font-semibold">BSAT Toolchain</span>
            <span aria-hidden="true">·</span>
            <span>TypeScript 7.x Node.js Auto-Start & Supervisor</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>start-server.bat</span>
            <span aria-hidden="true">·</span>
            <span>start-server.sh</span>
            <span aria-hidden="true">·</span>
            <span>dist-server/index.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BsatStudio;

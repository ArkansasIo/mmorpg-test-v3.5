import React, { useState } from 'react';
import { PROJECT_FILES, ProjectFile } from '../data/filesData';
import { EXE_BINARIES, downloadExeBinary } from '../data/exeBinaries';
import { Check, Copy, Download, FileCode, Folder, Terminal, HardDrive } from 'lucide-react';

export const FileCatalog: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [filterCategory, setFilterCategory] = useState<'all' | 'batch' | 'shell' | 'server' | 'config' | 'binary'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredFiles = PROJECT_FILES.filter((file) => {
    if (filterCategory === 'all') return true;
    return file.category === filterCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: ProjectFile) => {
    if (file.type === 'exe') {
      const match = EXE_BINARIES.find((b) => b.filename === file.name.split('/').pop());
      if (match) {
        downloadExeBinary(match);
        return;
      }
    }
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name.split('/').pop() || file.name;
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
              <Folder className="w-3.5 h-3.5" />
              <span>PROJECT ARTIFACT EXPLORER</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Generated Project Files</h2>
            <p className="text-xs text-slate-400 mt-1">
              All files are created in your root workspace and ready for immediate local execution or download.
            </p>
          </div>

          <button
            onClick={() => handleDownloadFile(selectedFile)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {selectedFile.name}</span>
          </button>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg mt-6">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterCategory === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Files ({PROJECT_FILES.length})
          </button>
          <button
            onClick={() => setFilterCategory('batch')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterCategory === 'batch'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Windows Batch (.bat)
          </button>
          <button
            onClick={() => setFilterCategory('shell')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterCategory === 'shell'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unix Bash (.sh)
          </button>
          <button
            onClick={() => setFilterCategory('server')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterCategory === 'server'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TypeScript Server
          </button>
          <button
            onClick={() => setFilterCategory('config')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterCategory === 'config'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Configs (tsconfig / nodemon / pm2)
          </button>
          <button
            onClick={() => setFilterCategory('binary')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterCategory === 'binary'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Binaries (.EXE)
          </button>
        </div>
      </div>

      {/* Explorer Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: File List */}
        <div className="lg:col-span-4 space-y-2">
          {filteredFiles.map((file) => {
            const isSelected = selectedFile.name === file.name;
            return (
              <div
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {file.type === 'bat' || file.type === 'sh' ? (
                      <Terminal className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <FileCode className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-xs font-mono font-bold text-white">{file.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{file.size}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{file.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right: File Viewer */}
        <div className="lg:col-span-8 border border-slate-800 bg-[#090d16] rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">{selectedFile.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {selectedFile.category.toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">{selectedFile.description}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleDownloadFile(selectedFile)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto overflow-y-auto max-h-[500px] leading-relaxed selection:bg-emerald-500/30">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

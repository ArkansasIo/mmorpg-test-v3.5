import React, { useState } from 'react';
import { X, Download, Upload, Cloud, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { sound } from '../../sound';
import { PlayerProfile, PlayerResources } from '../../types';

interface SaveStateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  resources: PlayerResources;
  onImportState: (stateJson: string) => void;
}

export const SaveStateManagerModal: React.FC<SaveStateManagerModalProps> = ({
  isOpen,
  onClose,
  profile,
  resources,
  onImportState,
}) => {
  const [importJson, setImportJson] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentExport = JSON.stringify({ profile, resources, timestamp: new Date().toISOString() }, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentExport);
    sound.play('confirm');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyImport = () => {
    if (!importJson.trim()) return;
    try {
      onImportState(importJson);
      sound.play('confirm');
      alert('Save snapshot imported successfully!');
      onClose();
    } catch (err) {
      alert('Invalid JSON save snapshot data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" id="save-state-manager-modal">
      <div className="bg-white border border-[#dedede] w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[#dedede] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#111111]" />
            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
              Galactic Save & State Vault (Feature 51)
            </h2>
          </div>
          <button
            onClick={() => { sound.play('click'); onClose(); }}
            className="p-1 hover:bg-[#eee] cursor-pointer"
          >
            <X className="w-5 h-5 text-[#666]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#444]">
          {/* Export Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#111111] uppercase">Current Snapshot JSON</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-[#111111] text-white text-[10px] font-bold uppercase hover:bg-[#333] cursor-pointer flex items-center gap-1"
              >
                {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <textarea
              readOnly
              value={currentExport}
              rows={4}
              className="w-full p-2.5 bg-[#fafafa] border border-[#ddd] font-mono text-[11px] text-[#333] select-all"
            />
          </div>

          {/* Import Section */}
          <div>
            <span className="font-bold text-[#111111] uppercase block mb-2">Restore / Import Save State</span>
            <textarea
              placeholder="Paste JSON save state here..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              rows={4}
              className="w-full p-2.5 bg-white border border-[#111111] font-mono text-[11px] text-[#111]"
            />
            <button
              onClick={handleApplyImport}
              className="w-full mt-2 py-2 bg-emerald-600 text-white text-xs font-bold uppercase hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Restore Save Snapshot
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dedede] bg-[#fafafa] flex justify-end">
          <button
            onClick={() => { sound.play('click'); onClose(); }}
            className="px-4 py-1.5 border border-[#ccc] text-xs font-bold uppercase hover:bg-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

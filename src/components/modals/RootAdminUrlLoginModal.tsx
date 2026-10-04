import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Key,
  Link,
  Copy,
  Check,
  X,
  ExternalLink,
  Plus,
  Play,
  Terminal,
  UserCheck,
  Sparkles,
  Lock,
  Globe,
  Sliders,
} from 'lucide-react';
import {
  getAllAdminAccounts,
  getAllRootAdminAccounts,
  createRootAdminAccount,
  generateAdminUrlLogin,
  processUrlAdminLogin,
  AdminUrlLoginMode,
} from '../../config/adminAuthConfig';
import { AdminAuthSession, AdminCredentialAccount } from '../../types';
import { sound } from '../../sound';

interface RootAdminUrlLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (session: AdminAuthSession, account: AdminCredentialAccount) => void;
}

export const RootAdminUrlLoginModal: React.FC<RootAdminUrlLoginModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const rootAccounts = getAllRootAdminAccounts();
  const [selectedAccount, setSelectedAccount] = useState<AdminCredentialAccount>(
    rootAccounts[0] || getAllAdminAccounts()[0]
  );
  const [urlMode, setUrlMode] = useState<AdminUrlLoginMode>('direct');
  const [targetTab, setTargetTab] = useState<string>('crown');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Quick URL Tester state
  const [testUrlInput, setTestUrlInput] = useState<string>('');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);

  // Create New Root Admin Form
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('s.sstargate@gmail.com');
  const [newLoginCode, setNewLoginCode] = useState<string>('');
  const [newPasscode, setNewPasscode] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('0001');

  if (!isOpen) return null;

  const currentGeneratedUrl = generateAdminUrlLogin(selectedAccount, {
    mode: urlMode,
    tab: targetTab,
    includePin: true,
  });

  const handleCopy = (text: string, keyId: string) => {
    sound.play('confirm');
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCreateRootAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.play('confirm');

    const created = createRootAdminAccount({
      username: newUsername || undefined,
      email: newEmail || undefined,
      loginCode: newLoginCode || undefined,
      passcode: newPasscode || undefined,
      securityPin: newPin || undefined,
      title: 'Supreme Galactic Root Administrator & Archon',
    });

    setSelectedAccount(created);
    setShowCreateForm(false);
    setTestResult({
      success: true,
      message: `Root Admin "${created.username}" successfully created with Level 10 Super Admin Clearance!`,
    });
  };

  const handleExecuteUrlLogin = (urlToTest?: string) => {
    sound.play('click');
    const target = urlToTest || currentGeneratedUrl;
    let search = '';
    let hash = '';

    try {
      if (target.includes('?')) {
        const parts = target.split('?');
        search = '?' + parts[1].split('#')[0];
      }
      if (target.includes('#')) {
        hash = '#' + target.split('#')[1];
      }
    } catch {
      // Fallback
    }

    const result = processUrlAdminLogin(search, hash);
    if (result.success && result.session && result.account) {
      sound.play('confirm');
      setTestResult({
        success: true,
        message: result.message || `Root Admin ${result.account.username} authenticated successfully!`,
      });
      if (onAuthSuccess) {
        onAuthSuccess(result.session, result.account);
      }
    } else {
      sound.play('warning');
      setTestResult({
        success: false,
        message: result.message || 'URL authentication failed. Please verify the URL parameters.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-3xl border-2 border-amber-400/70 bg-gradient-to-b from-[#111111] via-[#161616] to-[#0d0d0d] text-white shadow-2xl p-6 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/10 border border-amber-400/40 text-amber-400">
              <Key size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                  ROOT ADMIN TERMINAL // LEVEL 10 CLEARANCE
                </span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-mono border border-emerald-500/30">
                  ONE-CLICK URL ACCESS
                </span>
              </div>
              <h2 className="text-lg font-black tracking-wide font-mono uppercase text-white">
                Root Admin Account & URL Login System
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Status Message */}
          {testResult && (
            <div
              className={`p-3 text-xs font-mono border flex items-center justify-between gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                  : 'bg-red-950/70 border-red-500/60 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                <span>{testResult.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setTestResult(null)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Section 1: Choose or Create Root Admin */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-neutral-300 uppercase tracking-wider">
                1. Select Root Admin Sovereign Identity:
              </span>
              <button
                type="button"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                <Plus size={12} />
                <span>{showCreateForm ? 'Cancel Creation' : 'Create New Root Admin'}</span>
              </button>
            </div>

            {/* Create Root Admin Subform */}
            {showCreateForm && (
              <form onSubmit={handleCreateRootAdmin} className="p-4 border border-amber-400/40 bg-neutral-900/90 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-amber-400 uppercase">
                    Provision New Root Admin Account
                  </span>
                  <span className="text-[10px] text-neutral-400">Granted ALL_ADMIN_PERMISSIONS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase">Username / Callsign</label>
                    <input
                      type="text"
                      placeholder="e.g. Stargate_Root_Admin"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-black border border-neutral-700 text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase">Admin Email</label>
                    <input
                      type="email"
                      placeholder="s.sstargate@gmail.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-black border border-neutral-700 text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase">Login Access Code</label>
                    <input
                      type="text"
                      placeholder="e.g. ROOT-SGW-0001"
                      value={newLoginCode}
                      onChange={(e) => setNewLoginCode(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-black border border-neutral-700 text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase">Passcode</label>
                    <input
                      type="text"
                      placeholder="e.g. stargateRoot2026"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-black border border-neutral-700 text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase">Security PIN (4 digits)</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="0001"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-black border border-neutral-700 text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-400 text-black font-bold uppercase text-xs hover:bg-amber-300 cursor-pointer shadow-sm active:scale-95"
                  >
                    Save & Generate URL
                  </button>
                </div>
              </form>
            )}

            {/* Root Accounts Selector Pill List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {rootAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setSelectedAccount(acc);
                  }}
                  className={`p-3 text-left font-mono transition-all border cursor-pointer ${
                    selectedAccount.id === acc.id
                      ? 'border-amber-400 bg-amber-400/10 text-white'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate text-amber-300">{acc.username}</span>
                    <span className="text-[9px] px-1 py-0.2 bg-amber-400/20 text-amber-400 border border-amber-400/40 font-bold uppercase">
                      ROOT
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate mt-1">Code: {acc.loginCode}</div>
                  <div className="text-[10px] text-neutral-500 truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: URL Format & Parameters */}
          <div className="space-y-2 border-t border-white/10 pt-4">
            <span className="block text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
              2. Select URL Authentication Format:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setUrlMode('direct')}
                className={`p-2.5 border text-left cursor-pointer transition-all ${
                  urlMode === 'direct'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-bold">1-Click Key URL</div>
                <div className="text-[10px] text-neutral-500">?root_admin=1&key=...</div>
              </button>

              <button
                type="button"
                onClick={() => setUrlMode('magic')}
                className={`p-2.5 border text-left cursor-pointer transition-all ${
                  urlMode === 'magic'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-bold">Magic Token URL</div>
                <div className="text-[10px] text-neutral-500">?magic_token=&lt;base64&gt;</div>
              </button>

              <button
                type="button"
                onClick={() => setUrlMode('params')}
                className={`p-2.5 border text-left cursor-pointer transition-all ${
                  urlMode === 'params'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-bold">Params Credential</div>
                <div className="text-[10px] text-neutral-500">?admin_login=1&code=...</div>
              </button>

              <button
                type="button"
                onClick={() => setUrlMode('create')}
                className={`p-2.5 border text-left cursor-pointer transition-all ${
                  urlMode === 'create'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="font-bold">Create-Account URL</div>
                <div className="text-[10px] text-neutral-500">?create_root=1&user=...</div>
              </button>
            </div>
          </div>

          {/* Section 3: Generated URL Display Card */}
          <div className="border border-amber-400/30 bg-neutral-950 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase">
                <Link size={14} />
                Generated Root Admin Login URL
              </span>
              <div className="flex items-center gap-2">
                <label className="text-[10px] uppercase text-neutral-400">Target Tab:</label>
                <select
                  value={targetTab}
                  onChange={(e) => setTargetTab(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-[11px] px-1.5 py-0.5 focus:outline-hidden"
                >
                  <option value="crown">Decrees & Throne</option>
                  <option value="users">Player Accounts</option>
                  <option value="database-mysql">MySQL & phpMyAdmin</option>
                  <option value="universe">Universe Rules</option>
                  <option value="maintenance">Maintenance & Reset</option>
                  <option value="admin-login">Permissions & Security</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-black border border-neutral-800 text-amber-300 break-all select-all font-mono text-xs">
              {currentGeneratedUrl}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="text-[11px] text-neutral-400">
                Opening this link immediately validates root privileges and navigates to the admin panel.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(currentGeneratedUrl, 'current_url')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer border border-neutral-700"
                >
                  {copiedKey === 'current_url' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedKey === 'current_url' ? 'Copied URL!' : 'Copy URL'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteUrlLogin(currentGeneratedUrl)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Play size={14} />
                  <span>Authenticate Root Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Live URL Tester */}
          <div className="border border-neutral-800 bg-neutral-900/60 p-4 space-y-2 font-mono text-xs">
            <span className="block font-bold text-neutral-300 uppercase tracking-wider">
              3. Test Custom Admin URL:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste any ?admin_login=... or ?root_admin=... URL here to authenticate"
                value={testUrlInput}
                onChange={(e) => setTestUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-black border border-neutral-700 text-white focus:border-amber-400 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleExecuteUrlLogin(testUrlInput)}
                disabled={!testUrlInput.trim()}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-bold uppercase disabled:opacity-50 cursor-pointer"
              >
                Execute URL
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono">
          <span className="text-neutral-500">
            Account: <strong className="text-neutral-300">{selectedAccount.username}</strong> ({selectedAccount.email})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-white/10 font-bold uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

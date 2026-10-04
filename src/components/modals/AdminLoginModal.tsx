import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Lock,
  User,
  CheckCircle2,
  X,
  Sparkles,
  AlertTriangle,
  LogOut,
  Copy,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
} from 'lucide-react';
import {
  CANONICAL_ADMIN_ACCOUNTS,
  getAllAdminAccounts,
  validateAdminCredentials,
  setAdminAuthSession,
  clearAdminAuthSession,
  getAdminAuthSession,
  ADMIN_PERMISSIONS_REGISTRY,
} from '../../config/adminAuthConfig';
import { AdminAuthSession, AdminCredentialAccount } from '../../types';
import { sound } from '../../sound';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (session: AdminAuthSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [currentSession, setCurrentSession] = useState<AdminAuthSession>(getAdminAuthSession);
  const [selectedAccount, setSelectedAccount] = useState<AdminCredentialAccount | null>(
    CANONICAL_ADMIN_ACCOUNTS[0]
  );
  const [loginInput, setLoginInput] = useState<string>(CANONICAL_ADMIN_ACCOUNTS[0].loginCode);
  const [passcodeInput, setPasscodeInput] = useState<string>(CANONICAL_ADMIN_ACCOUNTS[0].passcode);
  const [pinInput, setPinInput] = useState<string>(CANONICAL_ADMIN_ACCOUNTS[0].securityPin);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePresetSelect = (acc: AdminCredentialAccount) => {
    sound.play('click');
    setSelectedAccount(acc);
    setLoginInput(acc.loginCode);
    setPasscodeInput(acc.passcode);
    setPinInput(acc.securityPin);
    setErrorMessage(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.play('click');
    setErrorMessage(null);
    setSuccessMessage(null);

    const match = validateAdminCredentials(loginInput, passcodeInput, pinInput);
    if (!match) {
      sound.play('warning');
      setErrorMessage('Invalid Admin Credentials, Security Pin, or Unauthorized Access Code!');
      return;
    }

    const clearanceLevel =
      match.role === 'super_admin'
        ? 5
        : match.role === 'administrator'
        ? 4
        : match.role === 'operator'
        ? 3
        : 2;

    const newSession: AdminAuthSession = {
      isAuthenticated: true,
      activeAdmin: match,
      authenticatedAt: new Date().toISOString(),
      securityClearanceLevel: clearanceLevel,
    };

    setAdminAuthSession(newSession);
    setCurrentSession(newSession);
    sound.play('confirm');
    setSuccessMessage(`Welcome Sovereign Administrator, ${match.username}! Clearance Level ${clearanceLevel} Granted.`);

    if (onAuthSuccess) {
      onAuthSuccess(newSession);
    }
  };

  const handleLogout = () => {
    sound.play('click');
    clearAdminAuthSession();
    const emptySession: AdminAuthSession = {
      isAuthenticated: false,
      activeAdmin: null,
      authenticatedAt: null,
      securityClearanceLevel: 0,
    };
    setCurrentSession(emptySession);
    setSuccessMessage('Admin session terminated. Root access revoked.');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    sound.play('confirm');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                  RESTRICTED SOVEREIGN PORTAL
                </span>
                <span className="text-slate-400 font-mono text-[10px]">AUTH ENCRYPTION: AES-256</span>
              </div>
              <h2 className="text-lg font-black text-white font-mono uppercase tracking-tight">
                Admin Only Account Login & Permissions Matrix
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.play('click');
              onClose();
            }}
            className="p-1.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
          {/* Active Session Status */}
          <div className="p-4 bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Current Security Clearance Status</span>
              {currentSession.isAuthenticated && currentSession.activeAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-bold uppercase text-sm">
                    {currentSession.activeAdmin.username} ({currentSession.activeAdmin.role.toUpperCase()})
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px]">
                    Level {currentSession.securityClearanceLevel} Root Access
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-red-400 font-bold uppercase text-sm">No Active Admin Session</span>
                </div>
              )}
            </div>

            {currentSession.isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Revoke & Logout</span>
              </button>
            )}
          </div>

          {/* Preset Admin Accounts Quick Selector */}
          <div className="space-y-2">
            <label className="text-slate-400 font-bold uppercase text-[10px] block">
              1. Select Preset Admin Account Login Details:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getAllAdminAccounts().map((acc) => {
                const isSelected = selectedAccount?.id === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => handlePresetSelect(acc)}
                    className={`p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-500 text-sky-200 ring-1 ring-sky-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        {acc.username}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-amber-300 text-[9px] uppercase font-bold">
                        {acc.role}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-0.5">
                      <div>Code: <code className="text-sky-300 font-bold">{acc.loginCode}</code></div>
                      <div>Passcode: <code className="text-emerald-300 font-bold">{acc.passcode}</code></div>
                      <div>Pin: <code className="text-amber-300 font-bold">{acc.securityPin}</code></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Credentials Input */}
          <form onSubmit={handleLogin} className="p-4 bg-slate-950 border border-slate-800 space-y-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] block border-b border-slate-800 pb-2">
              2. Enter Admin Security Credentials & PIN:
            </span>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/40 text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Login Code / Email</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 pl-8 pr-3 py-1.5 text-xs text-slate-100 font-mono focus:border-sky-500 outline-none"
                    placeholder="e.g. SG1-ARCHON-9000"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Passcode</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 pl-8 pr-8 py-1.5 text-xs text-slate-100 font-mono focus:border-sky-500 outline-none"
                    placeholder="Passcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Security PIN (4-Digit)</label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 pl-8 pr-3 py-1.5 text-xs text-slate-100 font-mono focus:border-sky-500 outline-none"
                    placeholder="e.g. 9901"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate & Grant Admin Access</span>
            </button>
          </form>

          {/* Active Admin Permissions Matrix Summary */}
          {selectedAccount && (
            <div className="p-4 bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-slate-400 font-bold uppercase text-[10px] block border-b border-slate-800 pb-2">
                3. Permissions Matrix Assigned to {selectedAccount.username} ({selectedAccount.permissions.length} Active Grants):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ADMIN_PERMISSIONS_REGISTRY.map((perm) => {
                  const isGranted = selectedAccount.permissions.includes(perm.key);
                  return (
                    <div
                      key={perm.key}
                      className={`p-2 border flex items-center justify-between text-[11px] ${
                        isGranted
                          ? 'bg-slate-900 border-slate-700 text-slate-200'
                          : 'bg-slate-950/50 border-slate-900 text-slate-600 line-through'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isGranted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        <span>{perm.label}</span>
                      </span>

                      <span className="text-[9px] px-1 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                        {perm.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Security Audit Logs Enabled · IP Tracked</span>
          <button
            onClick={() => {
              sound.play('click');
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase cursor-pointer"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};

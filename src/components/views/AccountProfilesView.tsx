import React, { useState } from 'react';
import {
  User,
  Shield,
  Award,
  Key,
  LogOut,
  Settings,
  Check,
  RefreshCw,
  Copy,
  AlertTriangle,
  FolderOpen,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { sound } from '../../sound';
import { PlayerProfile, RaceId } from '../../types';
import {
  COMMANDER_AVATARS,
  COMMANDER_TITLES,
  INITIAL_PROFILE_SLOTS,
  INITIAL_CAREER_STATS,
} from '../../accountProfilesData';
import { CANONICAL_ADMIN_ACCOUNTS, getAdminAuthSession } from '../../config/adminAuthConfig';
import { auth, loginWithGoogle, logoutUser } from '../../firebase';

interface AccountProfilesViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (updates: Partial<PlayerProfile>) => void;
  onLogout?: () => void;
}

export const AccountProfilesView: React.FC<AccountProfilesViewProps> = ({
  profile,
  onUpdateProfile,
  onLogout,
}) => {
  // Profiles slots
  const [profileSlots, setProfileSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_state_commander_slots');
      return saved ? JSON.parse(saved) : INITIAL_PROFILE_SLOTS;
    } catch {
      return INITIAL_PROFILE_SLOTS;
    }
  });

  const [careerStats] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_state_career_stats');
      return saved ? JSON.parse(saved) : INITIAL_CAREER_STATS;
    } catch {
      return INITIAL_CAREER_STATS;
    }
  });

  const [activeSubTab, setActiveSubTab] = useState<'dossier' | 'slots' | 'career' | 'security'>('dossier');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarUrl || '👨‍✈️');
  const [selectedTitle, setSelectedTitle] = useState(profile.title || 'Fleet Commander');
  const [commanderName, setCommanderName] = useState(profile.name || 'Commander Tanang');
  const [motto, setMotto] = useState('Through the Event Horizon to Victory');
  const [notification, setNotification] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [vacationMode, setVacationMode] = useState(false);

  const showMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Save profile changes
  const handleSaveDossier = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: commanderName,
      displayName: commanderName,
      username: commanderName,
      title: selectedTitle,
      avatarUrl: selectedAvatar,
    });
    sound.play('confirm');
    showMsg('Commander credentials & insignia successfully updated in Galactica Command!');
  };

  // Switch Profile Slot
  const handleSwitchSlot = (slotId: string) => {
    const updated = profileSlots.map((s: any) => ({
      ...s,
      isActive: s.id === slotId,
    }));
    setProfileSlots(updated);
    localStorage.setItem('uc_state_commander_slots', JSON.stringify(updated));

    const active = updated.find((s: any) => s.id === slotId);
    if (active) {
      onUpdateProfile({
        name: active.commanderName,
        displayName: active.commanderName,
        username: active.commanderName,
        title: active.title,
        race: active.race,
        avatarUrl: active.avatarUrl,
      });
      setCommanderName(active.commanderName);
      setSelectedTitle(active.title);
      setSelectedAvatar(active.avatarUrl);
    }

    sound.play('success');
    showMsg(`Switched to active profile: ${active?.commanderName} [Slot ${active?.slotNumber}]`);
  };

  // Logout handler
  const handlePerformLogout = () => {
    sound.play('warning');
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    } else {
      // Clear session indicator and reload
      localStorage.removeItem('uc_session_token');
      sessionStorage.clear();
      showMsg('Securely logging out of subspace session...');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div id="account-profiles-view" className="space-y-6">
      {/* Header Banner */}
      <div className="border border-[#dedede] bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
            COMMANDER CENTRAL REGISTRY
          </div>
          <h2 className="text-2xl font-bold text-[#111111] flex items-center gap-3">
            <span>Empire Profile & Identity Archive</span>
            <span className="text-xs bg-[#111111] text-white px-2.5 py-0.5 font-mono uppercase">
              Subspace Verified
            </span>
          </h2>
          <p className="text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
            Manage multi-slot commander dossiers, customize galactic titles and insignia, inspect lifetime combat
            records, and configure high-security subspace credentials.
          </p>
        </div>

        {/* Global Logout Button */}
        <button
          type="button"
          id="btn-account-logout-header"
          onClick={() => {
            sound.play('click');
            setShowLogoutModal(true);
          }}
          className="px-4 py-2.5 bg-[#dc2626] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b91c1c] transition-colors flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <LogOut size={14} />
          <span>Log Out Session</span>
        </button>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div className="p-4 border border-[#111111] bg-[#fafafa] text-xs font-semibold text-[#111111] border-l-4 flex items-center justify-between">
          <span>{notification}</span>
          <button type="button" onClick={() => setNotification(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Subtabs */}
      <div className="flex border-b border-[#dedede] gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('dossier')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeSubTab === 'dossier'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Commander Dossier
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('slots')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeSubTab === 'slots'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Character Slots (3)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('career')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeSubTab === 'career'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Lifetime Career Stats
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('security')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeSubTab === 'security'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Security & Terminate
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. COMMANDER DOSSIER */}
      {/* ============================================================ */}
      {activeSubTab === 'dossier' && (
        <form onSubmit={handleSaveDossier} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Identity Card */}
            <div className="border border-[#dedede] bg-white p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#f5f5f5] border-2 border-[#111111] flex items-center justify-center text-5xl mb-4 shadow-sm">
                {selectedAvatar}
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#eeeeee] px-2 py-0.5 text-[#555555] mb-2">
                {selectedTitle}
              </span>
              <h3 className="text-xl font-bold text-[#111111]">{commanderName}</h3>
              <p className="text-xs text-[#777777] mt-1 font-mono uppercase">
                Species: {profile.race.toUpperCase()} • Level {profile.level}
              </p>

              <div className="mt-6 w-full pt-4 border-t border-[#eeeeee] text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#888888]">Stargate Code:</span>
                  <span className="font-mono font-bold text-[#111111]">P3X-982-TAU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Homeworld:</span>
                  <span className="font-mono font-bold text-[#111111]">{profile.planetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Empire Honor:</span>
                  <span className="font-mono font-bold text-[#111111]">14,250 Points</span>
                </div>
              </div>
            </div>

            {/* Customization Settings */}
            <div className="lg:col-span-2 border border-[#dedede] bg-white p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-[#111111] mb-1.5">
                  Commander Call-Sign
                </label>
                <input
                  type="text"
                  value={commanderName}
                  onChange={(e) => setCommanderName(e.target.value)}
                  className="w-full border border-[#dedede] p-2.5 text-sm font-mono focus:border-[#111111] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#111111] mb-1.5">
                  Military Title
                </label>
                <select
                  value={selectedTitle}
                  onChange={(e) => setSelectedTitle(e.target.value)}
                  className="w-full border border-[#dedede] p-2.5 text-sm font-mono focus:border-[#111111] outline-none bg-white"
                >
                  {COMMANDER_TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#111111] mb-1.5">
                  Imperial Doctrine Motto
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full border border-[#dedede] p-2.5 text-sm font-mono focus:border-[#111111] outline-none"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#111111] mb-2">
                  Holographic Commander Avatar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {COMMANDER_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.icon)}
                      className={`p-3 border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        selectedAvatar === av.icon
                          ? 'border-[#111111] bg-[#f5f5f5] scale-105'
                          : 'border-[#dedede] hover:border-[#999999]'
                      }`}
                      title={`${av.name}: ${av.description}`}
                    >
                      <span className="text-3xl">{av.icon}</span>
                      <span className="text-[9px] text-[#666666] font-mono mt-1 truncate w-full text-center">
                        {av.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#eeeeee] flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  Save Credentials
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* 2. CHARACTER SAVE SLOTS */}
      {/* ============================================================ */}
      {activeSubTab === 'slots' && (
        <div className="space-y-6">
          <div className="border border-[#dedede] bg-white p-6">
            <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-2">
              Multi-Commander Save Slots
            </h3>
            <p className="text-xs text-[#666666] mb-6">
              Switch seamlessly between sovereign empires. Each slot maintains independent fleets, colonies, and
              conquest progress.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profileSlots.map((slot: any) => (
                <div
                  key={slot.id}
                  className={`border p-5 flex flex-col justify-between transition-all ${
                    slot.isActive
                      ? 'border-[#111111] bg-[#fafafa] ring-2 ring-[#111111]'
                      : 'border-[#dedede] bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold bg-[#eeeeee] px-2 py-0.5 text-[#555555]">
                        SLOT {slot.slotNumber}
                      </span>
                      {slot.isActive ? (
                        <span className="text-[10px] font-black uppercase text-[#16a34a] flex items-center gap-1">
                          <Check size={12} /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#888888] font-mono">{slot.lastPlayed}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{slot.avatarUrl}</span>
                      <div>
                        <h4 className="font-bold text-sm text-[#111111]">{slot.commanderName}</h4>
                        <span className="text-xs text-[#666666] block">{slot.title}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-mono border-t border-[#eeeeee] pt-3">
                      <div className="flex justify-between text-[#777777]">
                        <span>Faction:</span>
                        <span className="text-[#111111] uppercase font-bold">{slot.race}</span>
                      </div>
                      <div className="flex justify-between text-[#777777]">
                        <span>Colonies:</span>
                        <span className="text-[#111111]">{slot.planetsCount} Worlds</span>
                      </div>
                      <div className="flex justify-between text-[#777777]">
                        <span>Fleet Power:</span>
                        <span className="text-[#111111]">{slot.fleetScore.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#eeeeee]">
                    <button
                      type="button"
                      onClick={() => handleSwitchSlot(slot.id)}
                      disabled={slot.isActive}
                      className={`w-full py-2 text-xs font-bold uppercase transition-colors cursor-pointer ${
                        slot.isActive
                          ? 'bg-[#111111] text-white cursor-default'
                          : 'border border-[#dedede] text-[#111111] hover:bg-[#f0f0f0]'
                      }`}
                    >
                      {slot.isActive ? 'Active Empire' : 'Switch To Slot →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. CAREER STATISTICS */}
      {/* ============================================================ */}
      {activeSubTab === 'career' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-1">
              Lifetime Military Dossier
            </h3>
            <p className="text-xs text-[#666666]">
              Verified audit logs transmitted from the High Council of Stargate Command.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="border border-[#dedede] p-4 bg-[#fafafa]">
              <span className="text-[10px] font-bold text-[#777777] uppercase block mb-1">Total Engagements</span>
              <span className="text-2xl font-bold font-mono text-[#111111]">{careerStats.totalBattles}</span>
            </div>
            <div className="border border-[#dedede] p-4 bg-[#fafafa]">
              <span className="text-[10px] font-bold text-[#777777] uppercase block mb-1">Fleet Victories</span>
              <span className="text-2xl font-bold font-mono text-[#16a34a]">{careerStats.victories}</span>
            </div>
            <div className="border border-[#dedede] p-4 bg-[#fafafa]">
              <span className="text-[10px] font-bold text-[#777777] uppercase block mb-1">Combat Win Rate</span>
              <span className="text-2xl font-bold font-mono text-[#111111]">{careerStats.winRate}%</span>
            </div>
            <div className="border border-[#dedede] p-4 bg-[#fafafa]">
              <span className="text-[10px] font-bold text-[#777777] uppercase block mb-1">Naquadah Looted</span>
              <span className="text-2xl font-bold font-mono text-[#111111]">
                {(careerStats.totalLootNaquadah / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="border border-[#dedede] p-4 bg-[#fafafa]">
              <span className="text-[10px] font-bold text-[#777777] uppercase block mb-1">Colonies Established</span>
              <span className="text-2xl font-bold font-mono text-[#111111]">{careerStats.planetsColonized}</span>
            </div>
            <div className="border border-[#dedede] p-4 bg-[#fafafa]">
              <span className="text-[10px] font-bold text-[#777777] uppercase block mb-1">Moons Discovered</span>
              <span className="text-2xl font-bold font-mono text-[#111111]">{careerStats.moonsDiscovered}</span>
            </div>
            <div className="border border-[#dedede] p-4 bg-[#fafafa]">
              <span className="text-[10px] font-bold text-[#777777] uppercase block mb-1">Stargates Dialed</span>
              <span className="text-2xl font-bold font-mono text-[#111111]">{careerStats.stargatesDialed}</span>
            </div>
            <div className="border border-[#dedede] p-4 bg-[#fafafa]">
              <span className="text-[10px] font-bold text-[#777777] uppercase block mb-1">Dark Matter Harvested</span>
              <span className="text-2xl font-bold font-mono text-[#6366f1]">
                {careerStats.darkMatterEarned.toLocaleString()} DM
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. SECURITY & LOGOUT */}
      {/* ============================================================ */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          <div className="border border-[#dedede] bg-white p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-1">
                Subspace Security & Session Controls
              </h3>
              <p className="text-xs text-[#666666]">
                Configure encryption layers and terminate active tactical sessions across all terminals.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              {/* Cloud Sync Status */}
              <div className="border border-[#dedede] p-4 flex items-center justify-between bg-neutral-50/50">
                <div>
                  <h4 className="font-bold text-xs text-[#111111] uppercase flex items-center gap-1.5">
                    <Cloud size={14} className={auth.currentUser ? 'text-emerald-600' : 'text-neutral-500'} />
                    Firestore Cloud Database Sync
                  </h4>
                  <p className="text-[11px] text-[#777777]">
                    {auth.currentUser
                      ? `Connected as ${auth.currentUser.email} (All turns & fleets synced)`
                      : 'Not signed in to Google. Empire progress is stored locally in this browser.'}
                  </p>
                </div>
                {auth.currentUser ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await logoutUser();
                      showMsg('Disconnected from Google Cloud Sync.');
                    }}
                    className="px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer border border-[#dedede] bg-white text-[#777777] hover:text-[#111111]"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        sound.play('confirm');
                        const u = await loginWithGoogle();
                        if (u) {
                          showMsg(`Connected to Google Cloud: ${u.email}`);
                          onUpdateProfile({ email: u.email || profile.email });
                        }
                      } catch (e) {
                        sound.play('warning');
                        showMsg('Sign-in cancelled or failed.');
                      }
                    }}
                    className="px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer bg-[#111111] text-white hover:bg-neutral-800"
                  >
                    Connect Google
                  </button>
                )}
              </div>

              <div className="border border-[#dedede] p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#111111] uppercase">Subspace 2FA Biometric Lock</h4>
                  <p className="text-[11px] text-[#777777]">Require iris scan confirmation on fleet dispatches</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
                    twoFactorEnabled ? 'bg-[#111111] text-white' : 'bg-[#eeeeee] text-[#777777]'
                  }`}
                >
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="border border-[#dedede] p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#111111] uppercase">Vacation Mode Protection</h4>
                  <p className="text-[11px] text-[#777777]">
                    Freezes resource mining and prevents incoming hostile fleet attacks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVacationMode(!vacationMode);
                    showMsg(`Vacation Mode ${!vacationMode ? 'Activated' : 'Deactivated'}.`);
                  }}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
                    vacationMode ? 'bg-[#16a34a] text-white' : 'bg-[#eeeeee] text-[#777777]'
                  }`}
                >
                  {vacationMode ? 'Active (Protected)' : 'Inactive'}
                </button>
              </div>
            </div>

            {/* Restricted Admin Only Account Login Details Vault (Shown only to Admin Users) */}
            {(() => {
              const adminSession = getAdminAuthSession();
              const isAdminUser = profile.role === 'admin' || profile.isAdmin === true || (adminSession && adminSession.isAuthenticated);
              if (!isAdminUser) return null;
              return (
                <div className="border border-slate-800 bg-slate-900 p-5 text-slate-100 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-amber-400 uppercase flex items-center gap-1.5">
                      <Shield size={16} /> Restricted Admin-Only Accounts Vault
                    </span>
                    <span className="text-[10px] text-slate-400">Clearance: Root Admin</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Registered system administrator login codes, passcodes, and security clearance permissions:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    {CANONICAL_ADMIN_ACCOUNTS.map((acc) => (
                      <div
                        key={acc.id}
                        className={`p-3 border space-y-1.5 ${
                          acc.role === 'super_admin'
                            ? 'bg-slate-950 border-amber-500/40 ring-1 ring-amber-500/20'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-white font-bold flex items-center gap-1.5">
                            {acc.role === 'super_admin' && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            )}
                            {acc.username}
                          </strong>
                          <span
                            className={`px-1.5 py-0.2 text-[9px] uppercase font-bold border ${
                              acc.role === 'super_admin'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {acc.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">Title: {acc.title}</div>
                        <div className="text-[10px] text-slate-300 flex flex-wrap items-center gap-2">
                          <span>
                            Login Code: <code className="text-sky-300 font-bold">{acc.loginCode}</code>
                          </span>
                          <span>
                            Passcode: <code className="text-emerald-300 font-bold">{acc.passcode}</code>
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                          <span>
                            PIN: <code className="text-amber-300 font-bold">{acc.securityPin}</code>
                          </span>
                          <span className="text-slate-500">{acc.permissions.length} Grants</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Prominent Session Termination Section */}
            <div className="pt-6 border-t border-[#eeeeee]">
              <div className="border border-red-200 bg-red-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-red-900 uppercase flex items-center gap-2">
                    <LogOut size={16} /> Terminate Active Commander Session
                  </h4>
                  <p className="text-xs text-red-700 mt-1">
                    Disconnect this terminal from the Galactica Command relay and clear ephemeral session tokens.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-perform-logout-action"
                  onClick={() => setShowLogoutModal(true)}
                  className="px-6 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer shrink-0"
                >
                  Log Out Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#111111] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider">
                Confirm Commander Logout
              </h3>
            </div>

            <p className="text-xs text-[#555555] leading-relaxed">
              Are you sure you wish to log out of <strong>{commanderName}</strong>? All active fleets and orbital
              queues will remain safe in simulated background time until you reconnect.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#eeeeee]">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-xs font-bold uppercase border border-[#dedede] text-[#555555] hover:bg-[#f0f0f0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePerformLogout}
                className="px-5 py-2 text-xs font-bold uppercase bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Confirm Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

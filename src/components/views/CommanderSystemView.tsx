import React, { useState, useEffect } from 'react';
import {
  Shield,
  Zap,
  Award,
  Users,
  Cpu,
  Star,
  RotateCcw,
  Plus,
  Check,
  ChevronRight,
  TrendingUp,
  Crosshair,
  Layers,
  Sparkles,
  Info,
  Sliders,
  Radio,
  Lock,
} from 'lucide-react';
import { sound } from '../../sound';
import { PlayerProfile, PlayerResources } from '../../types';
import {
  COMMANDER_CLASSES,
  CommanderClassId,
  INITIAL_OFFICERS,
  Officer,
  INITIAL_COMMANDER_TALENTS,
  CommanderTalent,
  INITIAL_COMMANDER_IMPLANTS,
  CommanderImplant,
  INITIAL_COMMANDER_MEDALS,
  CommanderMedal,
} from '../../commanderData';
import { CommanderGachaStorePanel } from './commander/CommanderGachaStorePanel';

interface CommanderSystemViewProps {
  profile: PlayerProfile;
  resources: PlayerResources;
  onUpdateResources: (updates: Partial<PlayerResources>) => void;
  onUpdateProfile?: (updates: Partial<PlayerProfile>) => void;
}

export const CommanderSystemView: React.FC<CommanderSystemViewProps> = ({
  profile,
  resources,
  onUpdateResources,
  onUpdateProfile,
}) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'officers' | 'gacha-72' | 'talents' | 'specialization' | 'implants' | 'medals'>(
    'officers'
  );

  // Commander Class
  const [selectedClassId, setSelectedClassId] = useState<CommanderClassId>(() => {
    try {
      const saved = localStorage.getItem('uc_state_commander_class');
      return (saved as CommanderClassId) || 'admiral';
    } catch {
      return 'admiral';
    }
  });

  // Officers State
  const [officers, setOfficers] = useState<Officer[]>(() => {
    try {
      const saved = localStorage.getItem('uc_state_officers');
      return saved ? JSON.parse(saved) : INITIAL_OFFICERS;
    } catch {
      return INITIAL_OFFICERS;
    }
  });

  // Talents State
  const [talents, setTalents] = useState<CommanderTalent[]>(() => {
    try {
      const saved = localStorage.getItem('uc_state_commander_talents');
      return saved ? JSON.parse(saved) : INITIAL_COMMANDER_TALENTS;
    } catch {
      return INITIAL_COMMANDER_TALENTS;
    }
  });

  // Implants State
  const [implants, setImplants] = useState<CommanderImplant[]>(() => {
    try {
      const saved = localStorage.getItem('uc_state_commander_implants');
      return saved ? JSON.parse(saved) : INITIAL_COMMANDER_IMPLANTS;
    } catch {
      return INITIAL_COMMANDER_IMPLANTS;
    }
  });

  // Medals
  const [medals] = useState<CommanderMedal[]>(() => {
    try {
      const saved = localStorage.getItem('uc_state_commander_medals');
      return saved ? JSON.parse(saved) : INITIAL_COMMANDER_MEDALS;
    } catch {
      return INITIAL_COMMANDER_MEDALS;
    }
  });

  // Level & XP
  const commanderLevel = profile.level || 18;
  const currentXp = 14250;
  const nextLevelXp = 20000;
  const xpPercent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  // Calculate allocated talent points vs available
  const totalTalentPoints = commanderLevel;
  const allocatedPoints = talents.reduce((sum, t) => sum + t.currentPoints, 0);
  const availableTalentPoints = Math.max(0, totalTalentPoints - allocatedPoints);

  const [notification, setNotification] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const activeClass = COMMANDER_CLASSES.find((c) => c.id === selectedClassId) || COMMANDER_CLASSES[0];

  // Switch Specialization
  const handleSelectClass = (classId: CommanderClassId) => {
    setSelectedClassId(classId);
    localStorage.setItem('uc_state_commander_class', classId);
    sound.play('confirm');
    showMsg(`Commander doctrine shifted to ${COMMANDER_CLASSES.find((c) => c.id === classId)?.name}!`);
  };

  // Hire or Promote Officer
  const handleHireOrPromoteOfficer = (officerId: string) => {
    const officer = officers.find((o) => o.id === officerId);
    if (!officer) return;

    if (resources.naquadah < officer.hireCostNaquadah) {
      sound.play('warning');
      showMsg(`Insufficient Naquadah! Requires ${officer.hireCostNaquadah.toLocaleString()} NQ.`);
      return;
    }
    if ((resources.darkMatter ?? 2500) < officer.hireCostDarkMatter) {
      sound.play('warning');
      showMsg(`Insufficient Dark Matter! Requires ${officer.hireCostDarkMatter.toLocaleString()} DM.`);
      return;
    }

    // Deduct resources
    onUpdateResources({
      naquadah: resources.naquadah - officer.hireCostNaquadah,
      darkMatter: (resources.darkMatter ?? 2500) - officer.hireCostDarkMatter,
    });

    const updated = officers.map((o) => {
      if (o.id === officerId) {
        const newLevel = o.isActive ? Math.min(o.maxLevel, o.level + 1) : o.level;
        return {
          ...o,
          isActive: true,
          level: newLevel,
          hiredUntil: 'Permanent High Command Commission',
        };
      }
      return o;
    });

    setOfficers(updated);
    localStorage.setItem('uc_state_officers', JSON.stringify(updated));
    sound.play('success');
    showMsg(`${officer.name} commissioned to Imperial High Command!`);
  };

  // Add Point to Talent
  const handleInvestTalent = (talentId: string) => {
    if (availableTalentPoints <= 0) {
      sound.play('warning');
      showMsg('No available Talent Points! Level up your commander to earn more.');
      return;
    }

    const talent = talents.find((t) => t.id === talentId);
    if (!talent || talent.currentPoints >= talent.maxPoints) {
      sound.play('warning');
      showMsg('Talent has already reached maximum rank!');
      return;
    }

    const updated = talents.map((t) =>
      t.id === talentId ? { ...t, currentPoints: t.currentPoints + 1 } : t
    );
    setTalents(updated);
    localStorage.setItem('uc_state_commander_talents', JSON.stringify(updated));
    sound.play('confirm');
    showMsg(`Rank increased in ${talent.name}!`);
  };

  // Reset Talents
  const handleResetTalents = () => {
    const updated = talents.map((t) => ({ ...t, currentPoints: 0 }));
    setTalents(updated);
    localStorage.setItem('uc_state_commander_talents', JSON.stringify(updated));
    sound.play('confirm');
    showMsg('All Commander Talent points have been refunded and reset!');
  };

  // Toggle Implant
  const handleToggleImplant = (implantId: string) => {
    const updated = implants.map((imp) => {
      if (imp.id === implantId) {
        return { ...imp, isEquipped: !imp.isEquipped };
      }
      return imp;
    });
    setImplants(updated);
    localStorage.setItem('uc_state_commander_implants', JSON.stringify(updated));
    sound.play('confirm');
    const changed = updated.find((i) => i.id === implantId);
    showMsg(`${changed?.name} ${changed?.isEquipped ? 'equipped' : 'stored in armory'}.`);
  };

  return (
    <div id="commander-system-view" className="space-y-6">
      {/* 1. COMMANDER SYSTEM HEADER */}
      <div className="border border-[#dedede] bg-white p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar, Name, Level, Rank */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#111111] bg-neutral-100 flex items-center justify-center text-3xl sm:text-4xl shadow-xs shrink-0">
              {profile.avatarUrl || '👨‍✈️'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-[#888888] tracking-widest uppercase">
                  MILITARY HIGH COMMAND · LEVEL {commanderLevel}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold border uppercase ${activeClass.badgeColor}`}>
                  {activeClass.name}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#111111] mt-0.5 font-mono">
                {profile.name || 'Commander Tanang'}
              </h2>
              <div className="text-xs text-[#555555] font-mono mt-1 flex items-center gap-3">
                <span>Rank: <strong className="text-[#111111]">{profile.rankName || 'Imperator'}</strong></span>
                <span>•</span>
                <span>Service Score: <strong className="text-[#111111]">145,000 PTS</strong></span>
              </div>
            </div>
          </div>

          {/* Right: XP Bar & Talent Points Reservoir */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border border-[#dedede] bg-[#fafafa] p-4">
            {/* XP Gauge */}
            <div className="space-y-1.5 min-w-[180px]">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#777777] font-bold uppercase text-[10px]">Commander XP</span>
                <span className="font-bold text-[#111111]">
                  {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 bg-[#e5e5e5] overflow-hidden">
                <div className="h-full bg-[#111111] transition-all duration-300" style={{ width: `${xpPercent}%` }} />
              </div>
              <div className="text-[10px] text-[#888888] text-right font-mono">
                {nextLevelXp - currentXp} XP to Level {commanderLevel + 1}
              </div>
            </div>

            {/* Available Talent Points Counter */}
            <div className="border-t sm:border-t-0 sm:border-l border-[#dedede] pt-3 sm:pt-0 sm:pl-4 text-center sm:text-left">
              <span className="text-[10px] text-[#777777] font-bold uppercase block">Talent Points</span>
              <strong className="text-2xl font-black font-mono text-emerald-700">
                {availableTalentPoints}
              </strong>
              <small className="block text-[10px] text-[#888888]">Available to assign</small>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3 bg-[#111111] text-white text-xs font-mono flex items-center justify-between border-l-4 border-emerald-500 shadow-md">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* 2. NAVIGATION SUB-TABS */}
      <div className="flex border-b border-[#dedede] bg-white overflow-x-auto text-xs font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('officers')}
          className={`px-4 sm:px-6 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'officers'
              ? 'border-[#111111] text-[#111111] bg-neutral-50'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Users size={14} />
          <span>High Command Officers</span>
          <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 font-mono">
            {officers.filter((o) => o.isActive).length}/{officers.length}
          </span>
        </button>

        <button
          type="button"
          id="tab-btn-commander-gacha-72"
          onClick={() => {
            sound.play('click');
            setActiveTab('gacha-72');
          }}
          className={`px-4 sm:px-6 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'gacha-72'
              ? 'border-[#111111] text-[#111111] bg-neutral-50'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Sparkles size={14} className="text-amber-500" />
          <span>72 Commanders & Gotcha Nexus</span>
          <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 font-bold uppercase">
            NEW
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('talents')}
          className={`px-4 sm:px-6 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'talents'
              ? 'border-[#111111] text-[#111111] bg-neutral-50'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Sliders size={14} />
          <span>Talent Tree Matrix</span>
          {availableTalentPoints > 0 && (
            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 font-mono animate-pulse">
              +{availableTalentPoints}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specialization')}
          className={`px-4 sm:px-6 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'specialization'
              ? 'border-[#111111] text-[#111111] bg-neutral-50'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Crosshair size={14} />
          <span>Doctrine & Specializations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('implants')}
          className={`px-4 sm:px-6 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'implants'
              ? 'border-[#111111] text-[#111111] bg-neutral-50'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Cpu size={14} />
          <span>Cybernetic Implants</span>
          <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 font-mono">
            {implants.filter((i) => i.isEquipped).length}/4
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('medals')}
          className={`px-4 sm:px-6 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'medals'
              ? 'border-[#111111] text-[#111111] bg-neutral-50'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Award size={14} />
          <span>Honors & Medals</span>
          <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 font-mono">
            {medals.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: 72 COMMANDERS & GOTCHA NEXUS */}
      {/* ========================================================================= */}
      {activeTab === 'gacha-72' && (
        <CommanderGachaStorePanel
          resources={resources}
          onUpdateResources={onUpdateResources}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: HIGH COMMAND & IMPERIAL OFFICERS */}
      {/* ========================================================================= */}
      {activeTab === 'officers' && (
        <div className="space-y-4">
          <div className="border border-[#dedede] bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#111111] text-base">Imperial High Command Staff</h3>
              <p className="text-xs text-[#666666]">
                Commission legendary officers into your staff to gain passive fleet, planetary, and technological bonuses.
              </p>
            </div>
            <div className="text-xs font-mono text-[#555555] bg-[#fafafa] border border-[#dedede] px-3 py-1.5">
              Treasury: <strong className="text-[#111111]">{resources.naquadah.toLocaleString()} NQ</strong> |{' '}
              <strong className="text-purple-700">{(resources.darkMatter ?? 2500).toLocaleString()} DM</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officers.map((officer) => (
              <div
                key={officer.id}
                className={`border p-5 bg-white transition-all flex flex-col justify-between ${
                  officer.isActive ? 'border-[#111111] shadow-xs' : 'border-[#dedede] opacity-85'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 border border-[#dedede] bg-neutral-100 flex items-center justify-center text-2xl">
                        {officer.avatar}
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-[#777777] uppercase tracking-wider block font-mono">
                          {officer.callsign} · {officer.race}
                        </span>
                        <h4 className="font-bold text-sm text-[#111111]">{officer.name}</h4>
                        <span className="text-[11px] text-[#555555]">{officer.role}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${
                        officer.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                      }`}
                    >
                      {officer.isActive ? `ACTIVE LV ${officer.level}` : 'UNCOMMISSIONED'}
                    </span>
                  </div>

                  <p className="text-[11px] italic text-[#666666] my-3 border-l-2 border-[#dedede] pl-2">
                    "{officer.quote}"
                  </p>

                  <div className="space-y-1.5 my-3 pt-2 border-t border-[#eeeeee]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] block">
                      Commission Bonuses:
                    </span>
                    {officer.bonuses.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-[#111111]">
                        <Check size={12} className="text-emerald-600 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#eeeeee] mt-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#666666] mb-2">
                    <span>Commission Cost:</span>
                    <span className="font-bold text-[#111111]">
                      {officer.hireCostNaquadah.toLocaleString()} NQ + {officer.hireCostDarkMatter} DM
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleHireOrPromoteOfficer(officer.id)}
                    className={`w-full py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                      officer.isActive
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-[#111111] border border-[#dedede]'
                        : 'bg-[#111111] hover:bg-[#333333] text-white'
                    }`}
                  >
                    {officer.isActive ? `Promote Officer to Rank ${officer.level + 1}` : 'Commission Officer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TALENT TREE MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'talents' && (
        <div className="space-y-4">
          <div className="border border-[#dedede] bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#111111] text-base">Commander Talent Tree Matrix</h3>
              <p className="text-xs text-[#666666]">
                Invest earned talent points into Warfare, Planetary Industry, or Deep Space Exploration.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5">
                Points Available: {availableTalentPoints}
              </span>
              <button
                type="button"
                onClick={handleResetTalents}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-[#555555] hover:text-[#111111] border border-[#dedede] hover:border-[#111111] bg-white cursor-pointer transition-colors"
              >
                <RotateCcw size={12} />
                <span>Reset Matrix</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Warfare Branch */}
            <div className="border border-[#dedede] bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#dedede] pb-2">
                <span className="font-bold text-sm text-[#111111] flex items-center gap-1.5">
                  <span>⚔️</span>
                  <span>Naval Warfare & Tactics</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 border border-rose-200">
                  Combat Tree
                </span>
              </div>

              <div className="space-y-3">
                {talents
                  .filter((t) => t.branch === 'warfare')
                  .map((talent) => (
                    <div
                      key={talent.id}
                      className="border border-[#dedede] p-3 bg-[#fafafa] hover:border-[#111111] transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{talent.icon}</span>
                          <div>
                            <h5 className="font-bold text-xs text-[#111111]">{talent.name}</h5>
                            <span className="text-[10px] text-[#777777] font-mono">
                              Tier {talent.tier}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#111111] bg-white border border-[#dedede] px-2 py-0.5">
                          {talent.currentPoints}/{talent.maxPoints}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#666666] leading-snug">{talent.description}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#eeeeee]">
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          {talent.bonusPerPoint}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInvestTalent(talent.id)}
                          disabled={availableTalentPoints <= 0 || talent.currentPoints >= talent.maxPoints}
                          className="px-2.5 py-1 bg-[#111111] hover:bg-[#333333] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          + Point
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Industry Branch */}
            <div className="border border-[#dedede] bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#dedede] pb-2">
                <span className="font-bold text-sm text-[#111111] flex items-center gap-1.5">
                  <span>⛏️</span>
                  <span>Planetary Industry & Mining</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
                  Economy Tree
                </span>
              </div>

              <div className="space-y-3">
                {talents
                  .filter((t) => t.branch === 'industry')
                  .map((talent) => (
                    <div
                      key={talent.id}
                      className="border border-[#dedede] p-3 bg-[#fafafa] hover:border-[#111111] transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{talent.icon}</span>
                          <div>
                            <h5 className="font-bold text-xs text-[#111111]">{talent.name}</h5>
                            <span className="text-[10px] text-[#777777] font-mono">
                              Tier {talent.tier}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#111111] bg-white border border-[#dedede] px-2 py-0.5">
                          {talent.currentPoints}/{talent.maxPoints}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#666666] leading-snug">{talent.description}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#eeeeee]">
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          {talent.bonusPerPoint}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInvestTalent(talent.id)}
                          disabled={availableTalentPoints <= 0 || talent.currentPoints >= talent.maxPoints}
                          className="px-2.5 py-1 bg-[#111111] hover:bg-[#333333] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          + Point
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Exploration Branch */}
            <div className="border border-[#dedede] bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#dedede] pb-2">
                <span className="font-bold text-sm text-[#111111] flex items-center gap-1.5">
                  <span>🌀</span>
                  <span>Deep Space & Intelligence</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 border border-cyan-200">
                  Expedition Tree
                </span>
              </div>

              <div className="space-y-3">
                {talents
                  .filter((t) => t.branch === 'exploration')
                  .map((talent) => (
                    <div
                      key={talent.id}
                      className="border border-[#dedede] p-3 bg-[#fafafa] hover:border-[#111111] transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{talent.icon}</span>
                          <div>
                            <h5 className="font-bold text-xs text-[#111111]">{talent.name}</h5>
                            <span className="text-[10px] text-[#777777] font-mono">
                              Tier {talent.tier}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#111111] bg-white border border-[#dedede] px-2 py-0.5">
                          {talent.currentPoints}/{talent.maxPoints}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#666666] leading-snug">{talent.description}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#eeeeee]">
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          {talent.bonusPerPoint}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInvestTalent(talent.id)}
                          disabled={availableTalentPoints <= 0 || talent.currentPoints >= talent.maxPoints}
                          className="px-2.5 py-1 bg-[#111111] hover:bg-[#333333] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          + Point
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DOCTRINES & SPECIALIZATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'specialization' && (
        <div className="space-y-4">
          <div className="border border-[#dedede] bg-white p-4">
            <h3 className="font-bold text-[#111111] text-base">Supreme Commander Doctrine</h3>
            <p className="text-xs text-[#666666]">
              Choose the primary strategic specialization of your commander. Each class radically boosts a core operational pillar of your civilization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMANDER_CLASSES.map((cls) => {
              const isCurrent = cls.id === selectedClassId;
              return (
                <div
                  key={cls.id}
                  className={`border p-5 bg-white transition-all flex flex-col justify-between ${
                    isCurrent ? 'border-[#111111] ring-2 ring-[#111111] shadow-xs' : 'border-[#dedede]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{cls.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-[#111111]">{cls.name}</h4>
                          <span className="text-[10px] font-mono text-[#777777] uppercase block">{cls.title}</span>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-[#111111] text-white">
                          ACTIVE DOCTRINE
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#666666] my-3 leading-relaxed">{cls.description}</p>

                    <div className="space-y-1.5 my-3 pt-2 border-t border-[#eeeeee]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] block">
                        Doctrinal Perks:
                      </span>
                      {cls.perks.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-[#111111]">
                          <Check size={12} className="text-emerald-600 shrink-0" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#eeeeee] mt-3">
                    <button
                      type="button"
                      onClick={() => handleSelectClass(cls.id)}
                      disabled={isCurrent}
                      className={`w-full py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-neutral-100 text-[#111111] border border-[#dedede] cursor-default'
                          : 'bg-[#111111] hover:bg-[#333333] text-white'
                      }`}
                    >
                      {isCurrent ? 'Active Specialization' : `Adopt ${cls.name} Doctrine`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CYBERNETIC IMPLANTS */}
      {/* ========================================================================= */}
      {activeTab === 'implants' && (
        <div className="space-y-4">
          <div className="border border-[#dedede] bg-white p-4">
            <h3 className="font-bold text-[#111111] text-base">Commander Cybernetic Augmentations</h3>
            <p className="text-xs text-[#666666]">
              Bio-neural implants recovered from ancient civilizations and Alteran archives. Equip up to 4 specialized augmentations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {implants.map((implant) => (
              <div
                key={implant.id}
                className={`border p-4 bg-white flex items-start justify-between gap-4 transition-all ${
                  implant.isEquipped ? 'border-[#111111] bg-neutral-50 shadow-xs' : 'border-[#dedede]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 border border-[#dedede] bg-white flex items-center justify-center text-2xl shrink-0">
                    {implant.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-[#777777] uppercase font-mono">
                        Slot: {implant.slot} · {implant.tier}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#111111]">{implant.name}</h4>
                    <p className="text-xs text-[#666666]">{implant.description}</p>
                    <div className="text-xs font-mono font-bold text-emerald-700 pt-1">
                      Effect: {implant.effect}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleImplant(implant.id)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shrink-0 ${
                    implant.isEquipped
                      ? 'bg-[#111111] text-white hover:bg-rose-700'
                      : 'bg-white border border-[#dedede] hover:border-[#111111] text-[#111111]'
                  }`}
                >
                  {implant.isEquipped ? 'Equipped ✓' : 'Equip'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HONORS & COMMENDATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'medals' && (
        <div className="space-y-4">
          <div className="border border-[#dedede] bg-white p-4">
            <h3 className="font-bold text-[#111111] text-base">Campaign Medals & Honors of Valor</h3>
            <p className="text-xs text-[#666666]">
              Decorations awarded by the Galactic High Council for distinguished service, strategic triumphs, and cosmic exploration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {medals.map((medal) => (
              <div key={medal.id} className="border border-[#dedede] bg-white p-4 text-center space-y-2">
                <div className="w-14 h-14 mx-auto border-2 border-[#111111] bg-neutral-100 flex items-center justify-center text-3xl shadow-xs">
                  {medal.icon}
                </div>
                <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wide">{medal.name}</h4>
                <p className="text-[11px] text-[#666666] leading-tight">{medal.criteria}</p>
                <div className="text-[10px] text-[#888888] font-mono pt-1 border-t border-[#eeeeee]">
                  Awarded: {medal.dateEarned}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

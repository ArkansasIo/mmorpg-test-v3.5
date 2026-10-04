import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Shield,
  Zap,
  Award,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Check,
  ChevronRight,
  Info,
  Scale,
  Crown,
  Building,
  Flag,
  Radio,
  Swords,
  Scroll,
} from 'lucide-react';
import { sound } from '../../sound';
import { Government, GovernmentEdict, PlayerProfile, PlayerResources } from '../../types';
import { GOVERNMENTS } from '../../gameData';

interface GovernmentSystemViewProps {
  profile: PlayerProfile;
  resources: PlayerResources;
  onChangeGovernment: (govId: string) => { success: boolean; message: string };
  onUpdateResources: (res: Partial<PlayerResources>) => void;
  onUpdateProfile: (updates: Partial<PlayerProfile>) => void;
  onNavigate?: (route: string) => void;
}

interface ActiveEdictRecord {
  edictId: string;
  govId: string;
  name: string;
  effect: string;
  activatedAt: string;
  expiresAt: string;
}

const STORAGE_KEY_ACTIVE_EDICTS = 'uc_active_government_edicts_v1';
const STORAGE_KEY_REFORM_HISTORY = 'uc_government_reform_history_v1';

export const GovernmentSystemView: React.FC<GovernmentSystemViewProps> = ({
  profile,
  resources,
  onChangeGovernment,
  onUpdateResources,
  onUpdateProfile,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'edicts' | 'analytics' | 'history'>('matrix');
  const [selectedGovId, setSelectedGovId] = useState<string>(profile.governmentId || 'democracy');
  const [archetypeFilter, setArchetypeFilter] = useState<string>('ALL');
  const [confirmModalGov, setConfirmModalGov] = useState<Government | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Active Edicts state
  const [activeEdicts, setActiveEdicts] = useState<ActiveEdictRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_EDICTS);
      if (saved) {
        const parsed: ActiveEdictRecord[] = JSON.parse(saved);
        // filter expired
        const now = Date.now();
        return parsed.filter((e) => new Date(e.expiresAt).getTime() > now);
      }
    } catch {
      // Fallback
    }
    return [
      {
        edictId: 'fed_trade_bill',
        govId: 'democracy',
        name: 'Interstellar Commerce Accord',
        effect: '+20% Trade Market Profits & Bank Interest',
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
      },
    ];
  });

  // Reform History State
  const [reformHistory, setReformHistory] = useState<Array<{ govId: string; name: string; date: string }>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REFORM_HISTORY);
      return saved ? JSON.parse(saved) : [
        { govId: profile.governmentId, name: GOVERNMENTS.find((g) => g.id === profile.governmentId)?.name || 'Sovereign Government', date: new Date().toISOString() },
      ];
    } catch {
      return [];
    }
  });

  // Save Edicts
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_EDICTS, JSON.stringify(activeEdicts));
  }, [activeEdicts]);

  // Current active government object
  const currentGov = GOVERNMENTS.find((g) => g.id === profile.governmentId) || GOVERNMENTS[0];
  const inspectedGov = GOVERNMENTS.find((g) => g.id === selectedGovId) || currentGov;

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Ratify new Constitution
  const handleRatify = (gov: Government) => {
    if (gov.id === profile.governmentId) return;

    sound.play('confirm');
    const res = onChangeGovernment(gov.id);
    if (res.success) {
      sound.play('success');
      showToast(`Constitution Ratified!`, `The empire is now governed under the ${gov.name}.`);

      const newHistory = [
        { govId: gov.id, name: gov.name, date: new Date().toISOString() },
        ...reformHistory.slice(0, 9),
      ];
      setReformHistory(newHistory);
      localStorage.setItem(STORAGE_KEY_REFORM_HISTORY, JSON.stringify(newHistory));
      setConfirmModalGov(null);
    } else {
      sound.play('warning');
      showToast(`Ratification Failed`, res.message);
    }
  };

  // Enact an edict
  const handleEnactEdict = (edict: GovernmentEdict, gov: Government) => {
    // Check if already active
    if (activeEdicts.some((e) => e.edictId === edict.id)) {
      showToast('Edict Already Enacted', `${edict.name} is already in active effect.`);
      return;
    }

    sound.play('success');
    const newActive: ActiveEdictRecord = {
      edictId: edict.id,
      govId: gov.id,
      name: edict.name,
      effect: edict.effect,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (edict.durationHours || 24) * 3600 * 1000).toISOString(),
    };

    setActiveEdicts((prev) => [newActive, ...prev]);
    showToast(`Imperial Edict Enacted: ${edict.name}`, `Active for ${edict.durationHours || 24} hours (${edict.effect}).`);
  };

  // Revoke an edict
  const handleRevokeEdict = (edictId: string) => {
    sound.play('click');
    setActiveEdicts((prev) => prev.filter((e) => e.edictId !== edictId));
    showToast(`Edict Revoked`, `The emergency decree has been withdrawn from law.`);
  };

  // Filter 9 governments
  const filteredGovernments = GOVERNMENTS.filter((g) => {
    if (archetypeFilter === 'ALL') return true;
    if (archetypeFilter === 'DEMOCRATIC') return g.id === 'democracy' || g.id === 'anarchy';
    if (archetypeFilter === 'MILITARY') return g.id === 'junta' || g.id === 'empire' || g.id === 'aristocracy';
    if (archetypeFilter === 'TECH') return g.id === 'technocracy' || g.id === 'hive';
    if (archetypeFilter === 'COMMERCE') return g.id === 'guild' || g.id === 'theocracy';
    return true;
  });

  return (
    <div id="government-system-view" className="space-y-6 font-mono">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-[#111111] text-white border-2 border-amber-400 shadow-xl flex items-start justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="block text-xs uppercase tracking-wide text-amber-300 font-extrabold">
                {toastMessage.title}
              </strong>
              <span className="text-[11px] text-neutral-300 block mt-0.5">
                {toastMessage.desc}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs text-neutral-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalGov && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#111111] max-w-md w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-2 text-amber-600">
              <Scale size={20} />
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-[#111111]">
                Confirm Constitutional Reform
              </h3>
            </div>

            <p className="text-xs text-[#555555] leading-relaxed">
              Are you prepared to disband your current sovereign framework and ratify the{' '}
              <strong className="text-[#111111] font-bold">{confirmModalGov.name}</strong>?
            </p>

            <div className="p-3 bg-neutral-50 border border-[#dedede] space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">{confirmModalGov.icon || '🏛️'}</span>
                <span className="font-bold text-[#111111]">{confirmModalGov.name}</span>
              </div>
              <p className="text-[11px] text-[#666666]">{confirmModalGov.tagline}</p>
              <div className="text-[11px] text-emerald-700 font-bold pt-1">
                ⭐ {confirmModalGov.specialPerk}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalGov(null)}
                className="px-4 py-2 border border-[#dedede] bg-white text-xs font-bold uppercase hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRatify(confirmModalGov)}
                className="px-4 py-2 bg-[#111111] hover:bg-neutral-800 text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-sm"
              >
                Ratify Constitution Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="border-2 border-[#111111] bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#111111] text-amber-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Landmark size={12} />
                SOVEREIGN IMPERIAL DOCTRINE · 9 GOVERNMENTS ENGINE
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
                Active Constitution: {currentGov.name}
              </span>
            </div>

            <h1 className="text-2xl font-black text-[#111111] tracking-tight uppercase">
              Supreme Government Systems & Decrees
            </h1>
            <p className="text-xs text-[#555555] max-w-3xl leading-relaxed">
              In accordance with classical Universe Civilization: Empire at War and galactic 4X conventions, an empire&apos;s government dictates foundational economic outputs, research velocity, fleet combat doctrines, planetary defense shields, and colonial expansion.
            </p>
          </div>

          {/* Current Constitution Stat Pill */}
          <div className="p-4 bg-neutral-50 border-2 border-[#111111] min-w-[260px] space-y-2">
            <div className="flex items-center justify-between border-b border-[#dedede] pb-2">
              <span className="text-[10px] font-bold uppercase text-[#777777]">Sovereign Power</span>
              <span className="text-xl">{currentGov.icon || '🏛️'}</span>
            </div>
            <div>
              <div className="text-xs font-extrabold text-[#111111]">{currentGov.name}</div>
              <div className="text-[10px] text-[#666666] italic mt-0.5">{currentGov.ideology}</div>
            </div>
            <div className="text-[10px] text-amber-700 font-bold bg-amber-50 p-1.5 border border-amber-200">
              {currentGov.specialPerk?.slice(0, 75)}...
            </div>
          </div>
        </div>

        {/* Global Multipliers Strip for Active Government */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-6 mt-6 border-t border-[#eee]">
          <div className="p-2.5 bg-neutral-50 border border-[#dedede] text-center">
            <span className="block text-[9px] text-[#777777] uppercase font-bold">Economy Output</span>
            <span className={`text-sm font-black ${currentGov.economyModifier >= 1 ? 'text-emerald-700' : 'text-red-600'}`}>
              {Math.round((currentGov.economyModifier - 1) * 100) >= 0 ? '+' : ''}
              {Math.round((currentGov.economyModifier - 1) * 100)}%
            </span>
          </div>
          <div className="p-2.5 bg-neutral-50 border border-[#dedede] text-center">
            <span className="block text-[9px] text-[#777777] uppercase font-bold">Science Labs</span>
            <span className={`text-sm font-black ${currentGov.researchModifier >= 1 ? 'text-blue-700' : 'text-red-600'}`}>
              {Math.round((currentGov.researchModifier - 1) * 100) >= 0 ? '+' : ''}
              {Math.round((currentGov.researchModifier - 1) * 100)}%
            </span>
          </div>
          <div className="p-2.5 bg-neutral-50 border border-[#dedede] text-center">
            <span className="block text-[9px] text-[#777777] uppercase font-bold">Fleet Weaponry</span>
            <span className={`text-sm font-black ${currentGov.militaryModifier >= 1 ? 'text-red-700' : 'text-neutral-600'}`}>
              {Math.round((currentGov.militaryModifier - 1) * 100) >= 0 ? '+' : ''}
              {Math.round((currentGov.militaryModifier - 1) * 100)}%
            </span>
          </div>
          <div className="p-2.5 bg-neutral-50 border border-[#dedede] text-center">
            <span className="block text-[9px] text-[#777777] uppercase font-bold">Planetary Defense</span>
            <span className={`text-sm font-black ${currentGov.defenseModifier >= 1 ? 'text-indigo-700' : 'text-neutral-600'}`}>
              {Math.round((currentGov.defenseModifier - 1) * 100) >= 0 ? '+' : ''}
              {Math.round((currentGov.defenseModifier - 1) * 100)}%
            </span>
          </div>
          <div className="p-2.5 bg-neutral-50 border border-[#dedede] text-center">
            <span className="block text-[9px] text-[#777777] uppercase font-bold">Colonies Outposts</span>
            <span className={`text-sm font-black ${currentGov.colonyModifier >= 1 ? 'text-amber-700' : 'text-neutral-600'}`}>
              {Math.round((currentGov.colonyModifier - 1) * 100) >= 0 ? '+' : ''}
              {Math.round((currentGov.colonyModifier - 1) * 100)}%
            </span>
          </div>
          <div className="p-2.5 bg-neutral-50 border border-[#dedede] text-center">
            <span className="block text-[9px] text-[#777777] uppercase font-bold">Shipyard Assembly</span>
            <span className={`text-sm font-black ${currentGov.fleetModifier >= 1 ? 'text-purple-700' : 'text-neutral-600'}`}>
              {Math.round((currentGov.fleetModifier - 1) * 100) >= 0 ? '+' : ''}
              {Math.round((currentGov.fleetModifier - 1) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#dedede] bg-white px-4 pt-2 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => { sound.play('click'); setActiveTab('matrix'); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'matrix' ? 'border-[#111111] text-[#111111] bg-neutral-50 font-black' : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Building size={14} />
          <span>The 9 Governments Matrix</span>
          <span className="px-1.5 py-0.2 bg-[#111111] text-white text-[9px] font-extrabold uppercase">
            9 Forms
          </span>
        </button>

        <button
          type="button"
          onClick={() => { sound.play('click'); setActiveTab('edicts'); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'edicts' ? 'border-[#111111] text-[#111111] bg-neutral-50 font-black' : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Scroll size={14} />
          <span>Imperial Edicts & Decrees</span>
          {activeEdicts.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[9px] font-extrabold uppercase">
              {activeEdicts.length} Active
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { sound.play('click'); setActiveTab('analytics'); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'analytics' ? 'border-[#111111] text-[#111111] bg-neutral-50 font-black' : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Sliders size={14} />
          <span>Production & Multiplier Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => { sound.play('click'); setActiveTab('history'); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase transition-colors border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'history' ? 'border-[#111111] text-[#111111] bg-neutral-50 font-black' : 'border-transparent text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Clock size={14} />
          <span>Constitutional History</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: THE 9 GOVERNMENTS MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dedede] pb-3">
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-[#888888] mr-2">Ideological Bloc:</span>
              {[
                { id: 'ALL', label: 'All 9 Systems' },
                { id: 'DEMOCRATIC', label: 'Democratic & Freedom' },
                { id: 'MILITARY', label: 'Military & Martial' },
                { id: 'TECH', label: 'Tech & Synthetic' },
                { id: 'COMMERCE', label: 'Commerce & Zealotry' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setArchetypeFilter(b.id);
                  }}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    archetypeFilter === b.id
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#dedede] bg-white text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-[#777777]">
              Showing <strong className="text-[#111111]">{filteredGovernments.length}</strong> of 9 Canonical Governments
            </div>
          </div>

          {/* 9 Governments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGovernments.map((gov) => {
              const isCurrent = profile.governmentId === gov.id;
              const isInspected = selectedGovId === gov.id;

              return (
                <div
                  key={gov.id}
                  onClick={() => setSelectedGovId(gov.id)}
                  className={`border-2 p-5 bg-white transition-all flex flex-col justify-between space-y-4 cursor-pointer relative ${
                    isCurrent
                      ? 'border-[#111111] ring-2 ring-[#111111] shadow-md'
                      : isInspected
                      ? 'border-neutral-400 bg-neutral-50/50'
                      : 'border-[#dedede] hover:border-neutral-400'
                  }`}
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 bg-neutral-100 border border-[#dedede]">
                          {gov.icon || '🏛️'}
                        </span>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-[#777777] block">
                            {gov.ideology}
                          </span>
                          <h3 className="font-black text-sm text-[#111111] tracking-tight">
                            {gov.name}
                          </h3>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#111111] text-amber-400 shrink-0">
                          Active Constitution
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-neutral-100 text-[#777777] shrink-0">
                          Available
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#555555] leading-relaxed mb-3">
                      {gov.description}
                    </p>

                    {/* Special Perk Highlight */}
                    {gov.specialPerk && (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 mb-3">
                        <strong className="block text-[10px] uppercase font-bold text-amber-800">
                          ⭐ Special Doctrine Perk:
                        </strong>
                        <span className="leading-snug">{gov.specialPerk}</span>
                      </div>
                    )}

                    {/* Strengths & Weaknesses */}
                    <div className="space-y-1 text-[10px] pt-1">
                      {gov.strengths?.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-emerald-800 font-bold">
                          <Check size={11} className="shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                      {gov.weaknesses?.map((w, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-neutral-500">
                          <span className="text-red-500 font-bold shrink-0">✕</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Multipliers Box */}
                  <div>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono p-2 bg-neutral-50 border border-[#dedede] mb-3">
                      <div>
                        <span className="block text-[8px] text-[#888888] uppercase">Econ</span>
                        <strong className={gov.economyModifier >= 1 ? 'text-emerald-700' : 'text-red-600'}>
                          ×{gov.economyModifier}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[8px] text-[#888888] uppercase">Labs</span>
                        <strong className={gov.researchModifier >= 1 ? 'text-blue-700' : 'text-red-600'}>
                          ×{gov.researchModifier}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[8px] text-[#888888] uppercase">Fleet</span>
                        <strong className={gov.militaryModifier >= 1 ? 'text-red-700' : 'text-neutral-600'}>
                          ×{gov.militaryModifier}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[8px] text-[#888888] uppercase">Defense</span>
                        <strong className={gov.defenseModifier >= 1 ? 'text-indigo-700' : 'text-neutral-600'}>
                          ×{gov.defenseModifier}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[8px] text-[#888888] uppercase">Colony</span>
                        <strong className={gov.colonyModifier >= 1 ? 'text-amber-700' : 'text-neutral-600'}>
                          ×{gov.colonyModifier}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[8px] text-[#888888] uppercase">Shipyard</span>
                        <strong className={gov.fleetModifier >= 1 ? 'text-purple-700' : 'text-neutral-600'}>
                          ×{gov.fleetModifier}
                        </strong>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModalGov(gov);
                      }}
                      className={`w-full py-2.5 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-neutral-100 text-[#111111] border border-[#dedede] cursor-default'
                          : 'bg-[#111111] hover:bg-neutral-800 text-white shadow-xs'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>Current Constitution</span>
                        </>
                      ) : (
                        <>
                          <Scale size={13} />
                          <span>Ratify Constitution</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IMPERIAL EDICTS & DECREES */}
      {/* ========================================================================= */}
      {activeTab === 'edicts' && (
        <div className="space-y-6">
          {/* Active Edicts Status */}
          <div className="border border-[#dedede] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold uppercase text-[#111111] flex items-center gap-2">
                  <Scroll size={16} className="text-amber-600" />
                  Currently Enacted Sovereign Edicts ({activeEdicts.length})
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Edicts represent executive decrees issued under your ratified government system, conferring powerful temporary buffs.
                </p>
              </div>
            </div>

            {activeEdicts.length === 0 ? (
              <div className="p-6 bg-neutral-50 border border-[#dedede] text-center text-xs text-[#777777]">
                No imperial edicts currently in effect. Enact decrees from the catalog below to empower your empire.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeEdicts.map((edict) => (
                  <div
                    key={edict.edictId}
                    className="p-4 border-2 border-emerald-600 bg-emerald-50/30 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-emerald-900">
                          {edict.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-600 text-white uppercase">
                          Enacted
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 font-bold mt-1">
                        ⭐ {edict.effect}
                      </p>
                      <div className="text-[10px] text-[#666666] flex items-center gap-1 mt-2">
                        <Clock size={11} />
                        <span>Expires: {new Date(edict.expiresAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeEdict(edict.edictId)}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase border border-red-300 text-red-700 bg-white hover:bg-red-50 cursor-pointer"
                    >
                      Withdraw
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Edicts by Government */}
          <div className="border border-[#dedede] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#eee] pb-3">
              <div>
                <h3 className="text-sm font-extrabold uppercase text-[#111111]">
                  Imperial Decrees of {currentGov.name}
                </h3>
                <p className="text-xs text-[#666666]">
                  Your current government enables three distinct executive edicts to resolve wartime crises and stimulate expansion.
                </p>
              </div>

              <span className="text-xs text-amber-700 font-bold">
                Constitution: {currentGov.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentGov.edicts?.map((edict) => {
                const isActive = activeEdicts.some((e) => e.edictId === edict.id);

                return (
                  <div
                    key={edict.id}
                    className={`p-4 border-2 transition-all flex flex-col justify-between space-y-3 ${
                      isActive ? 'border-emerald-600 bg-emerald-50/20' : 'border-[#dedede] bg-neutral-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-black text-[#111111] uppercase">
                          {edict.name}
                        </h4>
                        {isActive && (
                          <span className="text-[9px] font-bold text-emerald-700 uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#666666] leading-relaxed mb-2">
                        {edict.description}
                      </p>
                      <div className="text-[11px] text-emerald-800 font-bold bg-white p-2 border border-[#dedede]">
                        {edict.effect}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#eee] flex items-center justify-between text-[10px]">
                      <span className="text-[#777777]">Cost: <strong>{edict.cost}</strong></span>
                      {isActive ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeEdict(edict.id)}
                          className="px-3 py-1 bg-neutral-200 hover:bg-neutral-300 text-[#111111] font-bold uppercase cursor-pointer"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEnactEdict(edict, currentGov)}
                          className="px-3 py-1.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold uppercase cursor-pointer shadow-xs"
                        >
                          Enact Decree
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRODUCTION & MULTIPLIER ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-6">
          <div>
            <h3 className="text-sm font-extrabold uppercase text-[#111111] flex items-center gap-2">
              <Sliders size={16} />
              Empire Constitutional Multiplier Matrix
            </h3>
            <p className="text-xs text-[#666666] mt-0.5">
              Live overview of how the <strong>{currentGov.name}</strong> modulates planetary output, mine yields, and shipyard efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-[#dedede] bg-neutral-50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#777777] block">Primary Economy & Mining</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#666666]">General Trade & Treasury:</span>
                  <strong className="text-emerald-700">×{currentGov.economyModifier}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Metal Mine Extraction:</span>
                  <strong className="text-neutral-800">×{currentGov.metalMineModifier || 1.0}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Crystal Mine Extraction:</span>
                  <strong className="text-cyan-800">×{currentGov.crystalMineModifier || 1.0}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Deuterium Synthesis:</span>
                  <strong className="text-emerald-800">×{currentGov.deutMineModifier || 1.0}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 border border-[#dedede] bg-neutral-50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#777777] block">Military & War Doctrine</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#666666]">Fleet Firepower Rating:</span>
                  <strong className="text-red-700">×{currentGov.militaryModifier}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Orbital Defense Fortifications:</span>
                  <strong className="text-indigo-700">×{currentGov.defenseModifier}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Shipyard Assembly Velocity:</span>
                  <strong className="text-purple-700">×{currentGov.fleetModifier}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Subspace Hyperdrive Speed:</span>
                  <strong className="text-amber-800">×{currentGov.subspaceSpeedModifier || 1.0}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 border border-[#dedede] bg-neutral-50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#777777] block">Science, Glory & Reputation</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#666666]">Astrophysics & Tech Labs:</span>
                  <strong className="text-blue-700">×{currentGov.researchModifier}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Colonial Outpost Capacity:</span>
                  <strong className="text-amber-700">×{currentGov.colonyModifier}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Glory Point Accrual:</span>
                  <strong className="text-amber-600">×{currentGov.gloryModifier || 1.0}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Diplomatic Standing:</span>
                  <strong className="text-emerald-700">×{currentGov.reputationModifier || 1.0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONSTITUTIONAL HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#eee] pb-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase text-[#111111] flex items-center gap-2">
                <Clock size={16} />
                Constitutional Ratification Archive
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Audit trail of governing constitutions ratified throughout your empire&apos;s stellar history.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {reformHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 border border-[#dedede] bg-neutral-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#888888] font-bold">#{reformHistory.length - idx}</span>
                  <div>
                    <strong className="block text-[#111111]">{item.name}</strong>
                    <span className="text-[10px] text-[#777777]">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-neutral-200 text-[#111111]">
                  Ratified
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

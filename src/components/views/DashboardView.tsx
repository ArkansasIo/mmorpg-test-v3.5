import React, { useMemo } from 'react';
import { ArrowRight, Shield, Target, Users, Zap, Globe, Coins, Award, Trophy, Star, Crown, RotateCw, Activity, Sparkles, RefreshCw } from 'lucide-react';
import { sound } from '../../sound';
import { PlayerProfile, PlayerResources, Race, PlanetColony } from '../../types';
import { RACES } from '../../gameData';
import { getEmpireColonialSummary } from '../../utils/colonyCalculations';

interface DashboardViewProps {
  profile: PlayerProfile;
  resources: PlayerResources;
  onNavigate: (route: string) => void;
  naturalIncome: number;
  bankCapacity: number;
  planets?: PlanetColony[];
  onUpdateAllSystems?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  resources,
  onNavigate,
  naturalIncome,
  bankCapacity,
  planets = [],
  onUpdateAllSystems,
}) => {
  const currentRace = RACES.find((r) => r.id === profile.race);

  const bankPercentage = Math.min(100, Math.round((resources.bankedNaquadah / bankCapacity) * 100));
  const turnsPercentage = Math.min(100, Math.round((resources.attackTurns / 100) * 100));

  const colonialSummary = useMemo(() => {
    return getEmpireColonialSummary(planets);
  }, [planets]);

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Intro Banner */}
      <div className="border border-[#dedede] bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
            REALM STATUS · {currentRace?.name.toUpperCase()} FACTION
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            Welcome back, {profile.displayName}.
          </h2>
          <p className="text-sm text-[#666666] mt-2 max-w-xl leading-relaxed">
            Make your next move carefully. Your realm is extracting vital Naquadah reserves while rival
            empires watch across the stargate network.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            id="dashboard-update-all-systems-btn"
            onClick={() => {
              sound.play('confirm');
              if (onUpdateAllSystems) {
                onUpdateAllSystems();
              }
            }}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-mono font-black tracking-wide uppercase transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer border border-emerald-400/50"
            title="Perform Full Empire Systems Synchronization"
          >
            <RotateCw size={14} className="text-emerald-200" />
            <span>Update All Systems</span>
          </button>
          <button
            type="button"
            id="choose-target-btn"
            onClick={() => {
              sound.play('click');
              onNavigate('targets');
            }}
            className="px-5 py-3 bg-[#111111] text-white text-xs font-bold tracking-wide uppercase hover:bg-[#333333] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Choose a Target</span>
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            id="train-units-shortcut-btn"
            onClick={() => {
              sound.play('click');
              onNavigate('units');
            }}
            className="px-5 py-3 border border-[#111111] text-[#111111] text-xs font-bold tracking-wide uppercase hover:bg-[#f5f5f5] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Train Troops</span>
          </button>
        </div>
      </div>

      {/* Empire Systems Matrix & Real-Time Synchronizer */}
      <div className="border border-[#dedede] bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eeeeee] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666666] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                DOMINION OPERATIONAL MATRIX
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-700 font-bold">10 SYSTEMS LIVE</span>
            </div>
            <h3 className="text-base font-bold text-[#111111] tracking-tight">
              Galactic Empire Systems Status & Synchronizer
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="matrix-update-all-systems-btn"
              onClick={() => {
                sound.play('confirm');
                if (onUpdateAllSystems) {
                  onUpdateAllSystems();
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-mono font-black uppercase tracking-wider rounded-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs border border-emerald-400/40"
            >
              <RotateCw size={13} className="text-emerald-200" />
              <span>SYNC ALL SYSTEMS</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
          {[
            { id: 'factories', title: '01. Planetary Mines', status: 'ACTIVE', desc: 'Naquadah & Ores', color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
            { id: 'factories', title: '02. Heavy Foundries', status: 'ONLINE', desc: 'Deut & Metal Plants', color: 'border-orange-200 bg-orange-50/50 text-orange-800' },
            { id: 'tech-tree', title: '03. Research Labs', status: 'DISCOVERING', desc: 'Quantum Tech Tree', color: 'border-purple-200 bg-purple-50/50 text-purple-800' },
            { id: 'shipyard', title: '04. Orbital Shipyard', status: 'OPERATIONAL', desc: 'Hull Assembly', color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
            { id: 'defenses', title: '05. Defense Grid', status: 'ARMED', desc: 'Shields & Turrets', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800' },
            { id: 'stargate-network', title: '06. Stargate Network', status: 'LINKED', desc: 'Subspace Wormholes', color: 'border-cyan-200 bg-cyan-50/50 text-cyan-800' },
            { id: 'bank-vault', title: '07. Imperial Citadel', status: 'PROTECTED', desc: 'Bank & Vault Reserves', color: 'border-lime-200 bg-lime-50/50 text-lime-800' },
            { id: 'workforce-academy', title: '08. Strike Academy', status: 'TRAINING', desc: 'Troops & Wings', color: 'border-rose-200 bg-rose-50/50 text-rose-800' },
            { id: 'ship', title: '09. Flagship Mothership', status: 'STATIONED', desc: 'Titan Subsystems', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-800' },
            { id: 'power-grid', title: '10. Energy Power Grid', status: 'SYNCHRONIZED', desc: 'Subspace Microgrids', color: 'border-teal-200 bg-teal-50/50 text-teal-800' },
          ].map((sys) => (
            <button
              key={sys.title}
              type="button"
              onClick={() => {
                sound.play('click');
                onNavigate(sys.id);
              }}
              className={`p-3 text-left border rounded-xs hover:border-[#111111] hover:bg-white transition-all cursor-pointer group shadow-2xs ${sys.color}`}
            >
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-[#666666]">
                <span className="truncate">{sys.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
              <strong className="text-xs font-bold text-[#111111] block mt-1">{sys.status}</strong>
              <span className="text-[10px] text-[#777777] block mt-0.5 group-hover:text-[#111111] transition-colors">{sys.desc} →</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Economy & Production */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-[#dedede] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4 mb-5">
              <div>
                <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase">
                  ECONOMY & LOGISTICS
                </div>
                <h3 className="text-base font-bold text-[#111111] mt-0.5">Resource Capacity</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.play('click');
                  onNavigate('resources');
                }}
                className="text-xs font-semibold text-[#555555] hover:text-[#111111] transition-colors"
              >
                Vault Details →
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-[#555555] mb-1.5 font-medium">
                  <span>Net Natural Income / Turn</span>
                  <b className="text-[#111111] font-mono font-bold">+{(naturalIncome ?? 0).toLocaleString()} Naquadah</b>
                </div>
                <div className="w-full h-2 bg-[#eeeeee]">
                  <div className="h-full bg-[#111111]" style={{ width: '75%' }} />
                </div>
              </div>

              {planets.length > 0 && (
                <div className="p-2.5 bg-[#fafafa] border border-[#eeeeee] space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666] flex items-center gap-1.5">
                      <Globe size={12} className="text-[#777777]" />
                      Colonial Maintenance ({planets.length} worlds):
                    </span>
                    <strong className="font-mono text-rose-700 font-bold">
                      -{Number(colonialSummary?.totalMaintenanceCost || 0).toLocaleString()} NQ/turn
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#888888]">Expansion Efficiency:</span>
                    <span className={`font-mono font-bold ${
                      colonialSummary?.expansionEfficiencyRating === 'Optimal'
                        ? 'text-emerald-700'
                        : colonialSummary?.expansionEfficiencyRating === 'Sustainable'
                        ? 'text-blue-700'
                        : colonialSummary?.expansionEfficiencyRating === 'Strained'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}>
                      {colonialSummary?.expansionEfficiencyRating || 'Optimal'} ({colonialSummary?.expansionEfficiencyPercent ?? 100}% Margin)
                    </span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs text-[#555555] mb-1.5 font-medium">
                  <span>Bank Vault Storage</span>
                  <b className="text-[#111111] font-mono font-bold">
                    {(resources?.bankedNaquadah ?? 0).toLocaleString()} / {(bankCapacity ?? 0).toLocaleString()} ({bankPercentage}%)
                  </b>
                </div>
                <div className="w-full h-2 bg-[#eeeeee]">
                  <div className="h-full bg-[#111111]" style={{ width: `${bankPercentage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#555555] mb-1.5 font-medium">
                  <span>Attack Turn Storage</span>
                  <b className="text-[#111111] font-mono font-bold">{resources.attackTurns} / 100 Turns</b>
                </div>
                <div className="w-full h-2 bg-[#eeeeee]">
                  <div className="h-full bg-[#111111]" style={{ width: `${turnsPercentage}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Checklist */}
          <div className="border border-[#dedede] bg-white p-6">
            <div className="border-b border-[#eeeeee] pb-4 mb-4">
              <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase">
                STRATEGIC CHECKLIST
              </div>
              <h3 className="text-base font-bold text-[#111111] mt-0.5">Recommended Operations</h3>
            </div>

            <div className="divide-y divide-[#eeeeee]">
              <div
                className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors -mx-2 px-2"
                onClick={() => {
                  sound.play('click');
                  onNavigate('units');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#999999] font-bold">01</span>
                  <div>
                    <strong className="block text-xs font-bold text-[#111111]">
                      Train Population into Specialized Units
                    </strong>
                    <small className="block text-[11px] text-[#777777]">
                      Convert {resources.untrainedUnits} untrained population into miners, troops, or spies.
                    </small>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#111111]">Open Training →</span>
              </div>

              <div
                className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors -mx-2 px-2"
                onClick={() => {
                  sound.play('click');
                  onNavigate('spy');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#999999] font-bold">02</span>
                  <div>
                    <strong className="block text-xs font-bold text-[#111111]">
                      Dispatch Covert Espionage Probes
                    </strong>
                    <small className="block text-[11px] text-[#777777]">
                      Scout rival enemy realms before committing attack turns.
                    </small>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#111111]">Recon Missions →</span>
              </div>

              <div
                className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors -mx-2 px-2"
                onClick={() => {
                  sound.play('click');
                  onNavigate('tech-offense');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#999999] font-bold">03</span>
                  <div>
                    <strong className="block text-xs font-bold text-[#111111]">
                      Upgrade Offensive & Shield Technologies
                    </strong>
                    <small className="block text-[11px] text-[#777777]">
                      Invest surplus Naquadah into permanent combat multipliers.
                    </small>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#111111]">Research Tree →</span>
              </div>

              <div
                className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors -mx-2 px-2"
                onClick={() => {
                  sound.play('click');
                  onNavigate('missions');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-600 font-bold">04</span>
                  <div>
                    <strong className="block text-xs font-bold text-[#111111] flex items-center gap-1.5">
                      <span>Daily Missions & Dynamic Activity Rewards</span>
                      <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[9px] font-bold uppercase">Daily</span>
                    </strong>
                    <small className="block text-[11px] text-[#777777]">
                      Complete directives for scaled dynamic resources and minor glory points.
                    </small>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600">Missions Tab →</span>
              </div>

              <div
                className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors -mx-2 px-2"
                onClick={() => {
                  sound.play('click');
                  onNavigate('government-system');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-indigo-600 font-bold">05</span>
                  <div>
                    <strong className="block text-xs font-bold text-[#111111] flex items-center gap-1.5">
                      <span>9 Sovereign Government Systems & Edicts</span>
                      <span className="px-1.5 py-0.2 bg-[#111111] text-amber-400 text-[9px] font-bold uppercase">9 Forms</span>
                    </strong>
                    <small className="block text-[11px] text-[#777777]">
                      Ratify your constitution (Democracy, Junta, Technocracy, Empire, Guild, etc.) and enact decrees.
                    </small>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600">Governments →</span>
              </div>

              <div
                className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors -mx-2 px-2 border-t border-[#eee]"
                onClick={() => {
                  sound.play('click');
                  onNavigate('codex-doc');
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-600 font-bold">06</span>
                  <div>
                    <strong className="block text-xs font-bold text-[#111111] flex items-center gap-1.5">
                      <span>Strategic Codex & Game Design Document</span>
                      <span className="px-1.5 py-0.2 bg-neutral-900 text-amber-400 text-[9px] font-bold uppercase">Manual</span>
                    </strong>
                    <small className="block text-[11px] text-[#777777]">
                      Formulas, math specifications, combat mechanics, and structural systems documentation.
                    </small>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600">Codex →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Military Strength & Personnel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-[#dedede] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4 mb-4">
              <div>
                <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase">
                  PERSONNEL & FLEET
                </div>
                <h3 className="text-base font-bold text-[#111111] mt-0.5">Military Breakdown</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.play('click');
                  onNavigate('military-stats');
                }}
                className="text-xs font-semibold text-[#555555] hover:text-[#111111] transition-colors"
              >
                Stats →
              </button>
            </div>

            <div className="divide-y divide-[#eeeeee] text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#666666]">Active Attack Units</span>
                <strong className="text-[#111111] font-mono font-bold">
                  {(resources?.attackUnits ?? 0).toLocaleString()}
                </strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#666666]">Active Defense Units</span>
                <strong className="text-[#111111] font-mono font-bold">
                  {(resources?.defenseUnits ?? 0).toLocaleString()}
                </strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#666666]">Covert Espionage Agents</span>
                <strong className="text-[#111111] font-mono font-bold">
                  {(resources?.spies ?? 0).toLocaleString()}
                </strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#666666]">Counter-Intelligence Agents</span>
                <strong className="text-[#111111] font-mono font-bold">
                  {(resources?.antiSpies ?? 0).toLocaleString()}
                </strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#666666]">Mining Workforce</span>
                <strong className="text-[#111111] font-mono font-bold">
                  {(resources?.miners ?? 0).toLocaleString()}
                </strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#666666]">Elite Super Units</span>
                <strong className="text-[#111111] font-mono font-bold">
                  {(resources?.superUnits ?? 0).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Quick Nav Card: Galactic Reputation & Standing (Redesigned) */}
          <div className="border border-[#111111] bg-white p-6 shadow-xs relative overflow-hidden">
            {/* Subtle high-tech ambient corner accent */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3 mb-4">
              <div>
                <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase flex items-center gap-1.5">
                  <Award size={12} className="text-amber-500" />
                  <span>GALACTIC REPUTATION & STANDING</span>
                </div>
                <h3 className="text-base font-bold text-[#111111] mt-0.5 flex items-center gap-2">
                  <span>Imperial Prestige</span>
                  {profile.ascended && (
                    <span className="px-1.5 py-0.2 bg-purple-100 text-purple-900 border border-purple-300 text-[9px] font-mono font-bold uppercase rounded-2xs">
                      Ascended
                    </span>
                  )}
                </h3>
              </div>

              <span className="px-2 py-0.5 bg-[#f8fafc] border border-[#111111] text-[10px] font-mono font-bold text-[#111111] flex items-center gap-1 shadow-2xs">
                <Crown size={11} className="text-amber-600" />
                <span>Tier {profile.rankLevel}</span>
              </span>
            </div>

            {/* Rank Title & Level Banner */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3.5 mb-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xs bg-[#111111] text-white flex items-center justify-center font-bold text-xs font-mono shadow-2xs">
                    {profile.rankLevel}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#777777] tracking-wider block">
                      Current Hegemony Rank
                    </span>
                    <h4 className="text-sm font-bold text-[#111111] leading-tight">
                      {profile.rankName}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-mono text-[#888888] block">DEFCON Protocol</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-2xs border ${
                      profile.defconLevel === 1
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : profile.defconLevel === 2
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    DEFCON {profile.defconLevel || 5}
                  </span>
                </div>
              </div>

              {/* Progress bar towards next milestone */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-[#666666]">
                  <span>Tier Progression</span>
                  <span className="font-bold text-[#111111]">
                    {Math.min(100, Math.max(15, (profile.glory % 1000) / 10))}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#e2e8f0] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#111111] to-amber-600 transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(15, (profile.glory % 1000) / 10))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white border border-[#111111] p-3 shadow-2xs relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider">
                    Glory Points
                  </span>
                  <Trophy size={13} className="text-amber-500" />
                </div>
                <strong className="text-lg font-bold text-[#111111] font-mono block">
                  {(profile?.glory ?? 0).toLocaleString()}
                </strong>
                <span className="text-[10px] text-[#888888] block mt-0.5">
                  Combat & war honors
                </span>
              </div>

              <div className="bg-white border border-[#111111] p-3 shadow-2xs relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider">
                    Reputation
                  </span>
                  <Star size={13} className="text-blue-600" />
                </div>
                <strong className="text-lg font-bold text-[#111111] font-mono block">
                  {(profile?.reputation ?? 0).toLocaleString()}
                </strong>
                <span className="text-[10px] text-[#888888] block mt-0.5">
                  Galactic standing
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                onNavigate('rankings');
              }}
              className="w-full py-2.5 px-4 bg-[#111111] text-white font-bold text-xs hover:bg-[#333333] transition-all flex items-center justify-between cursor-pointer group shadow-2xs active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <Trophy size={14} className="text-amber-400" />
                <span>View Galactic Leaderboard</span>
              </span>
              <span className="font-mono text-neutral-300 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

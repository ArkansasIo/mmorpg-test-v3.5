import React, { useState, useEffect } from 'react';
import {
  Eye,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Radio,
  Crosshair,
  BookOpen,
  Zap,
  Lock,
  ChevronRight,
  TrendingUp,
  Skull,
  Shield,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  Radar,
  Activity,
  Terminal,
} from 'lucide-react';
import { sound } from '../../sound';
import { CovertMissionRecord } from '../../types';
import { TARGET_REALMS } from '../../gameData';

interface IntelligenceViewProps {
  missions: CovertMissionRecord[];
  onNavigate: (route: string) => void;
  defaultTab?: 'spy-log' | 'enemy-intelligence' | 'intel-codex';
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
  missions,
  onNavigate,
  defaultTab = 'spy-log',
}) => {
  const [activeTab, setActiveTab] = useState<'spy-log' | 'enemy-intelligence' | 'intel-codex'>(defaultTab);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(TARGET_REALMS[0]?.id || '');
  const [searchTarget, setSearchTarget] = useState<string>('');
  const [filterResult, setFilterResult] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const filteredMissions = missions.filter((m) => {
    if (filterResult === 'success') return m.success;
    if (filterResult === 'failed') return !m.success;
    return true;
  });

  const filteredTargets = TARGET_REALMS.filter(
    (t) =>
      t.commanderName.toLowerCase().includes(searchTarget.toLowerCase()) ||
      t.rank.toLowerCase().includes(searchTarget.toLowerCase()) ||
      t.race.toLowerCase().includes(searchTarget.toLowerCase())
  );

  const selectedTarget = TARGET_REALMS.find((t) => t.id === selectedTargetId) || TARGET_REALMS[0];

  return (
    <div id="intelligence-view" className="space-y-6">
      {/* Header Banner */}
      <div className="border border-[#dedede] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1 flex items-center gap-1.5 font-mono">
              <Radar size={13} className="text-amber-500 animate-spin" />
              <span>DOMINION INTELLIGENCE BUREAU · CLASSIFIED DOSSIERS</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              Espionage Reports, Enemy Dossiers & Strategic Intel
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
              Subspace reconnaissance records, live satellite scans, and intercepted telemetry gathered from
              covert operations across all star systems.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                onNavigate('spy');
              }}
              className="px-4 py-2.5 bg-[#111111] text-white hover:bg-[#333333] text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Crosshair size={14} className="text-amber-400" />
              <span>Deploy Spy Probes</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                onNavigate('sabotage');
              }}
              className="px-3.5 py-2.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-300 hover:border-red-600 text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Skull size={14} />
              <span>Sabotage Ops</span>
            </button>
          </div>
        </div>

        {/* Sub-Page Navigation Tabs Menu */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[#eeeeee]">
          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('spy-log');
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'spy-log'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-neutral-100 text-[#555555] hover:bg-neutral-200 border border-[#dedede]'
            }`}
          >
            <FileText size={14} className={activeTab === 'spy-log' ? 'text-amber-400' : 'text-[#777777]'} />
            <span>01. Espionage Reports & Logs ({missions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('enemy-intelligence');
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'enemy-intelligence'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-neutral-100 text-[#555555] hover:bg-neutral-200 border border-[#dedede]'
            }`}
          >
            <Eye size={14} className={activeTab === 'enemy-intelligence' ? 'text-amber-400' : 'text-[#777777]'} />
            <span>02. Enemy Intelligence Dossier ({TARGET_REALMS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('intel-codex');
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'intel-codex'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-neutral-100 text-[#555555] hover:bg-neutral-200 border border-[#dedede]'
            }`}
          >
            <BookOpen size={14} className={activeTab === 'intel-codex' ? 'text-amber-400' : 'text-[#777777]'} />
            <span>03. Strategic Intel Codex</span>
          </button>
        </div>
      </div>

      {/* Subpage 1: Espionage Reports & Logs */}
      {activeTab === 'spy-log' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eeeeee] pb-4">
            <div>
              <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <span>Subspace Mission Transmission Archive</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-100 border border-[#dedede] text-[#666666]">
                  {filteredMissions.length} RECORDED
                </span>
              </h3>
              <p className="text-xs text-[#777777] mt-0.5">
                Past covert infiltrations, orbital probe telemetry, and defensive counter-scan logs.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setFilterResult('all')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase cursor-pointer border ${
                  filterResult === 'all'
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white text-[#666666] border-[#dedede] hover:bg-neutral-100'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterResult('success')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase cursor-pointer border ${
                  filterResult === 'success'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                Successful
              </button>
              <button
                type="button"
                onClick={() => setFilterResult('failed')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase cursor-pointer border ${
                  filterResult === 'failed'
                    ? 'bg-red-600 text-white border-red-700'
                    : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                }`}
              >
                Intercepted
              </button>
            </div>
          </div>

          {filteredMissions.length === 0 ? (
            <div className="py-14 text-center text-xs text-[#777777] space-y-3">
              <Radio size={36} className="mx-auto text-[#cccccc] animate-pulse" />
              <p className="font-medium text-sm text-[#444444]">
                No intelligence records match the active filter criteria.
              </p>
              <p className="text-xs text-[#888888] max-w-md mx-auto">
                Deploy reconnaissance probes from the Covert Operations console to infiltrate enemy star systems and capture telemetry.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('spy')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white text-xs font-mono font-bold uppercase cursor-pointer hover:bg-[#333333]"
              >
                <span>Launch First Infiltration Mission</span>
                <ChevronRight size={13} />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#eeeeee]">
              {filteredMissions.map((m) => (
                <div key={m.id} className="py-4 space-y-3 hover:bg-neutral-50/50 transition-colors p-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {m.success ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={15} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                          <ShieldAlert size={15} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-[#111111]">{m.targetName}</strong>
                          <span
                            className={`px-1.5 py-0.5 border text-[10px] font-mono font-bold uppercase ${
                              m.type === 'sabotage'
                                ? 'bg-purple-50 text-purple-700 border-purple-300'
                                : 'bg-blue-50 text-blue-700 border-blue-300'
                            }`}
                          >
                            {m.type}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                              m.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {m.success ? 'SUCCESSFUL' : 'COMPROMISED'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#888888]">{m.timestamp}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate('targets')}
                      className="self-start sm:self-auto text-xs font-mono font-bold text-[#111111] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Engage Fleet Invasion</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  <p className="text-xs text-[#444444] bg-[#fafafa] p-2.5 border border-[#eeeeee] font-mono leading-relaxed">
                    {m.resultText}
                  </p>

                  {m.intel && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-100/70 border border-[#dedede] p-3 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-[#777777] block uppercase font-bold">
                          Defense Garrison
                        </span>
                        <b className="text-sm text-[#111111]">
                          {m.intel.defenseUnits.toLocaleString()} troops
                        </b>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#777777] block uppercase font-bold">
                          Strike Force
                        </span>
                        <b className="text-sm text-red-600">
                          {m.intel.attackUnits.toLocaleString()} troops
                        </b>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#777777] block uppercase font-bold">
                          Liquid Naquadah Vault
                        </span>
                        <b className="text-sm text-amber-600">
                          {m.intel.naquadah.toLocaleString()} NQ
                        </b>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subpage 2: Enemy Intelligence Dossier */}
      {activeTab === 'enemy-intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Target List Left Column */}
          <div className="border border-[#dedede] bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#eeeeee]">
              <span className="font-bold text-xs font-mono uppercase text-[#111111]">
                Identified Sovereign Realms
              </span>
              <span className="text-[10px] font-mono text-[#888888]">{filteredTargets.length} Realms</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-[#999999]" />
              <input
                type="text"
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                placeholder="Search targets or rulers..."
                className="w-full pl-8 pr-3 py-1.5 border border-[#cccccc] text-xs font-mono focus:border-[#111111] focus:outline-hidden"
              />
            </div>

            {/* Target Selectors */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto no-scrollbar">
              {filteredTargets.map((realm) => {
                const isSelected = realm.id === selectedTarget.id;
                return (
                  <button
                    key={realm.id}
                    type="button"
                    onClick={() => {
                      sound.play('click');
                      setSelectedTargetId(realm.id);
                    }}
                    className={`w-full text-left p-3 border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                        : 'bg-[#fafafa] hover:bg-neutral-100 text-[#222222] border-[#dedede]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-tight">{realm.commanderName}</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-amber-400' : 'text-[#777777]'}`}>
                        Rank: {realm.rank} ({realm.race})
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <span className={`block font-bold ${isSelected ? 'text-white' : 'text-red-600'}`}>
                        DEF L{realm.defenseLevel}
                      </span>
                      <span className={isSelected ? 'text-neutral-300' : 'text-[#888888]'}>
                        {(realm.score / 1000).toFixed(0)}k PTS
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dossier Deep Analysis Right 2 Columns */}
          <div className="lg:col-span-2 border border-[#dedede] bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#eeeeee] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-red-100 text-red-800 font-bold uppercase">
                    DEFENSE LEVEL {selectedTarget.defenseLevel}
                  </span>
                  <span className="text-xs font-mono text-[#666666]">RACE: {selectedTarget.race}</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#111111] mt-1">{selectedTarget.commanderName}</h3>
                <p className="text-xs text-[#777777] font-mono">
                  Rank: <strong>{selectedTarget.rank}</strong> · Realm ID: {selectedTarget.id}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('spy')}
                  className="px-3.5 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Eye size={13} className="text-amber-400" />
                  <span>Scan Target</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('targets')}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Crosshair size={13} />
                  <span>Target Lock</span>
                </button>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5]">
                <span className="text-[10px] text-[#777777] uppercase font-bold block">Empire Score</span>
                <b className="text-base text-[#111111]">{selectedTarget.score.toLocaleString()}</b>
              </div>
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5]">
                <span className="text-[10px] text-[#777777] uppercase font-bold block">Estimated Troops</span>
                <b className="text-base text-[#111111]">{selectedTarget.estimatedUnits.toLocaleString()}</b>
              </div>
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5]">
                <span className="text-[10px] text-[#777777] uppercase font-bold block">Naquadah Cache</span>
                <b className="text-base text-amber-600">{selectedTarget.estimatedNaquadah.toLocaleString()} NQ</b>
              </div>
              <div className="p-3 bg-[#fafafa] border border-[#e5e5e5]">
                <span className="text-[10px] text-[#777777] uppercase font-bold block">Intel Difficulty</span>
                <b className="text-base text-red-600">
                  {selectedTarget.defenseLevel <= 2 ? 'Moderate' : selectedTarget.defenseLevel <= 4 ? 'Hard' : 'Extreme'}
                </b>
              </div>
            </div>

            {/* Strategic Analysis Paragraph */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 text-xs text-amber-950 font-mono space-y-2">
              <div className="font-bold flex items-center gap-1.5 uppercase text-amber-900">
                <AlertTriangle size={14} className="text-amber-600" />
                <span>Naval & Counter-Espionage Intel Assessment</span>
              </div>
              <p className="leading-relaxed">
                {selectedTarget.commanderName} maintains hardened subspace sensor arrays and defense batteries (Anti-Covert Lvl {selectedTarget.antiCovertLevel}).
                Infiltrating this realm requires minimum Level {selectedTarget.antiCovertLevel + 1} Covert Technology to bypass
                automatic orbital intercept grids. Standard recon probes have an estimated 65% baseline success rate.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('sabotage')}
                className="px-4 py-2 border border-purple-300 bg-purple-50 text-purple-900 text-xs font-mono font-bold uppercase hover:bg-purple-600 hover:text-white transition-colors cursor-pointer"
              >
                Commence Covert Sabotage Operation
              </button>
              <button
                type="button"
                onClick={() => onNavigate('targets')}
                className="px-4 py-2 border border-[#cccccc] bg-white text-[#111111] text-xs font-mono font-bold uppercase hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Simulate Fleet Battle Outcome
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subpage 3: Strategic Intel Codex */}
      {activeTab === 'intel-codex' && (
        <div className="border border-[#dedede] bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-[#eeeeee] pb-4">
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16} className="text-amber-500" />
              <span>Covert Operations & Espionage Science Manual</span>
            </h3>
            <p className="text-xs text-[#777777] mt-0.5">
              Definitive strategic doctrine governing infiltration math, probe survival formulas, and counter-recon protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rule 1: Detection Probability */}
            <div className="p-4 border border-[#e5e5e5] bg-[#fafafa] space-y-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#111111] text-amber-400 uppercase">
                MECHANIC 01
              </span>
              <h4 className="text-sm font-bold text-[#111111]">Detection Probability Formula</h4>
              <p className="text-xs text-[#555555] leading-relaxed">
                When sending espionage probes, probability of target counter-detection is calculated as:
              </p>
              <div className="p-3 bg-white border border-[#dedede] font-mono text-xs text-[#111111]">
                <code>P(Detection) = MAX( 5%, MIN( 95%, 50% + (Tech_Enemy_Counter - Tech_Your_Covert) * 10% - Probes * 2% ) )</code>
              </div>
              <p className="text-[11px] text-[#777777]">
                Higher Covert Espionage Technology suppresses probe electromagnetic signature, lowering detection chance.
              </p>
            </div>

            {/* Rule 2: Reconnaissance Resolution Tiers */}
            <div className="p-4 border border-[#e5e5e5] bg-[#fafafa] space-y-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#111111] text-amber-400 uppercase">
                MECHANIC 02
              </span>
              <h4 className="text-sm font-bold text-[#111111]">Reconnaissance Resolution Tiers</h4>
              <p className="text-xs text-[#555555] leading-relaxed">
                The depth of intelligence extracted depends on probe quantity and tech superiority:
              </p>
              <ul className="text-xs text-[#444444] space-y-1 font-mono">
                <li>• <strong>Level 1 (1 Probe):</strong> Surface liquid naquadah reserves & basic garrison.</li>
                <li>• <strong>Level 2 (3 Probes):</strong> Defense structures, active shields & troop roster.</li>
                <li>• <strong>Level 3 (5 Probes):</strong> Strike fleet composition & jump gate status.</li>
                <li>• <strong>Level 4 (10+ Probes):</strong> Research lab levels & active production queues.</li>
              </ul>
            </div>

            {/* Rule 3: Sabotage Operations */}
            <div className="p-4 border border-[#e5e5e5] bg-[#fafafa] space-y-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#111111] text-amber-400 uppercase">
                MECHANIC 03
              </span>
              <h4 className="text-sm font-bold text-[#111111]">Black Ops Sabotage Mechanics</h4>
              <p className="text-xs text-[#555555] leading-relaxed">
                Deploying black ops agents behind enemy lines targets vital planetary infrastructure:
              </p>
              <ul className="text-xs text-[#444444] space-y-1 font-mono">
                <li>• <strong>Silo Demolition:</strong> Destroys 10-25% of unbanked target naquadah.</li>
                <li>• <strong>Shield Overload:</strong> Temporarily reduces target defense rating by 30%.</li>
                <li>• <strong>Sensor Jamming:</strong> Blinds enemy early-warning radar for 3 turns.</li>
              </ul>
            </div>

            {/* Rule 4: Counter-Espionage Shields */}
            <div className="p-4 border border-[#e5e5e5] bg-[#fafafa] space-y-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#111111] text-amber-400 uppercase">
                MECHANIC 04
              </span>
              <h4 className="text-sm font-bold text-[#111111]">Empire Counter-Espionage Grid</h4>
              <p className="text-xs text-[#555555] leading-relaxed">
                Protect your own homeworld and colonial worlds against enemy spies:
              </p>
              <ul className="text-xs text-[#444444] space-y-1 font-mono">
                <li>• Train <strong>Anti-Spies</strong> in the Fleet Training console.</li>
                <li>• Upgrade <strong>Anti-Covert Counter-Sensors</strong> in Research.</li>
                <li>• Deploy <strong>Sensor Phalanx</strong> satellites on your Moon Bases.</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#eeeeee]">
            <span className="text-xs font-mono text-[#777777]">
              Galactic Intelligence Bureau · Classification: ULTRA SECRET
            </span>
            <button
              type="button"
              onClick={() => onNavigate('tech-covert')}
              className="px-4 py-2 bg-[#111111] text-white hover:bg-[#333333] text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
            >
              Upgrade Covert Espionage Tech →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

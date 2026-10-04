import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  Compass,
  Shield,
  Swords,
  Layers,
  Zap,
  Info,
  Search,
  Crown,
  Globe,
  Rocket,
  Cpu,
  Sparkles,
  Sliders,
  Flame,
  Award,
  DollarSign,
  Eye,
  Terminal,
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { sound } from '../../sound';

export const CodexDocumentationView: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('loop');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Calculator State
  const [calcBaseHp, setCalcBaseHp] = useState<number>(100000);
  const [calcShield, setCalcShield] = useState<number>(50000);
  const [calcArmor, setCalcArmor] = useState<number>(30000);
  const [calcResist, setCalcResist] = useState<number>(45);

  const calculatedEhp = Math.round(
    (calcBaseHp + calcShield + calcArmor) / Math.max(0.05, 1 - calcResist / 100)
  );

  const SECTIONS = [
    { id: 'loop', title: '1. 60-System Master Architecture', icon: '🌌', category: 'Core Loop' },
    { id: 'formulas', title: '2. Mathematical Engine & Formulas', icon: '🧮', category: 'Game Engine' },
    { id: 'ogame_stellaris', title: '3. Universe Civilization: Empire at War Specs', icon: '🪐', category: 'Grand Strategy' },
    { id: 'fitting_eve', title: '4. EVE Fitting & 6-Armor Layering', icon: '🛡️', category: 'Fleet Hardpoints' },
    { id: 'stargate_lore', title: '5. Stargate Network & Relic Manual', icon: '🏺', category: 'Precursor Tech' },
    { id: 'ships_roster', title: '6. 90-Class Ship Roster & Tiers', icon: '🛸', category: 'Tactical Fleet' },
    { id: 'rpg_progression', title: '7. 999 RPG Levels & Talent Trees', icon: '👑', category: 'Progression' },
    { id: 'nms_universe', title: '8. NMS Procedural Universe & Worlds', icon: '🌌', category: 'Exploration' },
    { id: 'economy_bank', title: '9. Turn System, DEFCON & Banking', icon: '💵', category: 'Economy' },
    { id: 'tactical_siege', title: '10. Planetary Siege & Intel Manual', icon: '⚔️', category: 'Warfare' },
  ];

  const filteredSections = SECTIONS.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="codex-documentation-root">
      {/* Top Banner Header */}
      <div className="p-6 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-2 border-[#334155] text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none font-mono text-9xl font-extrabold select-none">
          📖
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-[10px] font-bold uppercase tracking-widest">
                GDD Manual & System Codex
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold uppercase tracking-widest">
                Feature 56 Specification
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-white">
              <BookOpen className="w-6 h-6 text-amber-400" />
              <span>Galactic Strategy Codex & Design Manual</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-1">
              Comprehensive game design documentation detailing the 60-feature gameplay loop, mathematical engine formulas, EVE fitting loadouts, Universe Civilization: Empire at War economy scaling, Stellaris demographic mechanics, and Stargate technology specifications.
            </p>
          </div>

          <div className="bg-slate-900/80 p-3 border border-slate-700 text-xs font-mono text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Document Version</span>
            <span className="text-amber-400 font-bold text-sm">v3.8.5 Enterprise</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 border border-[#dedede] bg-white flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Strategy Manual chapters, formulas, ship classes, or Stargate mechanics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-[#ccc] focus:border-[#111] outline-none"
          />
        </div>

        <div className="text-xs font-mono text-[#666] shrink-0">
          Showing <strong>{filteredSections.length}</strong> Manual Chapters
        </div>
      </div>

      {/* Main Layout: Left Navigation Sidebar & Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="border border-[#dedede] bg-white p-3">
            <div className="text-xs font-bold text-[#111] uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
              <span>Manual Contents</span>
              <span className="text-[10px] text-[#777]">10 Chapters</span>
            </div>

            <div className="space-y-1.5">
              {filteredSections.map((sec) => {
                const isActive = selectedSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      sound.play('click');
                      setSelectedSection(sec.id);
                    }}
                    className={`w-full text-left p-3 border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isActive
                        ? 'border-[#111] bg-[#111] text-white font-bold shadow-md'
                        : 'border-[#e8e8e8] bg-white text-[#333] hover:border-[#111] hover:bg-[#fafafa]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{sec.icon}</span>
                      <div>
                        <span className="block text-xs leading-tight">{sec.title}</span>
                        <span
                          className={`text-[9px] font-mono uppercase ${
                            isActive ? 'text-amber-300' : 'text-[#777]'
                          }`}
                        >
                          {sec.category}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Help Box */}
          <div className="p-4 bg-amber-50/80 border border-amber-300 text-xs space-y-2 font-mono">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Commander Manual Tip</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              All formulas in this manual reflect the exact real-time math executed by the game engine during turn processing, battle rounds, and resource production.
            </p>
          </div>
        </div>

        {/* Content Panel (8 cols) */}
        <div className="lg:col-span-8 p-6 bg-white border border-[#dedede] space-y-6">
          {/* ========================================================================= */}
          {/* SECTION 1: 60-SYSTEM MASTER ARCHITECTURE */}
          {/* ========================================================================= */}
          {selectedSection === 'loop' && (
            <div className="space-y-5 text-xs text-[#333] leading-relaxed">
              <div className="border-b border-[#eee] pb-3">
                <span className="text-[10px] font-bold text-cyan-700 font-mono uppercase tracking-widest">
                  Chapter 1 · Core Architecture
                </span>
                <h2 className="text-xl font-black text-[#111] mt-0.5">The Integrated 60-Feature Gameplay Loop</h2>
              </div>

              <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs border-l-4 border-amber-500 leading-relaxed">
                <strong className="text-amber-400 block mb-1">THE MASTER STRATEGIC CYCLE (60 SYSTEMS):</strong>
                Exploration & Deep Space Scanning → Planetary Claiming & Colony Founding → Infrastructure & Mine Construction → Metal / Crystal / Deuterium Extraction → Scientific Research Laboratory Upgrades → 90-Class Shipyard Manufacturing → Hardpoint & Armor Fitting → Armada Battle Formations → Stargate & Jump Gate Deployment → Tactical Fleet Combat & Ground Siege → Debris Field Salvage → Civilization Ethics & Senate Traditions → Megastructure Construction → Galactic Ascension.
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#111] uppercase font-mono">Core System Interdependencies</h3>
                <p>
                  In this grand strategy engine, no sub-system operates in isolation. Every action trickles through the entire galactic empire:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 border border-[#e2e8f0] bg-[#f8fafc]">
                    <strong className="text-[#111] block font-mono text-xs mb-1">1. Population Happiness & Mine Output</strong>
                    <p className="text-[11px] text-[#555]">
                      Colonial happiness above 80% applies up to a +25% bonus multiplier to all local Metal, Crystal, and Deuterium mines. Unrest below 30% triggers industrial strikes and revolts.
                    </p>
                  </div>

                  <div className="p-3 border border-[#e2e8f0] bg-[#f8fafc]">
                    <strong className="text-[#111] block font-mono text-xs mb-1">2. Scientific Specialization & Shipyards</strong>
                    <p className="text-[11px] text-[#555]">
                      Allocating Research Laboratories into Propulsion Specialization reduces Shipyard manufacturing cycle times by 15% and increases sub-light engine velocity.
                    </p>
                  </div>

                  <div className="p-3 border border-[#e2e8f0] bg-[#f8fafc]">
                    <strong className="text-[#111] block font-mono text-xs mb-1">3. Stargate Relics & Flagship Auras</strong>
                    <p className="text-[11px] text-[#555]">
                      Socketing canonical Stargate artifacts (such as the Zero-Point Module or Asgard Core) grants empire-wide energy production surges and flagship command aura buffs.
                    </p>
                  </div>

                  <div className="p-3 border border-[#e2e8f0] bg-[#f8fafc]">
                    <strong className="text-[#111] block font-mono text-xs mb-1">4. DEFCON Level & Reserve Banking</strong>
                    <p className="text-[11px] text-[#555]">
                      Elevating DEFCON security status to Level 1 redirects 20% of commercial income into military readiness while unlocking heavy planetary defense shields.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: MATHEMATICAL ENGINE & FORMULAS */}
          {/* ========================================================================= */}
          {selectedSection === 'formulas' && (
            <div className="space-y-5 text-xs text-[#333] leading-relaxed">
              <div className="border-b border-[#eee] pb-3">
                <span className="text-[10px] font-bold text-amber-700 font-mono uppercase tracking-widest">
                  Chapter 2 · Mathematical Engine
                </span>
                <h2 className="text-xl font-black text-[#111] mt-0.5">Core Game Engine Formulas & Mechanics</h2>
              </div>

              <div className="space-y-4">
                {/* Income Formula */}
                <div className="p-4 border border-[#dedede] bg-[#fafafa]">
                  <h3 className="font-extrabold text-xs text-[#111] uppercase font-mono mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Gross Imperial Income Formula</span>
                  </h3>
                  <div className="p-3 bg-white border border-[#ccc] font-mono text-[11px] text-[#111] mb-2">
                    Gross = ((UntrainedPops × 20) + ((Miners + Lifers) × 80) + PlanetBonuses) × RaceModifier × DefconMultiplier
                  </div>
                  <p className="text-[11px] text-[#555]">
                    Where <code>DefconMultiplier</code> scales from 1.0 at DEFCON 5 down to 0.85 at DEFCON 1 due to wartime economic controls, while <code>RaceModifier</code> provides specialized racial productivity modifiers (e.g. Asgard +20% Tech, Goa'uld +25% Slave Output).
                  </p>
                </div>

                {/* EHP Formula */}
                <div className="p-4 border border-[#dedede] bg-[#fafafa]">
                  <h3 className="font-extrabold text-xs text-[#111] uppercase font-mono mb-2 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Effective Hit Points (EHP) Calculation</span>
                  </h3>
                  <div className="p-3 bg-white border border-[#ccc] font-mono text-[11px] text-[#111] mb-2">
                    EHP = (Base Hull HP + Shield Buffer + Armor Plating) / Max(0.05, 1 - AverageResistance%)
                  </div>
                  <p className="text-[11px] text-[#555]">
                    Resistance mitigation is capped at 95% to prevent infinite durability. Combining multi-layer armor (Kinetic, Thermal, Explosive, Corrosive, Graviton, Neutron) maximizes overall ship survival.
                  </p>
                </div>

                {/* Interactive EHP Calculator */}
                <div className="p-4 bg-[#f0f9ff] border border-sky-300 space-y-3">
                  <h4 className="font-bold text-xs uppercase font-mono text-sky-900 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-sky-700" />
                    <span>Interactive EHP Warship Calculator</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono">
                    <div>
                      <label className="block text-[#666] mb-1">Base Hull HP:</label>
                      <input
                        type="number"
                        value={calcBaseHp}
                        onChange={(e) => setCalcBaseHp(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-sky-300 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#666] mb-1">Shield Buffer HP:</label>
                      <input
                        type="number"
                        value={calcShield}
                        onChange={(e) => setCalcShield(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-sky-300 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#666] mb-1">Armor Plating HP:</label>
                      <input
                        type="number"
                        value={calcArmor}
                        onChange={(e) => setCalcArmor(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-sky-300 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#666] mb-1">Avg Resist (%):</label>
                      <input
                        type="number"
                        value={calcResist}
                        onChange={(e) => setCalcResist(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-sky-300 outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-sky-300 font-mono text-xs flex items-center justify-between">
                    <span className="font-bold text-sky-900">Calculated Warship EHP:</span>
                    <span className="text-sm font-extrabold text-blue-700">{calculatedEhp.toLocaleString()} HP</span>
                  </div>
                </div>

                {/* Mine Exponential Cost Formula */}
                <div className="p-4 border border-[#dedede] bg-[#fafafa]">
                  <h3 className="font-extrabold text-xs text-[#111] uppercase font-mono mb-2 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>Universe Civilization Mine Cost Scaling Formula</span>
                  </h3>
                  <div className="p-3 bg-white border border-[#ccc] font-mono text-[11px] text-[#111] mb-2">
                    Metal Cost(Lvl) = BaseMetal × (1.5 ^ (Lvl - 1)) | Crystal Cost(Lvl) = BaseCrystal × (1.6 ^ (Lvl - 1))
                  </div>
                  <p className="text-[11px] text-[#555]">
                    Mining facility upgrades follow exponential growth curves, encouraging players to expand into multi-planet colonies once high upgrade tiers become capital-intensive.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: UNIVERSE CIVILIZATION: EMPIRE AT WAR SPECS */}
          {/* ========================================================================= */}
          {selectedSection === 'ogame_stellaris' && (
            <div className="space-y-5 text-xs text-[#333] leading-relaxed">
              <div className="border-b border-[#eee] pb-3">
                <span className="text-[10px] font-bold text-purple-700 font-mono uppercase tracking-widest">
                  Chapter 3 · Grand Strategy Architecture
                </span>
                <h2 className="text-xl font-black text-[#111] mt-0.5">Universe Civilization: Empire at War Mechanics</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-purple-200 bg-purple-50/40">
                  <h3 className="font-extrabold text-xs text-purple-900 uppercase font-mono mb-2">
                    1. Universe Civilization Foundations (Features 57 & 59)
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-purple-950 font-mono">
                    <li>
                      <strong>Resource Ratios:</strong> Standard economy operates on a 3:2:1 baseline ratio (Metal:Crystal:Deuterium).
                    </li>
                    <li>
                      <strong>Debris Field Creation:</strong> 30% of structural metal and crystal from destroyed ships in combat creates orbital debris fields harvestable by Recycler fleets.
                    </li>
                    <li>
                      <strong>Sensor Phalanx Array:</strong> Sub-space scanning buildings on Moons that detect incoming fleet movements and arrival timestamps across neighboring galaxy sectors.
                    </li>
                    <li>
                      <strong>Moon Creation:</strong> Battles producing debris fields over 2,000,000 resources have a scaled chance (up to 20%) to coalesce into a permanent Moon.
                    </li>
                  </ul>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50/40">
                  <h3 className="font-extrabold text-xs text-blue-900 uppercase font-mono mb-2">
                    2. Stellaris Expansions (Features 58 & 60)
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-blue-950 font-mono">
                    <li>
                      <strong>Demographic Strata:</strong> Populations are split into Rulers, Specialists, and Workers with distinct resource consumption and political approval weights.
                    </li>
                    <li>
                      <strong>Ethics & Civics:</strong> Empire governance choices (Militarist, Fanatic Materialist, Pacifist, Xenophile) shape policy options and alliance trust.
                    </li>
                    <li>
                      <strong>Megastructure Multi-Stages:</strong> Construction projects evolve through multiple stages (Site → Frame → Core → Fully Operational Megastructure).
                    </li>
                    <li>
                      <strong>Galactic Senate Resolutions:</strong> Galactic voting motions pass binding empire laws regulating trade tariffs, military sanctions, and environmental protection.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: EVE FITTING & 6-ARMOR LAYERING */}
          {/* ========================================================================= */}
          {selectedSection === 'fitting_eve' && (
            <div className="space-y-5 text-xs text-[#333] leading-relaxed">
              <div className="border-b border-[#eee] pb-3">
                <span className="text-[10px] font-bold text-rose-700 font-mono uppercase tracking-widest">
                  Chapter 4 · Fleet Engineering
                </span>
                <h2 className="text-xl font-black text-[#111] mt-0.5">EVE-Inspired Ship Fitting & 6-Type Armor</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-[#dedede] bg-[#fafafa]">
                  <h3 className="font-bold text-xs text-[#111] uppercase font-mono mb-2">
                    Fitting Loadout Constraints: Powergrid & CPU
                  </h3>
                  <p className="text-[11px] text-[#555] leading-relaxed mb-3">
                    Every warship features specific Powergrid (Megawatts - MW) and CPU (Teraflops - TFlops) output limits. Modules installed in High, Mid, or Low slots draw from these resources:
                  </p>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-[#111]">
                    <div className="p-2 bg-white border border-[#ccc]">
                      <strong className="block text-rose-700">HIGH SLOTS</strong>
                      Spinal Lances, Tachyon Cannons, Torpedo Launchers
                    </div>
                    <div className="p-2 bg-white border border-[#ccc]">
                      <strong className="block text-blue-700">MID SLOTS</strong>
                      Phase Deflectors, Warp Scramblers, Shield Rechargers
                    </div>
                    <div className="p-2 bg-white border border-[#ccc]">
                      <strong className="block text-emerald-700">LOW SLOTS</strong>
                      Nanite Repair Units, Armor Plates, Gyro-Stabilizers
                    </div>
                  </div>
                </div>

                {/* 6 Armor Types Table */}
                <div className="border border-[#dedede] overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px] font-mono">
                    <thead>
                      <tr className="bg-[#111] text-white uppercase text-[10px]">
                        <th className="p-2 border border-[#333]">Armor Damage Type</th>
                        <th className="p-2 border border-[#333]">Primary Vulnerability</th>
                        <th className="p-2 border border-[#333]">Best Counter Module</th>
                        <th className="p-2 border border-[#333]">Tactical Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#eee] bg-white">
                        <td className="p-2 font-bold text-rose-700">Kinetic</td>
                        <td className="p-2">Shield Barriers</td>
                        <td className="p-2">Titanium Hardened Bulkheads</td>
                        <td className="p-2">Physical impact, AP shells</td>
                      </tr>
                      <tr className="border-b border-[#eee] bg-[#fafafa]">
                        <td className="p-2 font-bold text-amber-700">Thermal</td>
                        <td className="p-2">Outer Hull Carapace</td>
                        <td className="p-2">Ablative Ceramic Coating</td>
                        <td className="p-2">Coherent laser plasma</td>
                      </tr>
                      <tr className="border-b border-[#eee] bg-white">
                        <td className="p-2 font-bold text-yellow-700">Explosive</td>
                        <td className="p-2">Escort Craft Swarms</td>
                        <td className="p-2">Blast Dampening Plating</td>
                        <td className="p-2">Missile alpha warheads</td>
                      </tr>
                      <tr className="border-b border-[#eee] bg-[#fafafa]">
                        <td className="p-2 font-bold text-emerald-700">Corrosive</td>
                        <td className="p-2">Active Armor Ratings</td>
                        <td className="p-2">Chemical Polymer Weave</td>
                        <td className="p-2">Acidic bio-degradation</td>
                      </tr>
                      <tr className="border-b border-[#eee] bg-white">
                        <td className="p-2 font-bold text-cyan-700">Graviton</td>
                        <td className="p-2">Sub-space Drives</td>
                        <td className="p-2">Singularity Field Stabilizer</td>
                        <td className="p-2">Space-time shear waves</td>
                      </tr>
                      <tr className="border-b border-[#eee] bg-[#fafafa]">
                        <td className="p-2 font-bold text-purple-700">Neutron</td>
                        <td className="p-2">Crew Electronics & AI</td>
                        <td className="p-2">Faraday Lead Layering</td>
                        <td className="p-2">Sub-atomic EMP radiation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: STARGATE NETWORK & RELIC MANUAL */}
          {/* ========================================================================= */}
          {selectedSection === 'stargate_lore' && (
            <div className="space-y-5 text-xs text-[#333] leading-relaxed">
              <div className="border-b border-[#eee] pb-3">
                <span className="text-[10px] font-bold text-cyan-700 font-mono uppercase tracking-widest">
                  Chapter 5 · Precursor Technology
                </span>
                <h2 className="text-xl font-black text-[#111] mt-0.5">Stargate Network & Relic Manual</h2>
              </div>

              <div className="space-y-4">
                <p>
                  The Stargate wormhole relay network spans galaxies, allowing SG Teams and Strike Armadas to dial 6-glyph origin addresses for instant troop transport, off-world resource recovery, and System Lord raids.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 border border-[#dedede] bg-[#fafafa]">
                    <h3 className="font-bold text-xs text-[#111] uppercase font-mono mb-1.5">
                      1. Stargate Dialing & Wormhole Logic
                    </h3>
                    <p className="text-[11px] text-[#555] leading-relaxed">
                      Dialing a target address consumes Naquadah fuel based on galactic distance. Intergalactic 8-glyph jumps (e.g. to Atlantis in Pegasus) require Zero-Point Module (ZPM) power boosting.
                    </p>
                  </div>

                  <div className="p-4 border border-[#dedede] bg-[#fafafa]">
                    <h3 className="font-bold text-xs text-[#111] uppercase font-mono mb-1.5">
                      2. 22 Canonical Artifacts & Sockets
                    </h3>
                    <p className="text-[11px] text-[#555] leading-relaxed">
                      Socket artifacts into your 6 Imperial Matrix Slots (Offense, Energy, Defense, Science, Planetary, Transcendent) to unlock active powers like the ZPM Surge, Dakara Wave, and Ark of Truth.
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-amber-300 bg-amber-50/50 space-y-2">
                  <h3 className="font-bold text-xs uppercase font-mono text-amber-900">
                    System Lord Raids & Alien NPC Races
                  </h3>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    Battle against 27 canonical Stargate alien species (Goa'uld, Asgard, Ancient/Lantean, Wraith, Replicators, Nox, Tollan, Ori, Ursini) in PvE Raids to obtain rare artifacts and Naquadah caches.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 6: 90-CLASS SHIP ROSTER & TIERS */}
          {/* ========================================================================= */}
          {selectedSection === 'ships_roster' && (
            <div className="space-y-5 text-xs text-[#333] leading-relaxed">
              <div className="border-b border-[#eee] pb-3">
                <span className="text-[10px] font-bold text-blue-700 font-mono uppercase tracking-widest">
                  Chapter 6 · Naval Fleet Roster
                </span>
                <h2 className="text-xl font-black text-[#111] mt-0.5">90-Class Ship Roster & 13 Ship Tiers</h2>
              </div>

              <p>
                The imperial shipyard manufactures 90 specialized warship classes spanning 13 distinct tonnage tiers:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 1: Light Fighters</strong>
                  Interceptor, Strike Drone
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 2: Corvettes</strong>
                  Fast Patrol, Escort Frigate
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 3: Frigates</strong>
                  Missile Frigate, Flak Guard
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 4: Destroyers</strong>
                  Artillery Ship, Sensor Array
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 5: Cruisers</strong>
                  Heavy Strike, Phase Shield
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 6: Battlecruisers</strong>
                  Spinal Lance, Carrier Command
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 7: Battleships</strong>
                  Dreadnought, Siege Artillery
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 8: Carriers</strong>
                  Super-Carrier, Drone Hive
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 9: Dreadnoughts</strong>
                  Titan Flagship, Leviathan
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 10: Titans</strong>
                  Colossus, Planet-Buster
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 11: Motherships</strong>
                  Mobile Citadel, Ark Colony
                </div>
                <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0]">
                  <strong className="block text-[#111]">Tier 12: World-Eaters</strong>
                  Stellar Furnace, Void Eater
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 7: 999 RPG LEVELS & TALENT TREES */}
          {/* ========================================================================= */}
          {selectedSection === 'rpg_progression' && (
            <div className="space-y-5 text-xs text-[#333] leading-relaxed">
              <div className="border-b border-[#eee] pb-3">
                <span className="text-[10px] font-bold text-yellow-700 font-mono uppercase tracking-widest">
                  Chapter 7 · RPG Progression
                </span>
                <h2 className="text-xl font-black text-[#111] mt-0.5">999 Levels & RPG Talent Trees</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#fafafa] border border-[#dedede]">
                  <h3 className="font-extrabold text-xs text-[#111] uppercase font-mono mb-2">
                    Experience Curve Formula
                  </h3>
                  <div className="p-3 bg-white border border-[#ccc] font-mono text-[11px] text-[#111] mb-2">
                    XP Required(Level) = Math.floor(1,000 × (Level ^ 1.4))
                  </div>
                  <p className="text-[11px] text-[#555]">
                    Experience is gained from winning space battles, exploring new solar systems, completing daily quests, and upgrading planetary infrastructures.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-3 border border-[#dedede] bg-white">
                    <strong className="text-rose-700 block mb-1">TACTICAL COMMAND TREE</strong>
                    Unlocks +% Critical Chance, Armor Penetration, Flagship Alpha Strike power, and Formation Tactics.
                  </div>
                  <div className="p-3 border border-[#dedede] bg-white">
                    <strong className="text-emerald-700 block mb-1">INDUSTRIAL LOGISTICS TREE</strong>
                    Unlocks +% Mine Throughput, Building Acceleration, Cargo Capacity, and Deposit Interest Rates.
                  </div>
                  <div className="p-3 border border-[#dedede] bg-white">
                    <strong className="text-cyan-700 block mb-1">DEEP SPACE SCIENCE TREE</strong>
                    Unlocks +% Research Speed, Stargate Artifact Drop Chances, and Probe Sensor Ranges.
                  </div>
                  <div className="p-3 border border-[#dedede] bg-white">
                    <strong className="text-purple-700 block mb-1">BLACK OPS & COVERT TREE</strong>
                    Unlocks Stealth Sabotage, Counter-Intelligence Ratios, and Sub-space Fleet Infiltration.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 8: NMS PROCEDURAL UNIVERSE & WORLDS */}
          {/* ========================================================================= */}
          {selectedSection === 'nms_universe' && (
            <div className="space-y-5 text-xs text-[#333] leading-relaxed">
              <div className="border-b border-[#eee] pb-3">
                <span className="text-[10px] font-bold text-emerald-700 font-mono uppercase tracking-widest">
                  Chapter 8 · Universal Exploration
                </span>
                <h2 className="text-xl font-black text-[#111] mt-0.5">No Man's Sky Procedural Universe</h2>
              </div>

              <div className="space-y-4">
                <p>
                  Explore procedural star systems generated with custom atmospheric weather, flora, biological fauna, and ancient precursor ruins.
                </p>

                <div className="p-4 border border-[#dedede] bg-[#fafafa] font-mono text-[11px]">
                  <strong className="text-[#111] block mb-1 uppercase font-bold">A-to-Z Planetary Classifications:</strong>
                  Aetherium Core, Barren Wasteland, Carbon Dense Jungle, Desert Dunes, Frozen Glacial, Gaia Paradise, Irradiated Fallout, Lava Magma World, Ocean Depths, Relic Moon, Tomb World, Xenon Gas Giant.
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 9: ECONOMY, DEFCON & BANKING */}
          {/* ========================================================================= */}
          {selectedSection === 'economy_bank' && (
            <div className="space-y-5 text-xs text-[#333] leading-relaxed">
              <div className="border-b border-[#eee] pb-3">
                <span className="text-[10px] font-bold text-amber-700 font-mono uppercase tracking-widest">
                  Chapter 9 · Imperial Commerce
                </span>
                <h2 className="text-xl font-black text-[#111] mt-0.5">Turn System, DEFCON & Reserve Banking</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-[#dedede] bg-[#fafafa]">
                  <h3 className="font-bold text-xs text-[#111] uppercase font-mono mb-1.5">
                    1. Turn Cycle & Auto-Tick Engine
                  </h3>
                  <p className="text-[11px] text-[#555]">
                    Turns accumulate automatically at a rate of 1 Turn every 60 seconds (up to a max cap of 1,000 Turns). Processing turns calculates resource production, construction progress, and bank interest.
                  </p>
                </div>

                <div className="p-4 border border-[#dedede] bg-[#fafafa]">
                  <h3 className="font-bold text-xs text-[#111] uppercase font-mono mb-1.5">
                    2. Bank Vault & Interest System
                  </h3>
                  <p className="text-[11px] text-[#555]">
                    Banked Naquadah generates 0.5% interest per turn cycle up to the Imperial Vault Capacity: <code>Vault Max = Max(350,000, GrossIncome × 72)</code>. Banked resources are completely protected from enemy fleet raids.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 10: PLANETARY SIEGE & INTEL MANUAL */}
          {/* ========================================================================= */}
          {selectedSection === 'tactical_siege' && (
            <div className="space-y-5 text-xs text-[#333] leading-relaxed">
              <div className="border-b border-[#eee] pb-3">
                <span className="text-[10px] font-bold text-rose-700 font-mono uppercase tracking-widest">
                  Chapter 10 · Tactical Warfare
                </span>
                <h2 className="text-xl font-black text-[#111] mt-0.5">Planetary Siege & Intelligence Manual</h2>
              </div>

              <div className="space-y-4">
                <p>
                  Conduct strategic planetary warfare across orbital space and ground battlefields:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-3 border border-[#dedede] bg-white">
                    <strong className="text-[#111] block mb-1">1. Espionage Probes & Intel Ratios</strong>
                    Probe surveillance compares Espionage Technology levels. Higher tech reveals enemy defense installations, fleet counts, and resource reserves.
                  </div>
                  <div className="p-3 border border-[#dedede] bg-white">
                    <strong className="text-[#111] block mb-1">2. Orbital Bombardment</strong>
                    Battlecruisers and Dreadnoughts can bombard planetary surfaces to degrade defense towers before launching ground troop invasion dropships.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

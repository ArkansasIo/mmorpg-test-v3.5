import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldCheck, Info, Award, Cpu, Globe, Rocket, CheckCircle2 } from 'lucide-react';
import { sound } from '../../sound';

interface PatchNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'update' | 'patch';
  onOpenCredits?: () => void;
}

export const PatchNotesModal: React.FC<PatchNotesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'patch',
  onOpenCredits,
}) => {
  const [activeTab, setActiveTab] = useState<'update' | 'patch'>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" id="patch-notes-modal">
      <div className="bg-white border border-[#dedede] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl font-mono">
        {/* Header */}
        <div className="p-4 border-b border-[#dedede] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2.5">
            <span className="p-1 bg-[#111111] text-amber-400">
              <Sparkles size={16} />
            </span>
            <div>
              <h2 className="text-sm font-black text-[#111111] uppercase tracking-wider">
                Stellar Dominion · Update & Patch Center
              </h2>
              <p className="text-[10px] text-[#777777]">
                Client & Server Protocol v3.5.0-RELEASE · Build #60-SYSTEMS-SYNCED
              </p>
            </div>
          </div>
          <button
            onClick={() => { sound.play('click'); onClose(); }}
            className="p-1 hover:bg-[#eee] cursor-pointer text-[#666]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#dedede] bg-neutral-100 px-4 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('update');
            }}
            className={`px-4 py-2 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
              activeTab === 'update'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#666666] hover:text-[#111111]'
            }`}
          >
            <Info size={13} className="text-cyan-600" />
            <span>Update Info</span>
            <span className="text-[9px] bg-cyan-100 text-cyan-900 px-1 py-0.2 font-bold">v3.5.0</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('patch');
            }}
            className={`px-4 py-2 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
              activeTab === 'patch'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#666666] hover:text-[#111111]'
            }`}
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>Patch Info</span>
            <span className="text-[9px] bg-amber-100 text-amber-900 px-1 py-0.2 font-bold">Changelog</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#444] leading-relaxed">
          {activeTab === 'update' ? (
            <div className="space-y-4">
              {/* Status banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                  <span>Version 3.5.0 Master System Update Operational</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  All 60 canonical strategy and simulation subsystems are synchronized with the galactic database.
                </p>
              </div>

              {/* Version & Build Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 border border-[#dedede] space-y-1">
                  <span className="text-[10px] text-[#777777] uppercase font-bold block">Engine Release Version</span>
                  <div className="text-sm font-black text-[#111111]">v3.5.0-RELEASE</div>
                  <span className="text-[10px] text-[#555555]">Stellar Dominion Core Edition</span>
                </div>

                <div className="p-3 bg-neutral-50 border border-[#dedede] space-y-1">
                  <span className="text-[10px] text-[#777777] uppercase font-bold block">Build Architecture</span>
                  <div className="text-sm font-black text-[#111111]">#60-SYSTEMS-SYNCED</div>
                  <span className="text-[10px] text-[#555555]">React 19 + TypeScript + Vite + Tailwind</span>
                </div>

                <div className="p-3 bg-neutral-50 border border-[#dedede] space-y-1">
                  <span className="text-[10px] text-[#777777] uppercase font-bold block">Galaxy Topology</span>
                  <div className="text-sm font-black text-[#111111]">30 Universes · 90 Galaxies</div>
                  <span className="text-[10px] text-[#555555]">89,910 star systems with [U:G:S:P] coordinates</span>
                </div>

                <div className="p-3 bg-neutral-50 border border-[#dedede] space-y-1">
                  <span className="text-[10px] text-[#777777] uppercase font-bold block">Empire Turn Engine</span>
                  <div className="text-sm font-black text-[#111111]">6 Turns / Minute Cron</div>
                  <span className="text-[10px] text-[#555555]">Compound interest, resource ticks & production</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="border border-[#dedede] p-4 bg-white space-y-2.5">
                <h3 className="text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                  <Rocket size={14} className="text-indigo-600" />
                  <span>Update Highlights & Scope</span>
                </h3>
                <ul className="space-y-1.5 text-[11px] text-[#555555]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Full Universe Civilization: Empire at War Homeworld Dropdown & 7 Colonial management sub-systems.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>1 to 999,999 Procedural Planets Engine with Stargate chevron dialing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Mothership Livery Studio, 12 Modular Systems & Doomsday Lance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Development Team Accreditation & Interactive Credits Viewer.</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Stellar Dominion v3.5.0 Master Patch Changelog</span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2.5">
                  ⭐ Major System Additions & Changes
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-[11px]">
                  <li><strong>Homeworld [1:204:8] & Sovereign World Dropdown System:</strong> Interactive header dropdown button menu displaying all owned worlds with coordinate tags (e.g. Homeworld Earth <code>[1:204:8]</code>, Alpha Site <code>[1:12:4]</code>, Chulak <code>[1:44:8]</code>, Abydos <code>[2:5:3]</code>), building field usages, attached moon indicators, income stats, and instant sub-menu jump triggers.</li>
                  <li><strong>Planetary Sub-Menus & Deep Colonial Pages:</strong> 7 comprehensive colonial management sub-systems: (1) Overview & Biosphere Astrometry, (2) Mines & Subterranean Energy Grid (Metal, Crystal, Deut, Naquadah Core Tap, Solar, Fusion), (3) High-Tech Planetary Facilities (Robotics, Shipyard, Research Labs, Nanite Factory, Terraformer), (4) Hardened Defense Grid Matrix (Rocket Pods, Lasers, Gauss, Plasma Turrets, Shield Domes, ABM/IPM Silos), (5) Lunar Base, Sensor Phalanx & Instant Jump Gates, (6) Governance Directives & Specializations, and (7) All Empire Worlds Macro Comparison Matrix.</li>
                  <li><strong>30 Multiverse Universes & 90 Galaxies per Universe (2,700 Total Galaxies):</strong> Complete inter-universal travel via Dimensional Supergates across 30 distinct cosmic realities (each with unique physics, cosmic modifiers, and ruling hegemonic factions), each housing exactly 90 unique galaxies and 89,910 star systems with full [U:G:S:P] coordinate navigation.</li>
                  <li><strong>1 to 999,999 Procedural Planets Planetary Conquest Engine:</strong> Dial and explore any of the 999,999 procedural celestial worlds with deterministic seed hashing, Stargate 7-chevron addresses, orbital flagship lance strikes, covert Stargate sabotage, ground assault dropships, diplomatic protectorate annexation, 6 colonial infrastructure facilities, tax directives, bookmark registry, and 1-click Imperial Tribute collection.</li>
                  <li><strong>Mothership Hull Themes & Livery Studio:</strong> 7 aesthetic visual doctrines (Imperial Obsidian, Neon Cyberpunk, Precursor Xenotech, Void Stealth, Solar Paladin, Asgard Crystalline, and Chrono-Temporal Singularity) with interactive blueprint schematic visualizer, custom conduit pulse modes, and combat stat multipliers.</li>
                  <li><strong>Expanded Mothership Titan & Flagship Nexus:</strong> 6-tier capital drydock chassis hierarchy, 12 modular subsystems, bridge officer promotions, carrier strike wings, deep space void recon with interactive branching anomaly events, and spinal Doomsday Lance.</li>
                  <li><strong>60-System Feature Matrix:</strong> Implemented all 60 systems from Stellar Dominion 3.5 architecture.</li>
                  <li><strong>EVE-Style Modular Ship Fitting (Feature 10 & 12):</strong> High, Medium, Low & Rig slot customizer with real-time CPU / Powergrid metrics.</li>
                  <li><strong>Six-Type Armor Resistance Engine (Feature 11):</strong> Kinetic, Thermal, Explosive, Corrosive, Graviton, and Neutron damage absorption matrices.</li>
                  <li><strong>Civilization, Population & Happiness (Features 18, 19, 20):</strong> Full demographic pop distribution, cultural traditions, stability meters, and empire welfare edicts.</li>
                  <li><strong>Diplomacy, Treaties & Federations (Features 21 & 22):</strong> Bilateral agreements, embassy envoy assignments, and shared federation vaults.</li>
                  <li><strong>Strategic Codex & GDD Manual (Feature 56):</strong> Full in-game mathematical formulas, Universe Civilization: Empire at War mechanics, and fitting guides.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Cross-Links */}
        <div className="p-3.5 border-t border-[#dedede] bg-[#fafafa] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {onOpenCredits && (
              <button
                type="button"
                onClick={() => {
                  sound.play('click');
                  onClose();
                  onOpenCredits();
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Award size={13} />
                <span>Dev Team Credits (Stephen)</span>
              </button>
            )}
          </div>

          <button
            onClick={() => { sound.play('confirm'); onClose(); }}
            className="px-5 py-2 bg-[#111111] text-white font-bold uppercase tracking-wider hover:bg-[#333] cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

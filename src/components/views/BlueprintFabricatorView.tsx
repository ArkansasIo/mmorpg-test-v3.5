import React, { useState } from 'react';
import {
  Compass,
  Building2,
  Layers,
  Sparkles,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Pickaxe,
  Factory,
  ChevronRight,
  Database,
  ArrowRight,
  Plus,
  Play,
  Trash2,
  TrendingUp,
  Flame,
} from 'lucide-react';
import {
  STRUCTURE_BLUEPRINTS,
  StructureBlueprint,
  BlueprintCategory,
  QueuedStructureFabrication,
} from '../../data/structureBlueprintsData';
import {
  INITIAL_CONSTRUCTION_YARDS,
  ConstructionYardWorld,
} from '../../data/constructionYardsData';
import {
  INITIAL_FABRICATOR_ENHANCEMENTS,
  StructureFabricatorEnhancement,
} from '../../data/fabricatorMasteryData';
import { TemperingForgePanel } from './fabricator/TemperingForgePanel';
import { MasterworkingFoundryPanel } from './fabricator/MasterworkingFoundryPanel';
import { FabricatorMasteryCodexPanel } from './fabricator/FabricatorMasteryCodexPanel';
import { PlayerResources } from '../../types';
import { sound } from '../../sound';

interface BlueprintFabricatorViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
  onNavigate?: (route: string) => void;
}

export const BlueprintFabricatorView: React.FC<BlueprintFabricatorViewProps> = ({
  resources,
  onUpdateResources,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'fabricator' | 'tempering' | 'masterworking' | 'codex'>('fabricator');
  const [selectedCategory, setSelectedCategory] = useState<BlueprintCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [yards, setYards] = useState<ConstructionYardWorld[]>(INITIAL_CONSTRUCTION_YARDS);
  const [selectedWorldId, setSelectedWorldId] = useState<string>(INITIAL_CONSTRUCTION_YARDS[0].id);
  const [selectedBlueprint, setSelectedBlueprint] = useState<StructureBlueprint>(STRUCTURE_BLUEPRINTS[0]);
  const [enhancements, setEnhancements] = useState<Record<string, StructureFabricatorEnhancement>>(() => {
    try {
      const saved = localStorage.getItem('uc_fabricator_enhancements');
      return saved ? JSON.parse(saved) : INITIAL_FABRICATOR_ENHANCEMENTS;
    } catch {
      return INITIAL_FABRICATOR_ENHANCEMENTS;
    }
  });

  const handleUpdateEnhancement = (enh: StructureFabricatorEnhancement) => {
    setEnhancements((prev) => {
      const next = { ...prev, [enh.blueprintId]: enh };
      try {
        localStorage.setItem('uc_fabricator_enhancements', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const [activeQueue, setActiveQueue] = useState<QueuedStructureFabrication[]>([
    {
      id: 'fab_q_01',
      blueprintId: 'bp_mine_deepcore',
      blueprintName: 'Deep-Core Titanium Extractor',
      targetWorldId: 'yard-p1-earth',
      targetWorldName: 'Earth (Sol III)',
      targetType: 'planet',
      turnsRemaining: 1,
      totalTurns: 2,
      fieldsAllocated: 1,
      startedAt: 'Cycle 104.2',
    },
    {
      id: 'fab_q_02',
      blueprintId: 'bp_power_fusion_tokamak',
      blueprintName: 'Deuterium Tokamak Fusion Core',
      targetWorldId: 'yard-p3-tollana',
      targetWorldName: 'New Tollana',
      targetType: 'planet',
      turnsRemaining: 2,
      totalTurns: 3,
      fieldsAllocated: 1,
      startedAt: 'Cycle 104.3',
    },
  ]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories: (BlueprintCategory | 'All')[] = [
    'All',
    'Resource Extraction',
    'Energy & Power',
    'Storage & Logistics',
    'Military & Defense',
    'Shipyard & Orbital',
    'Research & Science',
    'Housing & Population',
    'Government & Administration',
    'Terraforming & Special',
  ];

  const selectedWorld = yards.find((y) => y.id === selectedWorldId) || yards[0];
  const fieldsAvailable = Math.max(0, selectedWorld.fieldsMax - selectedWorld.fieldsUsed);

  // Filter Blueprints
  const filteredBlueprints = STRUCTURE_BLUEPRINTS.filter((bp) => {
    if (selectedCategory !== 'All' && bp.category !== selectedCategory) return false;
    if (selectedTierFilter !== 'all' && bp.tier.toString() !== selectedTierFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        bp.name.toLowerCase().includes(q) ||
        bp.subCategory.toLowerCase().includes(q) ||
        bp.type.toLowerCase().includes(q) ||
        bp.subType.toLowerCase().includes(q) ||
        bp.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Fabrication Action
  const handleFabricate = (bp: StructureBlueprint) => {
    // 1. Check Yard Tier Requirement
    if (selectedWorld.yardLevel < bp.requiredYardLevel) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Cannot fabricate ${bp.name}. Requires Construction Yard Level ${bp.requiredYardLevel} on ${selectedWorld.name} (Current: Lvl ${selectedWorld.yardLevel}).`,
      });
      return;
    }

    // 2. Check Target Type Compatibility
    if (bp.applicableTarget !== 'both' && bp.applicableTarget !== selectedWorld.type) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Incompatible target world type. ${bp.name} can only be fabricated on a ${bp.applicableTarget.toUpperCase()}.`,
      });
      return;
    }

    // 3. Check Buildable Fields Availability
    if (fieldsAvailable < bp.fieldsConsumed) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Insufficient buildable fields on ${selectedWorld.name}. Requires ${bp.fieldsConsumed} fields, only ${fieldsAvailable} available. Expand fields or dismantle structures.`,
      });
      return;
    }

    // 4. Check Resource Costs
    const hasEnough =
      (resources.metal || 0) >= bp.cost.metal &&
      (resources.crystal || 0) >= bp.cost.crystal &&
      (resources.deuterium || 0) >= bp.cost.deuterium &&
      (resources.naquadah || 0) >= bp.cost.naquadah &&
      (resources.credits || 0) >= bp.cost.credits;

    if (!hasEnough) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Insufficient empire resources to commission blueprint "${bp.name}". Check required costs.`,
      });
      return;
    }

    // Deduct Resources
    onUpdateResources({
      metal: Math.max(0, (resources.metal || 0) - bp.cost.metal),
      crystal: Math.max(0, (resources.crystal || 0) - bp.cost.crystal),
      deuterium: Math.max(0, (resources.deuterium || 0) - bp.cost.deuterium),
      naquadah: Math.max(0, (resources.naquadah || 0) - bp.cost.naquadah),
      credits: Math.max(0, (resources.credits || 0) - bp.cost.credits),
    });

    // Update target world field usage
    setYards((prev) =>
      prev.map((y) =>
        y.id === selectedWorld.id
          ? {
              ...y,
              fieldsUsed: y.fieldsUsed + bp.fieldsConsumed,
              activeFabricationsCount: y.activeFabricationsCount + 1,
            }
          : y
      )
    );

    // Queue structure
    const calculatedTurns = Math.max(
      1,
      Math.round(bp.buildTurns / selectedWorld.buildSpeedMultiplier)
    );

    const newQueueItem: QueuedStructureFabrication = {
      id: `fab_q_${Date.now()}`,
      blueprintId: bp.id,
      blueprintName: bp.name,
      targetWorldId: selectedWorld.id,
      targetWorldName: selectedWorld.name,
      targetType: selectedWorld.type,
      turnsRemaining: calculatedTurns,
      totalTurns: calculatedTurns,
      fieldsAllocated: bp.fieldsConsumed,
      startedAt: `Turn Cycle #${Math.floor(Math.random() * 900 + 100)}`,
    };

    setActiveQueue((prev) => [newQueueItem, ...prev]);

    sound.play('confirm');
    setFeedback({
      type: 'success',
      text: `Successfully initiated fabrication of ${bp.name} on ${selectedWorld.name}! Consumed ${bp.fieldsConsumed} fields. Estimated completion in ${calculatedTurns} turns.`,
    });
  };

  // Instant Rush / Advance
  const handleRushFabrication = (queueId: string) => {
    sound.play('confirm');
    setActiveQueue((prev) =>
      prev
        .map((item) => {
          if (item.id === queueId) {
            return { ...item, turnsRemaining: 0 };
          }
          return item;
        })
        .filter((item) => item.turnsRemaining > 0)
    );

    setYards((prev) =>
      prev.map((y) =>
        y.id === selectedWorld.id
          ? {
              ...y,
              activeFabricationsCount: Math.max(0, y.activeFabricationsCount - 1),
              structuresBuiltCount: y.structuresBuiltCount + 1,
            }
          : y
      )
    );

    setFeedback({
      type: 'success',
      text: 'Structure fabrication commissioned and integrated into planetary grid!',
    });
  };

  return (
    <div id="blueprint-fabricator-view" className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="border border-[#dedede] bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-bold text-[#777777] tracking-[2px] uppercase mb-1 flex items-center gap-1.5">
              <Compass size={12} className="text-amber-500" />
              <span>ADVANCED BLUEPRINT FABRICATOR & STRUCTURE CONSTRUCTION MATRIX</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight flex items-center gap-2">
              <span>Structure Blueprint Fabricator</span>
              <span className="text-xs px-2 py-0.5 bg-neutral-900 text-amber-300 rounded font-normal">
                45 Blueprints · 9 Categories
              </span>
            </h1>
            <p className="text-xs text-[#555555] mt-1 max-w-3xl leading-relaxed">
              Synthesize and raise monumental planetary architecture. Every blueprint defines class tiers,
              structural sub-types, resource and buildable field requirements. Fabricate directly onto chosen
              colony worlds or moon bases.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('construction-yards')}
              className="px-4 py-2.5 bg-white border border-[#111111] hover:bg-neutral-100 text-[#111111] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
            >
              <Building2 size={14} className="text-emerald-700" />
              <span>Construction Yards Registry →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fabricator Mode Tabs */}
      <div className="flex border-b border-[#dedede] bg-white overflow-x-auto text-xs font-bold uppercase tracking-wider shadow-2xs">
        <button
          type="button"
          onClick={() => {
            sound.play('click');
            setActiveTab('fabricator');
          }}
          className={`px-4 sm:px-6 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'fabricator'
              ? 'border-[#111111] text-[#111111] bg-neutral-50'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Factory size={14} />
          <span>Blueprint Matrix & Yards</span>
          <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 font-mono">
            45
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.play('click');
            setActiveTab('tempering');
          }}
          className={`px-4 sm:px-6 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'tempering'
              ? 'border-amber-600 text-amber-950 bg-amber-50/50'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Flame size={14} className="text-amber-500" />
          <span>Subspace Tempering Forge</span>
          <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 font-mono font-bold">
            5 MANUALS
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.play('click');
            setActiveTab('masterworking');
          }}
          className={`px-4 sm:px-6 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'masterworking'
              ? 'border-cyan-600 text-cyan-950 bg-cyan-50/50'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Zap size={14} className="text-cyan-600" />
          <span>Masterworking Foundry</span>
          <span className="text-[10px] bg-cyan-100 text-cyan-900 px-1.5 py-0.2 font-mono font-bold">
            12 RANKS
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.play('click');
            setActiveTab('codex');
          }}
          className={`px-4 sm:px-6 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'codex'
              ? 'border-purple-600 text-purple-950 bg-purple-50/50'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Database size={14} className="text-purple-600" />
          <span>Fabrication Mastery Codex</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 border text-xs font-semibold flex items-center justify-between shadow-2xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-rose-700 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-bold text-neutral-500 hover:text-black cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* VIEW MODE 1: STANDARD BLUEPRINT FABRICATOR & CONSTRUCTION MATRIX */}
      {activeTab === 'fabricator' && (
        <div className="space-y-6">
          {/* Target World & Yard Selector Deck */}
          <div className="border border-[#dedede] bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eee] pb-4 mb-4">
          <div>
            <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider block">
              TARGET FABRICATION DESTINATION
            </span>
            <h3 className="text-base font-bold text-[#111111] flex items-center gap-2 mt-0.5">
              <span>{selectedWorld.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-neutral-100 text-neutral-800 border uppercase">
                {selectedWorld.type}
              </span>
            </h3>
          </div>

          {/* World Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#777777]">Switch Target:</span>
            <select
              value={selectedWorldId}
              onChange={(e) => setSelectedWorldId(e.target.value)}
              className="text-xs font-bold border border-neutral-300 bg-white p-2 rounded outline-none focus:border-black cursor-pointer"
            >
              {yards.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name} ({y.type.toUpperCase()} · Lvl {y.yardLevel} Yard)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected World Yard & Fields Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] text-[#888888] uppercase block font-semibold">Construction Yard</span>
            <strong className="text-sm font-bold text-[#111111] block mt-0.5">
              Level {selectedWorld.yardLevel} / 10
            </strong>
            <span className="text-[10px] text-emerald-700 block mt-0.5 font-bold">
              {Math.round(selectedWorld.buildSpeedMultiplier * 100)}% Build Velocity
            </span>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] text-[#888888] uppercase block font-semibold">Max Supported Tier</span>
            <strong className="text-sm font-bold text-[#111111] block mt-0.5">
              Tier {selectedWorld.maxBlueprintTierSupported} Blueprints
            </strong>
            <span className="text-[10px] text-[#777777] block mt-0.5">
              {selectedWorld.maxBlueprintTierSupported === 5 ? 'All Tiers Unlocked' : 'Upgrade Yard for Tier 4-5'}
            </span>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] text-[#888888] uppercase block font-semibold">Buildable Fields</span>
            <strong className="text-sm font-bold text-[#111111] block mt-0.5">
              {selectedWorld.fieldsUsed} / {selectedWorld.fieldsMax} Used
            </strong>
            <div className="w-full h-1.5 bg-neutral-200 mt-1.5 overflow-hidden">
              <div
                className={`h-full ${
                  (selectedWorld.fieldsUsed / selectedWorld.fieldsMax) > 0.85 ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, (selectedWorld.fieldsUsed / selectedWorld.fieldsMax) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] text-[#888888] uppercase block font-semibold">Available Space</span>
            <strong className={`text-sm font-bold block mt-0.5 ${fieldsAvailable > 5 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {fieldsAvailable} Fields Free
            </strong>
            <span className="text-[10px] text-[#777777] block mt-0.5">
              {selectedWorld.activeFabricationsCount} Active in Queue
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="border border-[#dedede] bg-white p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Search size={14} className="text-[#888888]" />
            <input
              type="text"
              placeholder="Search 45 blueprints by name, category, or sub-type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs p-1.5 border border-neutral-300 rounded outline-none focus:border-black font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#777777] shrink-0">Tier:</span>
            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value)}
              className="text-xs p-1.5 border border-neutral-300 rounded bg-white font-mono cursor-pointer"
            >
              <option value="all">All Tiers (1-5)</option>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
              <option value="4">Tier 4</option>
              <option value="5">Tier 5</option>
            </select>
          </div>
        </div>

        {/* 9 Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#111111] text-white border-black shadow-2xs'
                  : 'bg-neutral-50 text-[#555555] border-neutral-200 hover:bg-neutral-100 hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Blueprints Catalog (Left) + Detail / Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 45 Blueprints List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#777777] pb-1 border-b">
            <span>SHOWING {filteredBlueprints.length} OF 45 BLUEPRINTS</span>
            <span>TARGET: {selectedWorld.name}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredBlueprints.map((bp) => {
              const isSelected = selectedBlueprint.id === bp.id;
              const canAfford =
                (resources.metal || 0) >= bp.cost.metal &&
                (resources.crystal || 0) >= bp.cost.crystal &&
                (resources.deuterium || 0) >= bp.cost.deuterium &&
                (resources.naquadah || 0) >= bp.cost.naquadah;
              const hasYardLevel = selectedWorld.yardLevel >= bp.requiredYardLevel;
              const hasFields = fieldsAvailable >= bp.fieldsConsumed;

              return (
                <div
                  key={bp.id}
                  onClick={() => setSelectedBlueprint(bp)}
                  className={`border p-4 transition-all cursor-pointer relative bg-white flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#111111] ring-2 ring-amber-400/50 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-400 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{bp.icon}</span>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-[#777777] block">
                            {bp.category} · {bp.subCategory}
                          </span>
                          <h4 className="text-xs font-bold text-[#111111] leading-tight">
                            {bp.name}
                          </h4>
                        </div>
                      </div>

                      <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-800 text-[10px] font-bold border shrink-0">
                        T{bp.tier}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#666666] line-clamp-2 mb-3">
                      {bp.description}
                    </p>

                    {/* Masterworking & Tempering Badges */}
                    {enhancements[bp.id] && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-2 font-mono text-[9px]">
                        {enhancements[bp.id].masterworkRank > 0 && (
                          <span className="px-1.5 py-0.2 bg-cyan-100 text-cyan-950 font-bold border border-cyan-300">
                            MW RANK {enhancements[bp.id].masterworkRank}
                          </span>
                        )}
                        {enhancements[bp.id].temperedAffixes.map((affix, i) => (
                          <span
                            key={i}
                            className={`px-1.5 py-0.2 font-bold ${
                              affix.isGreater
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            +{affix.value}{affix.unit} {affix.affixName.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats & Specification Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3 text-[10px]">
                      <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 border">
                        Fields: <strong>{bp.fieldsConsumed}</strong>
                      </span>
                      <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 border">
                        Base: <strong>{bp.buildTurns} Turns</strong>
                      </span>
                      <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 border">
                        Yard Req: <strong>Lvl {bp.requiredYardLevel}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Resource Cost Summary */}
                  <div className="border-t border-neutral-100 pt-2.5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-[#555555]">
                      <span>{bp.cost.metal.toLocaleString()} M</span>
                      <span>{bp.cost.crystal.toLocaleString()} C</span>
                      <span>{bp.cost.deuterium.toLocaleString()} D</span>
                      <span>{bp.cost.naquadah.toLocaleString()} N</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlueprint(bp);
                          sound.play('click');
                          setActiveTab('tempering');
                        }}
                        title="Forge / Temper Blueprint"
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Flame size={10} className="text-amber-600" />
                        <span>Temper</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlueprint(bp);
                          sound.play('click');
                          setActiveTab('masterworking');
                        }}
                        title="Quantum Masterworking"
                        className="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-950 border border-cyan-300 text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Zap size={10} className="text-cyan-600" />
                        <span>MW</span>
                      </button>
                      <button
                        type="button"
                        disabled={!canAfford || !hasYardLevel || !hasFields}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFabricate(bp);
                        }}
                        className={`px-3 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          canAfford && hasYardLevel && hasFields
                            ? 'bg-[#111111] hover:bg-[#333333] text-white shadow-2xs'
                            : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                        }`}
                      >
                        Fabricate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Blueprint Detail & Active Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Blueprint Dossier Card */}
          <div className="border border-[#dedede] bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-[#eee] pb-3">
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">
                BLUEPRINT SPECIFICATIONS DOSSIER
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl">{selectedBlueprint.icon}</span>
                <div>
                  <h3 className="text-sm font-extrabold text-[#111111] leading-tight">
                    {selectedBlueprint.name}
                  </h3>
                  <span className="text-[10px] text-[#777777]">
                    Tier {selectedBlueprint.tier} · {selectedBlueprint.type}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#555555] leading-relaxed">
              {selectedBlueprint.description}
            </p>

            {/* Structure Classification Hierarchy */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#777777]">Classification:</span>
                <strong className="text-[#111111]">{selectedBlueprint.category}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Sub-Category:</span>
                <strong className="text-[#111111]">{selectedBlueprint.subCategory}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Structural Type:</span>
                <strong className="text-[#111111]">{selectedBlueprint.type}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Engineering Sub-Type:</span>
                <strong className="text-[#111111]">{selectedBlueprint.subType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Deployable Target:</span>
                <strong className="text-[#111111] uppercase">{selectedBlueprint.applicableTarget}</strong>
              </div>
            </div>

            {/* Yields & Operational Bonuses */}
            <div className="border border-neutral-200 p-3 space-y-1 text-xs">
              <span className="text-[10px] text-[#888888] uppercase font-bold block mb-1">
                Projected Output & Bonuses
              </span>
              {selectedBlueprint.stats.productionBonusPct && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Production Yield Bonus:</span>
                  <span>+{selectedBlueprint.stats.productionBonusPct}%</span>
                </div>
              )}
              {selectedBlueprint.stats.energyOutput && (
                <div className={`flex justify-between font-bold ${selectedBlueprint.stats.energyOutput > 0 ? 'text-amber-600' : 'text-rose-700'}`}>
                  <span>Energy Network Flux:</span>
                  <span>{selectedBlueprint.stats.energyOutput > 0 ? `+${selectedBlueprint.stats.energyOutput}` : selectedBlueprint.stats.energyOutput} GW</span>
                </div>
              )}
              {selectedBlueprint.stats.defenseRating && (
                <div className="flex justify-between text-blue-700 font-bold">
                  <span>Planetary Defense Rating:</span>
                  <span>+{selectedBlueprint.stats.defenseRating} pts</span>
                </div>
              )}
              {selectedBlueprint.stats.storageCapacity && (
                <div className="flex justify-between text-neutral-800 font-bold">
                  <span>Vault Storage Expanded:</span>
                  <span>+{selectedBlueprint.stats.storageCapacity.toLocaleString()}</span>
                </div>
              )}
              {selectedBlueprint.stats.populationCapacity && (
                <div className="flex justify-between text-purple-700 font-bold">
                  <span>Habitation Capacity:</span>
                  <span>+{selectedBlueprint.stats.populationCapacity.toLocaleString()}</span>
                </div>
              )}
              {selectedBlueprint.stats.researchPointsPerTurn && (
                <div className="flex justify-between text-sky-700 font-bold">
                  <span>R&D Scientific Rate:</span>
                  <span>+{selectedBlueprint.stats.researchPointsPerTurn} pts/turn</span>
                </div>
              )}
            </div>

            {/* Required Resources for Commissioning */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] text-[#777777] uppercase font-bold block">
                Required Commissioning Cost
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-neutral-50 border flex justify-between">
                  <span className="text-[#666666]">Metal:</span>
                  <span className="font-bold">{selectedBlueprint.cost.metal.toLocaleString()}</span>
                </div>
                <div className="p-2 bg-neutral-50 border flex justify-between">
                  <span className="text-[#666666]">Crystal:</span>
                  <span className="font-bold">{selectedBlueprint.cost.crystal.toLocaleString()}</span>
                </div>
                <div className="p-2 bg-neutral-50 border flex justify-between">
                  <span className="text-[#666666]">Deuterium:</span>
                  <span className="font-bold">{selectedBlueprint.cost.deuterium.toLocaleString()}</span>
                </div>
                <div className="p-2 bg-neutral-50 border flex justify-between">
                  <span className="text-[#666666]">Naquadah:</span>
                  <span className="font-bold">{selectedBlueprint.cost.naquadah.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Tempering & Masterworking Quick Access */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#777777] uppercase font-bold">Fabricator Enhancements:</span>
                <span className="text-[10px] font-bold text-cyan-800">
                  MW Rank {enhancements[selectedBlueprint.id]?.masterworkRank || 0} / 12
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setActiveTab('tempering');
                  }}
                  className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold uppercase text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Flame size={11} className="text-amber-600" />
                  <span>Forge / Temper</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setActiveTab('masterworking');
                  }}
                  className="py-1.5 px-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-950 border border-cyan-300 font-bold uppercase text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Zap size={11} className="text-cyan-600" />
                  <span>Masterworking</span>
                </button>
              </div>
            </div>

            {/* Commission Action Button */}
            <button
              type="button"
              onClick={() => handleFabricate(selectedBlueprint)}
              className="w-full py-3 bg-[#111111] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Commission onto {selectedWorld.name}</span>
            </button>
          </div>

          {/* Active Fabrication Construction Queue */}
          <div className="border border-[#dedede] bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-[#eee] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
                  ACTIVE CONSTRUCTION QUEUE
                </span>
                <h4 className="text-xs font-bold text-[#111111]">
                  Planetary Yard Assemblers
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-800 border">
                {activeQueue.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {activeQueue.map((item) => (
                <div key={item.id} className="p-3 border border-neutral-200 bg-neutral-50 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="block text-xs font-bold text-[#111111] leading-tight">
                        {item.blueprintName}
                      </strong>
                      <span className="text-[10px] text-[#777777]">
                        Site: {item.targetWorldName} ({item.fieldsAllocated} Fields)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                      {item.turnsRemaining} Turns
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-neutral-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-500"
                      style={{
                        width: `${Math.max(10, ((item.totalTurns - item.turnsRemaining) / item.totalTurns) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#888888]">{item.startedAt}</span>
                    <button
                      type="button"
                      onClick={() => handleRushFabrication(item.id)}
                      className="px-2 py-0.5 bg-black hover:bg-neutral-800 text-white text-[10px] uppercase font-bold cursor-pointer"
                    >
                      Instant Rush →
                    </button>
                  </div>
                </div>
              ))}

              {activeQueue.length === 0 && (
                <div className="p-6 text-center text-xs text-[#888888]">
                  No active fabrications currently in progress. Select a blueprint and commission construction above.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    )}

      {/* VIEW MODE 2: SUBSPACE TEMPERING FORGE */}
      {activeTab === 'tempering' && (
        <TemperingForgePanel
          selectedBlueprint={selectedBlueprint}
          allBlueprints={STRUCTURE_BLUEPRINTS}
          onSelectBlueprint={setSelectedBlueprint}
          enhancement={enhancements[selectedBlueprint.id]}
          onUpdateEnhancement={handleUpdateEnhancement}
          resources={resources}
          onUpdateResources={onUpdateResources}
          onNavigateToMasterworking={() => {
            sound.play('click');
            setActiveTab('masterworking');
          }}
        />
      )}

      {/* VIEW MODE 3: QUANTUM MASTERWORKING FOUNDRY */}
      {activeTab === 'masterworking' && (
        <MasterworkingFoundryPanel
          selectedBlueprint={selectedBlueprint}
          allBlueprints={STRUCTURE_BLUEPRINTS}
          onSelectBlueprint={setSelectedBlueprint}
          enhancement={enhancements[selectedBlueprint.id]}
          onUpdateEnhancement={handleUpdateEnhancement}
          resources={resources}
          onUpdateResources={onUpdateResources}
          onNavigateToTempering={() => {
            sound.play('click');
            setActiveTab('tempering');
          }}
        />
      )}

      {/* VIEW MODE 4: FABRICATION MASTERY CODEX */}
      {activeTab === 'codex' && <FabricatorMasteryCodexPanel />}
    </div>
  );
};

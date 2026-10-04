import React, { useState } from 'react';
import {
  Building2,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Globe,
  Moon,
  Zap,
  Wrench,
  Shield,
  Clock,
  Compass,
} from 'lucide-react';
import {
  INITIAL_CONSTRUCTION_YARDS,
  ConstructionYardWorld,
} from '../../data/constructionYardsData';
import { PlayerResources } from '../../types';
import { sound } from '../../sound';

interface ConstructionYardsViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
  onNavigate?: (route: string) => void;
}

export const ConstructionYardsView: React.FC<ConstructionYardsViewProps> = ({
  resources,
  onUpdateResources,
  onNavigate,
}) => {
  const [yards, setYards] = useState<ConstructionYardWorld[]>(INITIAL_CONSTRUCTION_YARDS);
  const [selectedWorldFilter, setSelectedWorldFilter] = useState<'all' | 'planet' | 'moon'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Totals telemetry
  const totalFields = yards.reduce((sum, y) => sum + y.fieldsMax, 0);
  const totalUsedFields = yards.reduce((sum, y) => sum + y.fieldsUsed, 0);
  const totalAvailableFields = totalFields - totalUsedFields;
  const overallUsagePct = Math.round((totalUsedFields / totalFields) * 100);

  // Filtered worlds
  const filteredYards = yards.filter((y) => {
    if (selectedWorldFilter !== 'all' && y.type !== selectedWorldFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        y.name.toLowerCase().includes(q) ||
        y.yardName.toLowerCase().includes(q) ||
        y.coordinate.toLowerCase().includes(q) ||
        y.biome.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Upgrade Construction Yard
  const handleUpgradeYard = (worldId: string) => {
    const world = yards.find((y) => y.id === worldId);
    if (!world) return;

    if (world.yardLevel >= 10) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `${world.name} Construction Yard is already at maximum Level 10 (Arch-Orbital Forge).`,
      });
      return;
    }

    const nextLvl = world.yardLevel + 1;
    const costMetal = nextLvl * 6500;
    const costCrystal = nextLvl * 4200;
    const costDeut = nextLvl * 1500;
    const costNaq = nextLvl * 800;
    const costCredits = nextLvl * 1200;

    const canAfford =
      (resources.metal || 0) >= costMetal &&
      (resources.crystal || 0) >= costCrystal &&
      (resources.deuterium || 0) >= costDeut &&
      (resources.naquadah || 0) >= costNaq &&
      (resources.credits || 0) >= costCredits;

    if (!canAfford) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Insufficient resources to upgrade ${world.name} Construction Yard to Level ${nextLvl}. Requires ${costMetal.toLocaleString()} Metal, ${costCrystal.toLocaleString()} Crystal, ${costNaq.toLocaleString()} Naq.`,
      });
      return;
    }

    onUpdateResources({
      metal: Math.max(0, (resources.metal || 0) - costMetal),
      crystal: Math.max(0, (resources.crystal || 0) - costCrystal),
      deuterium: Math.max(0, (resources.deuterium || 0) - costDeut),
      naquadah: Math.max(0, (resources.naquadah || 0) - costNaq),
      credits: Math.max(0, (resources.credits || 0) - costCredits),
    });

    const newSpeed = +(1.0 + nextLvl * 0.25).toFixed(2);
    const newTier = Math.min(5, Math.floor(nextLvl / 2) + 1);

    setYards((prev) =>
      prev.map((y) =>
        y.id === worldId
          ? {
              ...y,
              yardLevel: nextLvl,
              buildSpeedMultiplier: newSpeed,
              maxBlueprintTierSupported: newTier,
            }
          : y
      )
    );

    sound.play('confirm');
    setFeedback({
      type: 'success',
      text: `Upgraded ${world.name} Construction Yard to Level ${nextLvl}! Build velocity increased to ${Math.round(newSpeed * 100)}% and supports Tier ${newTier} Blueprints.`,
    });
  };

  // Expand Buildable Fields Action (Terraform / Deep Lunar Bore)
  const handleExpandFields = (worldId: string) => {
    const world = yards.find((y) => y.id === worldId);
    if (!world) return;

    const costMetal = 8000 + world.fieldsMax * 25;
    const costCrystal = 5000 + world.fieldsMax * 20;
    const costDeut = 2000 + world.fieldsMax * 10;
    const costNaq = 1000 + world.fieldsMax * 5;

    const canAfford =
      (resources.metal || 0) >= costMetal &&
      (resources.crystal || 0) >= costCrystal &&
      (resources.deuterium || 0) >= costDeut &&
      (resources.naquadah || 0) >= costNaq;

    if (!canAfford) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Insufficient supplies to clear additional planetary fields on ${world.name}. Requires ${costMetal.toLocaleString()} Metal, ${costCrystal.toLocaleString()} Crystal, ${costNaq.toLocaleString()} Naq.`,
      });
      return;
    }

    onUpdateResources({
      metal: Math.max(0, (resources.metal || 0) - costMetal),
      crystal: Math.max(0, (resources.crystal || 0) - costCrystal),
      deuterium: Math.max(0, (resources.deuterium || 0) - costDeut),
      naquadah: Math.max(0, (resources.naquadah || 0) - costNaq),
    });

    const extraFields = world.type === 'planet' ? 10 : 5;

    setYards((prev) =>
      prev.map((y) =>
        y.id === worldId
          ? {
              ...y,
              fieldsMax: y.fieldsMax + extraFields,
            }
          : y
      )
    );

    sound.play('confirm');
    setFeedback({
      type: 'success',
      text: `Planetary terraforming & excavation successful on ${world.name}! Unlocked +${extraFields} new buildable fields.`,
    });
  };

  return (
    <div id="construction-yards-view" className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="border border-[#dedede] bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-bold text-[#777777] tracking-[2px] uppercase mb-1 flex items-center gap-1.5">
              <Building2 size={12} className="text-emerald-600" />
              <span>PLANETARY & LUNAR CONSTRUCTION YARDS & FIELDS REGISTRY</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight flex items-center gap-2">
              <span>Construction Yards & Fields Allocation</span>
              <span className="text-xs px-2 py-0.5 bg-neutral-900 text-emerald-300 rounded font-normal">
                {yards.length} Active Yards · {totalFields} Total Fields
              </span>
            </h1>
            <p className="text-xs text-[#555555] mt-1 max-w-3xl leading-relaxed">
              Every planet and moon offers a limited number of buildable fields. Construction yards determine
              assembly speed and which blueprint tiers you may raise. Manage yard levels and field allocation
              across your sovereign empire.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('blueprint-fabricator')}
              className="px-4 py-2.5 bg-[#111111] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
            >
              <Compass size={14} className="text-amber-400" />
              <span>Open Blueprint Fabricator →</span>
            </button>
          </div>
        </div>
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

      {/* Global Fields & Yards Telemetry Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#dedede] bg-white p-4 shadow-xs">
          <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider block">
            Empire Buildable Fields
          </span>
          <strong className="text-2xl font-bold text-[#111111] block mt-1 font-mono">
            {totalUsedFields} / {totalFields}
          </strong>
          <div className="w-full h-1.5 bg-neutral-200 mt-2 overflow-hidden">
            <div
              className={`h-full ${overallUsagePct > 80 ? 'bg-rose-600' : 'bg-emerald-600'}`}
              style={{ width: `${overallUsagePct}%` }}
            />
          </div>
          <span className="text-[10px] text-[#777777] block mt-1.5 font-mono">
            {overallUsagePct}% Empire Land Utilization
          </span>
        </div>

        <div className="border border-[#dedede] bg-white p-4 shadow-xs">
          <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider block">
            Remaining Buildable Space
          </span>
          <strong className="text-2xl font-bold text-emerald-700 block mt-1 font-mono">
            {totalAvailableFields} Fields
          </strong>
          <span className="text-[10px] text-[#777777] block mt-1.5">
            Available across {yards.length} colonial worlds & moons
          </span>
        </div>

        <div className="border border-[#dedede] bg-white p-4 shadow-xs">
          <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider block">
            Construction Yards
          </span>
          <strong className="text-2xl font-bold text-[#111111] block mt-1 font-mono">
            {yards.length} Operational
          </strong>
          <span className="text-[10px] text-amber-700 block mt-1.5 font-bold">
            Avg Velocity: {(yards.reduce((s, y) => s + y.buildSpeedMultiplier, 0) / yards.length).toFixed(2)}x
          </span>
        </div>

        <div className="border border-[#dedede] bg-white p-4 shadow-xs">
          <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider block">
            Active Structures Standing
          </span>
          <strong className="text-2xl font-bold text-[#111111] block mt-1 font-mono">
            {yards.reduce((s, y) => s + y.structuresBuiltCount, 0)} Complexes
          </strong>
          <span className="text-[10px] text-[#777777] block mt-1.5">
            {yards.reduce((s, y) => s + y.activeFabricationsCount, 0)} Ongoing Fabrications
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-[#dedede] bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search size={14} className="text-[#888888]" />
          <input
            type="text"
            placeholder="Search construction yards by colony name, biome, coordinate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-1.5 border border-neutral-300 rounded outline-none focus:border-black font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSelectedWorldFilter('all')}
            className={`px-3 py-1.5 border rounded cursor-pointer ${
              selectedWorldFilter === 'all'
                ? 'bg-black text-white border-black font-bold'
                : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            All Worlds ({yards.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedWorldFilter('planet')}
            className={`px-3 py-1.5 border rounded cursor-pointer flex items-center gap-1 ${
              selectedWorldFilter === 'planet'
                ? 'bg-black text-white border-black font-bold'
                : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <Globe size={12} />
            <span>Planets</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedWorldFilter('moon')}
            className={`px-3 py-1.5 border rounded cursor-pointer flex items-center gap-1 ${
              selectedWorldFilter === 'moon'
                ? 'bg-black text-white border-black font-bold'
                : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <Moon size={12} />
            <span>Moons</span>
          </button>
        </div>
      </div>

      {/* Worlds Construction Yards Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredYards.map((world) => {
          const usagePct = Math.round((world.fieldsUsed / world.fieldsMax) * 100);
          const fieldsLeft = world.fieldsMax - world.fieldsUsed;
          const upgradeCostMetal = (world.yardLevel + 1) * 6500;
          const upgradeCostCrystal = (world.yardLevel + 1) * 4200;

          return (
            <div
              key={world.id}
              className="border border-neutral-300 bg-white p-5 shadow-xs hover:border-black transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* World Header */}
                <div className="flex items-start justify-between border-b pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xs bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-2xs">
                      {world.type === 'planet' ? <Globe size={18} /> : <Moon size={18} />}
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#777777] block font-bold">
                        {world.coordinate} · {world.biome}
                      </span>
                      <h3 className="text-sm font-bold text-[#111111] leading-tight">
                        {world.name}
                      </h3>
                      {world.parentPlanetName && (
                        <span className="text-[10px] text-[#888888] block">
                          Orbiting: {world.parentPlanetName}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-800 text-[10px] font-bold border uppercase">
                    {world.type}
                  </span>
                </div>

                {/* Yard Status */}
                <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#666666] font-semibold">Yard Facility:</span>
                    <strong className="text-emerald-800 font-bold">
                      Level {world.yardLevel} / 10
                    </strong>
                  </div>
                  <div className="text-[11px] text-[#111111] font-semibold">
                    {world.yardName}
                  </div>
                  <div className="flex justify-between text-[11px] text-[#666666]">
                    <span>Build Speed:</span>
                    <span className="font-bold text-black">{Math.round(world.buildSpeedMultiplier * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#666666]">
                    <span>Max Blueprint Tier:</span>
                    <span className="font-bold text-amber-700">Tier {world.maxBlueprintTierSupported}</span>
                  </div>
                </div>

                {/* Fields Allocation Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#777777] font-semibold">Fields Capacity:</span>
                    <strong className="text-[#111111]">
                      {world.fieldsUsed} / {world.fieldsMax} ({usagePct}%)
                    </strong>
                  </div>

                  <div className="w-full h-2.5 bg-neutral-200 overflow-hidden rounded-2xs">
                    <div
                      className={`h-full transition-all duration-500 ${
                        usagePct > 85 ? 'bg-rose-600' : usagePct > 60 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, usagePct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-[#777777]">
                    <span>{fieldsLeft} Available Fields</span>
                    <span>{world.structuresBuiltCount} Erected Structures</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-3 mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleUpgradeYard(world.id)}
                  disabled={world.yardLevel >= 10}
                  className={`w-full py-2 px-3 text-xs font-bold uppercase transition-all flex items-center justify-between cursor-pointer border ${
                    world.yardLevel < 10
                      ? 'bg-neutral-900 hover:bg-black text-white border-black shadow-2xs'
                      : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Wrench size={13} className="text-amber-400" />
                    <span>Upgrade Yard to Lvl {world.yardLevel + 1}</span>
                  </span>
                  <span className="text-[10px] text-neutral-300 font-mono">
                    {upgradeCostMetal.toLocaleString()} M · {upgradeCostCrystal.toLocaleString()} C
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExpandFields(world.id)}
                  className="w-full py-1.5 px-3 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold uppercase transition-all flex items-center justify-between cursor-pointer border border-neutral-300 shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-600" />
                    <span>Expand Land ({world.type === 'planet' ? '+10 Fields' : '+5 Fields'})</span>
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Terraform / Bore
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Layers,
  Shield,
  Landmark,
  Zap,
  Cpu,
  Radio,
  Truck,
  FlaskConical,
  Users,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { sound } from '../../sound';
import {
  PlayerResources,
  MasterUpgradesState,
  ImperialUpgradeDefinition,
  ImperialUpgradeCategory,
} from '../../types';
import {
  IMPERIAL_UPGRADES_CATALOG,
  calculateUpgradeCost,
  DEFAULT_MASTER_UPGRADES_STATE,
} from '../../utils/upgradeCalculations';

interface MasterUpgradesViewProps {
  resources: PlayerResources;
  upgradesState?: MasterUpgradesState;
  onUpgradeKey: (key: string, cost: { metal: number; crystal: number; deuterium: number; naquadah: number }) => void;
  onNavigate?: (route: string) => void;
  initialCategory?: ImperialUpgradeCategory | 'all';
}

export const MasterUpgradesView: React.FC<MasterUpgradesViewProps> = ({
  resources,
  upgradesState = DEFAULT_MASTER_UPGRADES_STATE,
  onUpgradeKey,
  onNavigate,
  initialCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ImperialUpgradeCategory | 'all'>(initialCategory);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const localState = upgradesState || DEFAULT_MASTER_UPGRADES_STATE;

  const categories: Array<{ id: ImperialUpgradeCategory | 'all'; label: string; icon: string }> = [
    { id: 'all', label: 'All Imperial Upgrades', icon: '🌌' },
    { id: 'banking', label: 'Bank & Vault Citadel', icon: '🏛️' },
    { id: 'storage', label: 'Resource Storage Silos', icon: '📦' },
    { id: 'industrial', label: 'Industrial Automation', icon: '🏭' },
    { id: 'defenses', label: 'Shield & Defense Grids', icon: '🛡️' },
    { id: 'logistics', label: 'Logistics & Hyperlanes', icon: '🚀' },
    { id: 'science', label: 'Science & Quantum Labs', icon: '🔬' },
    { id: 'workforce', label: 'Workforce Cybernetics', icon: '🦾' },
  ];

  const filteredUpgrades = IMPERIAL_UPGRADES_CATALOG.filter(
    (upg) => selectedCategory === 'all' || upg.category === selectedCategory
  );

  const getUpgradeLevel = (upg: ImperialUpgradeDefinition): number => {
    if (upg.category === 'banking') {
      return (localState.bank?.[upg.key as keyof typeof localState.bank] as number) || upg.level;
    }
    if (upg.category === 'storage') {
      return (localState.storage?.[upg.key as keyof typeof localState.storage] as number) || upg.level;
    }
    return (localState[upg.key as keyof MasterUpgradesState] as number) || upg.level;
  };

  const handlePurchaseUpgrade = (upg: ImperialUpgradeDefinition) => {
    const currentLevel = getUpgradeLevel(upg);
    if (currentLevel >= upg.maxLevel) {
      sound.play('warning');
      setFeedback({ type: 'error', text: `${upg.name} has already achieved maximum Tier ${upg.maxLevel}!` });
      return;
    }

    const cost = calculateUpgradeCost(upg, currentLevel + 1);

    if (
      resources.metal < cost.metal ||
      resources.crystal < cost.crystal ||
      resources.deuterium < cost.deuterium ||
      resources.naquadah < cost.naquadah
    ) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Insufficient resources to construct Tier ${currentLevel + 1} ${upg.name}! Required: ${cost.metal.toLocaleString()} Metal, ${cost.crystal.toLocaleString()} Crystal, ${cost.deuterium.toLocaleString()} Deut, ${cost.naquadah.toLocaleString()} NQ.`,
      });
      return;
    }

    onUpgradeKey(upg.key, cost);
    sound.play('confirm');
    setFeedback({
      type: 'success',
      text: `Successfully upgraded ${upg.name} to Tier ${currentLevel + 1}! Imperial bonuses active across all worlds.`,
    });
  };

  // Summary counts
  const totalUpgradesCount = IMPERIAL_UPGRADES_CATALOG.length;
  const totalTiersUnlocked = IMPERIAL_UPGRADES_CATALOG.reduce((sum, u) => sum + getUpgradeLevel(u), 0);

  return (
    <div id="master-upgrades-view" className="space-y-6">
      {/* Header */}
      <div className="border border-[#dedede] bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
              IMPERIAL ARCHITECTURE · MASTER UPGRADES MATRIX
            </div>
            <h2 className="text-2xl font-bold text-[#111111]">Empire Infrastructure & Universal Upgrades</h2>
            <p className="text-sm text-[#666666] mt-1 max-w-3xl leading-relaxed">
              Construct high-tier structural improvements across all seven imperial sectors: Bank Fortifications,
              Resource Storage Silos, Industrial Automation, Planetary Shields, Subspace Hyperlanes, Scientific Colliders, and Workforce Cybernetics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('blueprint-fabricator')}
              className="px-3.5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              <span>📐 Blueprint Fabricator (45 Types)</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('construction-yards')}
              className="px-3.5 py-2.5 bg-white border border-[#111111] hover:bg-neutral-100 text-[#111111] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              <span>🏗️ Construction Yards & Fields</span>
            </button>
            <div className="border border-[#dedede] bg-[#fafafa] p-3 text-right">
              <span className="text-[10px] font-bold text-[#777777] uppercase block">Total Tiers Active</span>
              <strong className="text-lg font-mono text-[#111111]">{totalTiersUnlocked} Tiers</strong>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 border-t border-[#eeeeee] pt-4 mt-5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#fafafa] text-[#555555] hover:bg-[#f0f0f0] border border-[#dedede]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`p-4 border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-[#fafafa] border-[#111111] text-[#111111] border-l-4'
              : 'bg-[#fff5f5] border-[#dc2626] text-[#dc2626] border-l-4'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[#888888] hover:text-[#111111] ml-4 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upgrades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUpgrades.map((upg) => {
          const currentLevel = getUpgradeLevel(upg);
          const isMaxed = currentLevel >= upg.maxLevel;
          const cost = calculateUpgradeCost(upg, currentLevel + 1);
          const canAfford =
            resources.metal >= cost.metal &&
            resources.crystal >= cost.crystal &&
            resources.deuterium >= cost.deuterium &&
            resources.naquadah >= cost.naquadah;

          return (
            <div
              key={upg.id}
              className={`border bg-white p-5 flex flex-col justify-between space-y-4 ${
                isMaxed ? 'border-emerald-500/50 bg-emerald-50/10' : 'border-[#dedede]'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{upg.icon}</span>
                    <div>
                      <span className="text-[10px] font-bold text-[#777777] uppercase block tracking-wider">
                        {upg.category.toUpperCase()} · TIER {currentLevel} / {upg.maxLevel}
                      </span>
                      <h4 className="font-bold text-sm text-[#111111] leading-tight">{upg.name}</h4>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold ${
                      isMaxed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#111111] text-white'
                    }`}
                  >
                    {isMaxed ? 'MAX TIER' : `Lv. ${currentLevel}`}
                  </span>
                </div>

                <p className="text-xs text-[#666666] leading-relaxed">{upg.description}</p>
              </div>

              {/* Benefits Box */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-[#fafafa] border border-[#dedede] space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-[#111111]">
                    <span>Current Active Multiplier:</span>
                    <span className="text-emerald-700 font-mono">
                      +{(currentLevel * upg.multiplierPerLevel).toLocaleString()} {upg.unit}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#777777]">
                    {upg.currentBenefit}
                  </div>
                </div>

                {!isMaxed && (
                  <div className="p-2 bg-blue-50/50 border border-blue-200 text-[11px] text-blue-900 font-mono">
                    Next Tier: {upg.nextBenefit}
                  </div>
                )}
              </div>

              {/* Cost & Upgrade Action */}
              <div className="border-t border-[#eeeeee] pt-3 space-y-3">
                {!isMaxed && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-[#777777] uppercase block">
                      Required Materials for Tier {currentLevel + 1}:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-[#555555]">
                      <span className={resources.metal < cost.metal ? 'text-red-600 font-bold' : ''}>
                        Metal: {cost.metal.toLocaleString()}
                      </span>
                      <span className={resources.crystal < cost.crystal ? 'text-red-600 font-bold' : ''}>
                        Crystal: {cost.crystal.toLocaleString()}
                      </span>
                      <span className={resources.deuterium < cost.deuterium ? 'text-red-600 font-bold' : ''}>
                        Deut: {cost.deuterium.toLocaleString()}
                      </span>
                      <span className={resources.naquadah < cost.naquadah ? 'text-red-600 font-bold' : ''}>
                        NQ: {cost.naquadah.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isMaxed || !canAfford}
                  onClick={() => handlePurchaseUpgrade(upg)}
                  className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    isMaxed
                      ? 'bg-emerald-600 text-white cursor-default'
                      : canAfford
                      ? 'bg-[#111111] text-white hover:bg-[#333333]'
                      : 'bg-[#eeeeee] text-[#888888] cursor-not-allowed'
                  }`}
                >
                  {isMaxed ? (
                    <>
                      <CheckCircle2 size={14} /> Maximum Tier Achieved
                    </>
                  ) : (
                    <>Upgrade to Tier {currentLevel + 1} →</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

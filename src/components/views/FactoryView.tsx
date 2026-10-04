import React, { useState } from 'react';
import {
  OGameFacility,
  FacilityCategory,
  PlayerResources,
  FactoryQueueItem,
} from '../../types';
import { sound } from '../../sound';

interface FactoryViewProps {
  facilities: OGameFacility[];
  resources: PlayerResources;
  factoryQueue: FactoryQueueItem[];
  onUpgradeFacility: (facilityId: string) => void;
  onCancelFactoryUpgrade: (queueId: string) => void;
}

const CATEGORIES: { id: FacilityCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Facilities', icon: '✦' },
  { id: 'resource', label: 'Resource Extraction & Energy', icon: '⛏' },
  { id: 'manufacturing', label: 'Manufacturing & Robotics', icon: '⚙' },
  { id: 'infrastructure', label: 'Infrastructure & Science', icon: '🏛' },
];

export const FactoryView: React.FC<FactoryViewProps> = ({
  facilities,
  resources,
  factoryQueue,
  onUpgradeFacility,
  onCancelFactoryUpgrade,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory | 'all'>('all');

  // Calculate empire industrial metrics
  const totalEnergyProduced = facilities.reduce((sum, f) => {
    return sum + (f.productionPerLevel?.energy ? f.productionPerLevel.energy * f.level : 0);
  }, 100); // 100 baseline

  const totalEnergyConsumed = facilities.reduce((sum, f) => {
    return sum + (f.energyConsumptionPerLevel || 0) * f.level;
  }, 0);

  const netEnergy = totalEnergyProduced - totalEnergyConsumed;
  const efficiencyPercent = totalEnergyConsumed === 0 ? 100 : Math.min(100, Math.round((totalEnergyProduced / Math.max(1, totalEnergyConsumed)) * 100));

  const metalPerMin = facilities.reduce((sum, f) => {
    return sum + (f.productionPerLevel?.metal ? f.productionPerLevel.metal * f.level : 0);
  }, 60);

  const crystalPerMin = facilities.reduce((sum, f) => {
    return sum + (f.productionPerLevel?.crystal ? f.productionPerLevel.crystal * f.level : 0);
  }, 30);

  const deuteriumPerMin = facilities.reduce((sum, f) => {
    return sum + (f.productionPerLevel?.deuterium ? f.productionPerLevel.deuterium * f.level : 0);
  }, 10);

  const filteredFacilities = facilities.filter((f) => {
    return selectedCategory === 'all' || f.category === selectedCategory;
  });

  const getCostForNextLevel = (facility: OGameFacility) => {
    const mult = Math.pow(facility.costMultiplier, facility.level);
    return {
      metal: Math.round(facility.baseCost.metal * mult),
      crystal: Math.round(facility.baseCost.crystal * mult),
      deuterium: Math.round(facility.baseCost.deuterium * mult),
    };
  };

  const canAfford = (facility: OGameFacility): boolean => {
    const cost = getCostForNextLevel(facility);
    return (
      (resources.metal ?? 0) >= cost.metal &&
      (resources.crystal ?? 0) >= cost.crystal &&
      (resources.deuterium ?? 0) >= cost.deuterium
    );
  };

  const isUpgrading = (facilityId: string) => {
    return factoryQueue.some((q) => q.facilityId === facilityId);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border border-[#111111] bg-white p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-wider">INDUSTRIAL NETWORK & FACTORY COMPLEX</span>
              <span className="px-2 py-0.5 text-[10px] font-mono border border-[#111111] bg-[#f8fafc]">
                GAME SPEC §15-16
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-1">
              Colonial resource extraction, energy generation, and automated industrial manufacturing.
              Nanite and Robotics factories dramatically compress fleet and planetary build times.
            </p>
          </div>

          {/* Efficiency Metric */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="border border-[#111111] bg-[#f8fafc] p-2.5 min-w-[120px]">
              <div className="text-[10px] text-[#666666]">POWER GRID</div>
              <div className={`font-bold ${netEnergy >= 0 ? 'text-[#22c55e]' : 'text-[#dc2626]'}`}>
                {netEnergy >= 0 ? `+${netEnergy}` : netEnergy} MW
              </div>
            </div>
            <div className="border border-[#111111] bg-[#f8fafc] p-2.5 min-w-[120px]">
              <div className="text-[10px] text-[#666666]">FACTORY EFFICIENCY</div>
              <div className="font-bold text-[#111111]">{efficiencyPercent}%</div>
            </div>
          </div>
        </div>

        {/* Real-Time Extraction Summary Bar */}
        <div className="mt-4 pt-4 border-t border-[#e2e8f0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2 border border-[#e2e8f0] bg-[#f8fafc]">
            <span className="text-[#666666] block text-[10px]">Metal Yield</span>
            <span className="font-bold text-[#111111]">+{metalPerMin.toLocaleString()} / min</span>
          </div>
          <div className="p-2 border border-[#e2e8f0] bg-[#f8fafc]">
            <span className="text-[#666666] block text-[10px]">Crystal Yield</span>
            <span className="font-bold text-[#111111]">+{crystalPerMin.toLocaleString()} / min</span>
          </div>
          <div className="p-2 border border-[#e2e8f0] bg-[#f8fafc]">
            <span className="text-[#666666] block text-[10px]">Deuterium Yield</span>
            <span className="font-bold text-[#111111]">+{deuteriumPerMin.toLocaleString()} / min</span>
          </div>
          <div className="p-2 border border-[#e2e8f0] bg-[#f8fafc]">
            <span className="text-[#666666] block text-[10px]">Total Power Generated</span>
            <span className="font-bold text-[#111111]">{totalEnergyProduced} MW</span>
          </div>
        </div>
      </div>

      {/* Factory Queue Section (Spec Section 16) */}
      <div className="border border-[#111111] bg-white p-5">
        <div className="flex items-center justify-between text-xs font-bold mb-3 border-b border-[#111111] pb-2">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
            FACTORY PRODUCTION & CONSTRUCTION QUEUE
          </span>
          <span className="font-mono text-[#666666]">
            Queue Capacity: {factoryQueue.length} / 5
          </span>
        </div>

        {factoryQueue.length === 0 ? (
          <div className="p-4 border border-[#e2e8f0] bg-[#f8fafc] text-center text-xs text-[#666666] font-mono">
            No active construction projects. Select a facility below to queue an upgrade.
          </div>
        ) : (
          <div className="space-y-3">
            {factoryQueue.map((item, idx) => {
              const progress = Math.min(
                100,
                Math.max(
                  5,
                  ((item.durationSeconds - item.remainingSeconds) / item.durationSeconds) * 100
                )
              );

              return (
                <div key={item.id} className="p-3 border border-[#e2e8f0] bg-[#f8fafc]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-[#111111]">
                      {idx + 1}. {item.facilityName} (Level {item.targetLevel})
                    </span>
                    <span className="text-[#666666]">
                      {formatSeconds(item.remainingSeconds)} remaining ({Math.round(progress)}%)
                    </span>
                  </div>

                  <div className="w-full bg-[#e2e8f0] h-2 mb-2 overflow-hidden">
                    <div
                      className="bg-[#111111] h-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onCancelFactoryUpgrade(item.id)}
                      className="text-[11px] font-mono text-[#dc2626] hover:underline cursor-pointer"
                    >
                      [Cancel Construction]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Facilities Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sound.play('click');
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'border-[#111111] bg-[#111111] text-white font-bold'
                  : 'border-[#cccccc] hover:border-[#111111] bg-white text-[#111111]'
              }`}
            >
              <span>{cat.icon}</span> <span className="ml-1">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((facility) => {
            const cost = getCostForNextLevel(facility);
            const affordable = canAfford(facility);
            const upgrading = isUpgrading(facility.id);

            return (
              <div
                key={facility.id}
                className="border border-[#111111] bg-white p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#666666]">
                        {facility.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#111111]">{facility.name}</h4>
                    </div>

                    <span className="px-2 py-0.5 text-xs font-mono font-bold border border-[#111111] bg-[#f8fafc]">
                      Level {facility.level}
                    </span>
                  </div>

                  <p className="text-xs text-[#555555] mb-3 leading-relaxed">
                    {facility.description}
                  </p>

                  <div className="p-2 border border-[#e2e8f0] bg-[#f8fafc] text-xs font-mono space-y-1 mb-4">
                    <div className="text-[#111111] font-semibold">{facility.bonusDescription}</div>
                    {facility.energyConsumptionPerLevel > 0 && (
                      <div className="text-[#dc2626]">
                        Energy Cost: -{facility.energyConsumptionPerLevel * (facility.level + 1)} MW
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e2e8f0]">
                  <div className="text-[11px] font-mono text-[#666666] mb-2 space-x-2">
                    <span>M: {cost.metal.toLocaleString()}</span>
                    <span>C: {cost.crystal.toLocaleString()}</span>
                    {cost.deuterium > 0 && <span>D: {cost.deuterium.toLocaleString()}</span>}
                  </div>

                  <button
                    type="button"
                    disabled={!affordable || upgrading || facility.level >= facility.maxLevel}
                    onClick={() => onUpgradeFacility(facility.id)}
                    className={`w-full py-2 text-xs font-mono font-bold transition-colors cursor-pointer border ${
                      upgrading
                        ? 'border-[#cccccc] bg-[#f1f5f9] text-[#666666] cursor-not-allowed'
                        : facility.level >= facility.maxLevel
                        ? 'border-[#cccccc] bg-[#e2e8f0] text-[#888888] cursor-not-allowed'
                        : !affordable
                        ? 'border-[#cccccc] bg-[#f8fafc] text-[#888888] cursor-not-allowed'
                        : 'border-[#111111] bg-[#111111] text-white hover:bg-black'
                    }`}
                  >
                    {upgrading
                      ? 'CONSTRUCTION IN PROGRESS'
                      : facility.level >= facility.maxLevel
                      ? 'MAX LEVEL'
                      : !affordable
                      ? 'INSUFFICIENT ORE'
                      : `UPGRADE TO LEVEL ${facility.level + 1}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  OGameDefense,
  OGameDefenseCategory,
  PlayerResources,
  DefenseQueueItem,
} from '../../types';
import { sound } from '../../sound';

interface DefenseViewProps {
  defenses: OGameDefense[];
  resources: PlayerResources;
  defenseQueue: DefenseQueueItem[];
  onBuildDefenses: (defenseId: string, quantity: number) => void;
  onCancelDefenseQueue: (queueId: string) => void;
}

const CATEGORIES: { id: OGameDefenseCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Defenses', icon: '✦' },
  { id: 'kinetic', label: 'Kinetic & Gauss', icon: '💥' },
  { id: 'laser', label: 'Beam & Lasers', icon: '⚡' },
  { id: 'plasma', label: 'Plasma Cannons', icon: '🔥' },
  { id: 'shield', label: 'Shield Domes', icon: '🛡' },
];

export const DefenseView: React.FC<DefenseViewProps> = ({
  defenses,
  resources,
  defenseQueue,
  onBuildDefenses,
  onCancelDefenseQueue,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<OGameDefenseCategory | 'all'>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filteredDefenses = defenses.filter(
    (d) => selectedCategory === 'all' || d.category === selectedCategory
  );

  const getQty = (id: string) => quantities[id] || 1;

  const setQty = (id: string, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, val),
    }));
  };

  const calculateMaxAffordable = (defense: OGameDefense): number => {
    if (defense.maxBuildable && defense.quantity >= defense.maxBuildable) return 0;
    const maxM = defense.cost.metal > 0 ? Math.floor((resources.metal ?? 0) / defense.cost.metal) : 9999;
    const maxC = defense.cost.crystal > 0 ? Math.floor((resources.crystal ?? 0) / defense.cost.crystal) : 9999;
    const maxD = defense.cost.deuterium > 0 ? Math.floor((resources.deuterium ?? 0) / defense.cost.deuterium) : 9999;
    let max = Math.max(0, Math.min(maxM, maxC, maxD));
    if (defense.maxBuildable) {
      max = Math.min(max, defense.maxBuildable - defense.quantity);
    }
    return max;
  };

  const canAfford = (defense: OGameDefense, qty: number): boolean => {
    return (
      (resources.metal ?? 0) >= defense.cost.metal * qty &&
      (resources.crystal ?? 0) >= defense.cost.crystal * qty &&
      (resources.deuterium ?? 0) >= defense.cost.deuterium * qty
    );
  };

  const totalDefenseStructures = defenses.reduce((sum, d) => sum + d.quantity, 0);
  const totalDefenseFirepower = defenses.reduce((sum, d) => sum + d.weaponPower * d.quantity, 0);
  const totalShieldPower = defenses.reduce((sum, d) => sum + d.shield * d.quantity, 0);

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
              <span className="text-base font-bold tracking-wider">PLANETARY DEFENSE GRID MATRIX</span>
              <span className="px-2 py-0.5 text-[10px] font-mono border border-[#111111] bg-[#f8fafc]">
                EMPIRE DEFENSE SPEC §22
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-1">
              Surface-to-orbit artillery batteries, pulsed laser turrets, gauss cannons, and planetary
              shield domes that defend your colony against hostile fleet raids and orbital sieges.
            </p>
          </div>

          {/* Defense Summary Badges */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="border border-[#111111] bg-[#f8fafc] p-2.5 min-w-[120px]">
              <div className="text-[10px] text-[#666666]">TOTAL EMPLACEMENTS</div>
              <div className="font-bold text-[#111111]">{totalDefenseStructures.toLocaleString()} Units</div>
            </div>
            <div className="border border-[#111111] bg-[#f8fafc] p-2.5 min-w-[120px]">
              <div className="text-[10px] text-[#666666]">BATTERY POWER</div>
              <div className="font-bold text-[#22c55e]">{totalDefenseFirepower.toLocaleString()}</div>
            </div>
            <div className="border border-[#111111] bg-[#f8fafc] p-2.5 min-w-[120px]">
              <div className="text-[10px] text-[#666666]">SHIELD INTEGRITY</div>
              <div className="font-bold text-[#2563eb]">{totalShieldPower.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex flex-wrap gap-1.5">
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
      </div>

      {/* Active Defense Queue */}
      {defenseQueue.length > 0 && (
        <div className="border border-[#111111] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-bold mb-3">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-ping" />
              DEFENSE INSTALLATION QUEUE ({defenseQueue.length} Active)
            </span>
          </div>

          <div className="space-y-3">
            {defenseQueue.map((item) => {
              const progressPercent = Math.min(
                100,
                Math.max(
                  5,
                  ((item.totalTimeSeconds - item.remainingSeconds) / item.totalTimeSeconds) * 100
                )
              );

              return (
                <div key={item.id} className="p-3 border border-[#e2e8f0] bg-[#f8fafc]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-[#111111]">
                      {item.defenseName} × {item.quantity} ({item.completedQuantity}/{item.quantity} installed)
                    </span>
                    <span className="text-[#666666]">
                      Time remaining: {formatSeconds(item.remainingSeconds)}
                    </span>
                  </div>

                  <div className="w-full bg-[#e2e8f0] h-2 mb-2 overflow-hidden">
                    <div
                      className="bg-[#111111] h-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onCancelDefenseQueue(item.id)}
                      className="text-[11px] font-mono text-[#dc2626] hover:underline cursor-pointer"
                    >
                      [Cancel Order]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Defenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDefenses.map((defense) => {
          const qty = getQty(defense.id);
          const affordable = canAfford(defense, qty);
          const maxAfford = calculateMaxAffordable(defense);
          const isMaxBuilt = defense.maxBuildable && defense.quantity >= defense.maxBuildable;

          return (
            <div
              key={defense.id}
              className="border border-[#111111] bg-white p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#666666]">
                      {defense.category} Defense
                    </span>
                    <h4 className="text-sm font-bold text-[#111111]">{defense.name}</h4>
                  </div>

                  <span className="px-2 py-0.5 text-xs font-mono font-bold border border-[#111111] bg-[#f8fafc]">
                    Operational: {defense.quantity}
                  </span>
                </div>

                <p className="text-xs text-[#555555] mb-3 leading-relaxed">
                  {defense.description}
                </p>

                {/* Defense Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-3 bg-[#f8fafc] p-2 border border-[#e2e8f0]">
                  <div>
                    <span className="text-[#666666] block text-[10px]">Structure</span>
                    <span className="font-semibold text-[#111111]">
                      {defense.structure.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#666666] block text-[10px]">Shield</span>
                    <span className="font-semibold text-[#111111]">
                      {defense.shield.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#666666] block text-[10px]">Weapon</span>
                    <span className="font-semibold text-[#111111]">
                      {defense.weaponPower.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Construction Form */}
              <div className="pt-3 border-t border-[#e2e8f0] space-y-2">
                <div className="text-[11px] font-mono text-[#666666]">
                  Cost per unit: M {defense.cost.metal.toLocaleString()}
                  {defense.cost.crystal > 0 && ` | C ${defense.cost.crystal.toLocaleString()}`}
                  {defense.cost.deuterium > 0 && ` | D ${defense.cost.deuterium.toLocaleString()}`}
                </div>

                {isMaxBuilt ? (
                  <div className="py-2 text-xs font-mono text-center bg-[#f1f5f9] text-[#666666] font-bold border border-[#cccccc]">
                    MAXIMUM SHIELD DOME OPERATIONAL (1/1)
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#cccccc] bg-white">
                      <button
                        type="button"
                        onClick={() => setQty(defense.id, Math.max(1, qty - 1))}
                        className="px-2 py-1 text-xs font-mono hover:bg-[#f1f5f9] cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={qty}
                        onChange={(e) => setQty(defense.id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center text-xs font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(defense.id, qty + 1)}
                        className="px-2 py-1 text-xs font-mono hover:bg-[#f1f5f9] cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQty(defense.id, Math.max(1, maxAfford))}
                      className="px-2 py-1 text-[10px] font-mono border border-[#cccccc] hover:border-[#111111] bg-[#f8fafc] cursor-pointer"
                    >
                      Max ({maxAfford})
                    </button>

                    <button
                      type="button"
                      disabled={!affordable || qty <= 0}
                      onClick={() => onBuildDefenses(defense.id, qty)}
                      className={`flex-1 py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer border ${
                        !affordable
                          ? 'border-[#cccccc] bg-[#f8fafc] text-[#888888] cursor-not-allowed'
                          : 'border-[#111111] bg-[#111111] text-white hover:bg-black'
                      }`}
                    >
                      {affordable ? `Construct ×${qty}` : 'Need Ore'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

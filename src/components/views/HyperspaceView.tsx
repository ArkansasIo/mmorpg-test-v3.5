import React, { useState } from 'react';
import {
  Compass,
  Zap,
  Shield,
  Radio,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Play,
  Cpu,
} from 'lucide-react';
import { sound } from '../../sound';
import {
  HyperspaceDriveTech,
  SubspaceJumpGate,
  WormholeAnomaly,
  MothershipTitanClass,
  MothershipTacticalAbility,
  PlayerResources,
} from '../../types';
import {
  HYPERSPACE_DRIVES,
  INITIAL_JUMP_GATES,
  WORMHOLE_ANOMALIES,
  MOTHERSHIP_TITAN_CLASSES,
  MOTHERSHIP_TACTICAL_ABILITIES,
} from '../../hyperspaceData';

interface HyperspaceViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
}

export const HyperspaceView: React.FC<HyperspaceViewProps> = ({
  resources,
  onUpdateResources,
}) => {
  const [drives, setDrives] = useState<HyperspaceDriveTech[]>(HYPERSPACE_DRIVES);
  const [jumpGates, setJumpGates] = useState<SubspaceJumpGate[]>(INITIAL_JUMP_GATES);
  const [abilities, setAbilities] = useState<MothershipTacticalAbility[]>(MOTHERSHIP_TACTICAL_ABILITIES);
  const [activeTab, setActiveTab] = useState<'drives' | 'jumpgates' | 'motherships' | 'wormholes'>('drives');
  const [mothershipEnergy, setMothershipEnergy] = useState<number>(18500);
  const [notification, setNotification] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Upgrade Drive
  const handleUpgradeDrive = (driveId: string) => {
    const drive = drives.find((d) => d.id === driveId);
    if (!drive) return;

    const cost = drive.level * 25000;
    if (resources.naquadah < cost) {
      sound.play('warning');
      showMsg(`Insufficient Naquadah to upgrade ${drive.name} (Need ${cost.toLocaleString()}).`);
      return;
    }

    onUpdateResources({ naquadah: resources.naquadah - cost });
    const updated = drives.map((d) =>
      d.id === driveId
        ? {
            ...d,
            level: d.level + 1,
            speedMultiplier: Number((d.speedMultiplier * 1.15).toFixed(2)),
          }
        : d
    );
    setDrives(updated);
    sound.play('research');
    showMsg(`Upgraded ${drive.name} to Level ${drive.level + 1}! Fleet sublight & FTL transit boosted.`);
  };

  // Trigger Instant Jump Gate
  const handleJumpFleet = (gate: SubspaceJumpGate) => {
    if (!gate.ready) {
      sound.play('warning');
      showMsg(`Jump Gate capacitor is recharging! (${gate.cooldownSeconds}s remaining).`);
      return;
    }

    const updated = jumpGates.map((g) =>
      g.id === gate.id
        ? {
            ...g,
            ready: false,
            chargePercentage: 0,
            cooldownSeconds: 120,
          }
        : g
    );
    setJumpGates(updated);
    sound.play('success');
    showMsg(`Instantaneous Jump conduit opened! Fleet transferred instantaneously from ${gate.originMoon} to ${gate.destinationMoon} with 0 deuterium burn.`);
  };

  // Trigger Mothership Tactical Ability
  const handleUseAbility = (ability: MothershipTacticalAbility) => {
    if (mothershipEnergy < ability.energyCost) {
      sound.play('warning');
      showMsg(`Insufficient Mothership Core Energy! Need ${ability.energyCost} Energy.`);
      return;
    }

    setMothershipEnergy((e) => e - ability.energyCost);
    sound.play('combat');
    showMsg(`Activated Flagship Tactical Protocol: [${ability.name}]! Effect dispatched across active combat grid.`);
  };

  return (
    <div id="hyperspace-view" className="space-y-6">
      {/* Header Banner */}
      <div className="border border-[#dedede] bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
            FTL PROPULSION & TITAN COMMAND MATRIX
          </div>
          <h2 className="text-2xl font-bold text-[#111111] flex items-center gap-3">
            <span>Hyperspace Drives & Mothership Systems</span>
            <span className="text-xs bg-[#111111] text-white px-2.5 py-0.5 font-mono uppercase">
              Slipstream Online
            </span>
          </h2>
          <p className="text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
            Manage multi-tier FTL propulsion engines, execute zero-delay Lunar Jump Gate transfers, deploy
            supermassive Titan Motherships, and navigate unstable subspace wormhole rifts.
          </p>
        </div>

        <div className="border border-[#dedede] bg-[#fafafa] p-3 text-right font-mono">
          <span className="text-[10px] text-[#777777] block uppercase font-bold">Mothership Core Energy</span>
          <span className="text-lg font-bold text-[#111111] flex items-center gap-1.5 justify-end">
            <Zap size={15} className="text-amber-500" />
            <span>{mothershipEnergy.toLocaleString()} MW</span>
          </span>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-4 border border-[#111111] bg-[#fafafa] text-xs font-semibold text-[#111111] border-l-4 flex items-center justify-between">
          <span>{notification}</span>
          <button type="button" onClick={() => setNotification(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#dedede] gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('drives')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'drives'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Hyperspace Drives (Tiers 1-5)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('jumpgates')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'jumpgates'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Lunar Jump Gate Network
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('motherships')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'motherships'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Titan Mothership Classes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('wormholes')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'wormholes'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Unstable Wormhole Rifts
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. HYPERSPACE DRIVE SYSTEMS */}
      {/* ============================================================ */}
      {activeTab === 'drives' && (
        <div className="space-y-6">
          <div className="border border-[#dedede] bg-white p-6">
            <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-1">
              FTL Propulsion Technology Hierarchy
            </h3>
            <p className="text-xs text-[#666666] mb-6">
              Higher-tier drives drastically accelerate fleet flight times across galaxies and lower deuterium burn.
            </p>

            <div className="space-y-4">
              {drives.map((drive) => {
                const upgradeCost = drive.level * 25000;
                const canAfford = resources.naquadah >= upgradeCost;

                return (
                  <div
                    key={drive.id}
                    className="border border-[#dedede] p-5 bg-[#fafafa] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#111111] text-white">
                          Tier {drive.tier}
                        </span>
                        <h4 className="font-bold text-sm text-[#111111]">{drive.name}</h4>
                        <span className="text-xs font-mono font-bold text-[#666666]">
                          Level {drive.level}
                        </span>
                      </div>
                      <p className="text-xs text-[#666666] leading-relaxed">{drive.description}</p>
                      <div className="flex flex-wrap gap-4 text-[11px] font-mono pt-1 text-[#333333]">
                        <span>🚀 Speed Multiplier: <strong>{drive.speedMultiplier}x</strong></span>
                        <span>⛽ Fuel Efficiency: <strong>{drive.fuelEfficiency}x</strong></span>
                        <span>🧪 Consumption: <strong>{drive.deuteriumCostPerHour} Deut/h</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-[#888888] block uppercase">Upgrade Cost</span>
                        <span className="text-xs font-bold text-[#111111]">
                          {upgradeCost.toLocaleString()} Naq
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUpgradeDrive(drive.id)}
                        disabled={!canAfford}
                        className={`px-4 py-2 text-xs font-bold uppercase transition-colors cursor-pointer ${
                          canAfford
                            ? 'bg-[#111111] text-white hover:bg-[#333333]'
                            : 'bg-[#eeeeee] text-[#888888] cursor-not-allowed'
                        }`}
                      >
                        Upgrade →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. LUNAR JUMP GATE NETWORK */}
      {/* ============================================================ */}
      {activeTab === 'jumpgates' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-1">
              Subspace Lunar Jump Gate Network
            </h3>
            <p className="text-xs text-[#666666]">
              Instantly relays entire armada formations between moon bases with zero deuterium consumption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jumpGates.map((gate) => (
              <div key={gate.id} className="border border-[#dedede] p-5 bg-[#fafafa] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase bg-[#eeeeee] px-2 py-0.5 text-[#555555]">
                      Relay Conduit
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase font-mono ${
                        gate.ready ? 'text-[#16a34a]' : 'text-amber-600'
                      }`}
                    >
                      {gate.ready ? '● Gate Ready' : `⏳ Cooling (${gate.cooldownSeconds}s)`}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#111111] mb-2">{gate.name}</h4>

                  <div className="space-y-1 text-xs font-mono border-t border-[#eeeeee] pt-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Origin:</span>
                      <strong className="text-[#111111]">{gate.originMoon}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Destination:</span>
                      <strong className="text-[#111111]">{gate.destinationMoon}</strong>
                    </div>
                  </div>

                  {/* Capacitor Meter */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span>Capacitor Charge</span>
                      <span>{gate.chargePercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#eeeeee] overflow-hidden">
                      <div
                        className={`h-full ${gate.ready ? 'bg-[#16a34a]' : 'bg-amber-500'}`}
                        style={{ width: `${gate.chargePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleJumpFleet(gate)}
                  disabled={!gate.ready}
                  className={`w-full py-2.5 text-xs font-bold uppercase transition-colors cursor-pointer ${
                    gate.ready
                      ? 'bg-[#111111] text-white hover:bg-[#333333]'
                      : 'bg-[#eeeeee] text-[#888888] cursor-not-allowed'
                  }`}
                >
                  {gate.ready ? 'Engage Instant Fleet Jump →' : 'Recharging Gate Capacitor'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TITAN MOTHERSHIP CLASSES & TACTICAL ABILITIES */}
      {/* ============================================================ */}
      {activeTab === 'motherships' && (
        <div className="space-y-6">
          {/* Tactical Flagship Abilities */}
          <div className="border border-[#dedede] bg-white p-6">
            <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-1">
              Active Mothership Tactical Protocols
            </h3>
            <p className="text-xs text-[#666666] mb-4">
              Discharge the mothership zero-point energy core to activate battlefield supremacy powers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {abilities.map((ab) => (
                <div key={ab.id} className="border border-[#dedede] p-4 bg-[#fafafa] flex flex-col justify-between">
                  <div>
                    <span className="text-2xl mb-2 block">{ab.icon}</span>
                    <h4 className="font-bold text-xs text-[#111111] mb-1">{ab.name}</h4>
                    <p className="text-[11px] text-[#666666] mb-3 leading-relaxed">{ab.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#eeeeee]">
                    <div className="text-[10px] font-mono text-[#888888] mb-2">
                      Cost: {ab.energyCost} MW Energy
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUseAbility(ab)}
                      disabled={mothershipEnergy < ab.energyCost}
                      className="w-full py-1.5 bg-[#111111] text-white text-[11px] font-bold uppercase hover:bg-[#333333] transition-colors cursor-pointer"
                    >
                      Execute Protocol
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Titan Classes */}
          <div className="border border-[#dedede] bg-white p-6">
            <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-1">
              Capital Titan & World-Forge Classes
            </h3>
            <p className="text-xs text-[#666666] mb-6">
              Colossal flagships capable of housing entire starfighter wings and planetary siege cannons.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOTHERSHIP_TITAN_CLASSES.map((titan) => (
                <div key={titan.id} className="border border-[#dedede] p-5 bg-[#fafafa] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#dedede] pb-2">
                    <div>
                      <span className="text-[9px] font-mono uppercase bg-[#111111] text-white px-2 py-0.5">
                        {titan.hullType}
                      </span>
                      <h4 className="font-bold text-base text-[#111111] mt-1">{titan.name}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-[#666666] leading-relaxed">{titan.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-3 border border-[#eeeeee]">
                    <div>
                      <span className="text-[#888888] block text-[10px]">Hull Integrity</span>
                      <strong className="text-[#111111]">{(titan.hullHp / 1000000).toFixed(1)}M HP</strong>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px]">Shield Power</span>
                      <strong className="text-cyan-700">{(titan.shieldHp / 1000000).toFixed(1)}M SP</strong>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px]">Firepower</span>
                      <strong className="text-red-700">{(titan.firepower / 1000).toFixed(0)}k DPS</strong>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px]">Hangar Slots</span>
                      <strong className="text-[#111111]">{titan.hangarSlots} Squadrons</strong>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 p-2.5">
                    Flagship Bonus: {titan.flagshipBonus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. UNSTABLE WORMHOLE RIFTS */}
      {/* ============================================================ */}
      {activeTab === 'wormholes' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-1">
              Active Deep-Space Wormhole Anomalies
            </h3>
            <p className="text-xs text-[#666666]">
              Subspace tears connecting directly to uncharted alien ruins. High reward expedition targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORMHOLE_ANOMALIES.map((wormhole) => (
              <div key={wormhole.id} className="border border-[#dedede] p-5 bg-[#fafafa] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase bg-[#eeeeee] px-2 py-0.5 text-[#555555]">
                      {wormhole.stability} Stability
                    </span>
                    <span className="text-xs font-mono text-red-600 font-bold">
                      {wormhole.dangerRating.toUpperCase()} DANGER
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#111111] mb-2">{wormhole.name}</h4>

                  <div className="space-y-1.5 text-xs font-mono border-t border-[#eeeeee] pt-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Destination:</span>
                      <strong className="text-[#111111] text-right truncate pl-2">{wormhole.destinationSector}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Potential Loot:</span>
                      <strong className="text-green-700 text-right truncate pl-2">{wormhole.rewardPotential}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.play('warning');
                    showMsg(`Expedition battle group dispatched into ${wormhole.name}! Sensor telemetry streaming...`);
                  }}
                  className="w-full py-2.5 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  Dispatch Deep Space Flotilla →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

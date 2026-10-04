import React, { useState } from 'react';
import {
  ExpeditionMission,
  ExpeditionLog,
  ExpeditionMissionType,
  OGameShip,
  PlayerResources,
  FleetFormationPreset,
  FleetFormationType,
} from '../../types';
import { FLEET_FORMATIONS } from '../../ogameData';
import { sound } from '../../sound';

interface ExpeditionViewProps {
  ships: OGameShip[];
  resources: PlayerResources;
  activeMissions: ExpeditionMission[];
  expeditionLogs: ExpeditionLog[];
  maxExpeditionSlots: number;
  fleetPresets?: FleetFormationPreset[];
  selectedFormation?: FleetFormationType;
  onSelectFormation?: (formation: FleetFormationType) => void;
  onSavePreset?: (preset: FleetFormationPreset) => void;
  onLaunchExpedition: (
    type: ExpeditionMissionType,
    targetSector: string,
    durationSeconds: number,
    fleet: { shipId: string; shipName: string; quantity: number }[]
  ) => void;
  onClaimLoot: (logId: string) => void;
  onNavigate?: (route: string) => void;
}

const MISSION_TYPES: {
  type: ExpeditionMissionType;
  name: string;
  desc: string;
  risk: string;
  primaryReward: string;
}[] = [
  {
    type: 'exploration',
    name: 'Sector Surveying',
    desc: 'Chart unmapped star systems, mineral asteroid belts, and uncataloged planetary moons.',
    risk: 'Low',
    primaryReward: 'Metal & Crystal Ores',
  },
  {
    type: 'deep_space',
    name: 'Deep Space Recon',
    desc: 'Long-range sensors probing dark matter clouds and interstellar voids.',
    risk: 'Medium',
    primaryReward: 'Deuterium Gas & Tech Points',
  },
  {
    type: 'anomaly',
    name: 'Sub-Space Anomaly Detection',
    desc: 'Investigate gravitational distortions, micro-singularities, and space-time rifts.',
    risk: 'High',
    primaryReward: 'Exotic Relics & High Tech',
  },
  {
    type: 'derelict_salvage',
    name: 'Derelict Ship Graveyard Salvage',
    desc: 'Tractor and board ancient battle wrecks from centuries-old galactic naval wars.',
    risk: 'Medium',
    primaryReward: 'Intact Recoverable Ships & Raw Scrap',
  },
  {
    type: 'alien_contact',
    name: 'First Contact Probe',
    desc: 'Broadcast diplomatic transponder signals into unexplored neutral territory.',
    risk: 'Uncertain',
    primaryReward: 'Naquadah Tribute or Pirate Ambush',
  },
  {
    type: 'relic_discovery',
    name: 'Precursor Temple Excavation',
    desc: 'Excavate subterranean ruins on dead core worlds for Precursor crystalline artifacts.',
    risk: 'High',
    primaryReward: 'Major Sovereign Windfalls',
  },
];

export const ExpeditionView: React.FC<ExpeditionViewProps> = ({
  ships,
  resources,
  activeMissions,
  expeditionLogs,
  maxExpeditionSlots,
  fleetPresets = [],
  selectedFormation = 'standard',
  onSelectFormation,
  onSavePreset,
  onLaunchExpedition,
  onClaimLoot,
  onNavigate,
}) => {
  const [selectedType, setSelectedType] = useState<ExpeditionMissionType>('exploration');
  const [targetSector, setTargetSector] = useState('Sector 4:182:9');
  const [durationSecs, setDurationSecs] = useState(60); // 1 min accelerated test
  const [selectedFleet, setSelectedFleet] = useState<Record<string, number>>({
    small_cargo: 2,
    espionage_probe: 3,
    light_fighter: 5,
  });

  const [activePresetId, setActivePresetId] = useState<string>('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [presetNotice, setPresetNotice] = useState<string | null>(null);

  const activeFormationDef = FLEET_FORMATIONS.find((f) => f.id === selectedFormation) || FLEET_FORMATIONS[0];

  const handleFleetChange = (shipId: string, delta: number) => {
    const ship = ships.find((s) => s.id === shipId);
    if (!ship) return;
    const current = selectedFleet[shipId] || 0;
    const next = Math.max(0, Math.min(ship.quantity, current + delta));
    setSelectedFleet((prev) => ({
      ...prev,
      [shipId]: next,
    }));
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = fleetPresets.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(preset.id);
    if (onSelectFormation) {
      onSelectFormation(preset.formation);
    }

    const loadedFleet: Record<string, number> = {};
    let totalAssigned = 0;
    let missingTotal = 0;

    Object.entries(preset.composition).forEach(([shipId, targetQty]: [string, any]) => {
      const ship = ships.find((s) => s.id === shipId);
      const inHangar = ship?.quantity || 0;
      const canAssign = Math.min(targetQty, inHangar);
      if (canAssign > 0) {
        loadedFleet[shipId] = canAssign;
        totalAssigned += canAssign;
      }
      if (inHangar < targetQty) {
        missingTotal += (targetQty - inHangar);
      }
    });

    setSelectedFleet(loadedFleet);
    sound.play('confirm');

    if (missingTotal > 0) {
      setPresetNotice(`Loaded preset "${preset.name}": Assigned ${totalAssigned} hulls (${missingTotal} hulls missing in hangar).`);
    } else {
      setPresetNotice(`Loaded preset "${preset.name}": All ${totalAssigned} hulls assigned and ready!`);
    }
    setTimeout(() => setPresetNotice(null), 4000);
  };

  const handleSaveCurrentAsPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const assignedEntries = Object.entries(selectedFleet).filter(([_, qty]) => qty > 0);
    if (assignedEntries.length === 0) {
      alert('Please allocate at least 1 ship to save a preset.');
      return;
    }

    const comp: Record<string, number> = {};
    assignedEntries.forEach(([shipId, qty]) => {
      comp[shipId] = qty;
    });

    const newPreset: FleetFormationPreset = {
      id: `preset_exp_${Date.now()}`,
      name: newPresetName.trim(),
      description: 'Expedition mission taskforce preset.',
      formation: selectedFormation,
      composition: comp,
      createdAt: Date.now(),
      tags: ['expedition', 'custom'],
    };

    if (onSavePreset) {
      onSavePreset(newPreset);
    }

    setIsSavingPreset(false);
    setNewPresetName('');
    setActivePresetId(newPreset.id);
    setPresetNotice(`Saved "${newPreset.name}" as a new Fleet Formation Preset!`);
    setTimeout(() => setPresetNotice(null), 4000);
  };

  const handleLaunch = () => {
    const assigned = Object.entries(selectedFleet)
      .filter(([_, qty]) => qty > 0)
      .map(([shipId, qty]) => {
        const ship = ships.find((s) => s.id === shipId);
        return {
          shipId,
          shipName: ship?.name || shipId,
          quantity: qty,
        };
      });

    if (assigned.length === 0) {
      alert('Please assign at least one ship to accompany the expedition fleet!');
      return;
    }

    sound.play('confirm');
    onLaunchExpedition(selectedType, targetSector, durationSecs, assigned);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const canLaunch = activeMissions.length < maxExpeditionSlots;

  const totalAssignedShips = Object.values(selectedFleet).reduce((sum, v) => sum + (v || 0), 0);

  return (
    <div id="expedition-view" className="space-y-6">
      {/* Top Banner */}
      <div className="border border-[#111111] bg-white p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-wider">DEEP SPACE EXPEDITIONS & EXPLORATION</span>
              <span className="px-2 py-0.5 text-[10px] font-mono border border-[#111111] bg-[#f8fafc]">
                GAME SPEC §26
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-1">
              Dispatch autonomous exploration task forces into uncharted deep space sectors.
              Missions yield raw mineral caches, recoverable derelict ships, ancient technology, and alien encounters.
            </p>
          </div>

          <div className="border border-[#111111] bg-[#f8fafc] p-2.5 text-xs font-mono min-w-[180px]">
            <div className="text-[10px] text-[#666666]">EXPEDITION SLOTS</div>
            <div className="font-bold text-[#111111] mt-0.5">
              {activeMissions.length} / {maxExpeditionSlots} Active
            </div>
            <div className="text-[10px] text-[#22c55e] mt-0.5">
              Astrophysics Tech Unlocks More Slots
            </div>
          </div>
        </div>
      </div>

      {/* Preset Feedback Toast */}
      {presetNotice && (
        <div className="p-3 border border-[#22c55e] bg-[#f0fdf4] text-[#166534] text-xs font-mono font-bold flex items-center justify-between animate-fade-in">
          <span>✓ {presetNotice}</span>
          <button type="button" onClick={() => setPresetNotice(null)} className="cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Active Missions Console */}
      {activeMissions.length > 0 && (
        <div className="border border-[#111111] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-bold mb-3">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-ping" />
              FLEETS EN ROUTE IN DEEP SPACE ({activeMissions.length})
            </span>
          </div>

          <div className="space-y-3">
            {activeMissions.map((mission) => {
              const progressPercent = Math.min(
                100,
                Math.max(
                  5,
                  ((mission.durationSeconds - mission.remainingSeconds) / mission.durationSeconds) * 100
                )
              );

              return (
                <div key={mission.id} className="p-3 border border-[#e2e8f0] bg-[#f8fafc]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-[#111111]">
                      {mission.name} → {mission.targetSector}
                    </span>
                    <span className="text-[#666666]">
                      Returning in: {formatSeconds(mission.remainingSeconds)}
                    </span>
                  </div>

                  <div className="w-full bg-[#e2e8f0] h-2 mb-2 overflow-hidden">
                    <div
                      className="bg-[#111111] h-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="text-[11px] font-mono text-[#666666]">
                    Escort Fleet:{' '}
                    {mission.fleet.map((f) => `${f.shipName} ×${f.quantity}`).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mission Launch Console (7 cols) & Telemetry Log (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-[#111111] bg-white p-5 space-y-4">
            <div className="border-b border-[#111111] pb-2">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                1. Select Expedition Objective
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MISSION_TYPES.map((m) => (
                <div
                  key={m.type}
                  onClick={() => setSelectedType(m.type)}
                  className={`p-3 border cursor-pointer transition-all ${
                    selectedType === m.type
                      ? 'border-[#111111] bg-white ring-2 ring-[#111111]'
                      : 'border-[#cccccc] hover:border-[#111111] bg-[#f8fafc]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#111111]">{m.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#cccccc] bg-white">
                      {m.risk} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555] mb-2">{m.desc}</p>
                  <div className="text-[10px] font-mono text-[#22c55e] font-semibold">
                    Target: {m.primaryReward}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e2e8f0] pt-4 space-y-3">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
                2. Mission Coordinates & Flight Duration
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="text-[#666666] block mb-1">Destination Coordinates:</label>
                  <input
                    type="text"
                    value={targetSector}
                    onChange={(e) => setTargetSector(e.target.value)}
                    className="w-full px-3 py-2 border border-[#cccccc] focus:border-[#111111] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#666666] block mb-1">Flight Duration:</label>
                  <select
                    value={durationSecs}
                    onChange={(e) => setDurationSecs(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-[#cccccc] focus:border-[#111111] outline-none bg-white"
                  >
                    <option value={30}>30 Seconds (Fast Recon Sweep)</option>
                    <option value={60}>60 Seconds (Standard Patrol)</option>
                    <option value={120}>2 Minutes (Deep Core Deep Space)</option>
                    <option value={300}>5 Minutes (Extensive Survey)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Fleet Formations & Preset Quick Load */}
            <div className="border-t border-[#e2e8f0] pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
                  3. Assign Escort Fleet & Formation Presets
                </span>
                <span className="text-[11px] font-mono text-[#666666]">
                  Assigned: <strong className="text-[#111111]">{totalAssignedShips} Hulls</strong>
                </span>
              </div>

              {/* Preset Selector Toolbar */}
              {fleetPresets.length > 0 && (
                <div className="p-3 border border-[#111111] bg-[#f8fafc] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#111111] flex items-center gap-1.5">
                      <span>❖</span> QUICK-LOAD FLEET FORMATION PRESET:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSavingPreset(true)}
                      className="text-[10px] font-mono text-[#2563eb] hover:underline cursor-pointer"
                    >
                      + Save Current as Preset
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {fleetPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleLoadPreset(preset.id)}
                        className={`px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer border ${
                          activePresetId === preset.id
                            ? 'border-[#111111] bg-[#111111] text-white font-bold'
                            : 'border-[#cccccc] hover:border-[#111111] bg-white text-[#111111]'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#e2e8f0] text-[10px] font-mono text-[#666666]">
                    <span>
                      Doctrine: <strong>{activeFormationDef.name}</strong> (Atk x{activeFormationDef.attackModifier} | Spd x{activeFormationDef.speedModifier})
                    </span>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate('shipyard')}
                        className="hover:text-[#111111] underline cursor-pointer"
                      >
                        Manage Presets in Shipyard →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Inline Save Preset Dialog */}
              {isSavingPreset && (
                <form
                  onSubmit={handleSaveCurrentAsPreset}
                  className="p-3 border-2 border-[#111111] bg-white space-y-2 animate-fade-in"
                >
                  <span className="text-xs font-mono font-bold text-[#111111] block">
                    Save Current Escort Loadout as Formation Preset:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Deep Space Alpha Flotilla"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[#cccccc] focus:border-[#111111] text-xs font-mono outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-mono font-bold bg-[#111111] text-white hover:bg-black cursor-pointer"
                    >
                      Save Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSavingPreset(false)}
                      className="px-3 py-1.5 text-xs font-mono border border-[#cccccc] hover:border-[#111111] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Ships Quantity Table */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {ships.map((ship) => {
                  const assigned = selectedFleet[ship.id] || 0;
                  const available = ship.quantity;

                  return (
                    <div
                      key={ship.id}
                      className="p-2 border border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <span className="font-bold text-[#111111]">{ship.name}</span>
                        <span className="text-[#666666] ml-2 text-[10px]">
                          (In Hangar: {available} | Cargo: {ship.cargoCapacity})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={assigned <= 0}
                          onClick={() => handleFleetChange(ship.id, -1)}
                          className="px-2 py-0.5 border border-[#cccccc] bg-white cursor-pointer hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-[#111111]">
                          {assigned}
                        </span>
                        <button
                          type="button"
                          disabled={assigned >= available}
                          onClick={() => handleFleetChange(ship.id, 1)}
                          className="px-2 py-0.5 border border-[#cccccc] bg-white cursor-pointer hover:bg-slate-200"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          disabled={available <= 0}
                          onClick={() =>
                            setSelectedFleet((prev) => ({
                              ...prev,
                              [ship.id]: available,
                            }))
                          }
                          className="px-1.5 py-0.5 text-[10px] border border-[#cccccc] bg-white hover:bg-slate-200 cursor-pointer"
                        >
                          All
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!canLaunch}
                onClick={handleLaunch}
                className={`w-full py-3 text-xs font-mono font-bold transition-colors cursor-pointer border ${
                  !canLaunch
                    ? 'border-[#cccccc] bg-[#f1f5f9] text-[#888888] cursor-not-allowed'
                    : 'border-[#111111] bg-[#111111] text-white hover:bg-black'
                }`}
              >
                {!canLaunch ? 'NO EXPEDITION SLOTS AVAILABLE' : 'DISPATCH EXPEDITION TASK FORCE'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Expedition Log Archive (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="border border-[#111111] bg-white p-4">
            <div className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              Deep Space Telemetry Archives
            </div>
            <div className="text-[11px] text-[#666666] mb-4">
              Historical sensor intercepts and loot manifests from prior missions.
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {expeditionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 border border-[#e2e8f0] bg-[#f8fafc] text-xs font-mono space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-1.5">
                    <span className="font-bold text-[#111111]">{log.sector}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 border ${
                        log.status === 'triumph'
                          ? 'border-[#22c55e] text-[#22c55e] bg-[#f0fdf4]'
                          : log.status === 'discovery'
                          ? 'border-[#2563eb] text-[#2563eb] bg-[#eff6ff]'
                          : 'border-[#dc2626] text-[#dc2626] bg-[#fef2f2]'
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[#444444] leading-relaxed text-[11px]">{log.narrative}</p>

                  {log.loot && (
                    <div className="p-2 border border-[#cbd5e1] bg-white space-y-1">
                      <div className="font-bold text-[#111111] text-[10px] uppercase">
                        Salvaged Goods:
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        {log.loot.metal && <span>Metal: +{log.loot.metal.toLocaleString()}</span>}
                        {log.loot.crystal && <span>Crystal: +{log.loot.crystal.toLocaleString()}</span>}
                        {log.loot.deuterium && <span>Deuterium: +{log.loot.deuterium.toLocaleString()}</span>}
                        {log.loot.naquadah && <span>Naquadah: +{log.loot.naquadah.toLocaleString()}</span>}
                        {log.loot.relicName && (
                          <span className="col-span-2 text-[#2563eb] font-semibold">
                            Relic: {log.loot.relicName}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-[#888888] text-right">
                    Logged at {log.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

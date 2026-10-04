import React, { useState } from 'react';
import {
  Globe,
  Radio,
  Crosshair,
  Shield,
  Layers,
  Search,
  Zap,
  Flame,
  ArrowRight,
  RefreshCw,
  Send,
  Eye,
  AlertCircle,
  Database,
  Compass,
} from 'lucide-react';
import { sound } from '../../sound';
import { SolarSystemSlot, OGameServer, ACSAttackGroup, MissileSiloData, PlayerResources } from '../../types';
import {
  OGAME_SERVERS,
  INITIAL_SOLAR_SYSTEM_SLOTS,
  INITIAL_ACS_GROUPS,
  INITIAL_MISSILE_SILO,
} from '../../mmorpgOgameData';

interface MMORPGOgameViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
}

export const MMORPGOgameView: React.FC<MMORPGOgameViewProps> = ({
  resources,
  onUpdateResources,
}) => {
  const [selectedServer, setSelectedServer] = useState<OGAME_SERVERS_TYPE>(OGAME_SERVERS[0]);
  const [galaxy, setGalaxy] = useState<number>(1);
  const [system, setSystem] = useState<number>(234);
  const [slots, setSlots] = useState<SolarSystemSlot[]>(INITIAL_SOLAR_SYSTEM_SLOTS);
  const [acsGroups, setAcsGroups] = useState<ACSAttackGroup[]>(INITIAL_ACS_GROUPS);
  const [missileSilo, setMissileSilo] = useState<MissileSiloData>(INITIAL_MISSILE_SILO);
  const [activeTab, setActiveTab] = useState<'galaxy' | 'acs' | 'missiles' | 'servers'>('galaxy');
  const [phalanxTarget, setPhalanxTarget] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Dispatch Espionage Probe
  const handleSpy = (slotNum: number, targetName: string) => {
    sound.play('ping');
    showMsg(`Espionage drone squadron dispatched to [${galaxy}:${system}:${slotNum}] ${targetName}. Sensor scan data incoming...`);
  };

  // Dispatch Attack Fleet
  const handleAttack = (slotNum: number, targetName: string) => {
    sound.play('warning');
    showMsg(`Strike force dispatched to raid [${galaxy}:${system}:${slotNum}] ${targetName}! ETA: 12m 40s.`);
  };

  // Recycle Debris Field
  const handleRecycle = (slotNum: number, debris: { metal: number; crystal: number }) => {
    const yieldNaq = Math.round((debris.metal + debris.crystal) * 0.8);
    onUpdateResources({
      naquadah: resources.naquadah + yieldNaq,
      metal: resources.metal + debris.metal,
    });

    // Clear debris field locally
    const updated = slots.map((s) => (s.slotNumber === slotNum ? { ...s, debrisField: undefined } : s));
    setSlots(updated);

    sound.play('success');
    showMsg(`Recycler fleet harvested debris at [${galaxy}:${system}:${slotNum}]! Recovered +${debris.metal.toLocaleString()} Metal & +${yieldNaq.toLocaleString()} Naquadah!`);
  };

  // Launch Interplanetary Missile
  const handleLaunchIPM = () => {
    if (missileSilo.ipmCount <= 0) {
      sound.play('warning');
      showMsg('No Interplanetary Missiles available in missile silo!');
      return;
    }

    setMissileSilo({ ...missileSilo, ipmCount: missileSilo.ipmCount - 1 });
    sound.play('combat');
    showMsg(`Interplanetary Missile fired at [${galaxy}:${system}:8] Sovereign Nexus! Target defense systems heavily bombarded.`);
  };

  // Build Missiles
  const handleBuildMissiles = (type: 'ipm' | 'abm') => {
    const cost = type === 'ipm' ? 15000 : 8000;
    if (resources.naquadah < cost) {
      sound.play('warning');
      showMsg(`Insufficient Naquadah to assemble missile (Need ${cost.toLocaleString()}).`);
      return;
    }

    onUpdateResources({ naquadah: resources.naquadah - cost });
    if (type === 'ipm') {
      setMissileSilo({ ...missileSilo, ipmCount: missileSilo.ipmCount + 1 });
    } else {
      setMissileSilo({ ...missileSilo, abmCount: missileSilo.abmCount + 1 });
    }
    sound.play('confirm');
    showMsg(`Constructed 1x ${type === 'ipm' ? 'Interplanetary' : 'Anti-Ballistic'} Missile in Silo.`);
  };

  // Sensor Phalanx Sweep
  const handlePhalanxSweep = (moonName: string) => {
    sound.play('ping');
    setPhalanxTarget(moonName);
    showMsg(`Sensor Phalanx scan completed for ${moonName}. Detected 2 fleet movements in transit.`);
  };

  return (
    <div id="mmorpg-ogame-view" className="space-y-6">
      {/* Header Banner */}
      <div className="border border-[#dedede] bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
            UNIVERSE CIVILIZATION: EMPIRE AT WAR MMORPG SIMULATION
          </div>
          <h2 className="text-2xl font-bold text-[#111111] flex items-center gap-3">
            <span>Universe Civilization Interstellar Star Systems</span>
            <span className="text-xs bg-[#111111] text-white px-2.5 py-0.5 font-mono uppercase">
              {selectedServer.name}
            </span>
          </h2>
          <p className="text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
            Classic 1-15 planetary orbit grids, floating space debris fields, ACS joint fleet attacks, lunar
            sensor phalanxes, and interplanetary missile defense networks.
          </p>
        </div>

        {/* Server Indicator Pill */}
        <div className="border border-[#dedede] bg-[#fafafa] p-3 text-right font-mono">
          <span className="text-[10px] text-[#777777] block uppercase font-bold">Speed Multipliers</span>
          <span className="text-sm font-bold text-[#111111]">
            Eco: {selectedServer.speedMultiplier}x • Fleet: {selectedServer.fleetSpeedMultiplier}x • Debris:{' '}
            {selectedServer.debrisFieldPercent}%
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

      {/* Sub-Navigation */}
      <div className="flex border-b border-[#dedede] gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('galaxy')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'galaxy'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Solar System Explorer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('acs')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'acs'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          ACS Alliance Fleet Combat
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('missiles')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'missiles'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Missile Silos & Phalanx
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('servers')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'servers'
              ? 'border-[#111111] text-[#111111] bg-white font-black'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          Universe Switcher
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. SOLAR SYSTEM EXPLORER (1-15 POSITIONS) */}
      {/* ============================================================ */}
      {activeTab === 'galaxy' && (
        <div className="space-y-6">
          {/* Coordinates Bar */}
          <div className="border border-[#dedede] bg-white p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-[#111111]">Galaxy:</span>
                <input
                  type="number"
                  min={1}
                  max={selectedServer.galaxiesCount}
                  value={galaxy}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setGalaxy(Math.max(1, Math.min(selectedServer.galaxiesCount, v)));
                  }}
                  className="w-16 border border-[#dedede] p-1.5 text-center font-mono font-bold text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-[#111111]">System:</span>
                <input
                  type="number"
                  min={1}
                  max={selectedServer.systemsPerGalaxy}
                  value={system}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setSystem(Math.max(1, Math.min(selectedServer.systemsPerGalaxy, v)));
                  }}
                  className="w-20 border border-[#dedede] p-1.5 text-center font-mono font-bold text-sm"
                />
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setSystem((s) => Math.max(1, s - 1))}
                  className="px-2.5 py-1.5 border border-[#dedede] text-xs font-mono font-bold hover:bg-[#f0f0f0]"
                >
                  ◄ Prev
                </button>
                <button
                  type="button"
                  onClick={() => setSystem((s) => Math.min(selectedServer.systemsPerGalaxy, s + 1))}
                  className="px-2.5 py-1.5 border border-[#dedede] text-xs font-mono font-bold hover:bg-[#f0f0f0]"
                >
                  Next ►
                </button>
              </div>
            </div>

            <div className="text-xs font-mono text-[#666666]">
              Target System Coordinates: <strong className="text-[#111111]">[{galaxy}:{system}:x]</strong>
            </div>
          </div>

          {/* Slots Table (1 to 15) */}
          <div className="border border-[#dedede] bg-white overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#dedede] bg-[#fafafa] font-mono text-[10px] text-[#777777] uppercase">
                  <th className="p-3 w-12 text-center">Pos</th>
                  <th className="p-3">Planet & Details</th>
                  <th className="p-3">Moon</th>
                  <th className="p-3">Debris Field</th>
                  <th className="p-3">Player / Alliance</th>
                  <th className="p-3 text-right">Tactical Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee]">
                {slots.map((slot) => {
                  const isEmpty = slot.type === 'empty';

                  return (
                    <tr key={slot.slotNumber} className={`hover:bg-[#fafafa] ${isEmpty ? 'opacity-60' : ''}`}>
                      <td className="p-3 text-center font-mono font-bold text-[#111111]">
                        {slot.slotNumber}
                      </td>

                      <td className="p-3">
                        {!isEmpty ? (
                          <div className="flex items-center gap-2.5">
                            <img
                              src={`/assets/planets/${(slot.planetClass || 'terran').toLowerCase().replace(' ', '_')}.png`}
                              alt={slot.planetName}
                              className="w-9 h-9 rounded-full border border-[#111111] bg-[#0f172a] object-cover shrink-0 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/assets/planets/terran.png';
                              }}
                            />
                            <div>
                              <div className="font-bold text-[#111111] flex items-center gap-1.5">
                                <span>{slot.planetName}</span>
                              </div>
                              <div className="text-[10px] text-[#777777] font-mono">
                                {slot.planetClass} • ⌀{slot.planetDiameterKm?.toLocaleString()}km •{' '}
                                {slot.temperatureMin}°C to {slot.temperatureMax}°C
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#999999] italic">Uncolonized Orbit</span>
                        )}
                      </td>

                      <td className="p-3">
                        {slot.hasMoon ? (
                          <div className="flex items-center gap-2">
                            <img
                              src="/assets/ogamex/planets/normal_moon_view.jpg"
                              alt={slot.moonName || 'Moon'}
                              className="w-7 h-7 rounded-full border border-[#111111] bg-[#0f172a] object-cover shrink-0 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/assets/planets/dead.png';
                              }}
                            />
                            <div>
                              <span className="font-bold text-[#111111] block">{slot.moonName}</span>
                              <span className="text-[10px] text-[#777777] font-mono">
                                ⌀{slot.moonDiameterKm?.toLocaleString()}km
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePhalanxSweep(slot.moonName || 'Moon')}
                              className="px-2 py-0.5 border border-[#dedede] hover:bg-[#111111] hover:text-white text-[10px] font-bold uppercase transition-colors"
                              title="Sensor Phalanx Scan"
                            >
                              Phalanx
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#bbbbbb] font-mono">-</span>
                        )}
                      </td>

                      <td className="p-3">
                        {slot.debrisField ? (
                          <div className="flex items-center gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-amber-700 font-bold block">
                                ⚙️ {slot.debrisField.metal.toLocaleString()} M
                              </span>
                              <span className="text-[10px] font-mono text-cyan-700 font-bold block">
                                💠 {slot.debrisField.crystal.toLocaleString()} C
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRecycle(slot.slotNumber, slot.debrisField!)}
                              className="px-2 py-1 bg-[#111111] text-white text-[10px] font-bold uppercase hover:bg-[#333333] transition-colors"
                            >
                              Recycle
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#bbbbbb] font-mono">-</span>
                        )}
                      </td>

                      <td className="p-3">
                        {!isEmpty ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#111111]">{slot.playerName}</span>
                              {slot.playerStatus === 'active' && (
                                <span className="text-[9px] font-bold text-green-600 font-mono">[a]</span>
                              )}
                              {slot.playerStatus === 'inactive' && (
                                <span className="text-[9px] font-bold text-gray-500 font-mono">[i]</span>
                              )}
                              {slot.playerStatus === 'vacation' && (
                                <span className="text-[9px] font-bold text-blue-600 font-mono">[v]</span>
                              )}
                              {slot.playerStatus === 'strong' && (
                                <span className="text-[9px] font-bold text-red-600 font-mono">[s]</span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#777777] font-mono">
                              Rank #{slot.playerRank} • <span className="text-indigo-600 font-bold">{slot.allianceTag}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#bbbbbb] font-mono">-</span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {!isEmpty ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSpy(slot.slotNumber, slot.planetName || 'Target')}
                              className="px-2 py-1 border border-[#dedede] hover:bg-[#eeeeee] text-[10px] font-bold uppercase"
                            >
                              Espionage
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttack(slot.slotNumber, slot.planetName || 'Target')}
                              className="px-2 py-1 bg-red-600 text-white hover:bg-red-700 text-[10px] font-bold uppercase"
                            >
                              Raid
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => showMsg(`Colony ship dispatched to settle position [${galaxy}:${system}:${slot.slotNumber}]!`)}
                            className="px-2.5 py-1 bg-[#111111] text-white hover:bg-[#333333] text-[10px] font-bold uppercase"
                          >
                            Colonize
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phalanx Radar Display Modal */}
          {phalanxTarget && (
            <div className="border border-[#111111] bg-[#fafafa] p-4">
              <div className="flex items-center justify-between border-b border-[#dedede] pb-2 mb-2">
                <span className="font-bold text-xs uppercase text-[#111111] flex items-center gap-1.5">
                  <Radio size={14} /> Active Sensor Phalanx Feed: {phalanxTarget}
                </span>
                <button
                  type="button"
                  onClick={() => setPhalanxTarget(null)}
                  className="text-xs font-bold text-[#555555] hover:text-[#111111]"
                >
                  ✕ Close Radar
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-white border border-[#eeeeee] flex justify-between">
                  <span className="text-red-600 font-bold">Hostile Fleet: 150 Cruisers & 40 Battleships</span>
                  <span>Arrival: in 04m 12s (Mission: Attack)</span>
                </div>
                <div className="p-2 bg-white border border-[#eeeeee] flex justify-between">
                  <span className="text-green-600 font-bold">Friendly Transport: 50 Large Cargo</span>
                  <span>Arrival: in 11m 30s (Mission: Transport)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. ACS ALLIANCE FLEET COMBAT */}
      {/* ============================================================ */}
      {activeTab === 'acs' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-1">
                Alliance Combat System (ACS)
              </h3>
              <p className="text-xs text-[#666666]">
                Coordinate synchronized joint attack and defense missions with alliance partners across the universe.
              </p>
            </div>

            <button
              type="button"
              onClick={() => showMsg('Created new ACS joint attack grouping. Invite codes sent to alliance commanders.')}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] transition-colors shrink-0"
            >
              + Create ACS Group
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {acsGroups.map((group) => (
              <div key={group.id} className="border border-[#dedede] p-5 bg-[#fafafa] space-y-4">
                <div className="flex items-center justify-between border-b border-[#dedede] pb-2">
                  <h4 className="font-bold text-sm text-[#111111]">{group.missionName}</h4>
                  <span className="text-[10px] font-mono uppercase bg-[#111111] text-white px-2 py-0.5">
                    {group.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Target Coordinate:</span>
                    <strong className="text-[#111111]">{group.targetCoord}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Lead Commander:</span>
                    <strong className="text-[#111111]">{group.leadCommander}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Synchronized Ships:</span>
                    <strong className="text-[#111111]">{group.totalShips.toLocaleString()} Warships</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Time to Impact:</span>
                    <strong className="text-red-600">{group.arrivalSeconds} Seconds</strong>
                  </div>
                </div>

                <div className="border-t border-[#dedede] pt-3">
                  <span className="text-[10px] text-[#777777] uppercase block font-bold mb-1">
                    Joined Commanders:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.members.map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white border border-[#dedede] text-xs font-mono">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showMsg(`Linked 250 heavy battleships to ACS group: ${group.missionName}!`)}
                  className="w-full py-2 bg-[#111111] text-white text-xs font-bold uppercase hover:bg-[#333333] transition-colors"
                >
                  Join ACS Strike Flotilla →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MISSILE SILOS & DEFENSE SYSTEMS */}
      {/* ============================================================ */}
      {activeTab === 'missiles' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-1">
              Missile Silo & Strategic Defense Complex
            </h3>
            <p className="text-xs text-[#666666]">
              Level {missileSilo.level} Silo Complex. Effective ballistic strike range: {missileSilo.rangeSystems} Systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IPM */}
            <div className="border border-[#dedede] p-5 bg-[#fafafa] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/defense/interplanetary_missile.png"
                    alt="IPM"
                    className="w-12 h-12 rounded border border-[#111111] bg-[#111827] object-cover shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/ogame/verteidigung/503.png';
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">Interplanetary Missiles (IPM)</h4>
                    <p className="text-xs text-[#666666]">
                      Destroys planetary defense turrets and shield domes without fleet losses.
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-mono text-[#111111]">
                  {missileSilo.ipmCount}
                </span>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleLaunchIPM}
                  className="flex-1 py-2 bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 transition-colors"
                >
                  Launch Strategic Strike
                </button>
                <button
                  type="button"
                  onClick={() => handleBuildMissiles('ipm')}
                  className="px-4 py-2 border border-[#dedede] text-xs font-bold uppercase hover:bg-[#eeeeee]"
                >
                  Build (+1)
                </button>
              </div>
            </div>

            {/* ABM */}
            <div className="border border-[#dedede] p-5 bg-[#fafafa] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/defense/anti_ballistic_missile.png"
                    alt="ABM"
                    className="w-12 h-12 rounded border border-[#111111] bg-[#111827] object-cover shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/ogame/verteidigung/502.png';
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">Anti-Ballistic Missiles (ABM)</h4>
                    <p className="text-xs text-[#666666]">
                      Automatically intercepts and neutralizes incoming hostile missile barrages.
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-mono text-[#16a34a]">
                  {missileSilo.abmCount}
                </span>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => handleBuildMissiles('abm')}
                  className="w-full py-2 border border-[#dedede] text-xs font-bold uppercase hover:bg-[#eeeeee] transition-colors"
                >
                  Build Interceptor (+1)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. UNIVERSE SWITCHER */}
      {/* ============================================================ */}
      {activeTab === 'servers' && (
        <div className="border border-[#dedede] bg-white p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-1">
              Select MMORPG Universe Server
            </h3>
            <p className="text-xs text-[#666666]">
              Switch server realms to experience distinct gameplay dynamics, speed ratings, and debris percentages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OGAME_SERVERS.map((srv) => (
              <div
                key={srv.id}
                className={`border p-5 flex flex-col justify-between transition-all ${
                  selectedServer.id === srv.id
                    ? 'border-[#111111] bg-[#fafafa] ring-2 ring-[#111111]'
                    : 'border-[#dedede] bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase bg-[#eeeeee] px-2 py-0.5 text-[#555555]">
                      {srv.status}
                    </span>
                    <span className="text-xs font-mono text-[#16a34a] font-bold">
                      ● {srv.playersOnline.toLocaleString()} Online
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-[#111111] mb-2">{srv.name}</h4>
                  <p className="text-xs text-[#666666] mb-4 leading-relaxed">{srv.description}</p>

                  <div className="space-y-1 text-xs font-mono border-t border-[#eeeeee] pt-3">
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Economy Velocity:</span>
                      <strong className="text-[#111111]">{srv.speedMultiplier}x Speed</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Fleet Flight Velocity:</span>
                      <strong className="text-[#111111]">{srv.fleetSpeedMultiplier}x Speed</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Combat Debris Field:</span>
                      <strong className="text-[#111111]">{srv.debrisFieldPercent}% of Hull</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[#eeeeee]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedServer(srv);
                      sound.play('confirm');
                      showMsg(`Connected to ${srv.name}!`);
                    }}
                    disabled={selectedServer.id === srv.id}
                    className={`w-full py-2 text-xs font-bold uppercase transition-colors ${
                      selectedServer.id === srv.id
                        ? 'bg-[#111111] text-white cursor-default'
                        : 'border border-[#dedede] hover:bg-[#f0f0f0]'
                    }`}
                  >
                    {selectedServer.id === srv.id ? 'Current Universe' : 'Connect To Realm →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
type OGAME_SERVERS_TYPE = (typeof OGAME_SERVERS)[number];

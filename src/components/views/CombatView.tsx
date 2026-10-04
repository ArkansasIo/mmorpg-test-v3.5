import React, { useState } from 'react';
import { Crosshair, Shield, Swords, AlertCircle, CheckCircle2, Flame, RefreshCw, Trophy, Skull } from 'lucide-react';
import { sound } from '../../sound';
import { BattleRecord, PlayerProfile, PlayerResources, TargetRealm, FleetFormationPreset, FleetFormationType } from '../../types';
import { FLEET_FORMATIONS } from '../../ogameData';

interface CombatViewProps {
  profile: PlayerProfile;
  resources: PlayerResources;
  targets: TargetRealm[];
  fleetPresets?: FleetFormationPreset[];
  selectedFormation?: FleetFormationType;
  onSelectFormation?: (formation: FleetFormationType) => void;
  onExecuteAttack: (
    targetId: string,
    turns: number,
    action: 'attack' | 'raid'
  ) => { success: boolean; message: string; battle?: BattleRecord };
  onNavigate: (route: string) => void;
}

interface CombatRoundLog {
  roundNumber: number;
  attackerDamageDealt: number;
  defenderDamageDealt: number;
  attackerShieldAbsorbed: number;
  defenderShieldAbsorbed: number;
  attackerLossesCount: number;
  defenderLossesCount: number;
}

interface DetailedBattleReport {
  targetName: string;
  victory: boolean;
  loot: number;
  debrisMetal: number;
  debrisCrystal: number;
  moonChance: number;
  moonCreated: boolean;
  attackerCasualties: number;
  defenderCasualties: number;
  rounds: CombatRoundLog[];
}

export const CombatView: React.FC<CombatViewProps> = ({
  profile,
  resources,
  targets,
  fleetPresets = [],
  selectedFormation = 'standard',
  onSelectFormation,
  onExecuteAttack,
  onNavigate,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>(targets[0]?.id || '');
  const [turnsToSpend, setTurnsToSpend] = useState<number>(3);
  const [actionType, setActionType] = useState<'attack' | 'raid'>('attack');
  const [lastBattle, setLastBattle] = useState<BattleRecord | null>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedBattleReport | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const selectedTarget = targets.find((t) => t.id === selectedTargetId);
  const activeFormationDef = FLEET_FORMATIONS.find((f) => f.id === selectedFormation) || FLEET_FORMATIONS[0];

  const handleSelectPreset = (presetId: string) => {
    const preset = fleetPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    if (onSelectFormation) {
      onSelectFormation(preset.formation);
    }
    sound.play('confirm');
  };

  const handleAttackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;

    if (resources.attackTurns < turnsToSpend) {
      sound.play('warning');
      setErrorNotice('Insufficient attack turns available.');
      return;
    }

    setIsSimulating(true);
    sound.play('combat');

    setTimeout(() => {
      const result = onExecuteAttack(selectedTarget.id, turnsToSpend, actionType);
      setIsSimulating(false);

      if (result.success && result.battle) {
        if (result.battle.victory) {
          sound.play('success');
        } else {
          sound.play('warning');
        }
        setLastBattle(result.battle);

        // Generate simulated OGame round-by-round combat report
        const roundCount = Math.floor(Math.random() * 3) + 2;
        const rounds: CombatRoundLog[] = [];
        let attLosses = result.battle.attackerCasualties;
        let defLosses = result.battle.defenderCasualties;

        for (let r = 1; r <= roundCount; r++) {
          rounds.push({
            roundNumber: r,
            attackerDamageDealt: Math.round(result.battle.attackerScore * (0.25 + Math.random() * 0.15) * activeFormationDef.attackModifier),
            defenderDamageDealt: Math.round(result.battle.defenderScore * (0.2 + Math.random() * 0.1)),
            attackerShieldAbsorbed: Math.round((Math.random() * 5000 + 1200) * activeFormationDef.defenseModifier),
            defenderShieldAbsorbed: Math.round(Math.random() * 4000 + 1000),
            attackerLossesCount: Math.round(attLosses / roundCount),
            defenderLossesCount: Math.round(defLosses / roundCount),
          });
        }

        const debrisMetal = Math.round(result.battle.loot * 0.3);
        const debrisCrystal = Math.round(result.battle.loot * 0.2);
        const moonChance = Math.min(20, Math.round((debrisMetal + debrisCrystal) / 100000 * 2));
        const moonCreated = Math.random() * 100 < moonChance;

        setDetailedReport({
          targetName: selectedTarget.commanderName,
          victory: result.battle.victory,
          loot: result.battle.loot,
          debrisMetal,
          debrisCrystal,
          moonChance,
          moonCreated,
          attackerCasualties: result.battle.attackerCasualties,
          defenderCasualties: result.battle.defenderCasualties,
          rounds,
        });

        setErrorNotice(null);
      } else {
        setErrorNotice(result.message);
      }
    }, 800);
  };

  return (
    <div id="combat-view" className="space-y-6">
      <div className="border border-[#dedede] bg-white p-6">
        <div className="text-[9px] font-bold text-[#777777] tracking-[1.5px] uppercase mb-1">
          GAME TACTICAL BATTLE ENGINE · FLEET COMBAT SIMULATOR
        </div>
        <h2 className="text-2xl font-bold text-[#111111]">Planetary Invasions & Round Combat Simulator</h2>
        <p className="text-sm text-[#666666] mt-1 max-w-3xl leading-relaxed">
          Simulate Game combat rounds (1-6 rounds), shield absorptions, rapid-fire weapon metrics, debris field wreckage formation (30% Metal & Crystal), and planetary moon creation probabilities.
        </p>
      </div>

      {errorNotice && (
        <div className="p-4 bg-[#fff5f5] border border-[#dc2626] border-l-4 text-[#dc2626] text-xs font-semibold flex justify-between items-center">
          <span>{errorNotice}</span>
          <button type="button" onClick={() => setErrorNotice(null)} className="cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Detailed Combat Simulation Result Modal / Dossier */}
      {detailedReport && (
        <div className="border-2 border-[#111111] bg-white p-6 space-y-6 animate-fade-in shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dedede] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase text-[#777777]">
                  TACTICAL AFTER-ACTION REPORT
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 font-bold uppercase font-mono ${
                    detailedReport.victory ? 'bg-emerald-600 text-white' : 'bg-rose-700 text-white'
                  }`}
                >
                  {detailedReport.victory ? 'TACTICAL VICTORY' : 'TACTICAL DEFEAT'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#111111] mt-1">
                Engagement against {detailedReport.targetName}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setDetailedReport(null)}
              className="px-3 py-1.5 border border-[#cccccc] hover:border-[#111111] text-xs font-mono font-bold cursor-pointer self-start sm:self-auto"
            >
              Close Dossier [✕]
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#fafafa] p-4 border border-[#dedede]">
              <span className="text-[#777777] block text-[10px] uppercase font-bold">Plundered Naquadah</span>
              <span className="text-lg font-bold font-mono text-emerald-600 block mt-1">
                +{detailedReport.loot.toLocaleString()} NQ
              </span>
            </div>
            <div className="bg-[#fafafa] p-4 border border-[#dedede]">
              <span className="text-[#777777] block text-[10px] uppercase font-bold">Orbital Debris Field</span>
              <div className="mt-1 font-mono text-[11px] space-y-0.5">
                <span className="text-[#111111] block">M: {detailedReport.debrisMetal.toLocaleString()}</span>
                <span className="text-[#555555] block">C: {detailedReport.debrisCrystal.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-[#fafafa] p-4 border border-[#dedede]">
              <span className="text-[#777777] block text-[10px] uppercase font-bold">Moon Generation</span>
              <div className="mt-1">
                <span className="font-mono text-xs font-bold text-indigo-700">
                  {detailedReport.moonChance}% Probability
                </span>
                {detailedReport.moonCreated ? (
                  <span className="block text-[11px] text-emerald-700 font-bold mt-0.5">
                    🌕 MOON FORMED IN ORBIT!
                  </span>
                ) : (
                  <span className="block text-[11px] text-[#777777] mt-0.5">No Moon Condensed</span>
                )}
              </div>
            </div>
            <div className="bg-[#fafafa] p-4 border border-[#dedede]">
              <span className="text-[#777777] block text-[10px] uppercase font-bold">Total Casualties</span>
              <div className="mt-1 font-mono text-[11px] space-y-0.5">
                <span className="text-rose-700 block">Attacker: -{detailedReport.attackerCasualties}</span>
                <span className="text-[#555555] block">Defender: -{detailedReport.defenderCasualties}</span>
              </div>
            </div>
          </div>

          {/* Round by Round Combat Log */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Game Round-by-Round Combat Engine Execution
            </h4>
            <div className="space-y-2">
              {detailedReport.rounds.map((rnd) => (
                <div key={rnd.roundNumber} className="border border-[#dedede] bg-[#fafafa] p-3 text-xs font-mono">
                  <div className="flex justify-between items-center border-b border-[#dedede] pb-1.5 mb-2 font-bold text-[#111111]">
                    <span>COMBAT ROUND {rnd.roundNumber} / 6</span>
                    <span className="text-[11px] text-[#666666]">Shield Absorption Active</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-2.5 border border-[#dedede]">
                      <span className="text-[#777777] block text-[10px] uppercase font-bold mb-1">Attacker Fleet Strike</span>
                      <div className="text-[11px] space-y-0.5">
                        <div>Damage Dealt: <strong className="text-[#111111]">{rnd.attackerDamageDealt.toLocaleString()}</strong></div>
                        <div>Shield Absorbed: <strong className="text-blue-700">{rnd.attackerShieldAbsorbed.toLocaleString()}</strong></div>
                        <div>Losses: <strong className="text-rose-700">-{rnd.attackerLossesCount} units</strong></div>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 border border-[#dedede]">
                      <span className="text-[#777777] block text-[10px] uppercase font-bold mb-1">Defender Garrison Defenses</span>
                      <div className="text-[11px] space-y-0.5">
                        <div>Damage Dealt: <strong className="text-[#111111]">{rnd.defenderDamageDealt.toLocaleString()}</strong></div>
                        <div>Shield Absorbed: <strong className="text-blue-700">{rnd.defenderShieldAbsorbed.toLocaleString()}</strong></div>
                        <div>Losses: <strong className="text-rose-700">-{rnd.defenderLossesCount} units</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Target Selection & Attack Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Targets Table */}
        <div className="lg:col-span-8 border border-[#dedede] bg-white p-6">
          <div className="border-b border-[#eeeeee] pb-4 mb-4">
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              Scouted Hostile Realms & Target Systems
            </h3>
            <p className="text-xs text-[#777777] mt-0.5">
              Select an enemy commander below to run the Game tactical battle simulation.
            </p>
          </div>

          <div className="divide-y divide-[#eeeeee] text-xs">
            {targets.map((tgt) => {
              const isSelected = selectedTargetId === tgt.id;
              return (
                <div
                  key={tgt.id}
                  onClick={() => {
                    sound.play('click');
                    setSelectedTargetId(tgt.id);
                  }}
                  className={`py-3.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#f5f5f5] border-l-4 border-[#111111]' : 'hover:bg-[#fafafa]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-[#111111]">{tgt.commanderName}</strong>
                      <span className="text-[10px] px-1.5 py-0.5 bg-white border border-[#dedede] text-[#666666]">
                        {tgt.race}
                      </span>
                      {tgt.isProtected && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-[#fef2f2] text-[#dc2626] font-bold border border-[#fecaca]">
                          PROTECTED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#777777] mt-1 flex gap-4">
                      <span>Rank: {tgt.rank}</span>
                      <span>Score: {tgt.score.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col sm:items-end gap-3 sm:gap-1 text-xs">
                    <span className="text-[#666666]">
                      Est. Garrison: <b className="font-mono text-[#111111]">~{tgt.estimatedUnits} units</b>
                    </span>
                    <span className="text-[#666666]">
                      Est. Plunder: <b className="font-mono text-[#111111]">~{tgt.estimatedNaquadah.toLocaleString()} NQ</b>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attack Control Panel */}
        <div className="lg:col-span-4 border border-[#dedede] bg-white p-6 space-y-5">
          <div className="border-b border-[#eeeeee] pb-3">
            <h3 className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              Engagement Orders
            </h3>
            <span className="text-xs text-[#777777] block mt-0.5">
              Target: <b className="text-[#111111]">{selectedTarget?.commanderName}</b>
            </span>
          </div>

          <form onSubmit={handleAttackSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#555555] uppercase tracking-wider mb-2">
                Operation Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('attack')}
                  className={`py-2 text-xs font-bold uppercase transition-colors border ${
                    actionType === 'attack'
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-[#555555] border-[#dedede] hover:border-[#111111]'
                  }`}
                >
                  Full Attack
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('raid')}
                  className={`py-2 text-xs font-bold uppercase transition-colors border ${
                    actionType === 'raid'
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-[#555555] border-[#dedede] hover:border-[#111111]'
                  }`}
                >
                  Quick Raid
                </button>
              </div>
            </div>

            {/* Tactical Formation Preset Selector */}
            {fleetPresets.length > 0 && (
              <div className="border border-[#dedede] bg-[#fafafa] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#555555] uppercase tracking-wider">
                    Fleet Formation Doctrine
                  </label>
                  <span className="text-[10px] font-mono font-bold text-[#111111]">
                    {activeFormationDef.name}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {fleetPresets.slice(0, 4).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`px-2 py-0.5 text-[10px] font-mono border cursor-pointer ${
                        selectedPresetId === preset.id || selectedFormation === preset.formation
                          ? 'border-[#111111] bg-[#111111] text-white font-bold'
                          : 'border-[#cccccc] bg-white text-[#111111] hover:border-[#111111]'
                      }`}
                    >
                      {preset.name.split(' ')[0]} {preset.name.split(' ')[1] || ''}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-[#666666] flex justify-between">
                  <span>Attack Multiplier: <strong className="text-[#16a34a]">x{activeFormationDef.attackModifier}</strong></span>
                  <span>Defense Shield: <strong className="text-[#2563eb]">x{activeFormationDef.defenseModifier}</strong></span>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-[#555555] uppercase tracking-wider">
                  Attack Turns to Spend
                </label>
                <span className="font-mono text-xs font-bold text-[#111111]">
                  {turnsToSpend} Turns ({resources.attackTurns} available)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={Math.min(15, Math.max(1, resources.attackTurns))}
                value={turnsToSpend}
                onChange={(e) => setTurnsToSpend(parseInt(e.target.value, 10))}
                className="w-full accent-[#111111]"
              />
              <div className="flex justify-between text-[10px] text-[#888888] mt-1">
                <span>1 Turn</span>
                <span>Max 15 Turns</span>
              </div>
            </div>

            <div className="border border-[#eeeeee] bg-[#fafafa] p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#666666]">Available Strike Troops:</span>
                <b className="font-mono text-[#111111]">{resources.attackUnits.toLocaleString()}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Race Attack Bonus:</span>
                <b className="font-mono text-[#111111]">{profile.race === 'tauri' ? '+25%' : '0%'}</b>
              </div>
            </div>

            <button
              type="submit"
              id="launch-combat-btn"
              disabled={resources.attackTurns < turnsToSpend || selectedTarget?.isProtected || isSimulating}
              className="w-full py-3 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSimulating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Simulating Combat Rounds...</span>
                </>
              ) : (
                <>
                  <Swords size={15} />
                  <span>Launch Strike Fleet & Simulate →</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

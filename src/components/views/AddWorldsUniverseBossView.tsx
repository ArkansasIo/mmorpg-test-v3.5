import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Shield,
  Zap,
  Crosshair,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Swords,
  ChevronRight,
  Database,
  Sliders,
  Radio,
  Cpu,
  Trash2,
  RefreshCw,
  Info,
  Box,
  Crown,
  ShieldAlert,
  ArrowRight,
  Sparkle,
} from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources } from '../../types';
import {
  UniverseWorld,
  GalaxyAndArcBoss,
  Class90Entry,
  loadCustomWorlds,
  saveCustomWorld,
  GALAXY_AND_ARC_BOSSES,
  getComplete90ClassesMatrix,
} from '../../data/universeBoss90Data';

interface AddWorldsUniverseBossViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
  onNavigate?: (route: string) => void;
}

export const AddWorldsUniverseBossView: React.FC<AddWorldsUniverseBossViewProps> = ({
  resources,
  onUpdateResources,
  onNavigate,
}) => {
  // Navigation Tabs inside this view
  const [activeTab, setActiveTab] = useState<'worlds' | 'bosses' | 'classes90' | 'gamelogic'>('bosses');

  // ============================================================================
  // TAB 1: ADD WORLDS & UNIVERSE MANAGER STATE
  // ============================================================================
  const [worlds, setWorlds] = useState<UniverseWorld[]>(loadCustomWorlds);
  const [worldSearch, setWorldSearch] = useState<string>('');
  const [selectedUniverseFilter, setSelectedUniverseFilter] = useState<number>(0); // 0 = All

  // New World Form State
  const [newWorldName, setNewWorldName] = useState<string>('');
  const [newWorldUniverse, setNewWorldUniverse] = useState<number>(1);
  const [newWorldGalaxy, setNewWorldGalaxy] = useState<number>(1);
  const [newWorldSystem, setNewWorldSystem] = useState<number>(100);
  const [newWorldPosition, setNewWorldPosition] = useState<number>(4);
  const [newWorldBiome, setNewWorldBiome] = useState<UniverseWorld['biome']>('Terrestrial');
  const [newWorldHazard, setNewWorldHazard] = useState<number>(3);
  const [newWorldResMult, setNewWorldResMult] = useState<number>(1.5);
  const [newWorldRuins, setNewWorldRuins] = useState<boolean>(true);
  const [newWorldDefense, setNewWorldDefense] = useState<number>(4);
  const [newWorldBoss, setNewWorldBoss] = useState<string>('');
  const [worldFeedback, setWorldFeedback] = useState<string | null>(null);

  const handleCreateWorld = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorldName.trim()) {
      sound.play('warning');
      setWorldFeedback('Please provide a valid World Name.');
      return;
    }

    const coordStr = `U${String(newWorldUniverse).padStart(2, '0')}:G${String(newWorldGalaxy).padStart(2, '0')}:S${String(newWorldSystem).padStart(3, '0')}:P${String(newWorldPosition).padStart(2, '0')}`;

    const newWorld: UniverseWorld = {
      id: `custom_world_${Date.now()}`,
      universeId: newWorldUniverse,
      galaxyId: newWorldGalaxy,
      system: newWorldSystem,
      position: newWorldPosition,
      name: newWorldName.trim(),
      biome: newWorldBiome,
      hazardLevel: newWorldHazard,
      resourceMultiplier: newWorldResMult,
      hasPrecursorRuins: newWorldRuins,
      defenseGridLevel: newWorldDefense,
      guardBossName: newWorldBoss.trim() || 'Sector Defense Sentry',
      stargateCoordinates: coordStr,
      description: `User-created ${newWorldBiome} world in Universe ${newWorldUniverse}, Galaxy ${newWorldGalaxy}. Fortified with Level ${newWorldDefense} defense grids.`,
      createdByUser: true,
      createdAt: new Date().toISOString(),
    };

    const updated = saveCustomWorld(newWorld);
    setWorlds(updated);
    sound.play('confirm');
    setWorldFeedback(`Successfully added "${newWorld.name}" [${coordStr}] to Universe ${newWorldUniverse}!`);

    // Reset Form
    setNewWorldName('');
  };

  const filteredWorlds = worlds.filter((w) => {
    const matchesUniv = selectedUniverseFilter === 0 || w.universeId === selectedUniverseFilter;
    const matchesSearch =
      w.name.toLowerCase().includes(worldSearch.toLowerCase()) ||
      w.stargateCoordinates.toLowerCase().includes(worldSearch.toLowerCase()) ||
      w.biome.toLowerCase().includes(worldSearch.toLowerCase());
    return matchesUniv && matchesSearch;
  });

  // ============================================================================
  // TAB 2: GALAXY BOSS & ARC BOSS RAID ARENA STATE
  // ============================================================================
  const [selectedBoss, setSelectedBoss] = useState<GalaxyAndArcBoss>(GALAXY_AND_ARC_BOSSES[0]);
  const [bossFilter, setBossFilter] = useState<'all' | 'arc_boss' | 'galaxy_boss'>('all');
  const [raidInProgress, setRaidInProgress] = useState<boolean>(false);
  const [currentBossHp, setCurrentBossHp] = useState<number>(selectedBoss.maxHealth);
  const [currentBossShield, setCurrentBossShield] = useState<number>(selectedBoss.maxShield);
  const [bossRageTicks, setBossRageTicks] = useState<number>(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [fleetIntegrity, setFleetIntegrity] = useState<number>(100); // 100%
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [raidVictory, setRaidVictory] = useState<boolean>(false);

  // Update live boss stats when changing boss
  useEffect(() => {
    setCurrentBossHp(selectedBoss.maxHealth);
    setCurrentBossShield(selectedBoss.maxShield);
    setBossRageTicks(0);
    setCurrentPhaseIndex(0);
    setFleetIntegrity(100);
    setCombatLogs([`Target locked: ${selectedBoss.name} (${selectedBoss.title}). Prepare for fleet strike!`]);
    setRaidInProgress(false);
    setRaidVictory(false);
  }, [selectedBoss]);

  // Execute Raid Combat Turn Tick
  const handleExecuteRaidTurn = () => {
    if (raidVictory || currentBossHp <= 0) return;

    sound.play('click');
    setRaidInProgress(true);

    // Player Fleet Deals Damage
    const playerFleetPower = 450000 + Math.floor(Math.random() * 150000);
    let damageToShield = Math.min(currentBossShield, playerFleetPower);
    let damageToHp = playerFleetPower - damageToShield;

    const newShield = Math.max(0, currentBossShield - damageToShield);
    const newHp = Math.max(0, currentBossHp - damageToHp);

    setCurrentBossShield(newShield);
    setCurrentBossHp(newHp);

    const newRage = bossRageTicks + 1;
    setBossRageTicks(newRage);

    // Check Boss Phase Transition
    const hpPercent = (newHp / selectedBoss.maxHealth) * 100;
    let newPhaseIdx = currentPhaseIndex;
    if (hpPercent <= 20 && selectedBoss.phases.length > 2) {
      newPhaseIdx = 2;
    } else if (hpPercent <= 50 && selectedBoss.phases.length > 1) {
      newPhaseIdx = 1;
    }

    if (newPhaseIdx !== currentPhaseIndex) {
      setCurrentPhaseIndex(newPhaseIdx);
      const phaseData = selectedBoss.phases[newPhaseIdx];
      sound.play('warning');
      setCombatLogs((prev) => [
        `⚠️ PHASE SHIFT DETECTED! ${selectedBoss.name} entered ${phaseData.phaseName}!`,
        `💬 Boss Dialogue: "${phaseData.dialogue}"`,
        ...prev,
      ]);
    }

    // Boss Retaliation Attack
    const activePhase = selectedBoss.phases[newPhaseIdx] || selectedBoss.phases[0];
    const bossDamage = Math.floor(selectedBoss.attackPower * activePhase.bonusAttackMultiplier * (0.8 + Math.random() * 0.4));
    const fleetHpLossPercent = Math.min(30, Math.floor((bossDamage / 15000) * 10)) + 2;
    const newFleetIntegrity = Math.max(0, fleetIntegrity - fleetHpLossPercent);
    setFleetIntegrity(newFleetIntegrity);

    // Random Boss Ability
    const randomAbility = selectedBoss.abilities[Math.floor(Math.random() * selectedBoss.abilities.length)];

    setCombatLogs((prev) => [
      `⚔️ Turn ${newRage}: Fleet dealt ${playerFleetPower.toLocaleString()} total damage (${damageToHp.toLocaleString()} to HP, ${damageToShield.toLocaleString()} to Shield).`,
      `🔥 ${selectedBoss.name} cast [${randomAbility.name}]! Fleet integrity dropped to ${newFleetIntegrity}%.`,
      ...prev,
    ]);

    // Check Victory Condition
    if (newHp <= 0) {
      sound.play('confirm');
      setRaidVictory(true);
      setRaidInProgress(false);
      setCombatLogs((prev) => [
        `🏆 VICTORY! ${selectedBoss.name} HAS BEEN OBLITERATED!`,
        `💰 PRECURSOR LOOT CLAIMED: +${selectedBoss.loot.metal.toLocaleString()} Metal, +${selectedBoss.loot.crystal.toLocaleString()} Crystal, +${selectedBoss.loot.deuterium.toLocaleString()} Deuterium, +${selectedBoss.loot.darkMatter.toLocaleString()} Dark Matter, +${selectedBoss.loot.precursorArtifacts} Precursor Relics!`,
        `📜 SCHEMATIC UNLOCKED: ${selectedBoss.loot.schematicDrop}`,
        ...prev,
      ]);

      // Grant Resources
      onUpdateResources({
        metal: resources.metal + selectedBoss.loot.metal,
        crystal: resources.crystal + selectedBoss.loot.crystal,
        deuterium: resources.deuterium + selectedBoss.loot.deuterium,
        darkMatter: (resources.darkMatter || 0) + selectedBoss.loot.darkMatter,
      });
    } else if (newFleetIntegrity <= 0) {
      sound.play('warning');
      setRaidInProgress(false);
      setCombatLogs((prev) => [
        `💥 FLEET DESTROYED! All frontline warships sustained critical structural breach. Emergency retreat initiated!`,
        ...prev,
      ]);
    }
  };

  const handleResetRaid = () => {
    sound.play('confirm');
    setCurrentBossHp(selectedBoss.maxHealth);
    setCurrentBossShield(selectedBoss.maxShield);
    setBossRageTicks(0);
    setCurrentPhaseIndex(0);
    setFleetIntegrity(100);
    setCombatLogs([`Raid combat reset. ${selectedBoss.name} fully recharged.`]);
    setRaidVictory(false);
    setRaidInProgress(false);
  };

  const filteredBosses = GALAXY_AND_ARC_BOSSES.filter((b) => {
    if (bossFilter === 'arc_boss') return b.type === 'arc_boss';
    if (bossFilter === 'galaxy_boss') return b.type === 'galaxy_boss';
    return true;
  });

  // ============================================================================
  // TAB 3: 90 CLASS & SUB-CLASS TAXONOMY MATRIX STATE
  // ============================================================================
  const classMatrix90 = getComplete90ClassesMatrix();
  const [classSearch, setClassSearch] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedClassDetail, setSelectedClassDetail] = useState<Class90Entry | null>(classMatrix90[0]);

  const categories90 = ['All', ...Array.from(new Set(classMatrix90.map((c) => c.primaryCategory)))];

  const filtered90Classes = classMatrix90.filter((c) => {
    const matchesCat = selectedCategoryFilter === 'All' || c.primaryCategory === selectedCategoryFilter;
    const matchesSearch =
      c.typeName.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.subClass.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.subType.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.weaponType.toLowerCase().includes(classSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div id="add-worlds-universe-boss-view" className="space-y-6">
      {/* Top Banner */}
      <div className="border border-[#dedede] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#111111] text-amber-300 text-[10px] font-mono font-extrabold uppercase tracking-widest">
                Multiverse Expansion Engine
              </span>
              <span className="text-xs font-mono text-[#777777]">
                30 Universes · 90 Galaxies · 90 Unit Classes
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[#111111]">
              Universe World Creator & Galaxy/Arc Boss Raid Arena
            </h2>
            <p className="text-xs text-[#666666] max-w-3xl mt-1 leading-relaxed">
              Generate new custom worlds across all 30 Universes, challenge Multiverse Arc Bosses and Galaxy Guardians in simulated raid combat, and inspect the complete 90-Class & Sub-Class taxonomy matrix.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('universe')}
              className="px-3 py-2 bg-[#fafafa] border border-[#dedede] hover:border-[#111111] text-xs font-mono font-bold text-[#333333] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Globe size={14} className="text-amber-600" />
              <span>30 Universes Map</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('unit-roster-90')}
              className="px-3 py-2 bg-[#111111] text-white text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-[#222222] transition-all cursor-pointer"
            >
              <Box size={14} className="text-amber-400" />
              <span>90 Unit Roster</span>
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#dedede] pt-4 font-mono">
          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('bosses');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'bosses'
                ? 'bg-[#111111] text-white border-[#111111] shadow'
                : 'bg-[#fafafa] text-[#555555] border-[#dedede] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <Crown size={15} className={activeTab === 'bosses' ? 'text-amber-400' : 'text-amber-600'} />
            <span>👾 Galaxy & Arc Boss Raids</span>
            <span className="px-1.5 py-0.2 bg-amber-500 text-[#111111] text-[10px] font-bold rounded-full">
              {GALAXY_AND_ARC_BOSSES.length} Bosses
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('worlds');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'worlds'
                ? 'bg-[#111111] text-white border-[#111111] shadow'
                : 'bg-[#fafafa] text-[#555555] border-[#dedede] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <Globe size={15} className={activeTab === 'worlds' ? 'text-emerald-400' : 'text-emerald-600'} />
            <span>🪐 Add Worlds & Universe Engine</span>
            <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
              {worlds.length} Worlds
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('classes90');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'classes90'
                ? 'bg-[#111111] text-white border-[#111111] shadow'
                : 'bg-[#fafafa] text-[#555555] border-[#dedede] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <Layers size={15} className={activeTab === 'classes90' ? 'text-sky-400' : 'text-sky-600'} />
            <span>📜 90 Class & Sub-Class Matrix</span>
            <span className="px-1.5 py-0.2 bg-sky-600 text-white text-[10px] font-bold rounded-full">
              90 Classes
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.play('click');
              setActiveTab('gamelogic');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'gamelogic'
                ? 'bg-[#111111] text-white border-[#111111] shadow'
                : 'bg-[#fafafa] text-[#555555] border-[#dedede] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <Cpu size={15} className={activeTab === 'gamelogic' ? 'text-purple-400' : 'text-purple-600'} />
            <span>⚙️ Game Logic & Combat Mechanics</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ADD WORLDS & UNIVERSE ENGINE                                      */}
      {/* ========================================================================= */}
      {activeTab === 'worlds' && (
        <div className="space-y-6 font-mono">
          {worldFeedback && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{worldFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setWorldFeedback(null)}
                className="text-emerald-800 hover:text-black font-extrabold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Create World Form (5 cols) */}
            <div className="lg:col-span-5 border-2 border-[#111111] bg-white p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#dedede] pb-3">
                <h3 className="text-sm font-black uppercase text-[#111111] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Generate New Universe World</span>
                </h3>
                <p className="text-[10px] text-[#666666] mt-0.5">
                  Configure exoplanet coordinates, environmental biomes, and planetary hazards.
                </p>
              </div>

              <form onSubmit={handleCreateWorld} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#444444] uppercase mb-1">
                    World / Exoplanet Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Chronos-Prime Citadel"
                    value={newWorldName}
                    onChange={(e) => setNewWorldName(e.target.value)}
                    className="w-full bg-[#fafafa] border border-[#dedede] p-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#444444] uppercase mb-1">
                      Target Universe (1-30)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={newWorldUniverse}
                      onChange={(e) => setNewWorldUniverse(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-[#fafafa] border border-[#dedede] p-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#444444] uppercase mb-1">
                      Target Galaxy (1-90)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={newWorldGalaxy}
                      onChange={(e) => setNewWorldGalaxy(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-[#fafafa] border border-[#dedede] p-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#444444] uppercase mb-1">
                      Solar System (1-499)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={499}
                      value={newWorldSystem}
                      onChange={(e) => setNewWorldSystem(parseInt(e.target.value, 10) || 100)}
                      className="w-full bg-[#fafafa] border border-[#dedede] p-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#444444] uppercase mb-1">
                      Orbital Position (1-15)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={newWorldPosition}
                      onChange={(e) => setNewWorldPosition(parseInt(e.target.value, 10) || 4)}
                      className="w-full bg-[#fafafa] border border-[#dedede] p-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#444444] uppercase mb-1">
                    World Biome Classification
                  </label>
                  <select
                    value={newWorldBiome}
                    onChange={(e) => setNewWorldBiome(e.target.value as UniverseWorld['biome'])}
                    className="w-full bg-[#fafafa] border border-[#dedede] p-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="Terrestrial">Terrestrial (Balanced Yields)</option>
                    <option value="Volcanic">Volcanic (+50% Metal Extraction)</option>
                    <option value="Glacial">Glacial (+45% Deuterium Yield)</option>
                    <option value="Precursor Void">Precursor Void (Dark Matter Node)</option>
                    <option value="Cybernetic Matrix">Cybernetic Matrix (+35% Tech Speed)</option>
                    <option value="Ocean Leviathan">Ocean Leviathan (Shield Harmonic)</option>
                    <option value="Dark Matter Nebula">Dark Matter Nebula (Quantum Fog)</option>
                    <option value="Crystalline Bastion">Crystalline Bastion (+60% Crystal)</option>
                    <option value="Singularity Core">Singularity Core (Zero-Point Energy)</option>
                    <option value="Plasma Rift">Plasma Rift (Weapon Volley Power)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#444444] uppercase mb-1 flex justify-between">
                      <span>Hazard Level</span>
                      <span className="text-rose-600 font-extrabold">{newWorldHazard}/10</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={newWorldHazard}
                      onChange={(e) => setNewWorldHazard(parseInt(e.target.value, 10))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#444444] uppercase mb-1 flex justify-between">
                      <span>Resource Yield</span>
                      <span className="text-emerald-600 font-extrabold">{newWorldResMult}x</span>
                    </label>
                    <input
                      type="range"
                      min={0.5}
                      max={5.0}
                      step={0.5}
                      value={newWorldResMult}
                      onChange={(e) => setNewWorldResMult(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#444444] uppercase mb-1">
                    Guard Boss Entity Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Chronos-Prime Void Archon"
                    value={newWorldBoss}
                    onChange={(e) => setNewWorldBoss(e.target.value)}
                    className="w-full bg-[#fafafa] border border-[#dedede] p-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="ruinsToggle"
                    checked={newWorldRuins}
                    onChange={(e) => setNewWorldRuins(e.target.checked)}
                    className="accent-[#111111] cursor-pointer"
                  />
                  <label htmlFor="ruinsToggle" className="text-xs text-[#333333] cursor-pointer font-bold">
                    Embed Precursor Relic Ruins (+Artifact Drops)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  <Plus size={15} className="text-amber-400" />
                  <span>Deploy World to Universe Map</span>
                </button>
              </form>
            </div>

            {/* Right Column: Universe World Directory (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border border-[#dedede] bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold uppercase text-[#444444]">Filter Universe:</span>
                  <select
                    value={selectedUniverseFilter}
                    onChange={(e) => setSelectedUniverseFilter(parseInt(e.target.value, 10))}
                    className="bg-[#fafafa] border border-[#dedede] p-1.5 text-xs font-bold text-[#111111] focus:outline-none"
                  >
                    <option value={0}>All Universes (1-30)</option>
                    {Array.from({ length: 30 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Universe {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-2.5 text-[#777777]" />
                  <input
                    type="text"
                    placeholder="Search worlds, coords..."
                    value={worldSearch}
                    onChange={(e) => setWorldSearch(e.target.value)}
                    className="w-full bg-[#fafafa] border border-[#dedede] pl-9 pr-3 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* World List Grid */}
              <div className="space-y-3">
                {filteredWorlds.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-[#dedede] text-xs text-[#777777]">
                    No worlds found matching filter parameters.
                  </div>
                ) : (
                  filteredWorlds.map((world) => (
                    <div
                      key={world.id}
                      className="border border-[#dedede] bg-white p-4 hover:border-[#111111] transition-all shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#111111] text-amber-300 text-[10px] font-bold">
                            {world.stargateCoordinates}
                          </span>
                          <h4 className="text-sm font-black text-[#111111]">{world.name}</h4>
                          {world.createdByUser && (
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase border border-emerald-300">
                              User Custom
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                          {world.resourceMultiplier}x Resource Multiplier
                        </span>
                      </div>

                      <p className="text-xs text-[#666666]">{world.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#555555] pt-2 border-t border-[#f0f0f0]">
                        <span className="flex items-center gap-1 font-bold text-sky-800">
                          <Globe size={13} />
                          <span>Biome: {world.biome}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-rose-700">
                          <AlertTriangle size={13} />
                          <span>Hazard: {world.hazardLevel}/10</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-purple-800">
                          <Shield size={13} />
                          <span>Guard: {world.guardBossName}</span>
                        </span>
                        {world.hasPrecursorRuins && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-bold text-amber-700">
                              <Sparkles size={13} />
                              <span>Precursor Ruins</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GALAXY BOSS & ARC BOSS RAID ARENA                                  */}
      {/* ========================================================================= */}
      {activeTab === 'bosses' && (
        <div className="space-y-6 font-mono">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Boss Selector List (4 cols) */}
            <div className="lg:col-span-4 border-2 border-[#111111] bg-white p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#dedede]">
                <h3 className="text-xs font-black uppercase text-[#111111] flex items-center gap-1.5">
                  <Crown size={15} className="text-amber-500" />
                  <span>Target Boss Directory</span>
                </h3>

                <div className="flex gap-1 text-[9px] font-bold">
                  <button
                    type="button"
                    onClick={() => setBossFilter('all')}
                    className={`px-2 py-0.5 border cursor-pointer ${
                      bossFilter === 'all' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#555555]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setBossFilter('arc_boss')}
                    className={`px-2 py-0.5 border cursor-pointer ${
                      bossFilter === 'arc_boss' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#555555]'
                    }`}
                  >
                    Arc Boss
                  </button>
                  <button
                    type="button"
                    onClick={() => setBossFilter('galaxy_boss')}
                    className={`px-2 py-0.5 border cursor-pointer ${
                      bossFilter === 'galaxy_boss' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#555555]'
                    }`}
                  >
                    Galaxy
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredBosses.map((boss) => {
                  const isSelected = selectedBoss.id === boss.id;
                  return (
                    <div
                      key={boss.id}
                      onClick={() => {
                        sound.play('click');
                        setSelectedBoss(boss);
                      }}
                      className={`p-3 border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#111111] bg-amber-50/40 shadow-sm'
                          : 'border-[#dedede] bg-white hover:border-[#111111]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 uppercase ${
                            boss.type === 'arc_boss'
                              ? 'bg-amber-500 text-[#111111]'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          {boss.type === 'arc_boss' ? `Arc Boss #${boss.arcNumber}` : `Galaxy ${boss.galaxyId}`}
                        </span>
                        <span className="text-[10px] font-extrabold text-[#777777]">Lvl {boss.level}</span>
                      </div>

                      <h4 className="text-xs font-black text-[#111111] mt-1">{boss.name}</h4>
                      <p className="text-[10px] text-[#666666] truncate">{boss.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Boss Raid Arena & Combat Simulation (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Boss Dossier Header */}
              <div className="border-2 border-[#111111] bg-white p-5 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dedede] pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-amber-500 text-[#111111] text-[10px] font-extrabold uppercase">
                        {selectedBoss.type === 'arc_boss' ? 'MULTIVERSE ARC BOSS' : 'GALAXY SECTOR GUARDIAN'}
                      </span>
                      <span className="text-xs font-bold text-[#666666]">
                        Universe {selectedBoss.universeId} · Galaxy {selectedBoss.galaxyId}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-[#111111]">{selectedBoss.name}</h3>
                    <p className="text-xs text-[#666666] mt-0.5">{selectedBoss.title}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-[#111111]">
                      Armor: {selectedBoss.armor.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-rose-700 font-bold">
                      Attack Power: {selectedBoss.attackPower.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Live Health & Shield Gauges */}
                <div className="space-y-3 bg-[#fafafa] border border-[#dedede] p-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-emerald-800 flex items-center gap-1">
                        <Flame size={14} className="text-emerald-600" />
                        <span>BOSS HEALTH POINTS</span>
                      </span>
                      <span className="text-[#111111]">
                        {currentBossHp.toLocaleString()} / {selectedBoss.maxHealth.toLocaleString()} (
                        {Math.round((currentBossHp / selectedBoss.maxHealth) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#e0e0e0] h-4 border border-[#111111]">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300"
                        style={{ width: `${Math.max(0, (currentBossHp / selectedBoss.maxHealth) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-sky-800 flex items-center gap-1">
                        <Shield size={14} className="text-sky-600" />
                        <span>COSMIC SHIELD BARRIER</span>
                      </span>
                      <span className="text-[#111111]">
                        {currentBossShield.toLocaleString()} / {selectedBoss.maxShield.toLocaleString()} (
                        {Math.round((currentBossShield / selectedBoss.maxShield) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#e0e0e0] h-3 border border-[#111111]">
                      <div
                        className="bg-sky-500 h-full transition-all duration-300"
                        style={{ width: `${Math.max(0, (currentBossShield / selectedBoss.maxShield) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-bold">
                    <div className="p-2 bg-white border border-[#dedede] flex items-center justify-between">
                      <span className="text-[#666666]">Raid Turn Counter:</span>
                      <span className="text-[#111111] font-mono">{bossRageTicks} Ticks</span>
                    </div>
                    <div className="p-2 bg-white border border-[#dedede] flex items-center justify-between">
                      <span className="text-[#666666]">Fleet Integrity:</span>
                      <span
                        className={`font-mono font-extrabold ${
                          fleetIntegrity > 50
                            ? 'text-emerald-700'
                            : fleetIntegrity > 20
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {fleetIntegrity}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Raid Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExecuteRaidTurn}
                    disabled={raidVictory || currentBossHp <= 0}
                    className="flex-1 py-3 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                  >
                    <Swords size={16} />
                    <span>
                      {raidVictory ? 'Raid Victory Achieved!' : 'Execute Fleet Attack Volley'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetRaid}
                    className="px-4 py-3 bg-[#fafafa] border border-[#dedede] hover:border-[#111111] text-[#333333] font-bold text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Reset Boss</span>
                  </button>
                </div>
              </div>

              {/* Combat Log Box */}
              <div className="border border-[#dedede] bg-[#111111] text-emerald-400 p-4 font-mono text-xs space-y-2 h-48 overflow-y-auto shadow-inner">
                <div className="text-[10px] uppercase font-bold text-[#aaaaaa] border-b border-[#333333] pb-1 flex items-center justify-between">
                  <span>Tactical Raid Combat Telemetry Log</span>
                  <span>Active Target: {selectedBoss.name}</span>
                </div>
                {combatLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>

              {/* Boss Abilities & Loot Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Abilities */}
                <div className="border border-[#dedede] bg-white p-4 space-y-2">
                  <h4 className="text-xs font-black uppercase text-[#111111] flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span>Boss Tactical Abilities</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedBoss.abilities.map((ab) => (
                      <div key={ab.id} className="p-2 bg-[#fafafa] border border-[#dedede] space-y-0.5">
                        <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                          <span>{ab.name}</span>
                          <span className="text-rose-600">Power: {ab.power.toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] text-[#666666]">{ab.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precursor Loot Drops */}
                <div className="border border-[#dedede] bg-white p-4 space-y-2">
                  <h4 className="text-xs font-black uppercase text-[#111111] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span>Precursor Victory Loot Rewards</span>
                  </h4>
                  <div className="p-3 bg-emerald-50/50 border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Metal Ore Yield:</span>
                      <span className="text-emerald-800">+{selectedBoss.loot.metal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Crystal Matrix Yield:</span>
                      <span className="text-emerald-800">+{selectedBoss.loot.crystal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Deuterium Fuel Yield:</span>
                      <span className="text-emerald-800">+{selectedBoss.loot.deuterium.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Dark Matter Reserve:</span>
                      <span className="text-purple-800">+{selectedBoss.loot.darkMatter.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Precursor Artifacts:</span>
                      <span className="text-amber-700">+{selectedBoss.loot.precursorArtifacts} Relics</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-300 font-bold text-[10px] text-emerald-900">
                      📜 Schematic: {selectedBoss.loot.schematicDrop}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 90 CLASS & SUB-CLASS TAXONOMY MATRIX                              */}
      {/* ========================================================================= */}
      {activeTab === 'classes90' && (
        <div className="space-y-6 font-mono">
          <div className="border border-[#dedede] bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {categories90.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setSelectedCategoryFilter(cat);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold uppercase transition-all cursor-pointer border ${
                    selectedCategoryFilter === cat
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-[#fafafa] border-[#dedede] text-[#666666] hover:border-[#111111]'
                  }`}
                >
                  {cat.replace(/Category [IVX]+:\s*/, '')}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-[#777777]" />
              <input
                type="text"
                placeholder="Search 90 classes..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="w-full bg-[#fafafa] border border-[#dedede] pl-9 pr-3 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: 90 Class Table Grid (7 cols) */}
            <div className="lg:col-span-7 space-y-2">
              <div className="text-xs font-bold text-[#777777] uppercase tracking-wider flex justify-between px-1">
                <span>Displaying {filtered90Classes.length} of 90 Classes</span>
                <span>Tier 1 - 10 Hierarchy</span>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filtered90Classes.map((cls) => {
                  const isSelected = selectedClassDetail?.classId === cls.classId;
                  return (
                    <div
                      key={cls.classId}
                      onClick={() => {
                        sound.play('click');
                        setSelectedClassDetail(cls);
                      }}
                      className={`p-3 border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-2 border-[#111111] bg-sky-50/50 shadow-sm'
                          : 'border-[#dedede] bg-white hover:border-[#111111]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-[#111111] text-amber-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                          #{cls.classId}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-[#111111]">{cls.typeName}</h4>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-300">
                              {cls.subClass}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#666666] mt-0.5">
                            Weapon: {cls.weaponType} · {cls.subType}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-rose-700 block">
                          Atk: {cls.attack.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-sky-700 block">
                          Shd: {cls.shield.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Class Detail Inspector Card (5 cols) */}
            <div className="lg:col-span-5">
              {selectedClassDetail ? (
                <div className="border-2 border-[#111111] bg-white p-5 space-y-4 shadow-sm sticky top-4">
                  <div className="border-b border-[#dedede] pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 bg-[#111111] text-amber-300 text-[10px] font-bold">
                        CLASS ID #{selectedClassDetail.classId} · TIER {selectedClassDetail.tier}
                      </span>
                      <span className="text-[10px] font-bold text-sky-800">
                        {selectedClassDetail.primaryCategory}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-[#111111]">
                      {selectedClassDetail.typeName}
                    </h3>
                    <p className="text-xs text-[#666666] mt-0.5">{selectedClassDetail.subClass}</p>
                  </div>

                  <p className="text-xs text-[#444444] leading-relaxed">
                    {selectedClassDetail.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-[#fafafa] border border-[#dedede]">
                      <span className="text-[9px] font-bold text-[#777777] uppercase block">Attack Power</span>
                      <span className="font-extrabold text-rose-700">{selectedClassDetail.attack.toLocaleString()}</span>
                    </div>

                    <div className="p-2 bg-[#fafafa] border border-[#dedede]">
                      <span className="text-[9px] font-bold text-[#777777] uppercase block">Armor Hull</span>
                      <span className="font-extrabold text-emerald-800">{selectedClassDetail.defense.toLocaleString()}</span>
                    </div>

                    <div className="p-2 bg-[#fafafa] border border-[#dedede]">
                      <span className="text-[9px] font-bold text-[#777777] uppercase block">Shield Rating</span>
                      <span className="font-extrabold text-sky-700">{selectedClassDetail.shield.toLocaleString()}</span>
                    </div>

                    <div className="p-2 bg-[#fafafa] border border-[#dedede]">
                      <span className="text-[9px] font-bold text-[#777777] uppercase block">Sub-Light Speed</span>
                      <span className="font-extrabold text-[#111111]">{selectedClassDetail.speed.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Special Ability */}
                  <div className="p-3 bg-amber-50/60 border border-amber-300 space-y-1">
                    <div className="flex items-center justify-between text-xs font-black text-amber-950">
                      <span>⚡ Ability: {selectedClassDetail.specialAbility.name}</span>
                      <span className="text-[10px] font-bold text-amber-800">{selectedClassDetail.specialAbility.procChance}</span>
                    </div>
                    <p className="text-[11px] text-amber-900">{selectedClassDetail.specialAbility.effect}</p>
                  </div>

                  {/* Game Logic Mechanics */}
                  <div className="p-3 bg-purple-50/50 border border-purple-200 space-y-1">
                    <span className="text-[10px] font-bold text-purple-900 uppercase block">
                      ⚙️ Core Game Logic & Combat Modifier
                    </span>
                    <p className="text-xs text-purple-950">{selectedClassDetail.gameLogicMechanics}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white border border-[#dedede] text-xs text-[#777777]">
                  Select a class from the matrix to inspect stats and game logic.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GAME LOGIC & COMBAT MECHANICS REFERENCE                           */}
      {/* ========================================================================= */}
      {activeTab === 'gamelogic' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="border-2 border-[#111111] bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black uppercase text-[#111111] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Multiverse Expansion Game Mechanics & Engine Logic</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#fafafa] border border-[#dedede] space-y-2">
                <h4 className="font-extrabold text-[#111111] uppercase">1. World Hazard & Resource Multiplier Engine</h4>
                <p className="text-[#666666] leading-relaxed">
                  Every world generated in Universes 1-30 possesses a base Resource Multiplier (0.5x to 5.0x) paired with Environmental Hazard Levels (1 to 10). High hazard worlds generate greater mineral yields but require reinforced shield defense grids.
                </p>
              </div>

              <div className="p-4 bg-[#fafafa] border border-[#dedede] space-y-2">
                <h4 className="font-extrabold text-[#111111] uppercase">2. Galaxy & Multiverse Arc Boss Phase Mechanics</h4>
                <p className="text-[#666666] leading-relaxed">
                  Arc Bosses feature multi-phase combat triggers at 100%, 50%, and 20% health thresholds. Each phase shift unlocks devastating cosmic abilities (such as Chrono-Zero Collapse) and boosts attack multipliers by up to 2.5x.
                </p>
              </div>

              <div className="p-4 bg-[#fafafa] border border-[#dedede] space-y-2">
                <h4 className="font-extrabold text-[#111111] uppercase">3. 90-Class Combat Weakness Triangle</h4>
                <p className="text-[#666666] leading-relaxed">
                  Unit classes follow a strict rock-paper-scissors counter matrix. Light Interceptors counter Covert Ops; Heavy Corvettes counter Interceptors; Strike Destroyers crack Capital Dreadnoughts; Precursor Flagships deal 2x bonus raid damage to Arc Bosses.
                </p>
              </div>

              <div className="p-4 bg-[#fafafa] border border-[#dedede] space-y-2">
                <h4 className="font-extrabold text-[#111111] uppercase">4. Precursor Relics & Dark Matter Drops</h4>
                <p className="text-[#666666] leading-relaxed">
                  Defeating Galaxy Guardians and Multiverse Arc Bosses awards millions of resources, thousands of Dark Matter, and rare Precursor Artifact Relics used to unlock Class-IX and Class-X super-capital schematics.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

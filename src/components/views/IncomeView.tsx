import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Building,
  Globe,
  Users,
  Pickaxe,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Droplet,
  Flame,
  Wheat,
  Activity,
  Sliders,
  BatteryCharging,
  DollarSign,
  Crown,
  Scale,
  RefreshCw,
  PlusCircle,
  Clock,
  Compass,
  Database,
  ShieldCheck,
  ChevronRight,
  UserPlus,
  Atom,
} from 'lucide-react';
import {
  PlayerProfile,
  PlayerResources,
  PlanetColony,
  DefconLevel,
} from '../../types';
import { RACES } from '../../gameData';
import { sound } from '../../sound';
import {
  getEmpireColonialSummary,
  getColonyMaintenanceDetails,
  calculateColonyMaintenance,
} from '../../utils/colonyCalculations';
import { PlanetDetailModal } from '../modals/PlanetDetailModal';

interface IncomeViewProps {
  profile: PlayerProfile;
  resources: PlayerResources;
  naturalIncome: number;
  planets?: PlanetColony[];
  onUpdateResources?: (updates: Partial<PlayerResources>) => void;
  onUpdatePlanets?: React.Dispatch<React.SetStateAction<PlanetColony[]>>;
  onNavigate?: (route: string) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  profile,
  resources,
  naturalIncome,
  planets = [],
  onUpdateResources,
  onUpdatePlanets,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'all' | 'mines' | 'food_water' | 'conscripts' | 'energy' | 'fiscal_ledger' | 'colonies'
  >('all');

  const [notification, setNotification] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);
  const [selectedModalPlanet, setSelectedModalPlanet] = useState<PlanetColony | null>(null);

  // Overclocking states for mines (100 = 100% normal, 125 = 125% overclock, 75 = eco)
  const [mineOverclock, setMineOverclock] = useState<{
    metal: number;
    crystal: number;
    deuterium: number;
    naquadah: number;
  }>({
    metal: 100,
    crystal: 100,
    deuterium: 100,
    naquadah: 100,
  });

  // Conscription policy
  const [conscriptionPolicy, setConscriptionPolicy] = useState<'volunteer' | 'selective' | 'mass_draft'>('volunteer');

  const triggerNotification = (text: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const currentRace = RACES.find((r) => r.id === profile.race);

  // =========================================================
  // FISCAL & NAQUADAH CALCULATIONS
  // =========================================================
  const untrainedYield = (resources?.untrainedUnits ?? 0) * 20;
  const workforceYield = ((resources?.miners ?? 0) + (resources?.lifers ?? 0)) * 80;

  const colonialSummary = getEmpireColonialSummary(planets);
  const grossColonyYield = Number(colonialSummary?.totalGrossIncome || 0);
  const colonyMaintenanceTotal = Number(colonialSummary?.totalMaintenanceCost || 0);
  const netColonyYield = Number(colonialSummary?.netColonialIncome || 0);

  const grossBaseSubtotal = untrainedYield + workforceYield + grossColonyYield;
  const netBaseSubtotal = Math.max(0, grossBaseSubtotal - colonyMaintenanceTotal);

  const raceMultiplier = currentRace?.incomeModifier || 1.0;
  const defconMultipliers: Record<number, number> = {
    0: 1.0,
    1: 0.9,
    2: 0.8,
    3: 0.6,
    4: 0.3,
  };
  const defconMultiplier = defconMultipliers[profile.defconLevel] ?? 1.0;

  // =========================================================
  // MINING EXTRACTION METRICS (METAL, CRYSTAL, DEUTERIUM)
  // =========================================================
  // Aggregate mine levels across all colonies & homeworld
  const homeworld = planets.find((p) => p.isHomeworld) || planets[0];

  const totalMetalMineLevels = planets.reduce((s, p) => s + (p.mines?.metalMine || 20), 0);
  const totalCrystalMineLevels = planets.reduce((s, p) => s + (p.mines?.crystalMine || 16), 0);
  const totalDeutMineLevels = planets.reduce((s, p) => s + (p.mines?.deuteriumSynthesizer || 12), 0);
  const totalSolarLevels = planets.reduce((s, p) => s + (p.mines?.solarPlant || 18), 0);
  const totalFusionLevels = planets.reduce((s, p) => s + (p.mines?.fusionReactor || 8), 0);
  const totalNaquadahTapLevels = planets.reduce((s, p) => s + (p.mines?.naquadahCoreTap || 10), 0);

  // Base production per turn (30-min cycle)
  const avgMetalLevel = Math.max(1, Math.round(totalMetalMineLevels / Math.max(1, planets.length)));
  const avgCrystalLevel = Math.max(1, Math.round(totalCrystalMineLevels / Math.max(1, planets.length)));
  const avgDeutLevel = Math.max(1, Math.round(totalDeutMineLevels / Math.max(1, planets.length)));

  const baseMetalPerPlanet = Math.round(30 * avgMetalLevel * Math.pow(1.1, avgMetalLevel)) + 30;
  const baseCrystalPerPlanet = Math.round(20 * avgCrystalLevel * Math.pow(1.1, avgCrystalLevel)) + 15;
  const baseDeutPerPlanet = Math.round(10 * avgDeutLevel * Math.pow(1.1, avgDeutLevel) * 1.36);

  // Energy consumption per turn
  const energyNeededMetal = Math.round(10 * avgMetalLevel * Math.pow(1.1, avgMetalLevel)) * planets.length;
  const energyNeededCrystal = Math.round(10 * avgCrystalLevel * Math.pow(1.1, avgCrystalLevel)) * planets.length;
  const energyNeededDeut = Math.round(20 * avgDeutLevel * Math.pow(1.1, avgDeutLevel)) * planets.length;
  const totalEnergyNeeded = Math.max(1, energyNeededMetal + energyNeededCrystal + energyNeededDeut);

  // Energy generation
  const energyProduced = Math.round(20 * totalSolarLevels * 1.1) + Math.round(35 * totalFusionLevels * 1.15) + (totalNaquadahTapLevels * 50) + 150;
  const energyRatio = Math.min(1.0, Math.max(0.2, energyProduced / totalEnergyNeeded));
  const energyNet = energyProduced - totalEnergyNeeded;

  // Final adjusted yields with overclocking multipliers
  const metalTurnYield = Math.round(baseMetalPerPlanet * planets.length * energyRatio * (mineOverclock.metal / 100));
  const crystalTurnYield = Math.round(baseCrystalPerPlanet * planets.length * energyRatio * (mineOverclock.crystal / 100));
  const deutTurnYield = Math.round(baseDeutPerPlanet * planets.length * energyRatio * (mineOverclock.deuterium / 100));

  // Hourly rates (2 turns per hour)
  const metalPerHour = metalTurnYield * 2;
  const crystalPerHour = crystalTurnYield * 2;
  const deutPerHour = deutTurnYield * 2;

  // =========================================================
  // FOOD & RATIONS METRICS
  // =========================================================
  const totalHydroponics = planets.reduce((s, p) => s + (p.lifeSupportFacilities?.hydroponicsDomes || 4), 0);
  const totalBioFarms = planets.reduce((s, p) => s + (p.lifeSupportFacilities?.bioFarms || 3), 0);
  const totalGeneticLabs = planets.reduce((s, p) => s + (p.lifeSupportFacilities?.geneticCropLabs || 2), 0);
  const totalPopulation = resources.totalPopulation || planets.reduce((s, p) => s + (p.population?.total || 2500000), 0);

  const geneticMultiplier = 1 + totalGeneticLabs * 0.15;
  const foodTurnProduced = Math.round((totalHydroponics * 32 + totalBioFarms * 48 + 50) * Math.max(0.3, energyRatio) * geneticMultiplier);

  // Rationing policy on homeworld / aggregate
  const currentRationing = homeworld?.population?.rationingLevel || 'abundant';
  const rationingMult = currentRationing === 'abundant' ? 1.2 : currentRationing === 'standard' ? 1.0 : currentRationing === 'strict_rationing' ? 0.65 : 0.35;
  const foodTurnConsumed = Math.round((totalPopulation * 0.000008 + 15 * planets.length) * rationingMult);
  const foodNetTurn = foodTurnProduced - foodTurnConsumed;

  // =========================================================
  // WATER & AQUIFER METRICS
  // =========================================================
  const totalAquiferPumps = planets.reduce((s, p) => s + (p.lifeSupportFacilities?.deepAquiferPumps || 3), 0);
  const totalMoistureCondensers = planets.reduce((s, p) => s + (p.lifeSupportFacilities?.moistureCondensers || 2), 0);
  const totalDesalination = planets.reduce((s, p) => s + (p.lifeSupportFacilities?.desalinationPlants || 2), 0);

  const waterTurnProduced = Math.round((totalAquiferPumps * 38 + totalMoistureCondensers * 24 + totalDesalination * 42 + 60) * Math.max(0.3, energyRatio));
  const waterTurnConsumed = Math.round(totalPopulation * 0.000009 + 20 * planets.length);
  const waterNetTurn = waterTurnProduced - waterTurnConsumed;

  // =========================================================
  // RECRUITS & CONSCRIPTION METRICS
  // =========================================================
  let conscriptionMult = 1.0;
  if (conscriptionPolicy === 'selective') conscriptionMult = 1.35;
  else if (conscriptionPolicy === 'mass_draft') conscriptionMult = 2.0;

  const recruitsPerTurn = Math.round((resources.unitProduction || 250) * conscriptionMult);
  const recruitsPerHour = recruitsPerTurn * 2;

  // =========================================================
  // INTERACTIVE UPGRADE / OVERCLOCK HANDLERS
  // =========================================================
  const handleUpgradeMine = (
    mineType: 'metalMine' | 'crystalMine' | 'deuteriumSynthesizer' | 'solarPlant' | 'fusionReactor' | 'naquadahCoreTap',
    metalCost: number,
    crystalCost: number,
    deutCost: number,
    naqCost: number
  ) => {
    sound.play('click');
    if ((resources.metal || 0) < metalCost) {
      sound.play('warning');
      triggerNotification(`Insufficient Metal! Requires ${metalCost.toLocaleString()} Metal.`, 'warning');
      return;
    }
    if ((resources.crystal || 0) < crystalCost) {
      sound.play('warning');
      triggerNotification(`Insufficient Crystal! Requires ${crystalCost.toLocaleString()} Crystal.`, 'warning');
      return;
    }
    if ((resources.deuterium || 0) < deutCost) {
      sound.play('warning');
      triggerNotification(`Insufficient Deuterium! Requires ${deutCost.toLocaleString()} Deuterium.`, 'warning');
      return;
    }
    if (resources.naquadah < naqCost) {
      sound.play('warning');
      triggerNotification(`Insufficient Naquadah! Requires ${naqCost.toLocaleString()} Naquadah.`, 'warning');
      return;
    }

    if (onUpdateResources) {
      onUpdateResources({
        metal: (resources.metal || 0) - metalCost,
        crystal: (resources.crystal || 0) - crystalCost,
        deuterium: (resources.deuterium || 0) - deutCost,
        naquadah: resources.naquadah - naqCost,
      });
    }

    if (onUpdatePlanets && planets.length > 0) {
      onUpdatePlanets((prev) =>
        prev.map((p, idx) => {
          if (idx === 0) {
            const currentMines = p.mines || {
              metalMine: 24,
              crystalMine: 20,
              deuteriumSynthesizer: 18,
              solarPlant: 22,
              fusionReactor: 12,
              naquadahCoreTap: 16,
            };
            return {
              ...p,
              mines: {
                ...currentMines,
                [mineType]: (currentMines[mineType] || 1) + 1,
              },
            };
          }
          return p;
        })
      );
    }

    sound.play('confirm');
    triggerNotification(`Facility Expanded! Upgraded ${mineType} on primary homeworld complex.`);
  };

  const handleUpgradeLifeSupport = (
    facType: 'hydroponicsDomes' | 'bioFarms' | 'deepAquiferPumps' | 'desalinationPlants',
    metalCost: number,
    crystalCost: number
  ) => {
    sound.play('click');
    if ((resources.metal || 0) < metalCost || (resources.crystal || 0) < crystalCost) {
      sound.play('warning');
      triggerNotification(`Insufficient resources! Requires ${metalCost.toLocaleString()} Metal & ${crystalCost.toLocaleString()} Crystal.`, 'warning');
      return;
    }

    if (onUpdateResources) {
      onUpdateResources({
        metal: (resources.metal || 0) - metalCost,
        crystal: (resources.crystal || 0) - crystalCost,
      });
    }

    if (onUpdatePlanets && planets.length > 0) {
      onUpdatePlanets((prev) =>
        prev.map((p, idx) => {
          if (idx === 0) {
            const currentLf = p.lifeSupportFacilities || {
              hydroponicsDomes: 4,
              bioFarms: 3,
              geneticCropLabs: 2,
              deepAquiferPumps: 3,
              moistureCondensers: 2,
              desalinationPlants: 2,
              subsurfaceCisterns: 2,
              atmosphereScrubbers: 2,
            };
            return {
              ...p,
              lifeSupportFacilities: {
                ...currentLf,
                [facType]: (currentLf[facType] || 1) + 1,
              },
            };
          }
          return p;
        })
      );
    }

    sound.play('confirm');
    triggerNotification(`Life Support Expanded! Upgraded ${facType} on primary agricultural sector.`);
  };

  const handleChangeRationing = (newLevel: 'abundant' | 'standard' | 'strict_rationing' | 'famine_starvation') => {
    sound.play('click');
    if (onUpdatePlanets) {
      onUpdatePlanets((prev) =>
        prev.map((p) => ({
          ...p,
          population: p.population
            ? { ...p.population, rationingLevel: newLevel }
            : {
                total: 2500000,
                growthRatePerHour: 15000,
                housingCapacity: 5000000,
                happiness: 85,
                unrest: 10,
                livingStandard: 'utopian',
                rationingLevel: newLevel,
                strata: {
                  farmers: 500000,
                  hydrologists: 400000,
                  miners: 600000,
                  industrialWorkers: 500000,
                  scientists: 200000,
                  administrators: 100000,
                  militaryRecruits: 200000,
                },
              },
        }))
      );
    }
    sound.play('trade');
    triggerNotification(`Imperial Rationing Decree updated to [${newLevel.toUpperCase().replace('_', ' ')}] across all worlds.`);
  };

  const handleInstantConscriptionDraft = (amount: number) => {
    sound.play('click');
    const costNaq = amount * 150;
    if (resources.naquadah < costNaq) {
      sound.play('warning');
      triggerNotification(`Requires ${costNaq.toLocaleString()} Naquadah in conscription enlistment bounties.`, 'warning');
      return;
    }

    if (onUpdateResources) {
      onUpdateResources({
        naquadah: resources.naquadah - costNaq,
        untrainedUnits: resources.untrainedUnits + amount,
      });
    }

    sound.play('confirm');
    triggerNotification(`🎖️ Rapid Mobilization! Drafted +${amount.toLocaleString()} Conscript Recruits into the reserve pool!`);
  };

  return (
    <div id="income-view" className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">
              <Pickaxe className="w-4 h-4 text-amber-500 animate-pulse" />
              EMPIRE RESOURCE INCOME & MINES COMMAND
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Resource Production, Mining & Life Support Telemetry
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Real-time fiscal and industrial ledger tracking <strong>Metal Ore extraction</strong>, <strong>Crystal Silicon quarries</strong>, <strong>Deuterium synthesis</strong>, <strong>Food & Caloric rations</strong>, <strong>Deep Aquifer pumps</strong>, <strong>Conscript drafts</strong>, and the planetary <strong>Energy Power Grid</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('planet-list')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg active:scale-95"
              >
                <Globe size={14} className="text-cyan-400" />
                <span>Colonial Sector →</span>
              </button>
            )}
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('resources')}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95"
              >
                <Database size={14} />
                <span>Storage Vaults →</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg ${
              notification.type === 'warning'
                ? 'bg-amber-950/90 border border-amber-500/60 text-amber-200'
                : 'bg-emerald-950/90 border border-emerald-500/60 text-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.text}</span>
          </div>
        )}
      </div>

      {/* QUICK SUMMARY TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Metal */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Pickaxe className="w-3 h-3 text-slate-300" /> Metal Ore
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">+{metalPerHour.toLocaleString()}/h</span>
          </div>
          <div className="text-lg font-mono font-black text-white">{(resources.metal || 0).toLocaleString()}</div>
          <span className="text-[10px] text-slate-500 block font-mono">+{metalTurnYield.toLocaleString()} / turn</span>
        </div>

        {/* Crystal */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Crystal Silicon
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">+{crystalPerHour.toLocaleString()}/h</span>
          </div>
          <div className="text-lg font-mono font-black text-cyan-300">{(resources.crystal || 0).toLocaleString()}</div>
          <span className="text-[10px] text-slate-500 block font-mono">+{crystalTurnYield.toLocaleString()} / turn</span>
        </div>

        {/* Deuterium */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-blue-400" /> Deuterium
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">+{deutPerHour.toLocaleString()}/h</span>
          </div>
          <div className="text-lg font-mono font-black text-blue-300">{(resources.deuterium || 0).toLocaleString()}</div>
          <span className="text-[10px] text-slate-500 block font-mono">+{deutTurnYield.toLocaleString()} / turn</span>
        </div>

        {/* Food */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Wheat className="w-3 h-3 text-emerald-400" /> Food Rations
            </span>
            <span className={`text-[10px] font-mono font-bold ${foodNetTurn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {foodNetTurn >= 0 ? `+${(foodNetTurn * 2).toLocaleString()}/h` : `${(foodNetTurn * 2).toLocaleString()}/h`}
            </span>
          </div>
          <div className="text-lg font-mono font-black text-emerald-300">{(resources.food || 25000).toLocaleString()}</div>
          <span className="text-[10px] text-slate-500 block font-mono">Net: {foodNetTurn >= 0 ? `+${foodNetTurn}` : foodNetTurn} / turn</span>
        </div>

        {/* Water */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Droplet className="w-3 h-3 text-sky-400" /> Water Aquifer
            </span>
            <span className={`text-[10px] font-mono font-bold ${waterNetTurn >= 0 ? 'text-sky-400' : 'text-red-400'}`}>
              {waterNetTurn >= 0 ? `+${(waterNetTurn * 2).toLocaleString()}/h` : `${(waterNetTurn * 2).toLocaleString()}/h`}
            </span>
          </div>
          <div className="text-lg font-mono font-black text-sky-300">{(resources.water || 30000).toLocaleString()}</div>
          <span className="text-[10px] text-slate-500 block font-mono">Net: {waterNetTurn >= 0 ? `+${waterNetTurn}` : waterNetTurn} / turn</span>
        </div>

        {/* Conscripts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-purple-400" /> Conscripts
            </span>
            <span className="text-[10px] text-purple-400 font-mono font-bold">+{recruitsPerHour.toLocaleString()}/h</span>
          </div>
          <div className="text-lg font-mono font-black text-purple-300">{(resources.untrainedUnits || 0).toLocaleString()}</div>
          <span className="text-[10px] text-slate-500 block font-mono">+{recruitsPerTurn} / turn</span>
        </div>

        {/* Energy Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Energy Grid
            </span>
            <span className={`text-[10px] font-mono font-bold ${energyNet >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {energyNet >= 0 ? `+${energyNet} MW` : `${energyNet} MW`}
            </span>
          </div>
          <div className="text-lg font-mono font-black text-amber-300">{Math.round(energyRatio * 100)}% Load</div>
          <span className="text-[10px] text-slate-500 block font-mono">{energyProduced} / {totalEnergyNeeded} MW</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('all');
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          ALL RESOURCES OVERVIEW
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('mines');
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'mines'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Pickaxe className="w-4 h-4 text-slate-300" />
          MINES (METAL, CRYSTAL, DEUTERIUM)
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('food_water');
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'food_water'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Wheat className="w-4 h-4 text-emerald-400" />
          FOOD RATIONS & WATER AQUIFERS
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('conscripts');
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'conscripts'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-purple-400" />
          CONSCRIPT RECRUITS & DRAFT
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('energy');
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'energy'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          ENERGY POWER GRID
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('fiscal_ledger');
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'fiscal_ledger'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          FISCAL LEDGER & UPKEEP
        </button>

        <button
          onClick={() => {
            sound.play('click');
            setActiveTab('colonies');
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'colonies'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-400" />
          PLANETARY MINING LEDGER ({planets.length})
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: ALL RESOURCES COMPREHENSIVE OVERVIEW                   */}
      {/* ============================================================= */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Main Net Yield Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold block mb-1">
                Net Naquadah Natural Yield
              </span>
              <div className="text-3xl font-mono font-black text-white">
                +{naturalIncome.toLocaleString()} NQ
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Aggregated per 30-min turn cycle: Citizen taxes + Miner workforce + Colonial tributes - Maintenance & DEFCON deductions.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold block mb-1">
                Heavy Industrial Mineral Yield
              </span>
              <div className="text-3xl font-mono font-black text-cyan-300">
                +{(metalTurnYield + crystalTurnYield + deutTurnYield).toLocaleString()} Units
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Combined output across Metal Ore, Crystal Silicon, and Deuterium Synthesizers at {Math.round(energyRatio * 100)}% Grid Efficiency.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold block mb-1">
                Life Support Caloric & Hydro Balance
              </span>
              <div className="text-3xl font-mono font-black text-emerald-300">
                {foodNetTurn >= 0 ? `+${foodNetTurn.toLocaleString()}` : foodNetTurn.toLocaleString()} Food • {waterNetTurn >= 0 ? `+${waterNetTurn.toLocaleString()}` : waterNetTurn.toLocaleString()} H₂O
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Civilian population of {totalPopulation.toLocaleString()} consuming under [{currentRationing.toUpperCase().replace('_', ' ')}] policy.
              </p>
            </div>
          </div>

          {/* Master Production Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Imperial Resource Balance & Production Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete breakdown of yields, energy grid requirements, stockpiles, and generation sources.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Turn Period: 30 Minutes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Resource Asset</th>
                    <th className="py-3 px-3">Current Stockpile</th>
                    <th className="py-3 px-3">Turn Yield</th>
                    <th className="py-3 px-3">Hourly Rate</th>
                    <th className="py-3 px-3">Primary Extraction Facilities</th>
                    <th className="py-3 px-3">Energy Cost</th>
                    <th className="py-3 px-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {/* Metal */}
                  <tr className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                      <Pickaxe className="w-4 h-4 text-slate-300" /> Metal Ore
                    </td>
                    <td className="py-3 px-3 text-slate-200">{(resources.metal || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">+{metalTurnYield.toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">+{metalPerHour.toLocaleString()}/h</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {totalMetalMineLevels} Total Mine Lvls ({planets.length} Worlds)
                    </td>
                    <td className="py-3 px-3 text-amber-400">-{energyNeededMetal} MW</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => setActiveTab('mines')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700"
                      >
                        Tune Mines →
                      </button>
                    </td>
                  </tr>

                  {/* Crystal */}
                  <tr className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-cyan-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> Crystal Silicon
                    </td>
                    <td className="py-3 px-3 text-slate-200">{(resources.crystal || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">+{crystalTurnYield.toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">+{crystalPerHour.toLocaleString()}/h</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {totalCrystalMineLevels} Total Quarry Lvls
                    </td>
                    <td className="py-3 px-3 text-amber-400">-{energyNeededCrystal} MW</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => setActiveTab('mines')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700"
                      >
                        Tune Quarries →
                      </button>
                    </td>
                  </tr>

                  {/* Deuterium */}
                  <tr className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-blue-300 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-blue-400" /> Deuterium Synthetics
                    </td>
                    <td className="py-3 px-3 text-slate-200">{(resources.deuterium || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">+{deutTurnYield.toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">+{deutPerHour.toLocaleString()}/h</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {totalDeutMineLevels} Total Centrifuge Lvls
                    </td>
                    <td className="py-3 px-3 text-amber-400">-{energyNeededDeut} MW</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => setActiveTab('mines')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700"
                      >
                        Synthesizers →
                      </button>
                    </td>
                  </tr>

                  {/* Food */}
                  <tr className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-emerald-300 flex items-center gap-2">
                      <Wheat className="w-4 h-4 text-emerald-400" /> Food & Caloric Rations
                    </td>
                    <td className="py-3 px-3 text-slate-200">{(resources.food || 25000).toLocaleString()}</td>
                    <td className={`py-3 px-3 font-bold ${foodNetTurn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {foodNetTurn >= 0 ? `+${foodNetTurn.toLocaleString()}` : foodNetTurn.toLocaleString()}
                    </td>
                    <td className={`py-3 px-3 font-bold ${foodNetTurn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {foodNetTurn >= 0 ? `+${(foodNetTurn * 2).toLocaleString()}/h` : `${(foodNetTurn * 2).toLocaleString()}/h`}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {totalHydroponics} Domes • {totalBioFarms} Bio-Farms
                    </td>
                    <td className="py-3 px-3 text-slate-400">Grid Dependent</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => setActiveTab('food_water')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700"
                      >
                        Rationing →
                      </button>
                    </td>
                  </tr>

                  {/* Water */}
                  <tr className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-sky-300 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-sky-400" /> Deep Aquifers & Hydration
                    </td>
                    <td className="py-3 px-3 text-slate-200">{(resources.water || 30000).toLocaleString()}</td>
                    <td className={`py-3 px-3 font-bold ${waterNetTurn >= 0 ? 'text-sky-400' : 'text-red-400'}`}>
                      {waterNetTurn >= 0 ? `+${waterNetTurn.toLocaleString()}` : waterNetTurn.toLocaleString()}
                    </td>
                    <td className={`py-3 px-3 font-bold ${waterNetTurn >= 0 ? 'text-sky-400' : 'text-red-400'}`}>
                      {waterNetTurn >= 0 ? `+${(waterNetTurn * 2).toLocaleString()}/h` : `${(waterNetTurn * 2).toLocaleString()}/h`}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {totalAquiferPumps} Aquifer Pumps • {totalDesalination} Desal Plants
                    </td>
                    <td className="py-3 px-3 text-slate-400">Grid Dependent</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => setActiveTab('food_water')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700"
                      >
                        Aquifers →
                      </button>
                    </td>
                  </tr>

                  {/* Conscripts */}
                  <tr className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-purple-300 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" /> Conscript Recruits
                    </td>
                    <td className="py-3 px-3 text-slate-200">{(resources.untrainedUnits || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-purple-400 font-bold">+{recruitsPerTurn}</td>
                    <td className="py-3 px-3 text-purple-400 font-bold">+{recruitsPerHour.toLocaleString()}/h</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      Military Training Academies ({conscriptionPolicy.toUpperCase()})
                    </td>
                    <td className="py-3 px-3 text-slate-400">None</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => setActiveTab('conscripts')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700"
                      >
                        Draft Quotas →
                      </button>
                    </td>
                  </tr>

                  {/* Naquadah */}
                  <tr className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-amber-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-400" /> Liquid Naquadah
                    </td>
                    <td className="py-3 px-3 text-slate-200">{(resources.naquadah || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">+{naturalIncome.toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">+{(naturalIncome * 2).toLocaleString()}/h</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      Workforce Taxes & Colonial Tributes
                    </td>
                    <td className="py-3 px-3 text-slate-400">Maintenance: {colonyMaintenanceTotal.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => setActiveTab('fiscal_ledger')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700"
                      >
                        Ledger →
                      </button>
                    </td>
                  </tr>

                  {/* Energy */}
                  <tr className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-yellow-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" /> Grid Megawatts
                    </td>
                    <td className="py-3 px-3 text-slate-200">{energyProduced} MW Supply</td>
                    <td className={`py-3 px-3 font-bold ${energyNet >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                      {energyNet >= 0 ? `+${energyNet} MW Net` : `${energyNet} MW Deficit`}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{Math.round(energyRatio * 100)}% Grid Load</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">
                      {totalSolarLevels} Solar • {totalFusionLevels} Fusion • {totalNaquadahTapLevels} Core Taps
                    </td>
                    <td className="py-3 px-3 text-slate-400">Total Drain: {totalEnergyNeeded} MW</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => setActiveTab('energy')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700"
                      >
                        Power Grid →
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: MINES (METAL, CRYSTAL, DEUTERIUM)                      */}
      {/* ============================================================= */}
      {activeTab === 'mines' && (
        <div className="space-y-6">
          {/* Overclocking Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Mining Sector Overclock & Power Regulation Sliders
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Regulate extraction power allocation from 50% (Eco-Conserve) to 125% (High-Yield Induction Overclock).
                </p>
              </div>

              <button
                onClick={() => {
                  sound.play('click');
                  setMineOverclock({ metal: 100, crystal: 100, deuterium: 100, naquadah: 100 });
                  triggerNotification('All mine overclock allocations reset to 100% nominal balance.');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                Reset 100%
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Metal Overclock */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">Metal Ore Overclock</span>
                  <span className="text-amber-400 font-mono">{mineOverclock.metal}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="125"
                  step="5"
                  value={mineOverclock.metal}
                  onChange={(e) => setMineOverclock((prev) => ({ ...prev, metal: parseInt(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50% (Eco)</span>
                  <span>100% (Standard)</span>
                  <span>125% (Overclock)</span>
                </div>
              </div>

              {/* Crystal Overclock */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-cyan-300">Crystal Silicon Overclock</span>
                  <span className="text-cyan-400 font-mono">{mineOverclock.crystal}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="125"
                  step="5"
                  value={mineOverclock.crystal}
                  onChange={(e) => setMineOverclock((prev) => ({ ...prev, crystal: parseInt(e.target.value) }))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50% (Eco)</span>
                  <span>100% (Standard)</span>
                  <span>125% (Overclock)</span>
                </div>
              </div>

              {/* Deuterium Overclock */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-blue-300">Deuterium Centrifuge Overclock</span>
                  <span className="text-blue-400 font-mono">{mineOverclock.deuterium}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="125"
                  step="5"
                  value={mineOverclock.deuterium}
                  onChange={(e) => setMineOverclock((prev) => ({ ...prev, deuterium: parseInt(e.target.value) }))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50% (Eco)</span>
                  <span>100% (Standard)</span>
                  <span>125% (Overclock)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Dedicated Mine Cards with Direct Upgrades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* METAL ORE MINES */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
                      <Pickaxe className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Metal Ore Extractive Complex</h4>
                      <span className="text-[11px] text-slate-400 font-mono">Level {homeworld?.mines?.metalMine || 24} (Homeworld)</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+{metalPerHour.toLocaleString()}/h</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Turn Yield:</span>
                    <strong className="text-white font-mono">+{metalTurnYield.toLocaleString()} Ore / turn</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Power Grid Demand:</span>
                    <strong className="text-amber-400 font-mono">-{energyNeededMetal} MW</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Empire Levels:</span>
                    <strong className="text-slate-200 font-mono">{totalMetalMineLevels} Levels across {planets.length} worlds</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Formula:</span>
                    <span className="text-slate-500 font-mono text-[10px]">30 × Lv × 1.1^Lv + 30</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                  <span className="text-slate-500 block font-bold uppercase tracking-wider text-[9px]">Upgrade Requisite</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
                    <span>Metal: 15,000</span>
                    <span>Crystal: 6,000</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleUpgradeMine('metalMine', 15000, 6000, 0, 0)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/40 active:scale-95"
              >
                <PlusCircle size={14} />
                Upgrade Metal Mine to Lv {(homeworld?.mines?.metalMine || 24) + 1}
              </button>
            </div>

            {/* CRYSTAL SILICON MINES */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-cyan-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Crystal Silicon Quarry</h4>
                      <span className="text-[11px] text-cyan-400 font-mono">Level {homeworld?.mines?.crystalMine || 20} (Homeworld)</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+{crystalPerHour.toLocaleString()}/h</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Turn Yield:</span>
                    <strong className="text-cyan-300 font-mono">+{crystalTurnYield.toLocaleString()} Silicon / turn</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Power Grid Demand:</span>
                    <strong className="text-amber-400 font-mono">-{energyNeededCrystal} MW</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Empire Levels:</span>
                    <strong className="text-slate-200 font-mono">{totalCrystalMineLevels} Levels across {planets.length} worlds</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Formula:</span>
                    <span className="text-slate-500 font-mono text-[10px]">20 × Lv × 1.1^Lv + 15</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                  <span className="text-slate-500 block font-bold uppercase tracking-wider text-[9px]">Upgrade Requisite</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
                    <span>Metal: 20,000</span>
                    <span>Crystal: 12,000</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleUpgradeMine('crystalMine', 20000, 12000, 0, 0)}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/40 active:scale-95"
              >
                <PlusCircle size={14} />
                Upgrade Crystal Quarry to Lv {(homeworld?.mines?.crystalMine || 20) + 1}
              </button>
            </div>

            {/* DEUTERIUM SYNTHESIZERS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-blue-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Deuterium Centrifuge Complex</h4>
                      <span className="text-[11px] text-blue-400 font-mono">Level {homeworld?.mines?.deuteriumSynthesizer || 18} (Homeworld)</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+{deutPerHour.toLocaleString()}/h</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Turn Yield:</span>
                    <strong className="text-blue-300 font-mono">+{deutTurnYield.toLocaleString()} Heavy Isotope / turn</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Power Grid Demand:</span>
                    <strong className="text-amber-400 font-mono">-{energyNeededDeut} MW</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Empire Levels:</span>
                    <strong className="text-slate-200 font-mono">{totalDeutMineLevels} Levels across {planets.length} worlds</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Formula:</span>
                    <span className="text-slate-500 font-mono text-[10px]">10 × Lv × 1.1^Lv × 1.36</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                  <span className="text-slate-500 block font-bold uppercase tracking-wider text-[9px]">Upgrade Requisite</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
                    <span>Metal: 25,000</span>
                    <span>Crystal: 15,000</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleUpgradeMine('deuteriumSynthesizer', 25000, 15000, 5000, 0)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-950/40 active:scale-95"
              >
                <PlusCircle size={14} />
                Upgrade Synthesizer to Lv {(homeworld?.mines?.deuteriumSynthesizer || 18) + 1}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: FOOD RATIONS & WATER AQUIFERS                          */}
      {/* ============================================================= */}
      {activeTab === 'food_water' && (
        <div className="space-y-6">
          {/* Rationing Policy Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-emerald-400" />
                  Imperial Food Rationing & Caloric Directives
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set food distribution policy across all planetary colonies to balance population growth vs. grain stockpile conservation.
                </p>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                Active Policy: {currentRationing.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleChangeRationing('abundant')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  currentRationing === 'abundant'
                    ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Abundant Banquets</span>
                  <span className="text-[10px] text-emerald-400 font-bold">+25% Growth</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Unrestricted gourmet rations. Boosts civilian happiness and max population expansion.
                </p>
                <span className="text-[10px] text-amber-400 font-mono block mt-2">Consumption: 120%</span>
              </button>

              <button
                onClick={() => handleChangeRationing('standard')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  currentRationing === 'standard'
                    ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Standard Rations</span>
                  <span className="text-[10px] text-cyan-400 font-bold">Nominal</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Calorically balanced nutrition. Stable baseline growth without societal friction.
                </p>
                <span className="text-[10px] text-slate-300 font-mono block mt-2">Consumption: 100%</span>
              </button>

              <button
                onClick={() => handleChangeRationing('strict_rationing')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  currentRationing === 'strict_rationing'
                    ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Strict Rationing</span>
                  <span className="text-[10px] text-amber-400 font-bold">-35% Consumption</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Tightly measured quotas. Extends food stockpiles during blockades or agricultural distress.
                </p>
                <span className="text-[10px] text-amber-400 font-mono block mt-2">Consumption: 65%</span>
              </button>

              <button
                onClick={() => handleChangeRationing('famine_starvation')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  currentRationing === 'famine_starvation'
                    ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Emergency Nutrient Paste</span>
                  <span className="text-[10px] text-red-400 font-bold">-65% Consumption</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Severe wartime survival rationing. Averts starvation but causes civilian unrest.
                </p>
                <span className="text-[10px] text-red-400 font-mono block mt-2">Consumption: 35%</span>
              </button>
            </div>
          </div>

          {/* Life Support Infrastructure Upgrades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hydroponics & Bio-Farms */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-emerald-400">
                    <Wheat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Hydroponic Dome Agri-Grid</h4>
                    <span className="text-xs text-slate-400">Total Domes: {totalHydroponics} across empire</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono">+{foodTurnProduced} Food / turn</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Empire Food Stockpile:</span>
                  <strong className="text-emerald-300 font-mono">{(resources.food || 25000).toLocaleString()} / {(resources.maxFood || 100000).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gross Production:</span>
                  <strong className="text-white font-mono">+{foodTurnProduced.toLocaleString()} units</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Population Consumption:</span>
                  <strong className="text-red-400 font-mono">-{foodTurnConsumed.toLocaleString()} units</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Net Growth Surplus:</span>
                  <strong className={`font-mono ${foodNetTurn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {foodNetTurn >= 0 ? `+${foodNetTurn.toLocaleString()}` : foodNetTurn.toLocaleString()} / turn
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpgradeLifeSupport('hydroponicsDomes', 12000, 8000)}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <PlusCircle size={13} />
                  +1 Hydroponic Dome
                </button>
                <button
                  onClick={() => handleUpgradeLifeSupport('bioFarms', 18000, 12000)}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1 active:scale-95"
                >
                  <PlusCircle size={13} />
                  +1 Bio-Farm Sector
                </button>
              </div>
            </div>

            {/* Deep Aquifer Pumping & Desalination */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-sky-400">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Subterranean Aquifer Hydro-Grid</h4>
                    <span className="text-xs text-slate-400">Total Deep Pumps: {totalAquiferPumps} across empire</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-sky-400 font-mono">+{waterTurnProduced} H₂O / turn</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Empire Water Stockpile:</span>
                  <strong className="text-sky-300 font-mono">{(resources.water || 30000).toLocaleString()} / {(resources.maxWater || 120000).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gross Pumping Yield:</span>
                  <strong className="text-white font-mono">+{waterTurnProduced.toLocaleString()} units</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Civilian Hydration Drain:</span>
                  <strong className="text-red-400 font-mono">-{waterTurnConsumed.toLocaleString()} units</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Net Water Replenishment:</span>
                  <strong className={`font-mono ${waterNetTurn >= 0 ? 'text-sky-400' : 'text-red-400'}`}>
                    {waterNetTurn >= 0 ? `+${waterNetTurn.toLocaleString()}` : waterNetTurn.toLocaleString()} / turn
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpgradeLifeSupport('deepAquiferPumps', 14000, 7000)}
                  className="py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <PlusCircle size={13} />
                  +1 Deep Aquifer Pump
                </button>
                <button
                  onClick={() => handleUpgradeLifeSupport('desalinationPlants', 20000, 11000)}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1 active:scale-95"
                >
                  <PlusCircle size={13} />
                  +1 Desalination Plant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: CONSCRIPT RECRUITS & DRAFT QUOTAS                      */}
      {/* ============================================================= */}
      {activeTab === 'conscripts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conscription Policy */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Military Academy Draft & Conscription Directives
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Regulate civilian intake into military academies. Recruits become untrained conscripts available for fleet crew, marines, and defense emplacements.
                  </p>
                </div>
                <span className="text-xs text-purple-400 font-mono font-bold">
                  +{recruitsPerTurn} Recruits / turn
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    sound.play('click');
                    setConscriptionPolicy('volunteer');
                    triggerNotification('Enlistment Policy: Volunteer Service active.');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    conscriptionPolicy === 'volunteer'
                      ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Volunteer Enlistment</span>
                    <span className="text-[10px] text-emerald-400 font-bold">High Morale</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Standard recruit quotas. Civilian approval remains elevated with zero draft unrest.
                  </p>
                  <span className="text-[10px] text-purple-400 font-mono block mt-2">Rate: 100% (+{resources.unitProduction || 250}/turn)</span>
                </button>

                <button
                  onClick={() => {
                    sound.play('click');
                    setConscriptionPolicy('selective');
                    triggerNotification('Enlistment Policy: Selective Conscription active (+35% Recruits).');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    conscriptionPolicy === 'selective'
                      ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Selective Conscription</span>
                    <span className="text-[10px] text-amber-400 font-bold">+35% Recruits</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Compulsory military training for young cohorts across all colony sectors.
                  </p>
                  <span className="text-[10px] text-purple-400 font-mono block mt-2">Rate: 135% (+{Math.round((resources.unitProduction || 250) * 1.35)}/turn)</span>
                </button>

                <button
                  onClick={() => {
                    sound.play('click');
                    setConscriptionPolicy('mass_draft');
                    triggerNotification('Enlistment Policy: Total Imperial Mobilization (+100% Recruits).');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    conscriptionPolicy === 'mass_draft'
                      ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Total Imperial Mobilization</span>
                    <span className="text-[10px] text-red-400 font-bold">+100% Recruits</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Total war decree drafting industrial workers and civilians directly into the armed forces.
                  </p>
                  <span className="text-[10px] text-purple-400 font-mono block mt-2">Rate: 200% (+{Math.round((resources.unitProduction || 250) * 2)}/turn)</span>
                </button>
              </div>

              {/* Instant Rapid Conscription Draft */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-purple-400" />
                  Instant Rapid Draft (Bounty Mobilization)
                </span>
                <p className="text-[11px] text-slate-400">
                  Pay cash enlistment bonuses to immediately draft recruits from available civilian populations:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleInstantConscriptionDraft(50)}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 active:scale-95"
                  >
                    Draft +50 Recruits (7.5k NQ)
                  </button>
                  <button
                    onClick={() => handleInstantConscriptionDraft(250)}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 active:scale-95"
                  >
                    Draft +250 Recruits (37.5k NQ)
                  </button>
                  <button
                    onClick={() => handleInstantConscriptionDraft(1000)}
                    className="py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-lg shadow-purple-950/40"
                  >
                    Draft +1,000 Recruits (150k NQ)
                  </button>
                </div>
              </div>
            </div>

            {/* Conscription Reserves Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Conscript Reserve Pool</h4>
                    <span className="text-xs text-slate-400">Ready for Specialization</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Available Recruits:</span>
                    <strong className="text-purple-300 font-mono text-base font-bold">{(resources.untrainedUnits || 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Hourly Draft Yield:</span>
                    <strong className="text-emerald-400 font-mono">+{recruitsPerHour.toLocaleString()}/h</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Military Academies:</span>
                    <strong className="text-slate-200 font-mono">{planets.length * 3} Facilities</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Trained Workforce:</span>
                    <strong className="text-amber-400 font-mono">{((resources?.miners ?? 0) + (resources?.lifers ?? 0)).toLocaleString()} Miners & Lifers</strong>
                  </div>
                </div>
              </div>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('training')}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <span>Train Units in Military Academy →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: ENERGY POWER GRID & DISTRIBUTION                       */}
      {/* ============================================================= */}
      {activeTab === 'energy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Grid Summary Meter */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Empire Power Grid Telemetry
                </h3>
                <span className={`text-xs font-mono font-bold ${energyNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {energyNet >= 0 ? 'STABLE' : 'DEFICIT'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Power Generation:</span>
                  <strong className="text-amber-400 font-mono text-base font-bold">{energyProduced} MW</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Grid Demand:</span>
                  <strong className="text-white font-mono text-base font-bold">{totalEnergyNeeded} MW</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Net Power Balance:</span>
                  <strong className={`font-mono text-base font-bold ${energyNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {energyNet >= 0 ? `+${energyNet} MW` : `${energyNet} MW`}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Grid Operational Ratio:</span>
                  <strong className="text-white font-mono font-bold">{Math.round(energyRatio * 100)}%</strong>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    energyRatio >= 1.0 ? 'bg-amber-500' : energyRatio >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.round(energyRatio * 100))}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                When grid demand exceeds generation, mining extraction and agricultural pumps throttle down proportionally. Upgrade Solar Plants, Fusion Reactors, or Naquadah Core Taps to restore 100% capacity.
              </p>
            </div>

            {/* Power Plants Management & Direct Upgrades */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Solar Plant */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <h4 className="text-sm font-bold text-white">Orbital Solar Power Plants</h4>
                    </div>
                    <span className="text-xs text-yellow-400 font-mono">Lv {homeworld?.mines?.solarPlant || 22}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Clean photovoltaic arrays capturing stellar radiation across all {planets.length} worlds.
                  </p>
                  <div className="mt-3 text-xs text-slate-300 font-mono">
                    Output: +{Math.round(20 * totalSolarLevels * 1.1)} MW Empire Generation
                  </div>
                </div>

                <button
                  onClick={() => handleUpgradeMine('solarPlant', 10000, 5000, 0, 0)}
                  className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Upgrade Solar Plant (10k M / 5k C)
                </button>
              </div>

              {/* Fusion Reactor */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Atom className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-sm font-bold text-white">Deuterium Fusion Reactors</h4>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">Lv {homeworld?.mines?.fusionReactor || 12}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Heavy-hydrogen magnetic confinement fusion producing dense, reliable megawatt baseloads.
                  </p>
                  <div className="mt-3 text-xs text-slate-300 font-mono">
                    Output: +{Math.round(35 * totalFusionLevels * 1.15)} MW Empire Generation
                  </div>
                </div>

                <button
                  onClick={() => handleUpgradeMine('fusionReactor', 20000, 15000, 8000, 0)}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Upgrade Fusion Reactor (20k M / 15k C / 8k D)
                </button>
              </div>

              {/* Naquadah Core Tap */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl flex flex-col justify-between sm:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-bold text-white">Subterranean Naquadah Core Taps</h4>
                  </div>
                  <span className="text-xs text-amber-400 font-mono">Lv {homeworld?.mines?.naquadahCoreTap || 16} (Output: +{totalNaquadahTapLevels * 50} MW)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Taps into deep planetary planetary naquadah fissures for continuous high-density energy transmission.
                </p>

                <button
                  onClick={() => handleUpgradeMine('naquadahCoreTap', 35000, 20000, 0, 10000)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Upgrade Naquadah Core Tap (35k M / 20k C / 10k NQ)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 6: FISCAL LEDGER & NAQUADAH CASHFLOWS                     */}
      {/* ============================================================= */}
      {activeTab === 'fiscal_ledger' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Gross Revenue Streams (Per Turn Cycle)
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  +{grossBaseSubtotal.toLocaleString()} NQ Gross
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Untrained Citizen Trade Taxes</span>
                    <span className="text-slate-400">{(resources?.untrainedUnits ?? 0).toLocaleString()} Citizens @ 20 NQ/cycle</span>
                  </div>
                  <strong className="text-emerald-400 font-mono">+{(untrainedYield ?? 0).toLocaleString()} NQ</strong>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Workforce Miner & Lifer Output</span>
                    <span className="text-slate-400">{((resources?.miners ?? 0) + (resources?.lifers ?? 0)).toLocaleString()} Personnel @ 80 NQ/cycle</span>
                  </div>
                  <strong className="text-emerald-400 font-mono">+{(workforceYield ?? 0).toLocaleString()} NQ</strong>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Gross Colonial Tribute</span>
                    <span className="text-slate-400">{planets.length} Planetary Worlds Combined</span>
                  </div>
                  <strong className="text-emerald-400 font-mono">+{(grossColonyYield ?? 0).toLocaleString()} NQ</strong>
                </div>
              </div>
            </div>

            {/* Deductions breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  Upkeep, Upgrades & Readiness Deductions
                </h3>
                <span className="text-xs text-red-400 font-mono font-bold">
                  -{colonyMaintenanceTotal.toLocaleString()} NQ Upkeep
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Colonial Sector Maintenance</span>
                    <span className="text-slate-400">Administration, Life Support & Logistical Upkeep</span>
                  </div>
                  <strong className="text-red-400 font-mono">-{colonyMaintenanceTotal.toLocaleString()} NQ</strong>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">DEFCON Military Readiness</span>
                    <span className="text-slate-400">DEFCON {profile.defconLevel} Multiplier: {Math.round(defconMultiplier * 100)}% Net</span>
                  </div>
                  <strong className="text-amber-400 font-mono">×{defconMultiplier.toFixed(2)}</strong>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Race Heritage Bonus</span>
                    <span className="text-slate-400">{currentRace?.name} Multiplier</span>
                  </div>
                  <strong className="text-cyan-400 font-mono">×{raceMultiplier.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 7: PLANETARY COLONIAL MINING LEDGER                       */}
      {/* ============================================================= */}
      {activeTab === 'colonies' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Planetary Mining & Production Roster
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed extractive outputs, facilities, and maintenance overhead for every world in your empire.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{planets.length} Sovereign Worlds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planets.map((planet) => {
              const maintenance = calculateColonyMaintenance(planet, planets.length);
              const gross = planet.incomeBonus || (planet.level * 10000 + 5000);
              const net = gross - maintenance;

              return (
                <div
                  key={planet.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{planet.name}</span>
                        {planet.isHomeworld && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                            HOME
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{planet.coordinate} • Level {planet.level}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {net >= 0 ? `+${net.toLocaleString()} NQ` : `${net.toLocaleString()} NQ`}
                    </span>
                  </div>

                  {/* Mine levels */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-slate-900/80 p-2 rounded-lg border border-slate-850">
                    <div>
                      <span className="text-slate-500 block">Metal</span>
                      <strong className="text-white font-mono">Lv {planet.mines?.metalMine || 20}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Crystal</span>
                      <strong className="text-cyan-300 font-mono">Lv {planet.mines?.crystalMine || 16}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Deut</span>
                      <strong className="text-blue-300 font-mono">Lv {planet.mines?.deuteriumSynthesizer || 12}</strong>
                    </div>
                  </div>

                  {/* Food and Water stats */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Food:</span>
                      <strong className="text-emerald-300 font-mono">{(planet.foodStockpile || 25000).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Water:</span>
                      <strong className="text-sky-300 font-mono">{(planet.waterStockpile || 30000).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-[11px] text-slate-500">
                    <span>Maintenance:</span>
                    <strong className="text-red-400 font-mono">-{maintenance.toLocaleString()} NQ</strong>
                  </div>

                  <button
                    onClick={() => {
                      sound.play('click');
                      setSelectedModalPlanet(planet);
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Activity size={12} />
                    <span>Inspect Dossier & Queues →</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED PLANET MODAL VIEW */}
      {selectedModalPlanet && (
        <PlanetDetailModal
          planet={selectedModalPlanet}
          isOpen={!!selectedModalPlanet}
          onClose={() => setSelectedModalPlanet(null)}
          resources={resources}
          onUpdateResources={onUpdateResources}
          onUpdatePlanet={(updated) => {
            if (onUpdatePlanets) {
              onUpdatePlanets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            }
            setSelectedModalPlanet(updated);
          }}
          planetsCount={planets.length}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

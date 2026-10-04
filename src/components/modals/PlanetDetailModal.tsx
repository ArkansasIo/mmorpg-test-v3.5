import React, { useState, useEffect } from 'react';
import {
  Globe,
  Shield,
  Zap,
  Sparkles,
  Layers,
  Flame,
  Building,
  CheckCircle2,
  AlertTriangle,
  X,
  Pickaxe,
  Wheat,
  Droplet,
  Users,
  Activity,
  Plus,
  Minus,
  Clock,
  Sliders,
  DollarSign,
  TrendingUp,
  FastForward,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldAlert,
  Crown,
  Atom,
  UserCheck,
  Award,
  ShieldCheck,
} from 'lucide-react';
import {
  PlanetColony,
  PlayerResources,
  PlanetaryBuildingQueueItem,
  PopulationRationingLevel,
  PopulationLivingStandard,
} from '../../types';
import { sound } from '../../sound';
import { calculateColonyMaintenance, getColonyMaintenanceDetails } from '../../utils/colonyCalculations';

interface PlanetDetailModalProps {
  planet: PlanetColony;
  isOpen: boolean;
  onClose: () => void;
  resources: PlayerResources;
  onUpdateResources?: (res: Partial<PlayerResources>) => void;
  onUpdatePlanet?: (updated: PlanetColony) => void;
  planetsCount?: number;
  onNavigate?: (route: string) => void;
}

export const PlanetDetailModal: React.FC<PlanetDetailModalProps> = ({
  planet,
  isOpen,
  onClose,
  resources,
  onUpdateResources,
  onUpdatePlanet,
  planetsCount = 3,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'queue' | 'workforce' | 'governance'>('resources');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  // Local editable strata distribution
  const defaultStrata = {
    farmers: 500000,
    hydrologists: 400000,
    miners: 600000,
    industrialWorkers: 500000,
    scientists: 200000,
    administrators: 100000,
    militaryRecruits: 200000,
  };

  const currentStrata = planet.population?.strata || defaultStrata;
  const [strata, setStrata] = useState(currentStrata);

  useEffect(() => {
    if (planet.population?.strata) {
      setStrata(planet.population.strata);
    }
  }, [planet]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerNotification = (text: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // =========================================================
  // SPECIFIC RESOURCE CALCULATIONS FOR THIS PLANET
  // =========================================================
  const metalMineLevel = planet.mines?.metalMine || 20;
  const crystalMineLevel = planet.mines?.crystalMine || 16;
  const deutMineLevel = planet.mines?.deuteriumSynthesizer || 12;
  const solarLevel = planet.mines?.solarPlant || 18;
  const fusionLevel = planet.mines?.fusionReactor || 8;
  const naqTapLevel = planet.mines?.naquadahCoreTap || 10;

  // Raw Turn Extraction Formulas
  const baseMetal = Math.round(30 * metalMineLevel * Math.pow(1.1, metalMineLevel)) + 30;
  const baseCrystal = Math.round(20 * crystalMineLevel * Math.pow(1.1, crystalMineLevel)) + 15;
  const baseDeut = Math.round(10 * deutMineLevel * Math.pow(1.1, deutMineLevel) * 1.36);

  // Energy Grid
  const energyMetal = Math.round(10 * metalMineLevel * Math.pow(1.1, metalMineLevel));
  const energyCrystal = Math.round(10 * crystalMineLevel * Math.pow(1.1, crystalMineLevel));
  const energyDeut = Math.round(20 * deutMineLevel * Math.pow(1.1, deutMineLevel));
  const totalEnergyNeeded = Math.max(1, energyMetal + energyCrystal + energyDeut);

  const energyProduced = Math.round(20 * solarLevel * 1.1) + Math.round(35 * fusionLevel * 1.15) + (naqTapLevel * 50) + 50;
  const energyRatio = Math.min(1.0, Math.max(0.2, energyProduced / totalEnergyNeeded));
  const localEnergyNet = energyProduced - totalEnergyNeeded;

  const metalTurnYield = Math.round(baseMetal * energyRatio);
  const crystalTurnYield = Math.round(baseCrystal * energyRatio);
  const deutTurnYield = Math.round(baseDeut * energyRatio);

  // Workforce impact on mining
  const minerCount = strata.miners || 600000;
  const minerBonusPercent = Math.min(50, Math.round((minerCount / 500000) * 10));

  // Life support calculations
  const lf = planet.lifeSupportFacilities || {
    hydroponicsDomes: 4,
    bioFarms: 3,
    geneticCropLabs: 2,
    deepAquiferPumps: 3,
    moistureCondensers: 2,
    desalinationPlants: 2,
    subsurfaceCisterns: 2,
    atmosphereScrubbers: 2,
  };

  const totalPop = planet.population?.total || 2500000;
  const farmerCount = strata.farmers || 500000;
  const hydrologistCount = strata.hydrologists || 400000;

  const geneticMult = 1 + (lf.geneticCropLabs || 0) * 0.15;
  const farmerBonus = Math.round(farmerCount * 0.00008);
  const foodTurnProduced = Math.round(((lf.hydroponicsDomes || 4) * 28 + (lf.bioFarms || 3) * 42 + farmerBonus + 30) * Math.max(0.25, energyRatio) * geneticMult);

  const rationingLevel = planet.population?.rationingLevel || 'abundant';
  const rationingMult = rationingLevel === 'abundant' ? 1.2 : rationingLevel === 'standard' ? 1.0 : rationingLevel === 'strict_rationing' ? 0.65 : 0.35;
  const foodTurnConsumed = Math.round((totalPop * 0.000008 + 15) * rationingMult);
  const foodNet = foodTurnProduced - foodTurnConsumed;

  const hydrologistBonus = Math.round(hydrologistCount * 0.00007);
  const waterTurnProduced = Math.round(((lf.deepAquiferPumps || 3) * 32 + (lf.moistureCondensers || 2) * 20 + (lf.desalinationPlants || 2) * 38 + hydrologistBonus + 35) * Math.max(0.25, energyRatio));
  const waterTurnConsumed = Math.round(totalPop * 0.000009 + 18);
  const waterNet = waterTurnProduced - waterTurnConsumed;

  // Fiscal breakdown
  const maintenance = calculateColonyMaintenance(planet, planetsCount);
  const grossIncome = planet.incomeBonus || (planet.level * 10000 + 5000);
  const netIncome = grossIncome - maintenance;

  // Building Queue
  const buildingQueue: PlanetaryBuildingQueueItem[] = planet.buildingQueue || [
    {
      id: `bq-${planet.id}-1`,
      category: 'mines',
      facilityKey: 'metalMine',
      name: `Metal Mine Expansion (Level ${metalMineLevel + 1})`,
      targetLevel: metalMineLevel + 1,
      progressPercent: 65,
      timeRemainingSeconds: 340,
      totalDurationSeconds: 1200,
      cost: { metal: 15000, crystal: 6000, deuterium: 0, naquadah: 0 },
      status: 'in_progress',
    },
    {
      id: `bq-${planet.id}-2`,
      category: 'lifeSupport',
      facilityKey: 'deepAquiferPumps',
      name: `Deep Aquifer Pump Station (Unit ${lf.deepAquiferPumps + 1})`,
      targetLevel: lf.deepAquiferPumps + 1,
      progressPercent: 0,
      timeRemainingSeconds: 900,
      totalDurationSeconds: 900,
      cost: { metal: 14000, crystal: 7000, deuterium: 0, naquadah: 0 },
      status: 'queued',
    },
  ];

  // =========================================================
  // QUEUE ACTIONS
  // =========================================================
  const handleEnqueueProject = (
    category: 'mines' | 'facilities' | 'lifeSupport' | 'defenses',
    facilityKey: string,
    name: string,
    targetLevel: number,
    cost: { metal: number; crystal: number; deuterium: number; naquadah: number }
  ) => {
    sound.play('click');
    if ((resources.metal || 0) < cost.metal || (resources.crystal || 0) < cost.crystal || (resources.deuterium || 0) < cost.deuterium || resources.naquadah < cost.naquadah) {
      sound.play('warning');
      triggerNotification('Insufficient empire resources to queue this construction project.', 'warning');
      return;
    }

    if (onUpdateResources) {
      onUpdateResources({
        metal: (resources.metal || 0) - cost.metal,
        crystal: (resources.crystal || 0) - cost.crystal,
        deuterium: (resources.deuterium || 0) - cost.deuterium,
        naquadah: resources.naquadah - cost.naquadah,
      });
    }

    const newItem: PlanetaryBuildingQueueItem = {
      id: `bq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category,
      facilityKey,
      name,
      targetLevel,
      progressPercent: 0,
      timeRemainingSeconds: 600 + targetLevel * 60,
      totalDurationSeconds: 600 + targetLevel * 60,
      cost,
      status: buildingQueue.length === 0 ? 'in_progress' : 'queued',
    };

    const updatedQueue = [...buildingQueue, newItem];
    if (onUpdatePlanet) {
      onUpdatePlanet({
        ...planet,
        buildingQueue: updatedQueue,
      });
    }

    sound.play('confirm');
    triggerNotification(`Construction Scheduled: ${name} added to planetary queue.`);
  };

  const handleCancelQueueItem = (itemId: string) => {
    sound.play('click');
    const item = buildingQueue.find((q) => q.id === itemId);
    if (!item) return;

    // Refund 80%
    if (onUpdateResources) {
      onUpdateResources({
        metal: (resources.metal || 0) + Math.round(item.cost.metal * 0.8),
        crystal: (resources.crystal || 0) + Math.round(item.cost.crystal * 0.8),
        deuterium: (resources.deuterium || 0) + Math.round(item.cost.deuterium * 0.8),
        naquadah: resources.naquadah + Math.round(item.cost.naquadah * 0.8),
      });
    }

    const updatedQueue = buildingQueue.filter((q) => q.id !== itemId);
    if (onUpdatePlanet) {
      onUpdatePlanet({
        ...planet,
        buildingQueue: updatedQueue,
      });
    }

    sound.play('warning');
    triggerNotification(`Project Cancelled. 80% of materials refunded to planetary vaults.`);
  };

  const handleRushQueueItem = (itemId: string) => {
    sound.play('click');
    const rushCost = 50000;
    if (resources.naquadah < rushCost) {
      sound.play('warning');
      triggerNotification(`Requires 50,000 Naquadah in rapid fabrication fabrication drones.`, 'warning');
      return;
    }

    const item = buildingQueue.find((q) => q.id === itemId);
    if (!item) return;

    if (onUpdateResources) {
      onUpdateResources({ naquadah: resources.naquadah - rushCost });
    }

    // Complete building upgrade directly on planet
    const updatedPlanet = { ...planet };
    if (item.category === 'mines') {
      updatedPlanet.mines = {
        ...(updatedPlanet.mines || {
          metalMine: 20,
          crystalMine: 16,
          deuteriumSynthesizer: 12,
          solarPlant: 18,
          fusionReactor: 8,
          naquadahCoreTap: 10,
        }),
        [item.facilityKey]: item.targetLevel,
      };
    } else if (item.category === 'lifeSupport') {
      updatedPlanet.lifeSupportFacilities = {
        ...(updatedPlanet.lifeSupportFacilities || {
          hydroponicsDomes: 4,
          bioFarms: 3,
          geneticCropLabs: 2,
          deepAquiferPumps: 3,
          moistureCondensers: 2,
          desalinationPlants: 2,
          subsurfaceCisterns: 2,
          atmosphereScrubbers: 2,
        }),
        [item.facilityKey]: item.targetLevel,
      };
    }

    updatedPlanet.buildingQueue = buildingQueue.filter((q) => q.id !== itemId);

    if (onUpdatePlanet) {
      onUpdatePlanet(updatedPlanet);
    }

    sound.play('confirm');
    triggerNotification(`⚡ Rapid Fabrication Complete! ${item.name} finished immediately!`);
  };

  // =========================================================
  // WORKFORCE REALLOCATION
  // =========================================================
  const handleAdjustStrata = (key: keyof typeof strata, delta: number) => {
    sound.play('click');
    const curVal = strata[key] || 0;
    const newVal = Math.max(10000, curVal + delta);
    const updated = { ...strata, [key]: newVal };
    setStrata(updated);

    if (onUpdatePlanet) {
      onUpdatePlanet({
        ...planet,
        population: {
          ...(planet.population || {
            total: totalPop,
            growthRatePerHour: 15000,
            housingCapacity: 5000000,
            happiness: 85,
            unrest: 10,
            livingStandard: 'utopian',
            rationingLevel: 'abundant',
            strata: updated,
          }),
          strata: updated,
        },
      });
    }
  };

  const handleApplyWorkforcePreset = (preset: 'balanced' | 'mining' | 'agrarian' | 'fortress') => {
    sound.play('click');
    let newStrata = { ...strata };

    if (preset === 'balanced') {
      newStrata = {
        farmers: Math.round(totalPop * 0.20),
        hydrologists: Math.round(totalPop * 0.16),
        miners: Math.round(totalPop * 0.24),
        industrialWorkers: Math.round(totalPop * 0.20),
        scientists: Math.round(totalPop * 0.08),
        administrators: Math.round(totalPop * 0.04),
        militaryRecruits: Math.round(totalPop * 0.08),
      };
    } else if (preset === 'mining') {
      newStrata = {
        farmers: Math.round(totalPop * 0.15),
        hydrologists: Math.round(totalPop * 0.12),
        miners: Math.round(totalPop * 0.45),
        industrialWorkers: Math.round(totalPop * 0.18),
        scientists: Math.round(totalPop * 0.04),
        administrators: Math.round(totalPop * 0.03),
        militaryRecruits: Math.round(totalPop * 0.03),
      };
    } else if (preset === 'agrarian') {
      newStrata = {
        farmers: Math.round(totalPop * 0.45),
        hydrologists: Math.round(totalPop * 0.30),
        miners: Math.round(totalPop * 0.10),
        industrialWorkers: Math.round(totalPop * 0.08),
        scientists: Math.round(totalPop * 0.03),
        administrators: Math.round(totalPop * 0.02),
        militaryRecruits: Math.round(totalPop * 0.02),
      };
    } else if (preset === 'fortress') {
      newStrata = {
        farmers: Math.round(totalPop * 0.15),
        hydrologists: Math.round(totalPop * 0.12),
        miners: Math.round(totalPop * 0.15),
        industrialWorkers: Math.round(totalPop * 0.20),
        scientists: Math.round(totalPop * 0.05),
        administrators: Math.round(totalPop * 0.05),
        militaryRecruits: Math.round(totalPop * 0.28),
      };
    }

    setStrata(newStrata);
    if (onUpdatePlanet) {
      onUpdatePlanet({
        ...planet,
        population: {
          ...(planet.population || {
            total: totalPop,
            growthRatePerHour: 15000,
            housingCapacity: 5000000,
            happiness: 85,
            unrest: 10,
            livingStandard: 'utopian',
            rationingLevel: 'abundant',
            strata: newStrata,
          }),
          strata: newStrata,
        },
      });
    }

    sound.play('trade');
    triggerNotification(`Applied Workforce Doctrine: [${preset.toUpperCase()}]`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative animate-fade-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* MODAL HEADER */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-700 text-cyan-400 shadow-inner flex items-center justify-center">
              <Globe className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">{planet.name}</h2>
                {planet.isHomeworld && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                    HOMEWORLD CAPITAL
                  </span>
                )}
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
                  {planet.coordinate}
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-bold uppercase">
                  Level {planet.level}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {planet.biome} • Specialization: <span className="text-amber-400 font-semibold uppercase">{planet.specialization || 'Homeworld'}</span> • Governor: <span className="text-slate-200">{planet.governor || 'Unassigned'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Quick Metrics */}
            <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Population</span>
                <span className="text-purple-300 font-bold">{totalPop.toLocaleString()}</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Fields</span>
                <span className="text-amber-400 font-bold">{planet.fieldsUsed || 45} / {planet.fieldsMax || 180}</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Temp</span>
                <span className="text-slate-200 font-bold">{planet.temperature || '+18°C'}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b animate-fade-in ${
              notification.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.text}</span>
          </div>
        )}

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/50 relative z-10 overflow-x-auto">
          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('resources');
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'resources'
                ? 'bg-slate-900 text-white border-t-2 border-amber-500 border-x border-slate-800 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            RESOURCE BREAKDOWNS
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('queue');
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-slate-900 text-white border-t-2 border-cyan-500 border-x border-slate-800 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4 text-cyan-400" />
            BUILDING QUEUES ({buildingQueue.length})
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('workforce');
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'workforce'
                ? 'bg-slate-900 text-white border-t-2 border-purple-500 border-x border-slate-800 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            WORKFORCE ALLOCATIONS
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('governance');
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'governance'
                ? 'bg-slate-900 text-white border-t-2 border-emerald-500 border-x border-slate-800 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            GOVERNANCE & LIFE SUPPORT
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 relative z-10">
          {/* ========================================================= */}
          {/* TAB 1: SPECIFIC RESOURCE BREAKDOWNS                       */}
          {/* ========================================================= */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              {/* Primary Mining & Extraction Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Metal Ore */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Pickaxe className="w-4 h-4 text-slate-300" /> Metal Ore Extraction
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">+{metalTurnYield * 2}/h</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Mine Level:</span>
                      <strong className="text-white font-mono">Lv {metalMineLevel}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Per 30-min Turn:</span>
                      <strong className="text-emerald-400 font-mono">+{metalTurnYield.toLocaleString()} Ore</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Grid Power Load:</span>
                      <strong className="text-amber-400 font-mono">-{energyMetal} MW</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Miner Workforce Bonus:</span>
                      <strong className="text-cyan-400 font-mono">+{minerBonusPercent}%</strong>
                    </div>
                  </div>
                </div>

                {/* Crystal Silicon */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> Crystal Silicon Quarry
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">+{crystalTurnYield * 2}/h</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Quarry Level:</span>
                      <strong className="text-white font-mono">Lv {crystalMineLevel}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Per 30-min Turn:</span>
                      <strong className="text-cyan-300 font-mono">+{crystalTurnYield.toLocaleString()} Silicon</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Grid Power Load:</span>
                      <strong className="text-amber-400 font-mono">-{energyCrystal} MW</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Semiconductor Purity:</span>
                      <strong className="text-slate-200 font-mono">99.98%</strong>
                    </div>
                  </div>
                </div>

                {/* Deuterium */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-blue-400" /> Deuterium Centrifuges
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">+{deutTurnYield * 2}/h</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Synthesizer Level:</span>
                      <strong className="text-white font-mono">Lv {deutMineLevel}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Per 30-min Turn:</span>
                      <strong className="text-blue-300 font-mono">+{deutTurnYield.toLocaleString()} Isotope</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Grid Power Load:</span>
                      <strong className="text-amber-400 font-mono">-{energyDeut} MW</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Thermal Bonus:</span>
                      <strong className="text-slate-200 font-mono">{planet.temperature?.includes('-') ? '+15% Cold' : 'Nominal'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Life Support, Energy & Fiscal Balances */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Food Rations */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Wheat className="w-4 h-4" /> Food & Caloric Rations
                    </span>
                    <span className={`text-xs font-bold font-mono ${foodNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {foodNet >= 0 ? `+${foodNet * 2}/h` : `${foodNet * 2}/h`}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Local Silo Reserves:</span>
                      <strong className="text-emerald-300 font-mono">{(planet.foodStockpile || 25000).toLocaleString()} / {(planet.foodCapacity || 100000).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Hydroponic Domes:</span>
                      <strong className="text-white font-mono">{lf.hydroponicsDomes} Domes • {lf.bioFarms} Bio-Farms</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Civilian Consumption:</span>
                      <strong className="text-red-400 font-mono">-{foodTurnConsumed} Food / turn</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Rationing Directive:</span>
                      <span className="text-amber-400 font-bold uppercase">{rationingLevel.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Water Aquifers */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4" /> Aquifer Hydro-Grid
                    </span>
                    <span className={`text-xs font-bold font-mono ${waterNet >= 0 ? 'text-sky-400' : 'text-red-400'}`}>
                      {waterNet >= 0 ? `+${waterNet * 2}/h` : `${waterNet * 2}/h`}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Cistern Reserves:</span>
                      <strong className="text-sky-300 font-mono">{(planet.waterStockpile || 30000).toLocaleString()} / {(planet.waterCapacity || 120000).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Deep Aquifer Pumps:</span>
                      <strong className="text-white font-mono">{lf.deepAquiferPumps} Pumps • {lf.desalinationPlants} Desal</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Hydration Drain:</span>
                      <strong className="text-red-400 font-mono">-{waterTurnConsumed} H₂O / turn</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Aquifer Replenishment:</span>
                      <strong className="text-emerald-400 font-mono">Stable Table (+12%)</strong>
                    </div>
                  </div>
                </div>

                {/* Energy & Maintenance */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> Energy & Maintenance
                    </span>
                    <span className={`text-xs font-mono font-bold ${localEnergyNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {localEnergyNet >= 0 ? `+${localEnergyNet} MW Net` : `${localEnergyNet} MW`}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Local Generation:</span>
                      <strong className="text-amber-400 font-mono">{energyProduced} MW (Solar/Fusion/Core)</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Industrial Drain:</span>
                      <strong className="text-white font-mono">{totalEnergyNeeded} MW</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Colonial Maintenance:</span>
                      <strong className="text-red-400 font-mono">-{maintenance.toLocaleString()} NQ / turn</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Net Cashflow Contribution:</span>
                      <strong className={`font-mono font-bold ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {netIncome >= 0 ? `+${netIncome.toLocaleString()} NQ` : `${netIncome.toLocaleString()} NQ`}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: BUILDING QUEUES & PROJECT ENQUEUEING               */}
          {/* ========================================================= */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              {/* Ongoing Building Queues List */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    Active Construction Queue for {planet.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Queue Slots: {buildingQueue.length} / 5</span>
                </div>

                {buildingQueue.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
                    <Building className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">No active construction projects on this planet. Select an expansion below to enqueue.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {buildingQueue.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-cyan-400">
                              <Building className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{item.name}</h4>
                              <span className="text-[10px] text-slate-400">
                                Target Tier: <strong className="text-amber-400">Level {item.targetLevel}</strong> • Status:{' '}
                                <span className={item.status === 'in_progress' ? 'text-emerald-400' : 'text-slate-400'}>
                                  {item.status.toUpperCase()}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRushQueueItem(item.id)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-md shadow-amber-950/40"
                              title="Instant rush complete with fabrication drones"
                            >
                              <FastForward size={12} />
                              Rush (50k NQ)
                            </button>
                            <button
                              onClick={() => handleCancelQueueItem(item.id)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg text-[11px] font-bold border border-slate-700 transition-all active:scale-95"
                              title="Cancel project and refund 80% materials"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-slate-400">
                            <span>Fabrication Progress</span>
                            <span>{item.progressPercent}% ({item.timeRemainingSeconds}s remaining)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(5, item.progressPercent)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Project to Queue Options */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={14} className="text-cyan-400" /> Available Projects to Enqueue
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Metal Mine */}
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-white">Metal Mine Lv {metalMineLevel + 1}</span>
                        <span className="text-slate-400 text-[10px]">+2,000 Ore/h</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Expands raw subterranean metal extraction veins.</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-2">Cost: 15,000 M • 6,000 C</div>
                    </div>
                    <button
                      onClick={() =>
                        handleEnqueueProject('mines', 'metalMine', `Metal Mine Expansion (Level ${metalMineLevel + 1})`, metalMineLevel + 1, {
                          metal: 15000,
                          crystal: 6000,
                          deuterium: 0,
                          naquadah: 0,
                        })
                      }
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 active:scale-95"
                    >
                      Enqueue Upgrade
                    </button>
                  </div>

                  {/* Crystal Quarry */}
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-cyan-300">Crystal Quarry Lv {crystalMineLevel + 1}</span>
                        <span className="text-slate-400 text-[10px]">+1,400 Si/h</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Expands high-purity silicon crystal extraction arrays.</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-2">Cost: 20,000 M • 12,000 C</div>
                    </div>
                    <button
                      onClick={() =>
                        handleEnqueueProject('mines', 'crystalMine', `Crystal Quarry Expansion (Level ${crystalMineLevel + 1})`, crystalMineLevel + 1, {
                          metal: 20000,
                          crystal: 12000,
                          deuterium: 0,
                          naquadah: 0,
                        })
                      }
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 active:scale-95"
                    >
                      Enqueue Upgrade
                    </button>
                  </div>

                  {/* Deuterium Synthesizer */}
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-blue-300">Deuterium Centrifuge Lv {deutMineLevel + 1}</span>
                        <span className="text-slate-400 text-[10px]">+950 Iso/h</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Centrifuges heavy isotopes from ocean basins.</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-2">Cost: 25,000 M • 15,000 C • 5,000 D</div>
                    </div>
                    <button
                      onClick={() =>
                        handleEnqueueProject('mines', 'deuteriumSynthesizer', `Deuterium Centrifuge (Level ${deutMineLevel + 1})`, deutMineLevel + 1, {
                          metal: 25000,
                          crystal: 15000,
                          deuterium: 5000,
                          naquadah: 0,
                        })
                      }
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 active:scale-95"
                    >
                      Enqueue Upgrade
                    </button>
                  </div>

                  {/* Hydroponic Dome */}
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-emerald-400">Hydroponic Dome Unit {lf.hydroponicsDomes + 1}</span>
                        <span className="text-slate-400 text-[10px]">+56 Food/h</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Automated nutrient bays producing fresh caloric rations.</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-2">Cost: 12,000 M • 8,000 C</div>
                    </div>
                    <button
                      onClick={() =>
                        handleEnqueueProject('lifeSupport', 'hydroponicsDomes', `Hydroponic Dome Unit ${lf.hydroponicsDomes + 1}`, lf.hydroponicsDomes + 1, {
                          metal: 12000,
                          crystal: 8000,
                          deuterium: 0,
                          naquadah: 0,
                        })
                      }
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 active:scale-95"
                    >
                      Enqueue Upgrade
                    </button>
                  </div>

                  {/* Deep Aquifer Pump */}
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-sky-400">Deep Aquifer Pump Unit {lf.deepAquiferPumps + 1}</span>
                        <span className="text-slate-400 text-[10px]">+64 H₂O/h</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Deep crust sonic drills tapping pristine subterranean water tables.</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-2">Cost: 14,000 M • 7,000 C</div>
                    </div>
                    <button
                      onClick={() =>
                        handleEnqueueProject('lifeSupport', 'deepAquiferPumps', `Deep Aquifer Pump Unit ${lf.deepAquiferPumps + 1}`, lf.deepAquiferPumps + 1, {
                          metal: 14000,
                          crystal: 7000,
                          deuterium: 0,
                          naquadah: 0,
                        })
                      }
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 active:scale-95"
                    >
                      Enqueue Upgrade
                    </button>
                  </div>

                  {/* Solar Power Plant */}
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-yellow-400">Solar Plant Lv {solarLevel + 1}</span>
                        <span className="text-slate-400 text-[10px]">+35 MW Output</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Orbital satellite photovoltaic relay to power colony mines.</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-2">Cost: 10,000 M • 5,000 C</div>
                    </div>
                    <button
                      onClick={() =>
                        handleEnqueueProject('mines', 'solarPlant', `Solar Power Plant (Level ${solarLevel + 1})`, solarLevel + 1, {
                          metal: 10000,
                          crystal: 5000,
                          deuterium: 0,
                          naquadah: 0,
                        })
                      }
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 active:scale-95"
                    >
                      Enqueue Upgrade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: WORKFORCE ALLOCATIONS                              */}
          {/* ========================================================= */}
          {activeTab === 'workforce' && (
            <div className="space-y-6">
              {/* Presets and Global Workforce Bar */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-850 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      Planetary Workforce Allocation & Strata Distribution
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Allocate civilian labor pools between agriculture, mining, hydrology, industry, research, and defense forces.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Doctrines:</span>
                    <button
                      onClick={() => handleApplyWorkforcePreset('balanced')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700"
                    >
                      Balanced
                    </button>
                    <button
                      onClick={() => handleApplyWorkforcePreset('mining')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold border border-slate-700"
                    >
                      Heavy Mining
                    </button>
                    <button
                      onClick={() => handleApplyWorkforcePreset('agrarian')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold border border-slate-700"
                    >
                      Agrarian
                    </button>
                    <button
                      onClick={() => handleApplyWorkforcePreset('fortress')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-lg text-xs font-semibold border border-slate-700"
                    >
                      Militarized
                    </button>
                  </div>
                </div>

                {/* Strata Allocation Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmers */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Wheat className="w-3.5 h-3.5 text-emerald-400" /> Agricultural Farmers
                      </span>
                      <strong className="text-emerald-400 font-mono">{(strata.farmers || 500000).toLocaleString()}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400">Boosts hydroponic yields and food production (+{farmerBonus} Food/turn).</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustStrata('farmers', -50000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Minus size={12} />
                      </button>
                      <div className="flex-1 text-center font-mono text-[11px] text-slate-300">
                        {Math.round(((strata.farmers || 500000) / totalPop) * 100)}% of Population
                      </div>
                      <button
                        onClick={() => handleAdjustStrata('farmers', 50000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Hydrologists */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-sky-400" /> Hydrologists & Aquifer Engineers
                      </span>
                      <strong className="text-sky-400 font-mono">{(strata.hydrologists || 400000).toLocaleString()}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400">Maintains subterranean aquifer pumping (+{hydrologistBonus} H₂O/turn).</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustStrata('hydrologists', -50000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Minus size={12} />
                      </button>
                      <div className="flex-1 text-center font-mono text-[11px] text-slate-300">
                        {Math.round(((strata.hydrologists || 400000) / totalPop) * 100)}% of Population
                      </div>
                      <button
                        onClick={() => handleAdjustStrata('hydrologists', 50000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Miners */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Pickaxe className="w-3.5 h-3.5 text-amber-500" /> Heavy Ore Miners
                      </span>
                      <strong className="text-amber-400 font-mono">{(strata.miners || 600000).toLocaleString()}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400">Extracts metal ore, crystal silicon, and naquadah (+{minerBonusPercent}% yield).</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustStrata('miners', -50000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Minus size={12} />
                      </button>
                      <div className="flex-1 text-center font-mono text-[11px] text-slate-300">
                        {Math.round(((strata.miners || 600000) / totalPop) * 100)}% of Population
                      </div>
                      <button
                        onClick={() => handleAdjustStrata('miners', 50000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Industrial Machinists */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-cyan-400" /> Industrial Machinists
                      </span>
                      <strong className="text-cyan-400 font-mono">{(strata.industrialWorkers || 500000).toLocaleString()}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400">Accelerates building queue fabrication speed and structural maintenance.</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustStrata('industrialWorkers', -50000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Minus size={12} />
                      </button>
                      <div className="flex-1 text-center font-mono text-[11px] text-slate-300">
                        {Math.round(((strata.industrialWorkers || 500000) / totalPop) * 100)}% of Population
                      </div>
                      <button
                        onClick={() => handleAdjustStrata('industrialWorkers', 50000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Scientists */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Colonial Scientists
                      </span>
                      <strong className="text-blue-400 font-mono">{(strata.scientists || 200000).toLocaleString()}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400">Powers local planetary research labs and technology tree research bonuses.</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustStrata('scientists', -25000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Minus size={12} />
                      </button>
                      <div className="flex-1 text-center font-mono text-[11px] text-slate-300">
                        {Math.round(((strata.scientists || 200000) / totalPop) * 100)}% of Population
                      </div>
                      <button
                        onClick={() => handleAdjustStrata('scientists', 25000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Military Recruits */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-purple-400" /> Conscript PDF Recruits
                      </span>
                      <strong className="text-purple-400 font-mono">{(strata.militaryRecruits || 200000).toLocaleString()}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400">Planetary defense garrison guarding against rival warlord orbital drops.</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustStrata('militaryRecruits', -25000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Minus size={12} />
                      </button>
                      <div className="flex-1 text-center font-mono text-[11px] text-slate-300">
                        {Math.round(((strata.militaryRecruits || 200000) / totalPop) * 100)}% of Population
                      </div>
                      <button
                        onClick={() => handleAdjustStrata('militaryRecruits', 25000)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: GOVERNANCE & LIFE SUPPORT                          */}
          {/* ========================================================= */}
          {activeTab === 'governance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specialization & Tax Policy */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-3">
                    <Crown className="w-4 h-4 text-amber-400" />
                    Colonial Specialization & Economic Focus
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Planetary Specialization:</label>
                      <select
                        value={planet.specialization || 'mining'}
                        onChange={(e) => {
                          sound.play('click');
                          if (onUpdatePlanet) {
                            onUpdatePlanet({
                              ...planet,
                              specialization: e.target.value as any,
                            });
                          }
                          triggerNotification(`Planetary Specialization updated to [${e.target.value.toUpperCase()}].`);
                        }}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold cursor-pointer"
                      >
                        <option value="mining">Mining Colony (-10% Logistics, +25% Ore Yield)</option>
                        <option value="industrial">Industrial World (+25% Build Speed, +10% Upkeep)</option>
                        <option value="research">Research Nexus (+35% Science, +15% Containment)</option>
                        <option value="fortress">Fortress World (+50% Defense Shields, +20% Upkeep)</option>
                        <option value="trade">Commercial Hub (+20% Trade Taxes, -15% Upkeep)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Tax Policy:</label>
                      <select
                        value={planet.taxPolicy || 'balanced'}
                        onChange={(e) => {
                          sound.play('click');
                          if (onUpdatePlanet) {
                            onUpdatePlanet({
                              ...planet,
                              taxPolicy: e.target.value as any,
                            });
                          }
                          triggerNotification(`Tax Policy updated to [${e.target.value.toUpperCase()}].`);
                        }}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold cursor-pointer"
                      >
                        <option value="balanced">Balanced Taxation (Standard Growth & Taxes)</option>
                        <option value="extractive">Extractive Austerity (+25% Tax Revenue, -10% Happiness)</option>
                        <option value="subsidized">Subsidized Welfare (+25% Upkeep, +20% Population Growth)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Life Support Scrubber & Environmental Controls */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Atmospheric Life Support & Scrubber Arrays
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Atmosphere Scrubbers:</span>
                      <strong className="text-white font-mono">{lf.atmosphereScrubbers || 2} Active Units</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Subsurface Cisterns:</span>
                      <strong className="text-sky-300 font-mono">{lf.subsurfaceCisterns || 2} High-Pressure Tanks</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Civilian Happiness:</span>
                      <strong className="text-emerald-400 font-mono">{planet.population?.happiness || 85}% Morale</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Social Unrest:</span>
                      <strong className="text-slate-300 font-mono">{planet.population?.unrest || 10}% Unrest</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

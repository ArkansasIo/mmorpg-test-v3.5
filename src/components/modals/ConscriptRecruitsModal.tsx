import React, { useState } from 'react';
import {
  Users,
  Wheat,
  Droplet,
  Shield,
  Layers,
  Rocket,
  Globe,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  Radio,
  Flame,
  Zap,
  Building,
  Sparkles,
  ArrowRight,
  Crosshair,
  UserCheck,
  ShieldAlert,
  X,
} from 'lucide-react';
import { sound } from '../../sound';
import { PlayerResources, PlanetColony, PopulationStrataDistribution } from '../../types';

interface ConscriptRecruitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: PlayerResources;
  planets: PlanetColony[];
  activePlanetId?: string;
  onUpdateResources?: (res: Partial<PlayerResources>) => void;
  onUpdatePlanets?: (planets: PlanetColony[]) => void;
  onColonizePlanet?: (coordinate: string, biome: string, name: string) => { success: boolean; message: string };
  onNavigate?: (route: string) => void;
  initialTab?: 'conscripts' | 'food-water' | 'fields' | 'colonize';
}

export const ConscriptRecruitsModal: React.FC<ConscriptRecruitsModalProps> = ({
  isOpen,
  onClose,
  resources,
  planets,
  activePlanetId,
  onUpdateResources,
  onUpdatePlanets,
  onColonizePlanet,
  onNavigate,
  initialTab = 'conscripts',
}) => {
  const [activeTab, setActiveTab] = useState<'conscripts' | 'food-water' | 'fields' | 'colonize'>(initialTab);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>(() => {
    return activePlanetId || planets.find((p) => p.isHomeworld)?.id || planets[0]?.id || 'pl-homeworld';
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // New Colony Form State
  const [targetBiome, setTargetBiome] = useState<'Terrestrial' | 'Desert' | 'Ocean' | 'Ice' | 'Volcanic' | 'Jungle' | 'Crystalline'>('Terrestrial');
  const [colonyName, setColonyName] = useState<string>('');

  if (!isOpen) return null;

  const currentPlanet = planets.find((p) => p.id === selectedPlanetId) || planets[0] || {
    id: 'pl-homeworld',
    name: "Homeworld Earth (Tau'ri Command)",
    coordinate: '1:204:8',
    biome: 'Temperate Continental',
    level: 5,
    isHomeworld: true,
    fieldsUsed: 84,
    fieldsMax: 188,
    hasMoon: true,
    moonName: 'Luna Prime',
    foodStockpile: 35000,
    foodCapacity: 100000,
    foodProductionRate: 14200,
    foodConsumptionRate: 8200,
    waterStockpile: 48000,
    waterCapacity: 120000,
    waterProductionRate: 18500,
    waterConsumptionRate: 10000,
    population: {
      total: 14000000,
      growthRatePerHour: 24500,
      housingCapacity: 20000000,
      happiness: 90,
      unrest: 10,
      strata: {
        farmers: 2400000,
        hydrologists: 2400000,
        miners: 2800000,
        industrialWorkers: 2600000,
        scientists: 1400000,
        administrators: 800000,
        militaryRecruits: 1600000,
      },
      livingStandard: 'utopian',
      rationingLevel: 'abundant',
    },
  };

  const planetPop = currentPlanet.population?.total || 14000000;
  const strata = currentPlanet.population?.strata || {
    farmers: 2400000,
    hydrologists: 2400000,
    miners: 2800000,
    industrialWorkers: 2600000,
    scientists: 1400000,
    administrators: 800000,
    militaryRecruits: 1600000,
  };

  const foodStock = currentPlanet.foodStockpile ?? resources.food ?? 35000;
  const waterStock = currentPlanet.waterStockpile ?? resources.water ?? 48000;
  const fieldsUsed = currentPlanet.fieldsUsed || 84;
  const fieldsMax = currentPlanet.fieldsMax || 188;

  // 1. Mobilize Conscript Recruits
  const handleMobilizeRecruits = (count: number) => {
    const foodCost = Math.round(count * 4.5);
    const waterCost = Math.round(count * 4.5);
    const nqCost = Math.round(count * 25);

    if (foodStock < foodCost) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Insufficient Food reserves! Conscripting ${count.toLocaleString()} recruits requires ${foodCost.toLocaleString()} kg food supplies (Stock: ${foodStock.toLocaleString()} kg).`,
      });
      return;
    }

    if (waterStock < waterCost) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Insufficient Water rations! Conscripting ${count.toLocaleString()} recruits requires ${waterCost.toLocaleString()} kL hydration (Stock: ${waterStock.toLocaleString()} kL).`,
      });
      return;
    }

    if (resources.naquadah < nqCost) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Insufficient Naquadah for military induction logistics! Requires ${nqCost.toLocaleString()} NQ (Reserves: ${resources.naquadah.toLocaleString()} NQ).`,
      });
      return;
    }

    // Deduct resources & add recruits to untrainedUnits pool
    if (onUpdateResources) {
      onUpdateResources({
        untrainedUnits: (resources.untrainedUnits || 0) + count,
        naquadah: resources.naquadah - nqCost,
        food: Math.max(0, (resources.food || 0) - foodCost),
        water: Math.max(0, (resources.water || 0) - waterCost),
      });
    }

    // Update active planet stockpiles & strata
    if (onUpdatePlanets) {
      const updated = planets.map((p) => {
        if (p.id !== currentPlanet.id) return p;
        const currentRecruits = p.population?.strata?.militaryRecruits || 1600000;
        return {
          ...p,
          foodStockpile: Math.max(0, (p.foodStockpile || 35000) - foodCost),
          waterStockpile: Math.max(0, (p.waterStockpile || 48000) - waterCost),
          population: {
            ...p.population!,
            strata: {
              ...p.population!.strata,
              militaryRecruits: currentRecruits + count,
            },
          },
        };
      });
      onUpdatePlanets(updated);
    }

    sound.play('confirm');
    setFeedback({
      type: 'success',
      text: `🎖️ MOBILIZATION DECREE ENACTED: +${count.toLocaleString()} Conscript Recruits mustered into active untrained reserves! (Supplied with ${foodCost.toLocaleString()} kg Food & ${waterCost.toLocaleString()} kL Water)`,
    });
  };

  // 2. Demobilize Recruits back to Civilian Workforce
  const handleDemobilizeRecruits = (count: number) => {
    if ((resources.untrainedUnits || 0) < count) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Cannot demobilize ${count.toLocaleString()} recruits; you only have ${(resources.untrainedUnits || 0).toLocaleString()} untrained recruits in reserve.`,
      });
      return;
    }

    if (onUpdateResources) {
      onUpdateResources({
        untrainedUnits: (resources.untrainedUnits || 0) - count,
      });
    }

    if (onUpdatePlanets) {
      const updated = planets.map((p) => {
        if (p.id !== currentPlanet.id) return p;
        return {
          ...p,
          population: {
            ...p.population!,
            happiness: Math.min(100, (p.population?.happiness || 88) + 2),
            unrest: Math.max(0, (p.population?.unrest || 12) - 3),
            strata: {
              ...p.population!.strata,
              farmers: (p.population?.strata?.farmers || 2400000) + Math.round(count * 0.4),
              hydrologists: (p.population?.strata?.hydrologists || 2400000) + Math.round(count * 0.4),
              industrialWorkers: (p.population?.strata?.industrialWorkers || 2600000) + Math.round(count * 0.2),
            },
          },
        };
      });
      onUpdatePlanets(updated);
    }

    sound.play('confirm');
    setFeedback({
      type: 'success',
      text: `🕊️ DEMOBILIZATION COMPLETE: ${count.toLocaleString()} recruits returned to civilian agrarian, hydration, and industrial sectors! Civilian Morale boosted.`,
    });
  };

  // 3. Field Expansion Project
  const handleExpandFields = (type: 'wasteland' | 'terraformer' | 'subterranean') => {
    let costMetal = 0;
    let costCrystal = 0;
    let costDeut = 0;
    let costNQ = 0;
    let fieldGain = 4;
    let name = '';

    if (type === 'wasteland') {
      costMetal = 25000;
      costCrystal = 15000;
      fieldGain = 4;
      name = 'Surface Badlands & Wasteland Clearing';
    } else if (type === 'terraformer') {
      costMetal = 50000;
      costDeut = 35000;
      fieldGain = 6;
      name = 'Atmospheric Terraforming Dome Array';
    } else if (type === 'subterranean') {
      costMetal = 80000;
      costNQ = 40000;
      fieldGain = 8;
      name = 'Subterranean Geothermal Core Tunnels';
    }

    if (
      resources.metal < costMetal ||
      resources.crystal < costCrystal ||
      resources.deuterium < costDeut ||
      resources.naquadah < costNQ
    ) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Insufficient resources to construct "${name}"! Requires ${costMetal ? `${costMetal.toLocaleString()} Metal ` : ''}${costCrystal ? `${costCrystal.toLocaleString()} Crystal ` : ''}${costDeut ? `${costDeut.toLocaleString()} Deut ` : ''}${costNQ ? `${costNQ.toLocaleString()} NQ` : ''}`,
      });
      return;
    }

    if (onUpdateResources) {
      onUpdateResources({
        metal: resources.metal - costMetal,
        crystal: resources.crystal - costCrystal,
        deuterium: resources.deuterium - costDeut,
        naquadah: resources.naquadah - costNQ,
      });
    }

    if (onUpdatePlanets) {
      const updated = planets.map((p) => {
        if (p.id !== currentPlanet.id) return p;
        return {
          ...p,
          fieldsMax: (p.fieldsMax || 188) + fieldGain,
        };
      });
      onUpdatePlanets(updated);
    }

    sound.play('research');
    setFeedback({
      type: 'success',
      text: `🏗️ EXPANSION SUCCESS: "${name}" completed on ${currentPlanet.name}! Maximum planetary building capacity increased by +${fieldGain} Fields (New: ${(fieldsMax + fieldGain)} Max Fields).`,
    });
  };

  // 4. Emergency Food / Water Relief Synthesis
  const handleEmergencyLifeSupport = (type: 'food' | 'water') => {
    const deutCost = 5000;
    const nqCost = 8000;

    if (resources.deuterium < deutCost || resources.naquadah < nqCost) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Emergency Life Support Synthesis requires 5,000 Deuterium and 8,000 Naquadah.`,
      });
      return;
    }

    if (onUpdateResources) {
      onUpdateResources({
        deuterium: resources.deuterium - deutCost,
        naquadah: resources.naquadah - nqCost,
        food: type === 'food' ? (resources.food || 0) + 12000 : resources.food,
        water: type === 'water' ? (resources.water || 0) + 15000 : resources.water,
      });
    }

    if (onUpdatePlanets) {
      const updated = planets.map((p) => {
        if (p.id !== currentPlanet.id) return p;
        return {
          ...p,
          foodStockpile: type === 'food' ? (p.foodStockpile || 35000) + 12000 : p.foodStockpile,
          waterStockpile: type === 'water' ? (p.waterStockpile || 48000) + 15000 : p.waterStockpile,
        };
      });
      onUpdatePlanets(updated);
    }

    sound.play('confirm');
    setFeedback({
      type: 'success',
      text: type === 'food'
        ? '🌾 Hydroponic Synthesis Pods activated: +12,000 kg Emergency Nutrient Rations dispatched!'
        : '🚰 Deep Aquifer Condensers flushed: +15,000 kL Purified Hydration injected into municipal grid!',
    });
  };

  // 5. Establish Colony Action
  const handleEstablishColony = () => {
    const deutCost = 10000;
    const crystalCost = 15000;

    if (resources.deuterium < deutCost || resources.crystal < crystalCost) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Establishing a new planetary colony requires 10,000 Deuterium and 15,000 Crystal.`,
      });
      return;
    }

    const nextGalaxy = 1;
    const nextSystem = 100 + planets.length * 4;
    const nextPosition = ((planets.length * 3) % 12) + 1;
    const newCoord = `${nextGalaxy}:${nextSystem}:${nextPosition}`;
    const targetName = colonyName.trim() || `New ${targetBiome} Prime [${newCoord}]`;

    if (onColonizePlanet) {
      const res = onColonizePlanet(newCoord, targetBiome, targetName);
      if (res.success) {
        sound.play('confirm');
        setFeedback({
          type: 'success',
          text: `🚀 COLONIAL EXPANSION COMMENCED: ${targetName} established! Seeded with 1.2M initial colonists, 160 fields, and food/water life support grid.`,
        });
        setColonyName('');
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } else if (onUpdatePlanets) {
      // Fallback colony creation
      const newPlanet: PlanetColony = {
        id: `pl-${Date.now()}`,
        name: targetName,
        coordinate: newCoord,
        biome: targetBiome,
        level: 1,
        incomeBonus: 8500,
        defenseBonus: 12000,
        maintenanceCost: 1500,
        jumpGateLevel: 0,
        fieldsUsed: 14,
        fieldsMax: 165,
        temperature: targetBiome === 'Ice' ? '-80°C' : targetBiome === 'Desert' ? '+55°C' : '+20°C',
        diameterKm: 11200,
        hasMoon: true,
        moonName: `${targetName} Minor`,
        foodStockpile: 20000,
        foodCapacity: 60000,
        foodProductionRate: 5000,
        foodConsumptionRate: 3000,
        waterStockpile: 25000,
        waterCapacity: 75000,
        waterProductionRate: 6500,
        waterConsumptionRate: 3800,
        population: {
          total: 1200000,
          growthRatePerHour: 8000,
          housingCapacity: 4000000,
          happiness: 85,
          unrest: 8,
          strata: {
            farmers: 200000,
            hydrologists: 200000,
            miners: 300000,
            industrialWorkers: 250000,
            scientists: 100000,
            administrators: 50000,
            militaryRecruits: 100000,
          },
          livingStandard: 'utopian',
          rationingLevel: 'abundant',
        },
      };

      if (onUpdateResources) {
        onUpdateResources({
          deuterium: resources.deuterium - deutCost,
          crystal: resources.crystal - crystalCost,
          totalPopulation: (resources.totalPopulation || 14000000) + 1200000,
        });
      }

      onUpdatePlanets([...planets, newPlanet]);
      sound.play('confirm');
      setFeedback({
        type: 'success',
        text: `🚀 COLONIAL EXPANSION COMMENCED: ${targetName} established! Seeded with 1.2M initial colonists, 165 fields, and food/water life support grid.`,
      });
      setColonyName('');
    }
  };

  // 6. Colonize / Upgrade Attached Moon
  const handleUpgradeMoon = () => {
    const metalCost = 45000;
    const crystalCost = 30000;
    const deutCost = 15000;

    if (resources.metal < metalCost || resources.crystal < crystalCost || resources.deuterium < deutCost) {
      sound.play('warning');
      setFeedback({
        type: 'error',
        text: `Expanding Lunar Base on ${currentPlanet.moonName || 'Attached Moon'} requires 45k Metal, 30k Crystal, and 15k Deuterium.`,
      });
      return;
    }

    if (onUpdateResources) {
      onUpdateResources({
        metal: resources.metal - metalCost,
        crystal: resources.crystal - crystalCost,
        deuterium: resources.deuterium - deutCost,
      });
    }

    if (onUpdatePlanets) {
      const updated = planets.map((p) => {
        if (p.id !== currentPlanet.id) return p;
        const curMoon = p.lunarBase || {
          level: 1,
          sensorPhalanxLevel: 1,
          jumpGateLevel: 0,
          moonFieldsUsed: 4,
          moonFieldsMax: 16,
        };
        return {
          ...p,
          hasMoon: true,
          moonName: p.moonName || `${p.name} Moon Alpha`,
          lunarBase: {
            ...curMoon,
            level: curMoon.level + 1,
            moonFieldsMax: (curMoon.moonFieldsMax || 16) + 4,
          },
        };
      });
      onUpdatePlanets(updated);
    }

    sound.play('confirm');
    setFeedback({
      type: 'success',
      text: `🌙 LUNAR BASE EXPANDED: ${currentPlanet.moonName || 'Lunar Base'} advanced to Tier ${(currentPlanet.lunarBase?.level || 1) + 1}! Sensor Phalanx range extended and +4 Lunar Fields unlocked.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white border-2 border-[#111111] shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[2px] text-indigo-300 font-bold">
                  CIVILIAN DEMOGRAPHICS & MILITARY CONSCRIPTION NEXUS
                </span>
                <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold rounded-2xs">
                  {currentPlanet.isHomeworld ? '👑 SOVEREIGN HOMEWORLD (14.0M POP)' : 'DOMINION COLONY'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{currentPlanet.name}</span>
                <span className="text-xs font-mono font-normal text-neutral-300">[{currentPlanet.coordinate}]</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* World Switcher Dropdown */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/20 text-xs font-mono">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">World:</span>
              <select
                value={currentPlanet.id}
                onChange={(e) => setSelectedPlanetId(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
              >
                {planets.map((p) => (
                  <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                    {p.name} {p.isHomeworld ? '👑 (14M Capital)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xs transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Global Summary Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 divide-x divide-neutral-200 border-b border-neutral-200 bg-neutral-50 text-xs font-mono shrink-0">
          <div className="p-3">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">Civilian Population</span>
            <div className="flex items-baseline gap-1">
              <strong className="text-base text-indigo-950 font-bold">
                {(planetPop / 1000000).toFixed(2)}M
              </strong>
              <span className="text-[10px] text-neutral-500">citizens</span>
            </div>
            <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">
              +{(currentPlanet.population?.growthRatePerHour || 24500).toLocaleString()}/h growth
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">Conscript Recruits</span>
            <div className="flex items-baseline gap-1">
              <strong className="text-base text-amber-900 font-bold">
                {(resources.untrainedUnits || 1600).toLocaleString()}
              </strong>
              <span className="text-[10px] text-neutral-500">units</span>
            </div>
            <span className="text-[9px] text-indigo-700 font-semibold block mt-0.5">
              +{(resources.unitProduction || 12)}/turn draft
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">Food Reserves</span>
            <div className="flex items-baseline gap-1">
              <strong className="text-base text-emerald-950 font-bold">
                {foodStock.toLocaleString()}
              </strong>
              <span className="text-[10px] text-neutral-500">kg</span>
            </div>
            <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">
              +60/t (+3.6k/h net)
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">Water Stockpile</span>
            <div className="flex items-baseline gap-1">
              <strong className="text-base text-cyan-950 font-bold">
                {waterStock.toLocaleString()}
              </strong>
              <span className="text-[10px] text-neutral-500">kL</span>
            </div>
            <span className="text-[9px] text-cyan-700 font-semibold block mt-0.5">
              +75/t (+4.5k/h net)
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">Building Fields</span>
            <div className="flex items-baseline gap-1">
              <strong className="text-base text-neutral-900 font-bold">
                {fieldsUsed} / {fieldsMax}
              </strong>
            </div>
            <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">
              {fieldsMax - fieldsUsed} Free Slots
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">Attached Moon</span>
            <div className="flex items-baseline gap-1">
              <strong className="text-sm text-neutral-900 font-bold truncate">
                {currentPlanet.moonName || 'Luna Prime'}
              </strong>
            </div>
            <span className="text-[9px] text-indigo-700 font-semibold block mt-0.5">
              Tier {currentPlanet.lunarBase?.level || 2} Base Active
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-300 bg-white px-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('conscripts');
            }}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'conscripts'
                ? 'border-indigo-600 text-indigo-900 bg-indigo-50/50'
                : 'border-transparent text-neutral-600 hover:text-black'
            }`}
          >
            <Crosshair size={14} className="text-indigo-600" />
            <span>Conscript Recruits & Mobilization</span>
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('food-water');
            }}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'food-water'
                ? 'border-emerald-600 text-emerald-950 bg-emerald-50/50'
                : 'border-transparent text-neutral-600 hover:text-black'
            }`}
          >
            <Wheat size={14} className="text-emerald-600" />
            <span>Food & Water Life Support Synergy</span>
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('fields');
            }}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'fields'
                ? 'border-neutral-900 text-black bg-neutral-100/60'
                : 'border-transparent text-neutral-600 hover:text-black'
            }`}
          >
            <Layers size={14} />
            <span>Planetary Fields & Land Reclamation</span>
          </button>

          <button
            onClick={() => {
              sound.play('click');
              setActiveTab('colonize');
            }}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'colonize'
                ? 'border-blue-600 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-neutral-600 hover:text-black'
            }`}
          >
            <Rocket size={14} className="text-blue-600" />
            <span>Colonize Planets & Lunar Outposts</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : feedback.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-indigo-50 border-indigo-300 text-indigo-900'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs font-bold text-neutral-600 hover:text-black cursor-pointer ml-3"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CONSCRIPT RECRUITS & MOBILIZATION */}
          {activeTab === 'conscripts' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 via-white to-neutral-50 border border-indigo-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                      <Shield size={16} className="text-indigo-600" />
                      <span>Homeworld 14.0M Population & Military Draft Infrastructure</span>
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed max-w-3xl">
                      Each citizen drafted into active service requires dedicated caloric sustenance (Food) and hydration filtration (Water) to maintain high battle readiness and social stability. Drafted recruits join your <strong>Untrained Recruits Pool</strong>, where they can be deployed into combat divisions, mining corps, or specialized reconnaissance cadres.
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Active Untrained Pool</span>
                    <strong className="text-xl font-bold font-mono text-indigo-900">
                      {(resources.untrainedUnits || 1600).toLocaleString()} Recruits
                    </strong>
                  </div>
                </div>
              </div>

              {/* Mobilization Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Standard Cohort */}
                <div className="border border-neutral-300 bg-white p-4 flex flex-col justify-between hover:border-indigo-500 transition-all shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase bg-indigo-50 px-1.5 py-0.5 border border-indigo-200">
                        COHORT LEVEL I
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-700">+100 Recruits</span>
                    </div>
                    <h4 className="font-bold text-neutral-900 text-sm">Garrison Muster</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Musters 100 disciplined recruits from metropolitan defense academies.
                    </p>
                    <div className="mt-3 pt-2 border-t border-neutral-100 space-y-1 text-[11px] font-mono text-neutral-600">
                      <div className="flex justify-between">
                        <span>Food Rations:</span>
                        <span className="font-bold text-emerald-800">450 kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Rations:</span>
                        <span className="font-bold text-cyan-800">450 kL</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logistics Cost:</span>
                        <span className="font-bold text-amber-800">2,500 NQ</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMobilizeRecruits(100)}
                    className="mt-4 w-full py-2 bg-neutral-900 text-white hover:bg-indigo-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Muster 100 Recruits
                  </button>
                </div>

                {/* 2. Brigade */}
                <div className="border border-neutral-300 bg-white p-4 flex flex-col justify-between hover:border-indigo-500 transition-all shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase bg-indigo-50 px-1.5 py-0.5 border border-indigo-200">
                        BRIGADE LEVEL II
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-700">+500 Recruits</span>
                    </div>
                    <h4 className="font-bold text-neutral-900 text-sm">Legion Brigade Draft</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Mobilizes 500 combat-ready recruits from regional military academies.
                    </p>
                    <div className="mt-3 pt-2 border-t border-neutral-100 space-y-1 text-[11px] font-mono text-neutral-600">
                      <div className="flex justify-between">
                        <span>Food Rations:</span>
                        <span className="font-bold text-emerald-800">2,250 kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Rations:</span>
                        <span className="font-bold text-cyan-800">2,250 kL</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logistics Cost:</span>
                        <span className="font-bold text-amber-800">12,500 NQ</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMobilizeRecruits(500)}
                    className="mt-4 w-full py-2 bg-neutral-900 text-white hover:bg-indigo-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Muster 500 Recruits
                  </button>
                </div>

                {/* 3. Division */}
                <div className="border border-indigo-300 bg-indigo-50/20 p-4 flex flex-col justify-between hover:border-indigo-600 transition-all shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-900 uppercase bg-indigo-100 px-1.5 py-0.5 border border-indigo-300">
                        DIVISION LEVEL III
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-950">+1,000 Recruits</span>
                    </div>
                    <h4 className="font-bold text-neutral-900 text-sm">Planetary Defense Division</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Full-scale conscription decree calling up 1,000 reservists across the globe.
                    </p>
                    <div className="mt-3 pt-2 border-t border-indigo-100 space-y-1 text-[11px] font-mono text-neutral-600">
                      <div className="flex justify-between">
                        <span>Food Rations:</span>
                        <span className="font-bold text-emerald-800">4,500 kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Rations:</span>
                        <span className="font-bold text-cyan-800">4,500 kL</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logistics Cost:</span>
                        <span className="font-bold text-amber-800">25,000 NQ</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMobilizeRecruits(1000)}
                    className="mt-4 w-full py-2 bg-indigo-900 text-white hover:bg-indigo-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Muster 1,000 Recruits
                  </button>
                </div>

                {/* 4. Mass Mobilization */}
                <div className="border border-amber-300 bg-amber-50/20 p-4 flex flex-col justify-between hover:border-amber-600 transition-all shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-amber-900 uppercase bg-amber-100 px-1.5 py-0.5 border border-amber-300">
                        EMERGENCY EDICT
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-950">+5,000 Recruits</span>
                    </div>
                    <h4 className="font-bold text-neutral-900 text-sm">Imperial Wartime Conscription</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Emergency war council proclamation: 5,000 conscripts mobilized immediately.
                    </p>
                    <div className="mt-3 pt-2 border-t border-amber-100 space-y-1 text-[11px] font-mono text-neutral-600">
                      <div className="flex justify-between">
                        <span>Food Rations:</span>
                        <span className="font-bold text-emerald-800">22,500 kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Rations:</span>
                        <span className="font-bold text-cyan-800">22,500 kL</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logistics Cost:</span>
                        <span className="font-bold text-amber-800">125,000 NQ</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMobilizeRecruits(5000)}
                    className="mt-4 w-full py-2 bg-amber-700 text-white hover:bg-amber-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Muster 5,000 Recruits
                  </button>
                </div>
              </div>

              {/* Demobilization & Training Roster Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-neutral-300 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                      <UserCheck size={16} className="text-emerald-700" />
                      <span>Civilian Demobilization Protocol</span>
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      MORALE BOOST
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Stand down soldiers back into planetary agriculture (Farmers), water filtration (Hydrologists), or manufacturing (Industrial Workers) to decrease civil unrest and increase production yields.
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleDemobilizeRecruits(100)}
                      disabled={(resources.untrainedUnits || 0) < 100}
                      className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 font-bold text-xs cursor-pointer disabled:opacity-50"
                    >
                      Disband 100 Units
                    </button>
                    <button
                      onClick={() => handleDemobilizeRecruits(500)}
                      disabled={(resources.untrainedUnits || 0) < 500}
                      className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 font-bold text-xs cursor-pointer disabled:opacity-50"
                    >
                      Disband 500 Units
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-indigo-200 bg-indigo-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                      <Award size={16} className="text-indigo-600" />
                      <span>Military Training & Unit Specialization</span>
                    </h4>
                    <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 border border-indigo-300">
                      TRAINING DECK
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Untrained conscript recruits are converted into frontline combat units (Attack Infantry, Heavy Defense Sentinels, Naquadah Miners, and Intelligence Agents) in the Imperial Academy.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('training');
                      }}
                      className="w-full py-2 bg-indigo-900 text-white hover:bg-indigo-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Open Military Training Academy →</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FOOD & WATER LIFE SUPPORT SYNERGY */}
          {activeTab === 'food-water' && (
            <div className="space-y-6">
              {/* Equation Dossier */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                      <Wheat size={16} className="text-emerald-700" />
                      <span>Colonial Nutrition & Hydration Sustenance Models</span>
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1 max-w-3xl leading-relaxed">
                      Sovereign Homeworld Earth sustains <strong>14.0 Million Citizens</strong> and active military conscripts through orbital bio-domes and planetary aquifer pumps. As long as food and water reserves remain above critical minimums, population growth operates at +24.5k/hour and colonial plunge stays suppressed at 8%.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold font-mono">
                      Nominal Biosphere (100% Saturation)
                    </span>
                  </div>
                </div>
              </div>

              {/* Food & Water Side-by-Side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Food Details */}
                <div className="p-5 border border-emerald-200 bg-white space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 text-emerald-800">
                        <Wheat size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">Hydroponic Crop Stockpile</h4>
                        <span className="text-[10px] text-neutral-500 uppercase font-mono">Life Support Layer 1</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="text-lg font-bold font-mono text-emerald-950">
                        {foodStock.toLocaleString()} kg
                      </strong>
                      <span className="text-[10px] text-neutral-500 block">/ 100,000 kg cap</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">Production Rate:</span>
                      <span className="font-bold text-emerald-700">+14,200 kg/hour (Farmers Strata)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">Civilian Consumption (14M Pop):</span>
                      <span className="font-bold text-neutral-800">-8,200 kg/hour</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">Conscript Rations Usage:</span>
                      <span className="font-bold text-neutral-800">-450 kg/recruitment run</span>
                    </div>
                    <div className="flex justify-between py-1 bg-emerald-50/50 px-2 font-bold">
                      <span className="text-emerald-900">Net Stockpile Surplus:</span>
                      <span className="text-emerald-700">+6,000 kg/hour surplus</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEmergencyLifeSupport('food')}
                    className="w-full py-2 bg-emerald-800 text-white hover:bg-emerald-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Deploy Emergency Food Aid (+12,000 kg)
                  </button>
                </div>

                {/* Water Details */}
                <div className="p-5 border border-cyan-200 bg-white space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-cyan-100 text-cyan-800">
                        <Droplet size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">Deep Aquifer & Moisture Grid</h4>
                        <span className="text-[10px] text-neutral-500 uppercase font-mono">Life Support Layer 2</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="text-lg font-bold font-mono text-cyan-950">
                        {waterStock.toLocaleString()} kL
                      </strong>
                      <span className="text-[10px] text-neutral-500 block">/ 120,000 kL cap</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">Aquifer Pump Rate:</span>
                      <span className="font-bold text-cyan-700">+18,500 kL/hour (Hydrologists Strata)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">Civilian Consumption (14M Pop):</span>
                      <span className="font-bold text-neutral-800">-10,000 kL/hour</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">Soldier Hydration Demand:</span>
                      <span className="font-bold text-neutral-800">-450 kL/recruitment run</span>
                    </div>
                    <div className="flex justify-between py-1 bg-cyan-50/50 px-2 font-bold">
                      <span className="text-cyan-900">Net Stockpile Surplus:</span>
                      <span className="text-cyan-700">+8,500 kL/hour surplus</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEmergencyLifeSupport('water')}
                    className="w-full py-2 bg-cyan-800 text-white hover:bg-cyan-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Activate Aquifer Surge (+15,000 kL)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLANETARY FIELDS & LAND RECLAMATION */}
          {activeTab === 'fields' && (
            <div className="space-y-6">
              {/* Field Usage Header */}
              <div className="p-4 border border-neutral-300 bg-neutral-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                      <Layers size={16} />
                      <span>Planetary Land Capacity: {currentPlanet.name}</span>
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Available surface fields determine how many industrial facilities, bio-domes, mines, and defense matrices can be built simultaneously.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-neutral-900">
                      {fieldsUsed} / {fieldsMax} Fields Used ({Math.round((fieldsUsed / fieldsMax) * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Visual Progress Gauge */}
                <div className="w-full h-3 bg-neutral-200 overflow-hidden rounded-2xs flex">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-emerald-600 transition-all duration-300"
                    style={{ width: `${Math.round((fieldsUsed / fieldsMax) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-500 mt-1">
                  <span>84 Developed Sectors</span>
                  <span>{fieldsMax - fieldsUsed} Undeveloped Free Sectors Available</span>
                </div>
              </div>

              {/* Expansion Projects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Clear Wastelands */}
                <div className="p-4 border border-neutral-300 bg-white flex flex-col justify-between hover:border-black transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                        SURFACE CIVIL WORKS
                      </span>
                      <strong className="text-xs font-mono text-neutral-900">+4 Max Fields</strong>
                    </div>
                    <h4 className="font-bold text-neutral-900 text-sm">Clear Surface Badlands</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Removes volcanic basalt and crater debris to open 4 new planetary building plots.
                    </p>
                    <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] font-mono space-y-1 text-neutral-600">
                      <div className="flex justify-between">
                        <span>Metal:</span>
                        <span className="font-bold text-neutral-900">25,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Crystal:</span>
                        <span className="font-bold text-neutral-900">15,000</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleExpandFields('wasteland')}
                    className="mt-4 w-full py-2 bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Clear Badlands (+4 Fields)
                  </button>
                </div>

                {/* 2. Terraforming Array */}
                <div className="p-4 border border-neutral-300 bg-white flex flex-col justify-between hover:border-black transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 border border-cyan-200">
                        ATMOSPHERIC SHIELD
                      </span>
                      <strong className="text-xs font-mono text-neutral-900">+6 Max Fields</strong>
                    </div>
                    <h4 className="font-bold text-neutral-900 text-sm">Terraformer Dome Array</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Erects pressurized environmental domes across hostile tundra/desert zones.
                    </p>
                    <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] font-mono space-y-1 text-neutral-600">
                      <div className="flex justify-between">
                        <span>Metal:</span>
                        <span className="font-bold text-neutral-900">50,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deuterium:</span>
                        <span className="font-bold text-neutral-900">35,000</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleExpandFields('terraformer')}
                    className="mt-4 w-full py-2 bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Build Domes (+6 Fields)
                  </button>
                </div>

                {/* 3. Deep Core Excavation */}
                <div className="p-4 border border-neutral-300 bg-white flex flex-col justify-between hover:border-black transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 border border-amber-200">
                        DEEP CORE ENGINEERING
                      </span>
                      <strong className="text-xs font-mono text-neutral-900">+8 Max Fields</strong>
                    </div>
                    <h4 className="font-bold text-neutral-900 text-sm">Subterranean Tunnels</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Carves deep planetary chambers into the mantle for subterranean installations.
                    </p>
                    <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] font-mono space-y-1 text-neutral-600">
                      <div className="flex justify-between">
                        <span>Metal:</span>
                        <span className="font-bold text-neutral-900">80,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Naquadah:</span>
                        <span className="font-bold text-neutral-900">40,000</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleExpandFields('subterranean')}
                    className="mt-4 w-full py-2 bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Excavate Mantle (+8 Fields)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COLONIZE PLANETS & LUNAR OUTPOSTS */}
          {activeTab === 'colonize' && (
            <div className="space-y-6">
              {/* Colonization Hub */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 cols: Colonize New World */}
                <div className="lg:col-span-7 p-5 border border-neutral-300 bg-white space-y-4">
                  <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
                    <Rocket className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">Found New Planetary Colony</h4>
                      <p className="text-xs text-neutral-500">
                        Expend Deuterium and Crystal to establish an imperial settlement in an uncharted star sector.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                        Select Target Biosphere / World Type:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['Terrestrial', 'Desert', 'Ocean', 'Ice', 'Volcanic', 'Jungle', 'Crystalline'] as const).map((biome) => (
                          <button
                            key={biome}
                            type="button"
                            onClick={() => setTargetBiome(biome)}
                            className={`p-2 text-left border text-xs font-bold transition-all cursor-pointer ${
                              targetBiome === biome
                                ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs'
                                : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            <span className="block truncate">{biome}</span>
                            <span className={`text-[9px] block font-normal ${targetBiome === biome ? 'text-indigo-200' : 'text-neutral-500'}`}>
                              {biome === 'Terrestrial' ? '+15% Metal' : biome === 'Ocean' ? '+40% Deut' : biome === 'Desert' ? '+30% Cryst' : '+Special'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">
                        Colony Designation Name:
                      </label>
                      <input
                        type="text"
                        value={colonyName}
                        onChange={(e) => setColonyName(e.target.value)}
                        placeholder={`e.g. New ${targetBiome} Vanguard`}
                        className="w-full px-3 py-2 border border-neutral-300 text-xs font-bold text-neutral-900 bg-white outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span>Required Deuterium Fuel:</span>
                        <span className="font-bold text-neutral-900">10,000 Deut</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Required Structural Crystal:</span>
                        <span className="font-bold text-neutral-900">15,000 Crystal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Colony Starter Package:</span>
                        <span className="font-bold text-emerald-700">1.2M Citizens · 165 Fields · Food/Water Grid</span>
                      </div>
                    </div>

                    <button
                      onClick={handleEstablishColony}
                      className="w-full py-2.5 bg-indigo-900 text-white hover:bg-indigo-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Rocket size={14} />
                      <span>Launch Colony Ship & Settle {targetBiome} World</span>
                    </button>
                  </div>
                </div>

                {/* Right 5 cols: Moon Colonization */}
                <div className="lg:col-span-5 p-5 border border-indigo-200 bg-indigo-50/20 space-y-4">
                  <div className="flex items-center gap-2 border-b border-indigo-200 pb-3">
                    <Radio className="w-5 h-5 text-indigo-700" />
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">Attached Moon: {currentPlanet.moonName || 'Luna Prime'}</h4>
                      <p className="text-xs text-neutral-500">
                        Orbital sensor station & jump gate platform.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 bg-white border border-indigo-100 flex items-center justify-between">
                      <span className="text-neutral-600">Lunar Base Level:</span>
                      <strong className="text-neutral-900">Tier {currentPlanet.lunarBase?.level || 2}</strong>
                    </div>
                    <div className="p-2.5 bg-white border border-indigo-100 flex items-center justify-between">
                      <span className="text-neutral-600">Sensor Phalanx:</span>
                      <strong className="text-neutral-900">Tier {currentPlanet.lunarBase?.sensorPhalanxLevel || 3} (5 Radii Scan)</strong>
                    </div>
                    <div className="p-2.5 bg-white border border-indigo-100 flex items-center justify-between">
                      <span className="text-neutral-600">Subspace Jump Gate:</span>
                      <strong className="text-neutral-900">{currentPlanet.jumpGateLevel ? 'Operational' : 'Ready to Build'}</strong>
                    </div>
                    <div className="p-2.5 bg-white border border-indigo-100 flex items-center justify-between">
                      <span className="text-neutral-600">Lunar Building Fields:</span>
                      <strong className="text-neutral-900">6 / 16 Fields Used</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleUpgradeMoon}
                      className="w-full py-2 bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Expand Lunar Base & Phalanx (+4 Fields)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono text-neutral-600 flex items-center gap-3">
            <span>Empire Total: <strong>{(resources.totalPopulation || 14000000).toLocaleString()} Citizens</strong></span>
            <span>·</span>
            <span>Untrained Reserve: <strong>{(resources.untrainedUnits || 1600).toLocaleString()} Recruits</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onNavigate) onNavigate('planets');
              }}
              className="px-3.5 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Full Planets Dossier →
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

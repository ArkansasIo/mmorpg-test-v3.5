import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  Sparkles,
  User,
  Cpu,
  Database,
  Shield,
  Zap,
  Clock,
  Globe,
  Play,
  Pause,
  AlertTriangle,
  Info,
  ChevronDown,
  Layers,
  Droplet,
  Gem,
  Coins,
  Radio,
  ExternalLink,
  Crown,
  Check,
  Building,
  Flame,
  Sliders,
  Rocket,
  Palette,
  Wheat,
  Users,
  AlertOctagon,
  TrendingDown,
  TrendingUp,
  Activity,
  CreditCard,
  Award,
  Menu,
  Crosshair,
  Settings,
} from 'lucide-react';
import { sound } from '../sound';
import { PlayerProfile, PlayerResources, PlanetColony } from '../types';
import { getAdminAuthSession } from '../config/adminAuthConfig';
import { GalacticCreditsModal } from './modals/GalacticCreditsModal';
import { ConscriptRecruitsModal } from './modals/ConscriptRecruitsModal';

interface TopbarProps {
  activeRoute: string;
  profile: PlayerProfile;
  resources: PlayerResources;
  planets?: PlanetColony[];
  activePlanetId?: string;
  onSelectPlanet?: (planetId: string) => void;
  cronAutoTickEnabled?: boolean;
  nextTickSeconds?: number;
  netIncome?: number;
  bankCapacity?: number;
  onProcessTurn: (count?: number) => void;
  onUpdateAllSystems?: () => void;
  onResetGame?: () => void;
  onNavigate?: (route: string) => void;
  onOpenPatchNotes?: () => void;
  onOpenUpdateInfo?: () => void;
  onOpenCredits?: () => void;
  onToggleMobileMenu?: () => void;
  onUpdateResources?: (res: Partial<PlayerResources>) => void;
  onUpdatePlanets?: (planets: PlanetColony[]) => void;
  onColonizePlanet?: (coordinate: string, biome: string, name: string) => { success: boolean; message: string };
}

const ROUTE_LABELS: Record<string, { section: string; title: string }> = {
  dashboard: { section: 'COMMAND CENTER', title: 'Dashboard Overview' },
  'commander-hq': { section: 'COMMAND CENTER', title: 'Commander HQ, Officers & Doctrines' },
  'player-profile': { section: 'COMMAND CENTER', title: 'Sovereign Player Profile & Realm Dossier' },
  'account-info': { section: 'COMMAND CENTER', title: 'Commander Information' },
  resources: { section: 'COMMAND CENTER', title: 'Naquadah Reserves & Vault' },
  income: { section: 'COMMAND CENTER', title: 'Planetary Income Models' },
  'military-stats': { section: 'COMMAND CENTER', title: 'Military Strength & DefCon' },
  targets: { section: 'ATTACK & COMBAT', title: 'Target Realms' },
  'planetary-invasion': { section: 'ATTACK & COMBAT', title: 'Planetary Invasion & Ground Siege' },
  spy: { section: 'ATTACK & COMBAT', title: 'Covert Reconnaissance' },
  sabotage: { section: 'ATTACK & COMBAT', title: 'Covert Sabotage' },
  'attack-log': { section: 'ATTACK & COMBAT', title: 'Battle Engagements Log' },
  weapons: { section: 'ARMORY ARSENAL', title: 'Weapons Inventory' },
  armors: { section: 'ARMORY ARSENAL', title: 'Armors & Combat Vehicles' },
  shields: { section: 'ARMORY ARSENAL', title: 'Deflector Shields & Barriers' },
  'weapon-market': { section: 'ARMORY ARSENAL', title: 'Arms Exchange' },
  repair: { section: 'ARMORY ARSENAL', title: 'Weapon Repair Facility' },
  universe: { section: 'ORBITAL SHIPYARD', title: 'Universe Galaxy Map' },
  units: { section: 'PERSONNEL & TRAINING', title: 'Troop Training' },
  miners: { section: 'PERSONNEL & TRAINING', title: 'Industrial Workforce' },
  'super-units': { section: 'PERSONNEL & TRAINING', title: 'Elite Super Units' },
  'unit-production': { section: 'PERSONNEL & TRAINING', title: 'Population Generation' },
  'unit-roster-90': { section: 'PERSONNEL & TRAINING', title: '90-Class Unit Roster' },
  'workforce-academy': { section: 'WORKFORCE & ACADEMY', title: 'Workforce Recruitment & Specialized Academy' },
  'military-barracks': { section: 'MILITARY BARRACKS', title: 'Ground Forces & Unit Enlistment Facilities (90 Classes)' },
  'academy-enlistment': { section: 'WORKFORCE & ACADEMY', title: 'Imperial Enlistment & Academy Specialization' },
  'workforce-roster': { section: 'WORKFORCE & ACADEMY', title: '90-Role Imperial Workforce Roster' },
  'academy-wings': { section: 'WORKFORCE & ACADEMY', title: '6 Specialized Academy Wings' },
  'academy-drills': { section: 'WORKFORCE & ACADEMY', title: 'Academy Drills, Readiness & Auto-Draft' },
  'tech-tree': { section: 'TECHNOLOGY ARCHIVE', title: 'Master Technology Tree & Visual Unlock Graph' },
  'tech-library': { section: 'TECHNOLOGY ARCHIVE', title: 'Research Library & Laboratory Focus' },
  'eve-blueprints': { section: 'TECHNOLOGY ARCHIVE', title: 'EVE Blueprints & ME/TE' },
  'blueprint-fabricator': { section: 'FACILITIES & FABRICATION', title: 'Structure Blueprint Fabricator (45 Blueprints)' },
  'construction-yards': { section: 'FACILITIES & FABRICATION', title: 'Construction Yards & Fields Allocation' },
  'tech-offense': { section: 'TECHNOLOGY ARCHIVE', title: 'Offensive Research' },
  'tech-defense': { section: 'TECHNOLOGY ARCHIVE', title: 'Defensive Grids' },
  'tech-covert': { section: 'TECHNOLOGY ARCHIVE', title: 'Covert Operations Tech' },
  'tech-anti-covert': { section: 'TECHNOLOGY ARCHIVE', title: 'Subspace Counter-Sensors' },
  factories: { section: 'INDUSTRIAL COMPLEX', title: 'Planetary Mines & Nanite Factories' },
  shipyard: { section: 'ORBITAL SHIPYARD', title: 'Orbital Shipyard & Fleet Drydocks' },
  'space-stations': { section: 'ORBITAL SHIPYARD', title: 'Orbital Starbases & Space Stations' },
  defenses: { section: 'PLANETARY DEFENSE', title: 'Planetary Defense Grid Matrix' },
  expeditions: { section: 'DEEP SPACE MISSIONS', title: 'Deep Space Expeditions & Anomalies' },
  megastructures: { section: 'STELLAR ENGINEERING', title: 'Stellar Megastructure Projects' },
  'nms-universe': { section: 'DEEP SPACE MISSIONS', title: "No Man's Sky Procedural Universe" },
  'stargate-network': { section: 'DEEP SPACE MISSIONS', title: 'Stargate & Interstellar Jump Gates' },
  'stargate-telemetry': { section: 'DEEP SPACE MISSIONS', title: 'Gate Room Telemetry & Dispatches (1,000 Events)' },
  'stargate-relics': { section: 'DEEP SPACE MISSIONS', title: 'Stargate Relics & TV/Movie Artifact Citadel' },
  'spy-log': { section: 'INTELLIGENCE BUREAU', title: 'Covert Missions History' },
  'enemy-intelligence': { section: 'INTELLIGENCE BUREAU', title: 'Enemy Intel Reports' },
  'resource-exchange': { section: 'COMMERCE & LOGISTICS', title: 'Resource Market' },
  'mercenary-market': { section: 'COMMERCE & LOGISTICS', title: 'Mercenary Guild' },
  'bank-vault': { section: 'COMMERCE & LOGISTICS', title: 'Imperial Bank & Vault' },
  rankings: { section: 'GALACTIC COUNCIL', title: 'Realm Leaderboards' },
  alliances: { section: 'GALACTIC COUNCIL', title: 'Alliances & Coalitions' },
  messages: { section: 'GALACTIC COUNCIL', title: 'Subspace Communications' },
  'planet-list': { section: 'WORLDS & COLONIES', title: 'Colonial Registry' },
  'planet-bonuses': { section: 'WORLDS & COLONIES', title: 'Planetary Modifiers' },
  'planet-defenses': { section: 'WORLDS & COLONIES', title: 'Orbital Defense Cannons' },
  'planet-power': { section: 'WORLDS & COLONIES', title: 'Planetary Power Grid' },
  'moon-bases': { section: 'WORLDS & COLONIES', title: 'Moon Bases & Phalanxes' },
  ship: { section: 'FLAGSHIP MOTHERSHIP', title: 'Mothership Core' },
  modules: { section: 'FLAGSHIP MOTHERSHIP', title: 'Vessel Modular Upgrades' },
  exploration: { section: 'FLAGSHIP MOTHERSHIP', title: 'Deep Space Recon' },
  'admin-dashboard': { section: 'ADMIN SYSTEMS', title: 'Admin Control Panel' },
  'turn-system': { section: 'ADMIN SYSTEMS', title: 'Empire Turn Engine (6 Turns/Min)' },
  'admin-crown': { section: 'ADMIN SYSTEMS', title: 'Imperial Crown & Sovereign Decrees' },
  'admin-cheats': { section: 'ADMIN SYSTEMS', title: 'God Mode & Sovereign Grants Console' },
  'admin-operations': { section: 'ADMIN SYSTEMS', title: 'Server Operations & Modifiers' },
  'cron-jobs': { section: 'ADMIN & OPERATIONS', title: 'Empire Cron Scheduler' },
  'cron-logs': { section: 'ADMIN & OPERATIONS', title: 'Execution & Operations Logs' },
  'cron-cli': { section: 'ADMIN & OPERATIONS', title: 'Server Crontab CLI Reference' },
  'store-battlepass': { section: 'STORE & BATTLE PASS', title: 'Imperial Store, Battle Pass & VIP Pass' },
  'ship-fitting': { section: 'MODULAR FITTING LAB', title: 'Modular Ship Fitting & 6-Type Armor Resistance' },
  civilization: { section: 'EMPIRE GOVERNANCE', title: 'Civilization Traditions, Demographics & Happiness' },
  'government-system': { section: 'SOVEREIGN DOCTRINE', title: '9 Government Systems, Edicts & Imperial Constitutions' },
  'dev-credits': { section: 'STUDIO & ARCHITECTURE', title: 'Official Development Team Credits & Creator Accolades' },
  diplomacy: { section: 'DIPLOMATIC NEXUS', title: 'Galactic Diplomacy, Embassies & Federation Vault' },
  missions: { section: 'CAMPAIGN OPERATIONS', title: 'Story Missions, Galactic Events & Achievements' },
  'galactic-news': { section: 'HOLONET BROADCAST', title: 'Live Galactic News Feed & Holonet Alerts' },
  'codex-doc': { section: 'STRATEGIC CODEX', title: 'In-Game Strategy Codex & Engine Formulas' },
  'account-profiles': { section: 'COMMAND MATRIX', title: 'Commander Character Slots & Profiles' },
  'mmorpg-ogame': { section: 'MMORPG GALAXY HUB', title: 'Guild Raids, Live Chat & Interstellar Bosses' },
  'hyperspace-systems': { section: 'FTL & TITAN PROPULSION', title: 'Hyperspace Drives & Titan Motherships' },
  'stellar-encyclopedia': { section: 'WORLDS & COLONIES', title: 'Stellar Planetary & Lunar Encyclopedia' },
  'aic-system': { section: 'AUTOMATED INDUSTRY', title: 'Automated Industry Complex (AIC) & Logistics' },
  'power-grid': { section: 'STELLAR ENGINEERING', title: 'Planetary & Microgrid Power Network' },
  race: { section: 'REALM PROFILE', title: 'Race & Government Faction' },
  vacation: { section: 'REALM PROFILE', title: 'Vacation Shielding' },
  ascension: { section: 'REALM PROFILE', title: 'Ascension Chamber' },
  bsat: { section: 'DEVELOPER SUITE', title: 'BSAT Studio: Auto-Start & TypeScript Compiler Suite' },
};

export const Topbar: React.FC<TopbarProps> = ({
  activeRoute,
  profile,
  resources,
  planets = [],
  activePlanetId,
  onSelectPlanet,
  cronAutoTickEnabled = true,
  nextTickSeconds = 60,
  netIncome = 18500,
  bankCapacity = 350000,
  onProcessTurn,
  onUpdateAllSystems,
  onNavigate,
  onOpenPatchNotes,
  onOpenUpdateInfo,
  onOpenCredits,
  onToggleMobileMenu,
  onUpdateResources,
  onUpdatePlanets,
  onColonizePlanet,
}) => {
  const currentMeta = ROUTE_LABELS[activeRoute] || {
    section: 'UNIVERSE CIVILIZATION',
    title: 'Command Interface',
  };

  // Live Galaxy Server Clock
  const [serverTime, setServerTime] = useState<string>('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [turnExecuting, setTurnExecuting] = useState<boolean>(false);
  const [isPlanetMenuOpen, setIsPlanetMenuOpen] = useState<boolean>(false);
  const [showTurnGainDetails, setShowTurnGainDetails] = useState<boolean>(false);
  const [isCreditsSystemModalOpen, setIsCreditsSystemModalOpen] = useState<boolean>(false);
  const [isConscriptRecruitsModalOpen, setIsConscriptRecruitsModalOpen] = useState<boolean>(false);
  const [conscriptModalTab, setConscriptModalTab] = useState<'conscripts' | 'food-water' | 'fields' | 'colonize'>('conscripts');
  const planetDropdownRef = useRef<HTMLDivElement>(null);
  const turnGainRef = useRef<HTMLDivElement>(null);

  // Active Planet resolution
  const activePlanet = planets.find((p) => p.id === activePlanetId) ||
    planets.find((p) => p.isHomeworld) ||
    planets[0] || {
      id: 'pl-homeworld',
      name: 'Homeworld Earth (Tau\'ri Command)',
      coordinate: '1:204:8',
      biome: 'Temperate Continental',
      level: 5,
      incomeBonus: 35000,
      defenseBonus: 65000,
      moonName: 'Luna Prime',
      jumpGateLevel: 2,
      isHomeworld: true,
      fieldsUsed: 84,
      fieldsMax: 188,
    };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (planetDropdownRef.current && !planetDropdownRef.current.contains(event.target as Node)) {
        setIsPlanetMenuOpen(false);
      }
      if (turnGainRef.current && !turnGainRef.current.contains(event.target as Node)) {
        setShowTurnGainDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setServerTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Standard OGame Storage Capacities
  const metalCapacity = 500000;
  const crystalCapacity = 300000;
  const deutCapacity = 150000;
  const foodCapacity = resources.maxFood || 250000;
  const waterCapacity = resources.maxWater || 300000;
  const maxEnergy = resources.maxEnergy || 1000;
  const maxTurns = resources.turnCap || 5000;
  const turnsPerMin = resources.turnsPerMinute || 6;
  const turnsPerHour = turnsPerMin * 60;
  const turnsPerDay = turnsPerHour * 24;
  const nextTurnInSeconds = nextTickSeconds !== undefined ? Math.max(1, nextTickSeconds % 10 || 10) : 10;
  const nextTurnProgress = Math.min(100, Math.round(((10 - nextTurnInSeconds) / 10) * 100));

  // Percentage filled
  const metalPercent = Math.min(100, Math.round(((resources.metal ?? 50000) / metalCapacity) * 100));
  const crystalPercent = Math.min(100, Math.round(((resources.crystal ?? 30000) / crystalCapacity) * 100));
  const deutPercent = Math.min(100, Math.round(((resources.deuterium ?? 15000) / deutCapacity) * 100));
  const foodPercent = Math.min(100, Math.round(((resources.food ?? 42000) / foodCapacity) * 100));
  const waterPercent = Math.min(100, Math.round(((resources.water ?? 58000) / waterCapacity) * 100));
  const energyPercent = Math.min(100, Math.round(((resources.energy ?? 500) / maxEnergy) * 100));
  const turnPercent = Math.min(100, Math.round((resources.attackTurns / maxTurns) * 100));

  // Turn Execution Wrapper with visual feedback
  const handleTriggerTurn = (count: number = 1) => {
    sound.play('confirm');
    setTurnExecuting(true);
    onProcessTurn(count);
    setTimeout(() => setTurnExecuting(false), 450);
  };

  return (
    <header id="universe-civilization-topbar-header" className="border-b border-[#dedede] bg-white shrink-0 relative z-30">
      {/* ========================================================================= */}
      {/* 1. TOP SUB-HEADER: COLONY COORDINATES, SERVER TIME & COMMANDER */}
      {/* ========================================================================= */}
      <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#fafafa] border-b border-[#dedede] flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Left: Mobile Menu Toggle + Active Colony / Coordinates & Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Drawer Trigger (iPhone 15, iPad portrait) */}
          <button
            type="button"
            id="mobile-nav-toggle-btn"
            onClick={() => {
              sound.play('click');
              if (onToggleMobileMenu) onToggleMobileMenu();
            }}
            className="lg:hidden p-1.5 sm:p-2 text-[#111111] hover:bg-neutral-200 border border-[#dedede] bg-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu size={18} />
          </button>

          {/* Active Planet Coordinates Dropdown Selector */}
          <div className="relative" ref={planetDropdownRef}>
            <button
              type="button"
              id="planet-dropdown-trigger"
              onClick={() => {
                sound.play('click');
                setIsPlanetMenuOpen(!isPlanetMenuOpen);
              }}
              title={`Active World: ${activePlanet.name} [${activePlanet.coordinate}] - Click to switch or manage worlds`}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-white border border-[#dedede] hover:border-[#111111] transition-colors cursor-pointer shadow-xs group"
            >
              <Globe size={14} className="text-[#111111] group-hover:scale-110 transition-transform shrink-0" />
              <div className="flex items-center gap-1 sm:gap-1.5">
                {activePlanet.isHomeworld && (
                  <span className="text-amber-500 font-bold text-xs" title="Homeworld">👑</span>
                )}
                <span className="font-bold text-[#111111] text-xs truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[180px]">{activePlanet.name.split(' (')[0]}</span>
                <span className="font-mono text-[#111111] bg-neutral-100 px-1 py-0.5 text-[10px] sm:text-[11px] font-bold border border-neutral-200 shrink-0">
                  [{activePlanet.coordinate}]
                </span>
              </div>
              <ChevronDown size={13} className={`text-[#666666] transition-transform duration-200 shrink-0 ${isPlanetMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Interactive Dropdown Button List of Worlds */}
            {isPlanetMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-[calc(100vw-1.5rem)] sm:w-[440px] max-w-[440px] bg-white border border-[#111111] shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Dropdown Header */}
                <div className="p-3 bg-[#111111] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={15} className="text-cyan-400" />
                    <span className="font-bold uppercase tracking-wider text-xs">
                      Sovereign Worlds & Colonies ({planets.length})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsPlanetMenuOpen(false);
                      onNavigate && onNavigate('planet-list');
                    }}
                    className="text-[10px] font-mono uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-2 py-0.5 cursor-pointer flex items-center gap-1"
                  >
                    <span>World Nexus</span>
                    <ExternalLink size={10} />
                  </button>
                </div>

                {/* Planet Items List */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-[#eeeeee]">
                  {planets.map((planet) => {
                    const isSelected = planet.id === activePlanet.id;
                    return (
                      <div
                        key={planet.id}
                        className={`p-3 transition-colors ${
                          isSelected ? 'bg-amber-50/50 border-l-4 border-amber-600' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            onClick={() => {
                              sound.play('confirm');
                              onSelectPlanet && onSelectPlanet(planet.id);
                              setIsPlanetMenuOpen(false);
                            }}
                            className="cursor-pointer flex-1"
                          >
                            <div className="flex items-center gap-1.5">
                              {planet.isHomeworld && (
                                <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider">
                                  HOMEWORLD
                                </span>
                              )}
                              <span className="font-bold text-xs text-[#111111] hover:text-blue-600">
                                {planet.name}
                              </span>
                              <span className="font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-1 border border-neutral-200">
                                [{planet.coordinate}]
                              </span>
                              {isSelected && (
                                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                                  <Check size={12} /> Active
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-mono text-[#666666]">
                              <span>Biome: <strong className="text-[#111111]">{planet.biome}</strong></span>
                              <span>Fields: <strong className="text-[#111111]">{planet.fieldsUsed || 80}/{planet.fieldsMax || 188}</strong></span>
                              {planet.moonName && (
                                <span className="text-cyan-700 font-semibold">🌙 {planet.moonName}</span>
                              )}
                            </div>

                            <div className="mt-1 text-[10px] font-mono text-emerald-700">
                              Production: +{planet.metalProductionRate?.toLocaleString() || '40k'} Met · +{planet.crystalProductionRate?.toLocaleString() || '25k'} Cryst/h
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Sub-Menu Jump Buttons */}
                        <div className="mt-2.5 pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-1 text-[10px]">
                          <button
                            onClick={() => {
                              onSelectPlanet && onSelectPlanet(planet.id);
                              setIsPlanetMenuOpen(false);
                              onNavigate && onNavigate('planet-list');
                            }}
                            className="px-2 py-0.5 bg-white border border-[#dedede] hover:border-[#111111] font-bold text-[#111111] cursor-pointer flex items-center gap-1"
                          >
                            <Globe size={10} />
                            <span>Overview</span>
                          </button>

                          <button
                            onClick={() => {
                              onSelectPlanet && onSelectPlanet(planet.id);
                              setIsPlanetMenuOpen(false);
                              onNavigate && onNavigate('factories');
                            }}
                            className="px-2 py-0.5 bg-white border border-[#dedede] hover:border-[#111111] font-bold text-[#111111] cursor-pointer flex items-center gap-1"
                          >
                            <Flame size={10} />
                            <span>Mines</span>
                          </button>

                          <button
                            onClick={() => {
                              onSelectPlanet && onSelectPlanet(planet.id);
                              setIsPlanetMenuOpen(false);
                              onNavigate && onNavigate('shipyard');
                            }}
                            className="px-2 py-0.5 bg-white border border-[#dedede] hover:border-[#111111] font-bold text-[#111111] cursor-pointer flex items-center gap-1"
                          >
                            <Building size={10} />
                            <span>Shipyard</span>
                          </button>

                          <button
                            onClick={() => {
                              onSelectPlanet && onSelectPlanet(planet.id);
                              setIsPlanetMenuOpen(false);
                              onNavigate && onNavigate('defenses');
                            }}
                            className="px-2 py-0.5 bg-white border border-[#dedede] hover:border-[#111111] font-bold text-[#111111] cursor-pointer flex items-center gap-1"
                          >
                            <Shield size={10} />
                            <span>Defenses</span>
                          </button>

                          <button
                            onClick={() => {
                              onSelectPlanet && onSelectPlanet(planet.id);
                              setIsPlanetMenuOpen(false);
                              onNavigate && onNavigate('moon-bases');
                            }}
                            className="px-2 py-0.5 bg-white border border-[#dedede] hover:border-[#111111] font-bold text-[#111111] cursor-pointer flex items-center gap-1"
                          >
                            <Radio size={10} />
                            <span>Moon</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dropdown Footer Action */}
                <div className="p-2.5 bg-[#fafafa] border-t border-[#dedede] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#777777] font-mono">
                    All 30 Universes & 90 Galaxies
                  </span>
                  <button
                    onClick={() => {
                      setIsPlanetMenuOpen(false);
                      onNavigate && onNavigate('universe');
                    }}
                    className="px-2.5 py-1 bg-[#111111] text-white hover:bg-neutral-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Rocket size={11} />
                    <span>Colonize New World</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[#777777] font-mono text-[11px]">
            <span>/</span>
            <span className="uppercase tracking-wider font-semibold text-[#555555]">
              {currentMeta.section}
            </span>
            <span>:</span>
            <span className="text-[#111111] font-bold">{currentMeta.title}</span>
          </div>
        </div>

        {/* Right: Live Server Time, DefCon, Commander Profile & Reset */}
        <div className="flex items-center gap-3">
          {/* Live Galaxy Server Clock */}
          <div
            className="flex items-center gap-1.5 font-mono text-xs text-[#555555] bg-white border border-[#dedede] px-2.5 py-1"
            title="Galactic Standard Time (Server synchronized)"
          >
            <Clock size={12} className="text-[#888888]" />
            <span className="text-[10px] text-[#888888] font-bold">ST</span>
            <span className="font-bold text-[#111111]">{serverTime || '12:00:00'}</span>
          </div>

          {/* Commander Rank Pill */}
          <div
            onClick={() => onNavigate && onNavigate('commander-hq')}
            className="flex items-center gap-2 px-2.5 py-1 bg-white border border-[#dedede] hover:border-[#111111] cursor-pointer transition-colors"
            title="Commander HQ, Officers & Doctrines"
          >
            <User size={13} className="text-[#555555]" />
            <span className="font-bold text-[#111111]">{profile.username}</span>
            <span className="text-[10px] text-[#777777] uppercase font-mono">
              ({profile.rankName || 'Imperator'})
            </span>
            <span
              className={`px-1.5 py-0.2 text-[9px] font-black uppercase ${
                profile.defconLevel === 0
                  ? 'bg-neutral-200 text-neutral-800'
                  : profile.defconLevel === 1
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-500 text-black'
              }`}
            >
              DEFCON {profile.defconLevel}
            </span>
          </div>

          {/* Account Settings Quick Action Button (Right Side Top Header) */}
          <button
            type="button"
            id="topbar-account-settings-btn"
            onClick={() => {
              sound.play('click');
              if (onNavigate) onNavigate('account-settings');
            }}
            title="Account Settings & Commander Preferences"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#dedede] hover:border-[#111111] text-[#222222] font-semibold cursor-pointer transition-colors text-[10px] font-mono shadow-2xs shrink-0"
          >
            <Settings size={12} className="text-neutral-700" />
            <span className="hidden sm:inline">Account Settings</span>
            <span className="sm:hidden">Settings</span>
          </button>

          {/* Quick Header Access: Dev Team Credits beside Update & Patch Info */}
          <div className="hidden 2xl:flex items-center gap-1.5 pl-2 border-l border-[#dedede]">
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                if (onOpenCredits) onOpenCredits();
                else if (onNavigate) onNavigate('dev-credits');
              }}
              title="View full Development Team Credits (Lead Creator: Stephen)"
              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 hover:border-amber-500 text-amber-950 font-bold flex items-center gap-1 cursor-pointer transition-colors text-[10px] font-mono shadow-2xs"
            >
              <Award size={11} className="text-amber-600" />
              <span>Dev Credits: <strong className="text-black">Stephen</strong></span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                if (onOpenUpdateInfo) onOpenUpdateInfo();
                else if (onOpenPatchNotes) onOpenPatchNotes();
              }}
              title="View Update Info"
              className="px-1.5 py-1 bg-white hover:bg-neutral-100 border border-[#dedede] text-[#333333] font-semibold flex items-center gap-1 cursor-pointer transition-colors text-[10px] font-mono"
            >
              <Info size={11} className="text-cyan-700" />
              <span>Update Info</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.play('click');
                if (onOpenPatchNotes) onOpenPatchNotes();
              }}
              title="View Patch Notes"
              className="px-1.5 py-1 bg-white hover:bg-neutral-100 border border-[#dedede] text-[#333333] font-semibold flex items-center gap-1 cursor-pointer transition-colors text-[10px] font-mono"
            >
              <Sparkles size={11} className="text-amber-600" />
              <span>Patch Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OGAME MULTI-RESOURCE BAR: CREDITS, METAL, CRYSTAL, DEUTERIUM, FOOD, WATER, POP, ENERGY, NAQ */}
      {/* ========================================================================= */}
      <div className="px-3 sm:px-6 py-2 bg-white flex items-center border-b border-[#dedede] overflow-hidden">
        {/* Resource Ribbon - Horizontally scrollable on iPhone/iPad with swipe gesture, grid on large desktop */}
        <div className="flex xl:grid xl:grid-cols-9 gap-2 flex-1 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          {/* 0. GALACTIC CREDITS (GC) */}
          <div
            id="galactic-credits-topbar-card"
            className="min-w-[145px] sm:min-w-[160px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border-2 border-amber-500 bg-gradient-to-b from-amber-100/60 via-white to-amber-50/70 hover:border-amber-600 hover:shadow-md hover:shadow-amber-500/25 transition-all cursor-pointer group shadow-xs"
            onMouseEnter={() => setActiveTooltip('credits')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => {
              sound.play('click');
              setIsCreditsSystemModalOpen(true);
            }}
            title="Galactic Credits System · Click to open Interstellar Central Bank & FX Matrix"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-amber-950 tracking-wider flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-800 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  <CreditCard size={10} strokeWidth={2.5} />
                </div>
                <span>Galactic Credits</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1 py-0.2 rounded-2xs font-black flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                +570/t
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong className="text-sm sm:text-base font-black tracking-tight text-amber-950">
                {(resources.credits ?? 500000).toLocaleString()}{' '}
                <span className="text-[10px] font-black text-amber-900 bg-amber-200/90 px-1 py-0.2 border border-amber-400">GC</span>
              </strong>
              <span className="text-[9px] font-mono font-bold text-amber-700/90">AAA Prime</span>
            </div>
            {/* Glowing Liquidity & Solvency Bar */}
            <div className="w-full h-1.5 bg-amber-200/70 mt-1.5 overflow-hidden rounded-full p-0.2 border border-amber-300">
              <div className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-full transition-all duration-300 w-full animate-pulse" />
            </div>

            {/* Quick Action Sub-Strip */}
            <div className="mt-1 flex items-center justify-between text-[8px] font-mono text-amber-800">
              <span className="flex items-center gap-0.5 font-bold text-amber-900">
                <Sparkles size={8} className="text-amber-600" />
                <span>GCS-9000</span>
              </span>
              <span className="bg-amber-600 group-hover:bg-amber-700 text-white px-1 py-0.2 uppercase font-black tracking-wider transition-colors">
                FX Console ▾
              </span>
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'credits' && (
              <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-[#111111] text-white text-xs z-50 shadow-2xl border-2 border-amber-500/80 space-y-2 pointer-events-none">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1.5">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <CreditCard size={13} />
                    <span>GALACTIC CREDITS SYSTEM (GCS-9000)</span>
                  </span>
                  <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950 px-1 border border-emerald-500">AAA+ GRADE</span>
                </div>
                <div className="space-y-1 text-[11px] text-neutral-300">
                  <div className="flex justify-between">
                    <span>Liquid Treasury Balance:</span>
                    <span className="font-mono text-amber-300 font-bold">{(resources.credits ?? 500000).toLocaleString()} GC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Net Turn Yield:</span>
                    <span className="font-mono text-emerald-400 font-bold">+570 GC/t (+34,200/h)</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 text-[10px]">
                    <span>· AIC Nanite Industry:</span>
                    <span className="font-mono text-neutral-200">+250 GC/turn</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 text-[10px]">
                    <span>· Planetary Commerce:</span>
                    <span className="font-mono text-neutral-200">+180 GC/turn</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 text-[10px]">
                    <span>· Guild Trade & Tolls:</span>
                    <span className="font-mono text-neutral-200">+140 GC/turn</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 text-[10px]">
                    <span>Reserve Solvency Backing:</span>
                    <span className="font-mono text-cyan-300">100% Naquadah Standard</span>
                  </div>
                </div>
                <div className="text-[10px] text-amber-200/90 pt-1.5 border-t border-white/10 flex items-center justify-between">
                  <span>⚡ Instant FX Swaps & Central Bank Grants</span>
                  <span className="font-bold uppercase text-[9px] bg-amber-500 text-black px-1">Click to open</span>
                </div>
              </div>
            )}
          </div>
          {/* 1. METAL */}
          <div
            className="min-w-[140px] sm:min-w-[155px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border border-slate-400/90 bg-gradient-to-b from-slate-100/90 via-white to-slate-200/35 hover:border-slate-700 hover:shadow-xs transition-all cursor-pointer group ring-1 ring-slate-400/25"
            onMouseEnter={() => setActiveTooltip('metal')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => onNavigate && onNavigate('factories')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-slate-700/15 border border-slate-600/30 flex items-center justify-center text-slate-800 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <Layers size={10} strokeWidth={2.5} />
                </div>
                <span>Metal Ore</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-1 py-0.2 rounded-2xs font-bold flex items-center gap-0.5 shadow-2xs">
                <TrendingUp size={8} strokeWidth={3} />
                +120/t
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong
                className={`text-sm sm:text-base font-bold tracking-tight font-mono ${
                  metalPercent >= 90 ? 'text-rose-600 animate-pulse' : 'text-slate-950'
                }`}
              >
                {(resources.metal ?? 50000).toLocaleString()}
                <span className="text-[9px] text-slate-700 font-bold ml-0.5">t</span>
              </strong>
              <span className="text-[9.5px] font-mono text-slate-800 bg-white/90 px-1 py-0.2 border border-slate-300 rounded-2xs shadow-2xs">
                {Math.round(metalCapacity / 1000)}k cap
              </span>
            </div>
            {/* Storage Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-200/80 rounded-2xs overflow-hidden mt-1.5 flex">
              <div
                className={`h-full transition-all duration-300 ${
                  metalPercent >= 90
                    ? 'bg-rose-500'
                    : metalPercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-slate-700 to-slate-500'
                }`}
                style={{ width: `${metalPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-700 mt-0.5 font-medium">
              <span>Smelting Matrix</span>
              <span className="font-bold text-slate-900">{metalPercent}% Full</span>
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'metal' && (
              <div className="absolute left-0 top-full mt-2 w-56 p-3 bg-[#111111] text-white text-xs z-50 shadow-xl border border-white/20 space-y-1.5 pointer-events-none">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1">
                  <span>METAL STORAGE</span>
                  <span className="font-mono">{metalPercent}%</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Current:</span>
                  <span className="font-mono text-white">{(resources.metal ?? 50000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Capacity:</span>
                  <span className="font-mono text-white">{metalCapacity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Mine Yield:</span>
                  <span className="font-mono text-emerald-400">+120/turn (+7.2k/h)</span>
                </div>
                <div className="text-[10px] text-neutral-400 pt-1 border-t border-white/10">
                  Essential for warship frames, orbital defenses, and heavy armor.
                </div>
              </div>
            )}
          </div>

          {/* 2. CRYSTAL */}
          <div
            className="min-w-[140px] sm:min-w-[155px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border border-sky-400/90 bg-gradient-to-b from-sky-50/85 via-white to-sky-100/35 hover:border-sky-600 hover:shadow-xs transition-all cursor-pointer group ring-1 ring-sky-400/25"
            onMouseEnter={() => setActiveTooltip('crystal')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => onNavigate && onNavigate('factories')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-sky-950 tracking-wider flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-sky-600/15 border border-sky-500/35 flex items-center justify-center text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Gem size={10} strokeWidth={2.5} />
                </div>
                <span>Crystal Silicon</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-1 py-0.2 rounded-2xs font-bold flex items-center gap-0.5 shadow-2xs">
                <TrendingUp size={8} strokeWidth={3} />
                +80/t
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong
                className={`text-sm sm:text-base font-bold tracking-tight font-mono ${
                  crystalPercent >= 90 ? 'text-rose-600 animate-pulse' : 'text-sky-950'
                }`}
              >
                {(resources.crystal ?? 30000).toLocaleString()}
                <span className="text-[9px] text-sky-800 font-bold ml-0.5">ct</span>
              </strong>
              <span className="text-[9.5px] font-mono text-sky-800 bg-white/90 px-1 py-0.2 border border-sky-300 rounded-2xs shadow-2xs">
                {Math.round(crystalCapacity / 1000)}k cap
              </span>
            </div>
            {/* Storage Bar */}
            <div className="w-full h-1.5 bg-neutral-200/80 rounded-2xs overflow-hidden mt-1.5 flex">
              <div
                className={`h-full transition-all duration-300 ${
                  crystalPercent >= 90
                    ? 'bg-rose-500'
                    : crystalPercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-sky-600 to-cyan-400'
                }`}
                style={{ width: `${crystalPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-sky-800 mt-0.5 font-medium">
              <span>Silicon Lattice</span>
              <span className="font-bold text-sky-950">{crystalPercent}% Full</span>
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'crystal' && (
              <div className="absolute left-0 top-full mt-2 w-56 p-3 bg-[#111111] text-white text-xs z-50 shadow-xl border border-white/20 space-y-1.5 pointer-events-none">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1">
                  <span>CRYSTAL STORAGE</span>
                  <span className="font-mono">{crystalPercent}%</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Current:</span>
                  <span className="font-mono text-white">{(resources.crystal ?? 30000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Capacity:</span>
                  <span className="font-mono text-white">{crystalCapacity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Mine Yield:</span>
                  <span className="font-mono text-emerald-400">+80/turn (+4.8k/h)</span>
                </div>
                <div className="text-[10px] text-neutral-400 pt-1 border-t border-white/10">
                  Required for electronic circuits, laser cannons, and research disciplines.
                </div>
              </div>
            )}
          </div>

          {/* 3. DEUTERIUM */}
          <div
            className="min-w-[140px] sm:min-w-[155px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border border-blue-400/90 bg-gradient-to-b from-blue-50/85 via-white to-blue-100/35 hover:border-blue-600 hover:shadow-xs transition-all cursor-pointer group ring-1 ring-blue-400/25"
            onMouseEnter={() => setActiveTooltip('deut')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => onNavigate && onNavigate('factories')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-blue-950 tracking-wider flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-blue-600/15 border border-blue-500/35 flex items-center justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Droplet size={10} strokeWidth={2.5} />
                </div>
                <span>Deuterium Fuel</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-1 py-0.2 rounded-2xs font-bold flex items-center gap-0.5 shadow-2xs">
                <TrendingUp size={8} strokeWidth={3} />
                +45/t
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong
                className={`text-sm sm:text-base font-bold tracking-tight font-mono ${
                  deutPercent >= 90 ? 'text-rose-600 animate-pulse' : 'text-blue-950'
                }`}
              >
                {(resources.deuterium ?? 15000).toLocaleString()}
                <span className="text-[9px] text-blue-800 font-bold ml-0.5">L</span>
              </strong>
              <span className="text-[9.5px] font-mono text-blue-800 bg-white/90 px-1 py-0.2 border border-blue-300 rounded-2xs shadow-2xs">
                {Math.round(deutCapacity / 1000)}k cap
              </span>
            </div>
            {/* Storage Bar */}
            <div className="w-full h-1.5 bg-neutral-200/80 rounded-2xs overflow-hidden mt-1.5 flex">
              <div
                className={`h-full transition-all duration-300 ${
                  deutPercent >= 90
                    ? 'bg-rose-500'
                    : deutPercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                }`}
                style={{ width: `${deutPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-blue-800 mt-0.5 font-medium">
              <span>Fusion Centrifuge</span>
              <span className="font-bold text-blue-950">{deutPercent}% Full</span>
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'deut' && (
              <div className="absolute left-0 top-full mt-2 w-56 p-3 bg-[#111111] text-white text-xs z-50 shadow-xl border border-white/20 space-y-1.5 pointer-events-none">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1">
                  <span>DEUTERIUM STORAGE</span>
                  <span className="font-mono">{deutPercent}%</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Current:</span>
                  <span className="font-mono text-white">{(resources.deuterium ?? 15000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Capacity:</span>
                  <span className="font-mono text-white">{deutCapacity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Synthesizer Yield:</span>
                  <span className="font-mono text-emerald-400">+45/turn (+2.7k/h)</span>
                </div>
                <div className="text-[10px] text-neutral-400 pt-1 border-t border-white/10">
                  Used as hyperspace warship fuel, fusion reaction feed, and sensor probes.
                </div>
              </div>
            )}
          </div>

          {/* 4. FOOD (LIFE SUPPORT & NUTRITION) */}
          <div
            className="min-w-[140px] sm:min-w-[155px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border border-emerald-400/90 bg-gradient-to-b from-emerald-50/80 via-white to-emerald-100/30 hover:border-emerald-600 hover:shadow-xs transition-all cursor-pointer group ring-1 ring-emerald-400/20"
            onMouseEnter={() => setActiveTooltip('food')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => {
              sound.play('click');
              setConscriptModalTab('food-water');
              setIsConscriptRecruitsModalOpen(true);
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-emerald-950 tracking-wider flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Wheat size={10} strokeWidth={2.5} />
                </div>
                <span>Food & Rations</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-100/90 border border-emerald-300/80 px-1 py-0.2 rounded-2xs font-bold flex items-center gap-0.5 shadow-2xs">
                <TrendingUp size={8} strokeWidth={3} />
                +60/t
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong
                className={`text-sm sm:text-base font-bold tracking-tight font-mono ${
                  (resources.food ?? 42000) < 5000 ? 'text-rose-600 animate-pulse' : 'text-emerald-950'
                }`}
              >
                {(resources.food ?? 42000).toLocaleString()}
                <span className="text-[9px] text-emerald-800/80 font-bold ml-0.5">kg</span>
              </strong>
              <span className="text-[9.5px] font-mono text-emerald-800/80 bg-white/90 px-1 py-0.2 border border-emerald-200/80 rounded-2xs shadow-2xs">
                {Math.round(foodCapacity / 1000)}k cap
              </span>
            </div>
            {/* Storage Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-200/80 rounded-2xs overflow-hidden mt-1.5 flex">
              <div
                className={`h-full transition-all duration-300 ${
                  foodPercent < 15
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                }`}
                style={{ width: `${foodPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-emerald-800/90 mt-0.5 font-medium">
              <span>Sustains 14M Pops</span>
              <span className="font-bold text-emerald-900">{foodPercent}% Full</span>
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'food' && (
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#111111] text-white text-xs z-50 shadow-2xl border border-emerald-500/40 space-y-1.5 pointer-events-none">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1">
                  <span className="flex items-center gap-1 text-emerald-300">
                    <Wheat size={12} />
                    FOOD & NUTRITION SYSTEM
                  </span>
                  <span className="font-mono text-emerald-400">{foodPercent}% FULL</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Stockpile:</span>
                  <span className="font-mono text-white">{(resources.food ?? 42000).toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Capacity:</span>
                  <span className="font-mono text-white">{foodCapacity.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Homeworld Demands:</span>
                  <span className="font-mono text-emerald-300">8.2k kg/h (14M Citizens)</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Recruit Mobilization:</span>
                  <span className="font-mono text-white">4.5 kg/conscript unit</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Net Growth Yield:</span>
                  <span className="font-mono text-emerald-400 font-bold">+60/t (+3.6k/h)</span>
                </div>
                <div className="text-[10px] text-emerald-200/70 pt-1 border-t border-white/10 font-mono">
                  Sustains 14M Homeworld citizens and conscript recruits. Click to open Life Support Console.
                </div>
              </div>
            )}
          </div>

          {/* 5. WATER (AQUIFER & HYDRATION) */}
          <div
            className="min-w-[140px] sm:min-w-[155px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border border-cyan-400/90 bg-gradient-to-b from-cyan-50/80 via-white to-cyan-100/30 hover:border-cyan-600 hover:shadow-xs transition-all cursor-pointer group ring-1 ring-cyan-400/20"
            onMouseEnter={() => setActiveTooltip('water')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => {
              sound.play('click');
              setConscriptModalTab('food-water');
              setIsConscriptRecruitsModalOpen(true);
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-cyan-950 tracking-wider flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <Droplet size={10} strokeWidth={2.5} />
                </div>
                <span>Water & Aquifer</span>
              </span>
              <span className="text-[9px] font-mono text-cyan-700 bg-cyan-100/90 border border-cyan-300/80 px-1 py-0.2 rounded-2xs font-bold flex items-center gap-0.5 shadow-2xs">
                <TrendingUp size={8} strokeWidth={3} />
                +75/t
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong
                className={`text-sm sm:text-base font-bold tracking-tight font-mono ${
                  (resources.water ?? 58000) < 5000 ? 'text-rose-600 animate-pulse' : 'text-cyan-950'
                }`}
              >
                {(resources.water ?? 58000).toLocaleString()}
                <span className="text-[9px] text-cyan-800/80 font-bold ml-0.5">kL</span>
              </strong>
              <span className="text-[9.5px] font-mono text-cyan-800/80 bg-white/90 px-1 py-0.2 border border-cyan-200/80 rounded-2xs shadow-2xs">
                {Math.round(waterCapacity / 1000)}k cap
              </span>
            </div>
            {/* Storage Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-200/80 rounded-2xs overflow-hidden mt-1.5 flex">
              <div
                className={`h-full transition-all duration-300 ${
                  waterPercent < 15
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                }`}
                style={{ width: `${waterPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-cyan-800/90 mt-0.5 font-medium">
              <span>Aquifer Grid</span>
              <span className="font-bold text-cyan-900">{waterPercent}% Full</span>
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'water' && (
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#111111] text-white text-xs z-50 shadow-2xl border border-cyan-500/40 space-y-1.5 pointer-events-none">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Droplet size={12} />
                    AQUIFER & HYDRATION SYSTEM
                  </span>
                  <span className="font-mono text-cyan-300">{waterPercent}% FULL</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Stockpile:</span>
                  <span className="font-mono text-white">{(resources.water ?? 58000).toLocaleString()} kL</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Capacity:</span>
                  <span className="font-mono text-white">{waterCapacity.toLocaleString()} kL</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Homeworld Demands:</span>
                  <span className="font-mono text-cyan-300">10.0k kL/h (14M Citizens)</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Recruit Hydration:</span>
                  <span className="font-mono text-white">4.5 kL/conscript unit</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Desalination Net:</span>
                  <span className="font-mono text-cyan-400 font-bold">+75/t (+4.5k/h)</span>
                </div>
                <div className="text-[10px] text-cyan-200/70 pt-1 border-t border-white/10 font-mono">
                  Guarantees planetary hydration for 14M citizens and military conscripts. Click to manage.
                </div>
              </div>
            )}
          </div>

          {/* 6. CONSCRIPT RECRUITS & CITIZENS POPULATION */}
          <div
            className="min-w-[160px] sm:min-w-[178px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border-2 border-indigo-500/90 bg-gradient-to-b from-indigo-50/85 via-white to-indigo-100/35 hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group ring-1 ring-indigo-400/25"
            onMouseEnter={() => setActiveTooltip('pop')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => {
              sound.play('click');
              setConscriptModalTab('conscripts');
              setIsConscriptRecruitsModalOpen(true);
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-indigo-600/15 border border-indigo-500/40 flex items-center justify-center text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Users size={10} strokeWidth={2.5} />
                </div>
                <span>Conscript Recruits</span>
              </span>
              <span className="text-[9px] font-mono text-indigo-900 bg-indigo-100/90 border border-indigo-300/80 px-1 py-0.2 rounded-2xs font-bold flex items-center gap-0.5 shadow-2xs">
                <Crosshair size={8} strokeWidth={3} className="text-indigo-700" />
                +{(resources.unitProduction ?? 12)}/t
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong className="text-sm sm:text-base font-bold tracking-tight text-indigo-950 font-mono flex items-baseline gap-1">
                <span>{((resources.totalPopulation ?? 14000000) / 1000000).toFixed(2)}M</span>
                <span className="text-[9px] text-indigo-700/80 font-bold">pop</span>
              </strong>
              <span className="text-[9.5px] font-mono text-amber-900 font-bold bg-amber-50 px-1.5 py-0.2 border border-amber-300/80 rounded-2xs shadow-2xs flex items-center gap-0.5">
                <span className="text-[8px] text-amber-700 font-mono">🎖️</span>
                {(resources.untrainedUnits ?? 1600).toLocaleString()}
              </span>
            </div>
            {/* Dual Strata & Conscription Bar */}
            <div className="w-full h-1.5 bg-neutral-200/80 rounded-2xs overflow-hidden mt-1.5 flex">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300"
                style={{ width: '85%' }}
                title="Civilian Strata"
              />
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: '15%' }}
                title="Military Conscripts"
              />
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-indigo-900/90 mt-0.5 font-medium">
              <span>Homeworld (14M)</span>
              <span className="font-bold text-indigo-900 flex items-center gap-0.5">
                <span>Fields {activePlanet.fieldsUsed || 84}/{activePlanet.fieldsMax || 188}</span>
              </span>
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'pop' && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-[#111111] text-white text-xs z-50 shadow-2xl border border-indigo-500/40 space-y-1.5 pointer-events-none">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1">
                  <span className="flex items-center gap-1 text-indigo-300">
                    <Users size={12} />
                    CONSCRIPT RECRUITS & DEMOGRAPHICS
                  </span>
                  <span className="font-mono text-emerald-400">14M HOMEWORLD</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Homeworld Population:</span>
                  <span className="font-mono text-white font-bold">14,000,000 Citizens</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Untrained Conscripts:</span>
                  <span className="font-mono text-amber-400 font-bold">{(resources.untrainedUnits ?? 1600).toLocaleString()} Recruits</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Conscription Draft Rate:</span>
                  <span className="font-mono text-indigo-300 font-bold">+{(resources.unitProduction ?? 12)} / turn</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Food & Water Sustenance:</span>
                  <span className="font-mono text-emerald-400">Fully Supplied (8% Plunge)</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Planetary Fields:</span>
                  <span className="font-mono text-white">{activePlanet.fieldsUsed || 84} / {activePlanet.fieldsMax || 188} Used</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Attached Moon:</span>
                  <span className="font-mono text-cyan-300">{activePlanet.moonName || 'Luna Prime'} (Tier {activePlanet.lunarBase?.level || 2})</span>
                </div>
                <div className="text-[10px] text-indigo-200/80 pt-1 border-t border-white/10 font-mono">
                  7 Population Strata (Farmers, Hydrologists, Miners, Industry, Scientists, Admins, Conscripts). Click to open Conscription & Colonization Console.
                </div>
              </div>
            )}
          </div>

          {/* 7. ENERGY */}
          <div
            className="min-w-[140px] sm:min-w-[155px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border border-amber-400/90 bg-gradient-to-b from-amber-50/85 via-white to-amber-100/35 hover:border-amber-600 hover:shadow-xs transition-all cursor-pointer group ring-1 ring-amber-400/25"
            onMouseEnter={() => setActiveTooltip('energy')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => onNavigate && onNavigate('planet-power')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-amber-950 tracking-wider flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  <Zap size={10} strokeWidth={2.5} />
                </div>
                <span>Energy Grid</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-1 py-0.2 rounded-2xs font-bold flex items-center gap-0.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                +340 MW
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong className="text-sm sm:text-base font-bold tracking-tight font-mono text-amber-950">
                {(resources.energy ?? 500).toLocaleString()}
                <span className="text-[9px] text-amber-800 font-bold ml-0.5">MW</span>
              </strong>
              <span className="text-[9.5px] font-mono text-amber-900 bg-white/90 px-1 py-0.2 border border-amber-300/80 rounded-2xs shadow-2xs">
                {maxEnergy} MW cap
              </span>
            </div>
            {/* Storage Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-200/80 rounded-2xs overflow-hidden mt-1.5 flex">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 transition-all duration-300"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-amber-900/90 mt-0.5 font-medium">
              <span>Solar & Fusion Grid</span>
              <span className="font-bold text-amber-950">{energyPercent}% Load</span>
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'energy' && (
              <div className="absolute left-0 top-full mt-2 w-60 p-3 bg-[#111111] text-white text-xs z-50 shadow-2xl border border-amber-500/40 space-y-1.5 pointer-events-none">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Zap size={12} />
                    <span>ENERGY BALANCE</span>
                  </span>
                  <span className="font-mono text-emerald-400">SURPLUS</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Total Output:</span>
                  <span className="font-mono text-white">{(resources.energy ?? 500).toLocaleString()} MW</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Colonial Demand:</span>
                  <span className="font-mono text-neutral-400">160 MW</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Net Available:</span>
                  <span className="font-mono text-emerald-400 font-bold">+340 MW</span>
                </div>
                <div className="text-[10px] text-neutral-400 pt-1 border-t border-white/10 font-mono">
                  Supplies power to mines and defense shields. Insufficient power reduces mine output!
                </div>
              </div>
            )}
          </div>

          {/* 5. DARK MATTER */}
          <div
            className="min-w-[140px] sm:min-w-[155px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border border-purple-400/90 bg-gradient-to-b from-purple-50/85 via-white to-purple-100/35 hover:border-purple-600 hover:shadow-xs transition-all cursor-pointer group ring-1 ring-purple-400/25"
            onMouseEnter={() => setActiveTooltip('dm')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => onNavigate && onNavigate('store-battlepass')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-purple-950 tracking-wider flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-purple-600/15 border border-purple-500/35 flex items-center justify-center text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Sparkles size={10} strokeWidth={2.5} />
                </div>
                <span>Dark Matter</span>
              </span>
              <span className="text-[9px] font-mono text-purple-900 bg-purple-100/90 border border-purple-300/80 px-1 py-0.2 rounded-2xs font-bold flex items-center gap-0.5 shadow-2xs">
                <Sparkles size={8} className="text-purple-600" />
                STORE →
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong className="text-sm sm:text-base font-bold tracking-tight font-mono text-purple-950">
                {(resources.darkMatter ?? 2500).toLocaleString()}
                <span className="text-[9px] text-purple-800 font-bold ml-0.5">DM</span>
              </strong>
              <span className="text-[9.5px] font-mono text-purple-900 bg-white/90 px-1 py-0.2 border border-purple-200/80 rounded-2xs shadow-2xs font-bold">
                Exotic
              </span>
            </div>
            {/* Storage Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-200/80 rounded-2xs overflow-hidden mt-1.5 flex">
              <div className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600 transition-all duration-300 w-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-purple-900/90 mt-0.5 font-medium">
              <span>Quantum Condensate</span>
              <span className="font-bold text-purple-950">Premium</span>
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'dm' && (
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#111111] text-white text-xs z-50 shadow-2xl border border-purple-500/40 space-y-1.5 pointer-events-none">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1">
                  <span className="flex items-center gap-1 text-purple-400">
                    <Sparkles size={12} />
                    <span>DARK MATTER RESERVE</span>
                  </span>
                  <span className="font-mono text-purple-300">PREMIUM</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Balance:</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {(resources.darkMatter ?? 2500).toLocaleString()} DM
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 pt-1 border-t border-white/10 font-mono">
                  Acquire elite commanders, instant supply drops, warship hull skins, and activate the VIP Battle Pass.
                </div>
              </div>
            )}
          </div>

          {/* 6. NAQUADAH SOVEREIGN CURRENCY & BANK VAULT */}
          <div
            className="min-w-[140px] sm:min-w-[155px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border border-emerald-500/90 bg-gradient-to-b from-amber-50/70 via-white to-emerald-50/50 hover:border-emerald-700 hover:shadow-xs transition-all cursor-pointer group ring-1 ring-emerald-500/25"
            onMouseEnter={() => setActiveTooltip('naq')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => onNavigate && onNavigate('resources')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-neutral-900 tracking-wider flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-xs bg-emerald-600/15 border border-emerald-500/35 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Coins size={10} strokeWidth={2.5} />
                </div>
                <span>Naquadah</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-1 py-0.2 rounded-2xs font-bold flex items-center gap-0.5 shadow-2xs">
                <TrendingUp size={8} strokeWidth={3} />
                +{(netIncome ?? 0).toLocaleString()}/t
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong className="text-sm sm:text-base font-bold tracking-tight font-mono text-neutral-950">
                {(resources?.naquadah ?? 0).toLocaleString()}
                <span className="text-[9px] text-emerald-800 font-bold ml-0.5">NQ</span>
              </strong>
              <span className="text-[9.5px] font-mono text-amber-900 bg-white/90 px-1 py-0.2 border border-amber-300/80 rounded-2xs shadow-2xs font-bold">
                {Math.round((resources?.bankedNaquadah ?? 0) / 1000)}k vlt
              </span>
            </div>
            {/* Storage Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-200/80 rounded-2xs overflow-hidden mt-1.5 flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round(((resources?.bankedNaquadah ?? 0) / (bankCapacity || 1)) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-neutral-700 mt-0.5 font-medium">
              <span>Protected Vault</span>
              <span className="font-bold text-emerald-900">
                {Math.min(100, Math.round(((resources?.bankedNaquadah ?? 0) / (bankCapacity || 1)) * 100))}% Stashed
              </span>
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'naq' && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#111111] text-white text-xs z-50 shadow-2xl border border-emerald-500/40 space-y-1.5 pointer-events-none">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1">
                  <span className="flex items-center gap-1 text-emerald-300">
                    <Coins size={12} />
                    <span>SOVEREIGN TREASURY</span>
                  </span>
                  <span className="font-mono text-amber-300">LIQUID & VAULT</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Liquid Cash:</span>
                  <span className="font-mono text-white font-bold">{(resources?.naquadah ?? 0).toLocaleString()} NQ</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Protected Vault:</span>
                  <span className="font-mono text-emerald-300 font-bold">{(resources?.bankedNaquadah ?? 0).toLocaleString()} NQ</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Vault Capacity:</span>
                  <span className="font-mono text-white">{(bankCapacity ?? 0).toLocaleString()} NQ</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>Net Turn Yield:</span>
                  <span className="font-mono text-emerald-400 font-bold">+{(netIncome ?? 0).toLocaleString()} NQ/turn</span>
                </div>
                <div className="text-[10px] text-neutral-400 pt-1 border-t border-white/10 font-mono">
                  Unbanked Naquadah can be plundered in combat raids. Stash funds in the Vault!
                </div>
              </div>
            )}
          </div>

          {/* 8. GATE TOKENS & DIMENSIONAL KEYS */}
          <div
            className="min-w-[130px] sm:min-w-[145px] xl:min-w-0 shrink-0 xl:shrink relative p-2 border border-cyan-300/80 bg-gradient-to-b from-cyan-50/50 to-white hover:border-cyan-700 transition-all cursor-pointer group shadow-2xs"
            onMouseEnter={() => setActiveTooltip('gate-tokens')}
            onMouseLeave={() => setActiveTooltip(null)}
            onClick={() => onNavigate && onNavigate('gate-tokens')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-cyan-950 tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-cyan-600 animate-pulse" />
                <span>Gate Tokens</span>
              </span>
              <span className="text-[8px] font-mono text-cyan-800 font-bold bg-cyan-100 px-1 py-0.2 border border-cyan-300">
                SGC KEYS
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <strong className="text-xs sm:text-sm font-black tracking-tight text-neutral-900 flex items-center gap-1.5">
                <span className="text-emerald-700" title="Alpha Tokens">{resources.gateTokens ?? 25}ᐰ</span>
                <span className="text-cyan-700" title="Delta Tokens">{resources.dimensionalTokens ?? 12}𐎡</span>
                <span className="text-purple-700" title="Omega Beacons">{resources.raidTokens ?? 6}Ω</span>
              </strong>
            </div>
            {/* Multi-Segment Gate Token Capacity Bar */}
            <div className="w-full h-1 bg-neutral-200 mt-1.5 overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all duration-300 w-2/4" title="Alpha Tokens" />
              <div className="h-full bg-cyan-500 transition-all duration-300 w-1/4" title="Delta Tokens" />
              <div className="h-full bg-purple-600 transition-all duration-300 w-1/4" title="Omega Beacons" />
            </div>

            {/* Hover Tooltip */}
            {activeTooltip === 'gate-tokens' && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-[#111111] text-white text-xs z-50 shadow-2xl border-2 border-cyan-400 space-y-2 pointer-events-none font-mono">
                <div className="font-bold flex justify-between border-b border-white/20 pb-1.5">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Sparkles size={13} />
                    <span>STARGATE CONSUMABLE TOKENS</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1 border border-emerald-500">ACTIVE</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-neutral-300">
                  <div className="flex justify-between items-center bg-neutral-900/80 p-1.5 border border-emerald-500/30">
                    <span className="text-emerald-300 font-bold">Alpha Tokens (ᐰ):</span>
                    <span className="font-mono text-white font-bold">{resources.gateTokens ?? 25} Available</span>
                  </div>
                  <div className="text-[9.5px] text-neutral-400 -mt-1 pl-1">
                    Used for: SG Deep Void Explorations & Surveying
                  </div>

                  <div className="flex justify-between items-center bg-neutral-900/80 p-1.5 border border-cyan-500/30">
                    <span className="text-cyan-300 font-bold">Delta Tokens (𐎡):</span>
                    <span className="font-mono text-white font-bold">{resources.dimensionalTokens ?? 12} Available</span>
                  </div>
                  <div className="text-[9.5px] text-neutral-400 -mt-1 pl-1">
                    Used for: Dimensional Anomalies & Quantum Rifts
                  </div>

                  <div className="flex justify-between items-center bg-neutral-900/80 p-1.5 border border-purple-500/30">
                    <span className="text-purple-300 font-bold">Omega Beacons (Ω):</span>
                    <span className="font-mono text-white font-bold">{resources.raidTokens ?? 6} Available</span>
                  </div>
                  <div className="text-[9.5px] text-neutral-400 -mt-1 pl-1">
                    Used for: System Lord Citadels & Supergate Raids
                  </div>
                </div>
                <div className="text-[10px] text-cyan-200/90 pt-1.5 border-t border-white/10 flex items-center justify-between">
                  <span>⚡ Spend & Synthesize Tokens</span>
                  <span className="font-bold uppercase text-[9px] bg-cyan-400 text-black px-1.5 py-0.2">Click to open</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. UNIVERSE CIVILIZATION TURN ENGINE & CRON TICK CONSOLE (INTERACTIVE STRIP) */}
      {/* ========================================================================= */}
      <div className="px-3 sm:px-6 py-2 bg-[#fafafa] flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Turn Gauge & Server Cron Pulse */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
          {/* Turn Reservoir Gauge */}
          <div
            ref={turnGainRef}
            className="relative flex items-center gap-2 sm:gap-3 bg-white border border-[#dedede] hover:border-emerald-600/60 px-2.5 sm:px-3 py-1.5 font-mono shadow-xs transition-colors"
          >
            {/* Empire Turn Reservoir & Gauge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#777777] gap-2 sm:gap-3">
                <span className="font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1">
                  <RotateCw
                    size={11}
                    className={`text-[#111111] ${turnExecuting ? 'animate-spin' : ''}`}
                  />
                  <span className="hidden xs:inline">Empire </span>Turns:
                </span>
                <span className="font-bold text-[#111111]">
                  {(resources?.attackTurns ?? 0).toLocaleString()}/{(maxTurns ?? 100).toLocaleString()}
                </span>
              </div>
              <div className="w-24 xs:w-28 sm:w-36 h-2 bg-[#eeeeee] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    resources.attackTurns >= 90
                      ? 'bg-emerald-600'
                      : resources.attackTurns >= 30
                      ? 'bg-[#111111]'
                      : 'bg-amber-600'
                  }`}
                  style={{ width: `${turnPercent}%` }}
                />
              </div>
            </div>

            {/* Turn Gain (Regeneration Rate & Next Tick) */}
            <div className="border-l border-[#dedede] pl-2 sm:pl-2.5 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">Turn Gain</span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300">
                  <TrendingUp size={9} className="text-emerald-600" />
                  +{turnsPerMin}/min
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-[#666666]">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
                </span>
                <span>Next in {nextTurnInSeconds}s</span>
                <span className="w-8 sm:w-10 h-1 bg-emerald-100 overflow-hidden inline-block align-middle">
                  <span
                    className="block h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${nextTurnProgress}%` }}
                  />
                </span>
              </div>
            </div>

            {/* Turn Gain Inspector Trigger Button */}
            <button
              type="button"
              onClick={() => setShowTurnGainDetails((prev) => !prev)}
              className="border-l border-[#dedede] pl-2 sm:pl-2.5 flex items-center gap-1 text-[10px] font-bold text-neutral-700 hover:text-emerald-700 hover:bg-neutral-50 py-0.5 px-1 transition-colors cursor-pointer"
              title="Click to inspect full Turn Gain velocity and per-turn resource yields"
            >
              <Zap size={11} className="text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">+{turnsPerHour}/h</span>
              <Info size={10} className="text-neutral-400" />
            </button>

            {/* Turn Gain Comprehensive Details Popover */}
            {showTurnGainDetails && (
              <div className="absolute top-full left-0 mt-1.5 w-[310px] sm:w-[360px] bg-white border-2 border-[#111111] shadow-2xl p-3 z-50 text-xs font-mono text-[#222222]">
                <div className="flex items-center justify-between border-b border-[#dedede] pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5 font-black uppercase text-[#111111]">
                    <TrendingUp size={14} className="text-emerald-600" />
                    <span>Empire Turn Gain & Yield Matrix</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTurnGainDetails(false)}
                    className="p-1 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Rates Grid */}
                <div className="grid grid-cols-3 gap-1.5 mb-2.5 text-center">
                  <div className="bg-emerald-50 border border-emerald-200 p-1.5">
                    <div className="text-[9px] text-emerald-800 uppercase font-bold">Velocity</div>
                    <div className="text-sm font-black text-emerald-700">+{turnsPerMin}/min</div>
                    <div className="text-[8px] text-emerald-600">1 turn / 10s</div>
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200 p-1.5">
                    <div className="text-[9px] text-neutral-600 uppercase font-bold">Hourly</div>
                    <div className="text-sm font-black text-neutral-900">+{turnsPerHour}/h</div>
                    <div className="text-[8px] text-neutral-500">Continuous</div>
                  </div>
                  <div className="bg-cyan-50 border border-cyan-200 p-1.5">
                    <div className="text-[9px] text-cyan-800 uppercase font-bold">24-Hour</div>
                    <div className="text-sm font-black text-cyan-700">+{turnsPerDay.toLocaleString()}</div>
                    <div className="text-[8px] text-cyan-600">Full day</div>
                  </div>
                </div>

                {/* Per-Turn Yield Breakdown */}
                <div className="bg-[#fafafa] border border-[#dedede] p-2 mb-2.5 space-y-1 text-[10px]">
                  <div className="font-bold text-[#111111] uppercase flex items-center justify-between border-b border-[#eeeeee] pb-1">
                    <span>Yield Earned Per Processed Turn:</span>
                    <span className="text-emerald-600 font-extrabold">100% Efficiency</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-700">
                    <span>⚡ Naquadah Revenue:</span>
                    <span className="font-bold text-amber-700">+{netIncome?.toLocaleString() || '2,500'} NQ</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-700">
                    <span>🔩 Metal Ore Mining:</span>
                    <span className="font-bold text-slate-800">
                      +{Math.round((resources.metal ?? 85000) * 0.015).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-700">
                    <span>💎 Crystal Synthesis:</span>
                    <span className="font-bold text-cyan-800">
                      +{Math.round((resources.crystal ?? 54000) * 0.012).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-700">
                    <span>🧪 Deuterium Refinement:</span>
                    <span className="font-bold text-teal-800">
                      +{Math.round((resources.deuterium ?? 28000) * 0.008).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-700">
                    <span>👥 Conscript Recruits:</span>
                    <span className="font-bold text-blue-800">+{resources.unitProduction || 12} soldiers</span>
                  </div>
                </div>

                {/* Reservoir Status */}
                <div className="text-[10px] text-neutral-600 space-y-1 mb-2">
                  <div className="flex justify-between">
                    <span>Turn Reservoir Capacity:</span>
                    <span className="font-bold text-neutral-900">
                      {(resources?.attackTurns ?? 0).toLocaleString()} / {(maxTurns ?? 100).toLocaleString()} turns
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Headroom:</span>
                    <span className="font-bold text-emerald-700">
                      {Math.max(0, (maxTurns ?? 100) - (resources?.attackTurns ?? 0)).toLocaleString()} turns remaining
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time to Full Cap:</span>
                    <span className="font-bold text-neutral-900">
                      {resources.attackTurns >= maxTurns
                        ? 'CAP REACHED'
                        : `~${Math.ceil((maxTurns - resources.attackTurns) / turnsPerMin)} minutes`}
                    </span>
                  </div>
                </div>

                {/* Footer Tip */}
                <div className="pt-2 border-t border-[#eeeeee] flex items-center justify-between text-[9px] text-neutral-500">
                  <span>Upgrade AIC & Government edicts to accelerate yields</span>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowTurnGainDetails(false);
                        onNavigate('turn-system');
                      }}
                      className="text-emerald-700 hover:underline font-bold uppercase cursor-pointer"
                    >
                      Turn Engine →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Automated Heartbeat / Cron Countdown */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('cron-jobs')}
              title="Automated Turn Heartbeat (Click to open Empire Cron)"
              className="flex items-center gap-1.5 sm:gap-2 bg-white border border-[#dedede] hover:border-[#111111] px-2.5 sm:px-3 py-1.5 text-xs transition-colors cursor-pointer font-mono"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                {cronAutoTickEnabled && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    cronAutoTickEnabled ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
              </span>
              <span className="text-[10px] font-bold text-[#777777] uppercase hidden xs:inline">Next:</span>
              <span className="font-bold text-[#111111]">
                {cronAutoTickEnabled ? `00:${nextTickSeconds.toString().padStart(2, '0')}` : 'PAUSED'}
              </span>
              <span className="text-[9px] bg-neutral-100 text-neutral-600 px-1 py-0.2 border border-neutral-300 hidden sm:inline">
                6/min
              </span>
            </button>
          )}
        </div>

        {/* Right: Quick Turn Execution Controls (OGame Tactile Actions) */}
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs">
          {/* Quick link to Turn Engine Overview */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('turn-system')}
              title="Open Full Empire Turn Engine"
              className="p-2 bg-white border border-[#dedede] hover:border-[#111111] text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
            >
              <ExternalLink size={13} />
            </button>
          )}

          {/* Quick link to Admin Systems & Crown - restricted only to authorized admin accounts */}
          {onNavigate && (() => {
            const adminSession = getAdminAuthSession();
            const isAdminUser = profile.role === 'admin' || profile.isAdmin === true || (adminSession && adminSession.isAuthenticated);
            if (!isAdminUser) return null;

            return (
              <button
                type="button"
                id="topbar-admin-systems-btn"
                onClick={() => onNavigate('admin-dashboard')}
                title="Open Admin Control Panel Systems (Imperial Crown & Server Operations)"
                className="px-2.5 py-2 bg-amber-400 hover:bg-amber-300 text-[#111111] border border-amber-500 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Crown size={14} className="text-[#111111]" />
                <span className="hidden md:inline font-mono text-[11px] uppercase tracking-wider font-bold">ADMIN</span>
              </button>
            );
          })()}

          {/* Vertical Separator */}
          <div className="h-5 w-px bg-[#dedede] hidden lg:block mx-1" />

          {/* Bottom Right Side Header Controls: Dev Team Credit beside Update Info & Patch Info */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* Development Team Credit */}
            <button
              type="button"
              id="topbar-strip-dev-credits-btn"
              onClick={() => {
                sound.play('click');
                if (onOpenCredits) onOpenCredits();
                else if (onNavigate) onNavigate('dev-credits');
              }}
              title="View full Development Team Credits (Lead Creator: Stephen)"
              className="px-2 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 hover:border-amber-500 text-amber-950 font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs group"
            >
              <Award size={13} className="text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold">Dev Credit: <strong className="text-black">Stephen</strong></span>
            </button>

            {/* Update Info */}
            <button
              type="button"
              id="topbar-strip-update-info-btn"
              onClick={() => {
                sound.play('click');
                if (onOpenUpdateInfo) onOpenUpdateInfo();
                else if (onOpenPatchNotes) onOpenPatchNotes();
              }}
              title="View Version 3.5.0 Master Update Information"
              className="px-2 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 hover:border-[#111111] text-[#222222] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Info size={12} className="text-cyan-700" />
              <span className="font-mono text-[11px] uppercase tracking-wider">Update Info</span>
            </button>

            {/* Patch Info */}
            <button
              type="button"
              id="topbar-strip-patch-info-btn"
              onClick={() => {
                sound.play('click');
                if (onOpenPatchNotes) onOpenPatchNotes();
              }}
              title="View Master Patch Changelog"
              className="px-2 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 hover:border-[#111111] text-[#222222] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Sparkles size={12} className="text-amber-600" />
              <span className="font-mono text-[11px] uppercase tracking-wider">Patch Info</span>
            </button>

            {/* BSAT Studio */}
            <button
              type="button"
              id="topbar-strip-bsat-btn"
              onClick={() => {
                sound.play('click');
                if (onNavigate) onNavigate('bsat');
              }}
              title="Launch BSAT Studio: TypeScript Auto-Start, Batch & Shell Scripts, Server Daemon"
              className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-400 hover:border-emerald-600 text-emerald-900 font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Zap size={13} className="text-emerald-600 fill-emerald-500" />
              <span className="font-mono text-[11px] uppercase tracking-wider">BSAT Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Galactic Credits Monetary System & FX Console Modal */}
      <GalacticCreditsModal
        isOpen={isCreditsSystemModalOpen}
        onClose={() => setIsCreditsSystemModalOpen(false)}
        resources={resources}
        onUpdateResources={onUpdateResources}
        onNavigate={onNavigate}
      />

      {/* Conscript Recruits & Colonial Demographics Command Modal */}
      <ConscriptRecruitsModal
        isOpen={isConscriptRecruitsModalOpen}
        onClose={() => setIsConscriptRecruitsModalOpen(false)}
        resources={resources}
        planets={planets}
        activePlanetId={activePlanet.id}
        onUpdateResources={onUpdateResources}
        onUpdatePlanets={onUpdatePlanets}
        onColonizePlanet={onColonizePlanet}
        onNavigate={onNavigate}
        initialTab={conscriptModalTab}
      />
    </header>
  );
};

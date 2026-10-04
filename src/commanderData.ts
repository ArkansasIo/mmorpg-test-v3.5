// =========================================================================
// COMMANDER SYSTEM DATA: OFFICERS, TALENT TREES, IMPLANTS & SPECIALIZATIONS
// =========================================================================

export type CommanderClassId = 'admiral' | 'geologist' | 'archon' | 'inquisitor' | 'technocrat';

export interface CommanderClass {
  id: CommanderClassId;
  name: string;
  title: string;
  icon: string;
  badgeColor: string;
  description: string;
  perks: string[];
}

export const COMMANDER_CLASSES: CommanderClass[] = [
  {
    id: 'admiral',
    name: 'Fleet Admiral',
    title: 'Supreme Naval Tactician',
    icon: '⚔️',
    badgeColor: 'border-rose-500 text-rose-700 bg-rose-50',
    description: 'Specializes in armada maneuvers, dreadnought fire coordination, and capital ship combat doctrines.',
    perks: ['+18% Fleet Weapon Power', '+15% Subspace Combat Speed', '-20% Warship Casualties in Victory'],
  },
  {
    id: 'geologist',
    name: 'Grand Geologist',
    title: 'Master of Planetary Resources',
    icon: '⛏️',
    badgeColor: 'border-amber-500 text-amber-700 bg-amber-50',
    description: 'Expert in planetary tectonic drilling, deep ore veins, and atmospheric gas harvesting.',
    perks: ['+25% Metal, Crystal & Deuterium Output', '+30% Warehouse Storage Capacity', '-15% Facility Energy Consumption'],
  },
  {
    id: 'archon',
    name: 'Stargate Archon',
    title: 'Deep Space Recon Vanguard',
    icon: '🌌',
    badgeColor: 'border-cyan-500 text-cyan-700 bg-cyan-50',
    description: 'Pioneers through unstable wormholes and anomalous planetary systems across uncharted galaxies.',
    perks: ['+35% Expedition Discovery Rate', '+50% Rare Relic & Ship Finding Chance', '-30% Jump Fuel Consumption'],
  },
  {
    id: 'inquisitor',
    name: 'High Inquisitor',
    title: 'Covert Intelligence Director',
    icon: '👁️',
    badgeColor: 'border-purple-500 text-purple-700 bg-purple-50',
    description: 'Runs subspace spy probe networks, counter-intelligence matrices, and planetary sabotage rings.',
    perks: ['+4 Espionage Tech Level (Effective)', '+40% Counter-Espionage Defense', '0 Cooldown on Covert Recon'],
  },
  {
    id: 'technocrat',
    name: 'Nanite Technocrat',
    title: 'Architect of Megastructures',
    icon: '🧪',
    badgeColor: 'border-emerald-500 text-emerald-700 bg-emerald-50',
    description: 'Command of molecular nanite assemblers, particle accelerators, and quantum science superclusters.',
    perks: ['-25% Research Lab Experiment Time', '-20% Orbital Shipyard Build Duration', '+2 Shipyard Construction Queues'],
  },
];

export interface Officer {
  id: string;
  name: string;
  callsign: string;
  role: string;
  avatar: string;
  race: string;
  level: number;
  maxLevel: number;
  isActive: boolean;
  hiredUntil: string;
  hireCostNaquadah: number;
  hireCostDarkMatter: number;
  bonuses: string[];
  quote: string;
}

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'officer-carter',
    name: 'Col. Samantha Carter',
    callsign: 'ASTRO-LEAD',
    role: 'Fleet Combat Strategist',
    avatar: '👩‍✈️',
    race: "Tau'ri",
    level: 3,
    maxLevel: 5,
    isActive: true,
    hiredUntil: 'Permanent Commission',
    hireCostNaquadah: 150000,
    hireCostDarkMatter: 500,
    bonuses: ['+12% Weapon Damage for Cruisers & Battleships', '+15% Shield Harmonic Resilience'],
    quote: 'If we can modify the subspace pulse, we can blow right past their defense perimeter.',
  },
  {
    id: 'officer-tealc',
    name: "Master Teal'c",
    callsign: 'FIRST-PRIME',
    role: 'Planetary Defense Commander',
    avatar: '🛡️',
    race: 'Jaffa Free League',
    level: 2,
    maxLevel: 5,
    isActive: true,
    hiredUntil: 'Permanent Commission',
    hireCostNaquadah: 120000,
    hireCostDarkMatter: 400,
    bonuses: ['+25% Planetary Defense Cannon Armor', '+20% Ground Troops Combat Effectiveness'],
    quote: 'Things will not calm down, Daniel Jackson. They will, in fact, calm up.',
  },
  {
    id: 'officer-jackson',
    name: 'Dr. Daniel Jackson',
    callsign: 'ARCHEON',
    role: 'Chief Science & Relic Decipherer',
    avatar: '📜',
    race: "Tau'ri",
    level: 2,
    maxLevel: 5,
    isActive: false,
    hiredUntil: 'Available for Commission',
    hireCostNaquadah: 200000,
    hireCostDarkMatter: 600,
    bonuses: ['-20% Ancient & Megastructure Research Time', '+30% Relic Discovery XP Yield'],
    quote: 'Ancient technology isn’t magic, it’s just physics we haven’t written equations for yet.',
  },
  {
    id: 'officer-quinn',
    name: 'Minister Jonas Quinn',
    callsign: 'CIPHER',
    role: 'Director of Covert Intelligence',
    avatar: '🕵️',
    race: 'Kelowna / Langara',
    level: 1,
    maxLevel: 5,
    isActive: false,
    hiredUntil: 'Available for Commission',
    hireCostNaquadah: 180000,
    hireCostDarkMatter: 450,
    bonuses: ['+35% Detection of Incoming Hostile Fleets', '+20% Success on Planetary Sabotage'],
    quote: 'I memorized your library of reconnaissance documents yesterday morning.',
  },
  {
    id: 'officer-hammond',
    name: 'General George Hammond',
    callsign: 'COMMAND-PRIME',
    role: 'Supreme High Marshal',
    avatar: '⭐',
    race: "Tau'ri",
    level: 3,
    maxLevel: 5,
    isActive: true,
    hiredUntil: 'Permanent Commission',
    hireCostNaquadah: 300000,
    hireCostDarkMatter: 1000,
    bonuses: ['+2 Attack Turns maximum capacity (102 cap)', '+15% All Mines Production output'],
    quote: 'Chevron seven is locked. May the fortunes of war favor this expedition.',
  },
];

export interface CommanderTalent {
  id: string;
  name: string;
  branch: 'warfare' | 'industry' | 'exploration';
  tier: number;
  currentPoints: number;
  maxPoints: number;
  icon: string;
  description: string;
  bonusPerPoint: string;
}

export const INITIAL_COMMANDER_TALENTS: CommanderTalent[] = [
  // WARFARE BRANCH
  {
    id: 'talent-ballistics',
    name: 'Plasma & Kinetic Focusing',
    branch: 'warfare',
    tier: 1,
    currentPoints: 3,
    maxPoints: 5,
    icon: '💥',
    description: 'Increases raw offensive firepower of all laser, coilgun, and plasma batteries.',
    bonusPerPoint: '+3% Fleet Attack Power per point',
  },
  {
    id: 'talent-deflectors',
    name: 'Shield Harmonics Oscillation',
    branch: 'warfare',
    tier: 1,
    currentPoints: 2,
    maxPoints: 5,
    icon: '🛡️',
    description: 'Calibrates deflector barrier frequency to absorb enemy torpedo impacts.',
    bonusPerPoint: '+4% Ship Shield Capacity per point',
  },
  {
    id: 'talent-rapidfire',
    name: 'Subspace Targeting Vectors',
    branch: 'warfare',
    tier: 2,
    currentPoints: 2,
    maxPoints: 3,
    icon: '🎯',
    description: 'Enhances automated fire-control algorithms for rapid-fire against swarms.',
    bonusPerPoint: '+5% Rapid-fire trigger frequency per point',
  },
  {
    id: 'talent-capital-hull',
    name: 'Trinium Armor Reinforcement',
    branch: 'warfare',
    tier: 3,
    currentPoints: 1,
    maxPoints: 3,
    icon: '🚢',
    description: 'Installs dense molecular trinium lattice into Battleship and Titan hulls.',
    bonusPerPoint: '+6% Heavy Hull Structural Integrity per point',
  },

  // INDUSTRY BRANCH
  {
    id: 'talent-deep-mining',
    name: 'Sub-Crustal Tectonic Drills',
    branch: 'industry',
    tier: 1,
    currentPoints: 3,
    maxPoints: 5,
    icon: '⛏️',
    description: 'Optimizes robotic mining excavators for dense metallic veins.',
    bonusPerPoint: '+4% Metal Mine production per point',
  },
  {
    id: 'talent-crystal-quarry',
    name: 'Harmonic Quartz Cutting',
    branch: 'industry',
    tier: 1,
    currentPoints: 2,
    maxPoints: 5,
    icon: '💎',
    description: 'Laser excavation arrays harvesting monocrystalline silicon without fracture.',
    bonusPerPoint: '+4% Crystal Mine production per point',
  },
  {
    id: 'talent-deuterium-distill',
    name: 'Cryogenic Isotope Centrifuges',
    branch: 'industry',
    tier: 2,
    currentPoints: 2,
    maxPoints: 3,
    icon: '💧',
    description: 'Heavy hydrogen distillation towers operating at zero thermal loss.',
    bonusPerPoint: '+5% Deuterium Synthesizer output per point',
  },
  {
    id: 'talent-nanite-assembly',
    name: 'Nanite Swarm Coordination',
    branch: 'industry',
    tier: 3,
    currentPoints: 1,
    maxPoints: 3,
    icon: '⚙️',
    description: 'Molecular nanobots constructing planetary facilities around the clock.',
    bonusPerPoint: '-6% Construction Time for all facilities per point',
  },

  // EXPLORATION & COVERT BRANCH
  {
    id: 'talent-stargate-routing',
    name: 'Glyph Compression Matrix',
    branch: 'exploration',
    tier: 1,
    currentPoints: 1,
    maxPoints: 5,
    icon: '🌀',
    description: 'Speeds up wormhole connection calculations and reduces vortex flare.',
    bonusPerPoint: '+4% Expedition Speed & Stargate Dialing Rate',
  },
  {
    id: 'talent-relic-analysis',
    name: 'Ancient Sensor Calibration',
    branch: 'exploration',
    tier: 1,
    currentPoints: 1,
    maxPoints: 5,
    icon: '🏺',
    description: 'Advanced spectrum sensors capable of detecting dormant alien derelicts.',
    bonusPerPoint: '+6% Chance to discover intact ships in Deep Space',
  },
  {
    id: 'talent-counter-intel',
    name: 'Subspace Encryption Cloak',
    branch: 'exploration',
    tier: 2,
    currentPoints: 0,
    maxPoints: 3,
    icon: '🕵️',
    description: 'Encrypts fleet transponders and obscures true shipyard production counts.',
    bonusPerPoint: '+10% Covert Probe Evasion per point',
  },
];

export interface CommanderImplant {
  id: string;
  name: string;
  slot: 'cortex' | 'neural' | 'tactical' | 'ocular';
  tier: 'Standard' | 'Advanced' | 'Masterwork' | 'Ancient';
  icon: string;
  isEquipped: boolean;
  effect: string;
  description: string;
}

export const INITIAL_COMMANDER_IMPLANTS: CommanderImplant[] = [
  {
    id: 'implant-cortex-1',
    name: 'Cortex Quantum Coprocessor',
    slot: 'cortex',
    tier: 'Masterwork',
    icon: '🧠',
    isEquipped: true,
    effect: '+15% Commander Experience Gain',
    description: 'Synthetic neural thread enhancing strategic tactical calculation speeds.',
  },
  {
    id: 'implant-neural-1',
    name: 'Subspace Synaptic Relay',
    slot: 'neural',
    tier: 'Advanced',
    icon: '⚡',
    isEquipped: true,
    effect: '+10% Fleet Subspace Speed across all sectors',
    description: 'Direct bio-neural link to flagship hyperspace drive regulators.',
  },
  {
    id: 'implant-tactical-1',
    name: 'Targeting HUD Telemetry Implant',
    slot: 'tactical',
    tier: 'Ancient',
    icon: '🎯',
    isEquipped: true,
    effect: '+12% Heavy Weapon Critical Hit Rate',
    description: 'Recovered Alteran optical implant feeding instant trajectories to orbital cannons.',
  },
  {
    id: 'implant-ocular-1',
    name: 'Deep Anomaly Ocular Scanner',
    slot: 'ocular',
    tier: 'Standard',
    icon: '👁️',
    isEquipped: false,
    effect: '+20% Derelict Salvage Yield from Expeditions',
    description: 'Filters cosmic radiation to reveal hidden debris and dark matter condensations.',
  },
];

export interface CommanderMedal {
  id: string;
  name: string;
  ribbonColor: string;
  icon: string;
  criteria: string;
  dateEarned: string;
}

export const INITIAL_COMMANDER_MEDALS: CommanderMedal[] = [
  {
    id: 'medal-1',
    name: 'Milky Way Campaign Star',
    ribbonColor: 'bg-blue-600',
    icon: '⭐',
    criteria: '100+ Total Space & Ground Battles Commanded',
    dateEarned: 'Cycle 34.2',
  },
  {
    id: 'medal-2',
    name: 'Event Horizon Vanguard Cross',
    ribbonColor: 'bg-emerald-600',
    icon: '🌀',
    criteria: '50+ Successful Deep Space Stargate Expeditions',
    dateEarned: 'Cycle 35.8',
  },
  {
    id: 'medal-3',
    name: 'System Lord Crusher Ribbon',
    ribbonColor: 'bg-amber-600',
    icon: '👑',
    criteria: 'Decisive Victory against a Goa\'uld Armada',
    dateEarned: 'Cycle 36.1',
  },
  {
    id: 'medal-4',
    name: 'Titan Megastructure Builder',
    ribbonColor: 'bg-purple-600',
    icon: '🏗️',
    criteria: 'Commissioned a Dyson Ring or Orbital Starbase',
    dateEarned: 'Cycle 37.0',
  },
];

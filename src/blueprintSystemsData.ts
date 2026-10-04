export type BlueprintType =
  | 'ship'
  | 'module'
  | 'ammunition'
  | 'drone'
  | 'subsystem'
  | 'structure'
  | 'capital_component'
  | 'rig';

export type TechTier = 'T1' | 'T2' | 'T3' | 'Faction' | 'Capital';

export type EveFaction =
  | 'Caldari'
  | 'Minmatar'
  | 'Gallente'
  | 'Amarr'
  | 'Pirate'
  | 'Upwell'
  | 'Sleeper'
  | 'Empire';

export type EveShipClass =
  | 'Frigate'
  | 'Assault Frigate'
  | 'Destroyer'
  | 'Cruiser'
  | 'Heavy Assault Cruiser'
  | 'Battlecruiser'
  | 'Command Ship'
  | 'Battleship'
  | 'Marauder'
  | 'Black Ops'
  | 'Strategic Cruiser'
  | 'Dreadnought'
  | 'Carrier'
  | 'Supercarrier'
  | 'Titan'
  | 'Industrial'
  | 'Capital Industrial'
  | 'Citadel'
  | 'Component'
  | 'Hardware'
  | 'Drone'
  | 'Ammo'
  | 'Subsystem';

export interface EveBlueprint {
  id: string;
  name: string;
  type: BlueprintType;
  techLevel: TechTier;
  faction?: EveFaction;
  shipClass?: EveShipClass;
  description: string;
  materialEfficiency: number; // ME (0 to 10%)
  timeEfficiency: number; // TE (0 to 20%)
  runsRemaining: number;
  maxRunsPerCopy: number;
  isOriginal: boolean; // BPO vs BPC
  marketSeedPrice?: number; // In Naquadah or Credits
  baseBuildCost: {
    metal: number;
    crystal: number;
    deuterium: number;
    naquadah?: number;
    trinium?: number;
  };
  mineralsCost?: {
    tritanium?: number;
    pyerite?: number;
    mexallon?: number;
    isogen?: number;
    nocxium?: number;
    zydrine?: number;
    megacyte?: number;
    morphite?: number;
  };
  baseBuildTimeSeconds: number;
  subsystemSlot?: 'offensive' | 'defensive' | 'propulsion' | 'core';
  inventionOutputId?: string;
  inventionChance?: number; // 0 - 100%
  requiredDatacores?: { name: string; amount: number }[];
  relicsRequired?: { name: string; amount: number }[];
  capitalComponentsRequired?: { name: string; amount: number }[];
  reverseEngineeringOutputId?: string;
  outputItem: {
    name: string;
    category: string;
    statSummary: string;
    hullHp?: number;
    shieldHp?: number;
    armorHp?: number;
    dps?: number;
    powergridMw?: number;
    cpuTf?: number;
    doomsdayName?: string;
  };
}

export interface DecryptorItem {
  id: string;
  name: string;
  probabilityBonus: number; // e.g. +40% or -10%
  meModifier: number; // e.g. +1, +2, -1
  teModifier: number; // e.g. +2, +4
  runsModifier: number; // e.g. +1, +2, +3
  description: string;
}

export interface DatacoreItem {
  id: string;
  name: string;
  discipline: string;
  description: string;
  marketPrice: number;
}

export interface AncientRelicItem {
  id: string;
  name: string;
  quality: 'intact' | 'malfunctioning' | 'wrecked';
  baseSuccessRate: number;
  description: string;
}

export interface IndustryFacility {
  id: string;
  name: string;
  type: 'station' | 'raitaru' | 'azbel' | 'sotiyo' | 'hyasyoda';
  location: string;
  timeMultiplier: number; // e.g. 0.85
  materialMultiplier: number; // e.g. 0.95
  costMultiplier: number; // e.g. 0.85
  description: string;
  specializationBonus: string;
}

export interface IndustryJob {
  id: string;
  type:
    | 'me_research'
    | 'te_research'
    | 'copying'
    | 'invention'
    | 'manufacturing'
    | 'reverse_engineering';
  blueprintId: string;
  blueprintName: string;
  runs: number;
  targetLevel?: number; // For ME or TE
  progressPercent: number;
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  status: 'active' | 'completed' | 'paused';
  installedAt: string;
  facilityId?: string;
  outputDetails: string;
  inventionSuccessRoll?: boolean;
}

// -------------------------------------------------------------
// EVE ONLINE DECRYPTORS (AUTHENTIC STATS)
// -------------------------------------------------------------
export const EVE_DECRYPTORS: DecryptorItem[] = [
  {
    id: 'dec_attainment',
    name: 'Attainment Decryptor',
    probabilityBonus: 40,
    meModifier: -1,
    teModifier: -2,
    runsModifier: 2,
    description: 'High success probability key (+40%). Sacrifices ME and TE for elevated throughput.',
  },
  {
    id: 'dec_augmentation',
    name: 'Augmentation Decryptor',
    probabilityBonus: -10,
    meModifier: 2,
    teModifier: 4,
    runsModifier: 1,
    description: 'High-grade precision cryptogram. Yields superior ME +2 and TE +4 copies.',
  },
  {
    id: 'dec_parity',
    name: 'Parity Decryptor',
    probabilityBonus: 20,
    meModifier: 1,
    teModifier: 2,
    runsModifier: 1,
    description: 'Balanced decryptor providing stable +20% success and balanced +1 ME / +2 TE.',
  },
  {
    id: 'dec_symmetry',
    name: 'Symmetry Decryptor',
    probabilityBonus: 0,
    meModifier: 1,
    teModifier: 8,
    runsModifier: 3,
    description: 'Maximizes production speed (+8 TE) and run volume (+3 runs).',
  },
  {
    id: 'dec_process',
    name: 'Process Decryptor',
    probabilityBonus: 10,
    meModifier: 3,
    teModifier: 0,
    runsModifier: 1,
    description: 'Maximizes raw material reduction (+3 ME) with a slight probability bonus (+10%).',
  },
  {
    id: 'dec_accelerant',
    name: 'Accelerant Decryptor',
    probabilityBonus: 20,
    meModifier: 0,
    teModifier: 6,
    runsModifier: 0,
    description: 'Boosts research velocity and time efficiency (+6 TE) with solid odds (+20%).',
  },
];

// -------------------------------------------------------------
// EVE ONLINE DATACORES
// -------------------------------------------------------------
export const EVE_DATACORES: DatacoreItem[] = [
  { id: 'dc_mech', name: 'Mechanical Engineering', discipline: 'Engineering', description: 'Theoretical kinematics & micro-composite structural stress tolerances.', marketPrice: 12500 },
  { id: 'dc_caldari', name: 'Caldari Starship Engineering', discipline: 'Naval Architecture', description: 'Shield matrix harmonics, kinetic ballistic mounts & missile bay layouts.', marketPrice: 15000 },
  { id: 'dc_minmatar', name: 'Minmatar Starship Engineering', discipline: 'Naval Architecture', description: 'Overdriven thruster manifolds, autocannon tracks & reinforced titanium skeletons.', marketPrice: 15000 },
  { id: 'dc_gallente', name: 'Gallente Starship Engineering', discipline: 'Naval Architecture', description: 'Magnetic particle containment, drone bandwidth routing & heavy armor plating.', marketPrice: 15000 },
  { id: 'dc_amarr', name: 'Amarr Starship Engineering', discipline: 'Naval Architecture', description: 'Capacitor grid conductors, laser lens assemblies & sacred gold armor alloy.', marketPrice: 15000 },
  { id: 'dc_rocket', name: 'Rocket Science', discipline: 'Propulsion & Munitions', description: 'Solid/liquid fuel rocket acceleration curves and shaped explosive charges.', marketPrice: 18000 },
  { id: 'dc_quantum', name: 'Quantum Physics', discipline: 'Theoretical Science', description: 'Entanglement communicators, subatomic sensors and cloaking phase arrays.', marketPrice: 22000 },
  { id: 'dc_laser', name: 'Laser Physics', discipline: 'High-Energy Physics', description: 'Focal crystal geometries, microwave amplification and tachyon beam optics.', marketPrice: 18000 },
  { id: 'dc_nanite', name: 'Nanite Engineering', discipline: 'Applied Nanotechnology', description: 'Molecular disassembly swarms and autonomous self-repair matrices.', marketPrice: 24000 },
  { id: 'dc_high_energy', name: 'High Energy Physics', discipline: 'High-Energy Physics', description: 'Antimatter confinement protocols and subspace warp field generators.', marketPrice: 25000 },
  { id: 'dc_plasma', name: 'Plasma Physics', discipline: 'Particle Physics', description: 'Superheated ion stream dynamics and magnetic containment nozzles.', marketPrice: 20000 },
];

// -------------------------------------------------------------
// EVE ONLINE ANCIENT RELICS (FOR T3 REVERSE ENGINEERING)
// -------------------------------------------------------------
export const EVE_ANCIENT_RELICS: AncientRelicItem[] = [
  { id: 'relic_intact', name: 'Intact Ancient Relic', quality: 'intact', baseSuccessRate: 75, description: 'Pristine Sleeper artifact with undamaged neural circuitry and superconductor matrices.' },
  { id: 'relic_malfunc', name: 'Malfunctioning Ancient Relic', quality: 'malfunctioning', baseSuccessRate: 50, description: 'Partially ionized Sleeper component requiring algorithmic decryptor correction.' },
  { id: 'relic_wrecked', name: 'Wrecked Ancient Relic', quality: 'wrecked', baseSuccessRate: 30, description: 'Fractured hull fragment from the Talocan / Sleeper enclave, heavily degraded.' },
];

// -------------------------------------------------------------
// EVE ONLINE INDUSTRIAL FACILITIES & CITADELS
// -------------------------------------------------------------
export const EVE_FACILITIES: IndustryFacility[] = [
  {
    id: 'fac_station',
    name: 'Planetary Station Assembly Plant',
    type: 'station',
    location: 'Homeworld Orbit',
    timeMultiplier: 1.0,
    materialMultiplier: 1.0,
    costMultiplier: 1.0,
    description: 'Standard orbital station manufacturing line with standard tax and throughput.',
    specializationBonus: 'Baseline production & standard public availability.',
  },
  {
    id: 'fac_raitaru',
    name: 'Raitaru Engineering Complex (Medium Upwell)',
    type: 'raitaru',
    location: 'Deep Subspace Anchor',
    timeMultiplier: 0.85,
    materialMultiplier: 0.95,
    costMultiplier: 0.88,
    description: 'Specialized medium Upwell structure tuned for swift research, copying, and ME/TE optimization.',
    specializationBonus: '-15% Job Duration • -5% Material Cost • +15% ME/TE Research Velocity',
  },
  {
    id: 'fac_azbel',
    name: 'Azbel Production Complex (Large Upwell)',
    type: 'azbel',
    location: 'Colonial Asteroid Belt',
    timeMultiplier: 0.75,
    materialMultiplier: 0.92,
    costMultiplier: 0.82,
    description: 'Heavy industrial facility designed for mass hull assembly, cruisers, battlecruisers, and modules.',
    specializationBonus: '-25% Job Duration • -8% Material Cost • -18% Installation Tax',
  },
  {
    id: 'fac_sotiyo',
    name: 'Sotiyo Supercapital Drydock (XL Upwell)',
    type: 'sotiyo',
    location: 'Deep Lagrange Point',
    timeMultiplier: 0.65,
    materialMultiplier: 0.88,
    costMultiplier: 0.75,
    description: 'Colossal extra-large manufacturing citadel capable of constructing Dreadnoughts, Carriers, and Titans.',
    specializationBonus: '-35% Job Duration • -12% Material Cost • Supercapital & Capital Component Optimization',
  },
  {
    id: 'fac_hyasyoda',
    name: 'Hyasyoda Corporate Science Institute',
    type: 'hyasyoda',
    location: 'High-Tech System Core',
    timeMultiplier: 0.70,
    materialMultiplier: 0.94,
    costMultiplier: 0.90,
    description: 'Corporate laboratory complex optimized for cryptanalytic invention and reverse engineering.',
    specializationBonus: '+30% Invention & Reverse Engineering Speed • +10% Flat Invention Success Rate',
  },
];

// -------------------------------------------------------------
// COMPREHENSIVE EVE ONLINE BLUEPRINTS ROSTER
// -------------------------------------------------------------
export const INITIAL_EVE_BLUEPRINTS: EveBlueprint[] = [
  // ==========================================
  // FRIGATES & ASSAULT FRIGATES
  // ==========================================
  {
    id: 'bp_rifter',
    name: 'Rifter Combat Frigate BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Minmatar',
    shipClass: 'Frigate',
    description: 'Iconic Minmatar combat frigate renowned for swift velocity, angular tracking, and fierce autocannon firepower.',
    materialEfficiency: 10,
    timeEfficiency: 20,
    runsRemaining: 9999,
    maxRunsPerCopy: 30,
    isOriginal: true,
    marketSeedPrice: 150000,
    baseBuildCost: { metal: 24000, crystal: 12000, deuterium: 3500 },
    mineralsCost: { tritanium: 16000, pyerite: 4500, mexallon: 1200, isogen: 250 },
    baseBuildTimeSeconds: 60,
    inventionOutputId: 'bp_wolf_t2',
    inventionChance: 60,
    requiredDatacores: [
      { name: 'Mechanical Engineering', amount: 2 },
      { name: 'Minmatar Starship Engineering', amount: 2 },
    ],
    outputItem: {
      name: 'Rifter Frigate',
      category: 'Combat Frigate',
      statSummary: 'Shield: 4,500 HP • DPS: 145 • Warp: 5.5 AU/s • 3x 200mm Autocannons',
      shieldHp: 4500,
      armorHp: 3800,
      hullHp: 3200,
      dps: 145,
    },
  },
  {
    id: 'bp_wolf_t2',
    name: 'Wolf Assault Frigate BPC',
    type: 'ship',
    techLevel: 'T2',
    faction: 'Minmatar',
    shipClass: 'Assault Frigate',
    description: 'Tech II Assault Frigate reinforced with dense neutronium armor layers and devastating high-damage projectile mounts.',
    materialEfficiency: 2,
    timeEfficiency: 4,
    runsRemaining: 10,
    maxRunsPerCopy: 10,
    isOriginal: false,
    baseBuildCost: { metal: 65000, crystal: 38000, deuterium: 18000, trinium: 4000 },
    mineralsCost: { tritanium: 38000, pyerite: 14000, mexallon: 4800, isogen: 1200, nocxium: 350 },
    baseBuildTimeSeconds: 180,
    outputItem: {
      name: 'Wolf Assault Frigate',
      category: 'Assault Ship',
      statSummary: 'Armor: 14,000 HP • DPS: 340 • Assault Damage Control (+75% Resist Surge)',
      shieldHp: 6500,
      armorHp: 14000,
      hullHp: 7500,
      dps: 340,
    },
  },
  {
    id: 'bp_merlin',
    name: 'Merlin Combat Frigate BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Caldari',
    shipClass: 'Frigate',
    description: 'Heavy Caldari brawler frigate outfitted with impenetrable shield deflection coils and dual hybrid blasters.',
    materialEfficiency: 9,
    timeEfficiency: 18,
    runsRemaining: 9999,
    maxRunsPerCopy: 30,
    isOriginal: true,
    marketSeedPrice: 160000,
    baseBuildCost: { metal: 26000, crystal: 14000, deuterium: 4000 },
    mineralsCost: { tritanium: 18000, pyerite: 5000, mexallon: 1400, isogen: 300 },
    baseBuildTimeSeconds: 65,
    inventionOutputId: 'bp_hawk_t2',
    inventionChance: 58,
    requiredDatacores: [
      { name: 'Rocket Science', amount: 2 },
      { name: 'Caldari Starship Engineering', amount: 2 },
    ],
    outputItem: {
      name: 'Merlin Frigate',
      category: 'Combat Frigate',
      statSummary: 'Shield: 6,800 HP • DPS: 160 • Kinetic/Thermal Shield Hardener',
      shieldHp: 6800,
      armorHp: 2900,
      hullHp: 3100,
      dps: 160,
    },
  },
  {
    id: 'bp_hawk_t2',
    name: 'Hawk Assault Frigate BPC',
    type: 'ship',
    techLevel: 'T2',
    faction: 'Caldari',
    shipClass: 'Assault Frigate',
    description: 'Tech II missile assault frigate capable of tanking immense orbital fire with dual active shield boosters.',
    materialEfficiency: 2,
    timeEfficiency: 4,
    runsRemaining: 10,
    maxRunsPerCopy: 10,
    isOriginal: false,
    baseBuildCost: { metal: 68000, crystal: 42000, deuterium: 20000, trinium: 4500 },
    baseBuildTimeSeconds: 190,
    outputItem: {
      name: 'Hawk Assault Frigate',
      category: 'Assault Ship',
      statSummary: 'Shield: 18,500 HP • DPS: 310 • Rapid Light Missile Battery',
      shieldHp: 18500,
      armorHp: 4200,
      hullHp: 5800,
      dps: 310,
    },
  },
  {
    id: 'bp_thrasher',
    name: 'Thrasher Fleet Destroyer BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Minmatar',
    shipClass: 'Destroyer',
    description: 'Lethal anti-frigate destroyer mounting 7 rapid projectile turrets capable of instant alpha vaporizations.',
    materialEfficiency: 8,
    timeEfficiency: 16,
    runsRemaining: 9999,
    maxRunsPerCopy: 25,
    isOriginal: true,
    marketSeedPrice: 280000,
    baseBuildCost: { metal: 45000, crystal: 22000, deuterium: 6500 },
    mineralsCost: { tritanium: 32000, pyerite: 9500, mexallon: 2800, isogen: 600 },
    baseBuildTimeSeconds: 95,
    outputItem: {
      name: 'Thrasher Destroyer',
      category: 'Fleet Destroyer',
      statSummary: 'Hull: 8,500 HP • DPS: 380 • 7x 280mm Howitzer Cannons',
      shieldHp: 5800,
      armorHp: 5200,
      hullHp: 8500,
      dps: 380,
    },
  },
  {
    id: 'bp_catalyst',
    name: 'Catalyst Fleet Destroyer BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Gallente',
    shipClass: 'Destroyer',
    description: 'Devastating close-range gank destroyer packing 8 neutron blasters with supreme thermal/kinetic damage.',
    materialEfficiency: 9,
    timeEfficiency: 18,
    runsRemaining: 9999,
    maxRunsPerCopy: 25,
    isOriginal: true,
    marketSeedPrice: 290000,
    baseBuildCost: { metal: 48000, crystal: 24000, deuterium: 7000 },
    mineralsCost: { tritanium: 34000, pyerite: 10200, mexallon: 3100, isogen: 650 },
    baseBuildTimeSeconds: 100,
    outputItem: {
      name: 'Catalyst Destroyer',
      category: 'Fleet Destroyer',
      statSummary: 'Armor: 9,200 HP • DPS: 440 • 8x Heavy Electron Blasters',
      shieldHp: 4800,
      armorHp: 9200,
      hullHp: 6500,
      dps: 440,
    },
  },

  // ==========================================
  // CRUISERS & HEAVY ASSAULT CRUISERS (HAC)
  // ==========================================
  {
    id: 'bp_caracal',
    name: 'Caracal Missile Cruiser BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Caldari',
    shipClass: 'Cruiser',
    description: 'Renowned long-range missile cruiser able to project heavy missile barrages beyond enemy visual horizon.',
    materialEfficiency: 8,
    timeEfficiency: 16,
    runsRemaining: 9999,
    maxRunsPerCopy: 20,
    isOriginal: true,
    marketSeedPrice: 480000,
    baseBuildCost: { metal: 78000, crystal: 45000, deuterium: 16000 },
    mineralsCost: { tritanium: 55000, pyerite: 18000, mexallon: 5500, isogen: 1200, nocxium: 300 },
    baseBuildTimeSeconds: 180,
    inventionOutputId: 'bp_cerberus_t2',
    inventionChance: 50,
    requiredDatacores: [
      { name: 'Rocket Science', amount: 3 },
      { name: 'Caldari Starship Engineering', amount: 3 },
    ],
    outputItem: {
      name: 'Caracal Cruiser',
      category: 'Combat Cruiser',
      statSummary: 'Shield: 22,000 HP • DPS: 420 • 5x Heavy Missile Launchers • Range: 85 km',
      shieldHp: 22000,
      armorHp: 8500,
      hullHp: 11000,
      dps: 420,
    },
  },
  {
    id: 'bp_cerberus_t2',
    name: 'Cerberus Heavy Assault Cruiser BPC',
    type: 'ship',
    techLevel: 'T2',
    faction: 'Caldari',
    shipClass: 'Heavy Assault Cruiser',
    description: 'Tech II Heavy Assault Cruiser capable of devastating orbital missile strikes with extreme missile velocity and flight duration.',
    materialEfficiency: 2,
    timeEfficiency: 4,
    runsRemaining: 6,
    maxRunsPerCopy: 6,
    isOriginal: false,
    baseBuildCost: { metal: 210000, crystal: 125000, deuterium: 55000, trinium: 12000 },
    baseBuildTimeSeconds: 380,
    outputItem: {
      name: 'Cerberus Heavy Assault Cruiser',
      category: 'Heavy Assault Cruiser',
      statSummary: 'Shield: 52,000 HP • DPS: 720 • Assault Missile Range: 140 km',
      shieldHp: 52000,
      armorHp: 18000,
      hullHp: 24000,
      dps: 720,
    },
  },
  {
    id: 'bp_rupture',
    name: 'Rupture Combat Cruiser BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Minmatar',
    shipClass: 'Cruiser',
    description: 'Rugged Minmatar frontline cruiser featuring dual heavy projectile batteries and active armor repair modules.',
    materialEfficiency: 9,
    timeEfficiency: 18,
    runsRemaining: 9999,
    maxRunsPerCopy: 20,
    isOriginal: true,
    marketSeedPrice: 470000,
    baseBuildCost: { metal: 75000, crystal: 42000, deuterium: 15000 },
    baseBuildTimeSeconds: 175,
    inventionOutputId: 'bp_muninn_t2',
    inventionChance: 48,
    requiredDatacores: [
      { name: 'Mechanical Engineering', amount: 3 },
      { name: 'Minmatar Starship Engineering', amount: 3 },
    ],
    outputItem: {
      name: 'Rupture Cruiser',
      category: 'Combat Cruiser',
      statSummary: 'Armor: 24,000 HP • DPS: 480 • 4x 650mm Medium Artillery Cannons',
      shieldHp: 14000,
      armorHp: 24000,
      hullHp: 13500,
      dps: 480,
    },
  },
  {
    id: 'bp_muninn_t2',
    name: 'Muninn Heavy Assault Cruiser BPC',
    type: 'ship',
    techLevel: 'T2',
    faction: 'Minmatar',
    shipClass: 'Heavy Assault Cruiser',
    description: 'Premier fleet doctrine Tech II artillery cruiser famous for devastating alpha volleys and superior speed.',
    materialEfficiency: 2,
    timeEfficiency: 4,
    runsRemaining: 6,
    maxRunsPerCopy: 6,
    isOriginal: false,
    baseBuildCost: { metal: 215000, crystal: 120000, deuterium: 58000, trinium: 11500 },
    baseBuildTimeSeconds: 390,
    outputItem: {
      name: 'Muninn Heavy Assault Cruiser',
      category: 'Heavy Assault Cruiser',
      statSummary: 'Armor: 48,000 HP • DPS: 790 • Alpha Strike: 5,600 • Warp: 4.8 AU/s',
      shieldHp: 22000,
      armorHp: 48000,
      hullHp: 21000,
      dps: 790,
    },
  },
  {
    id: 'bp_vexor',
    name: 'Vexor Drone Cruiser BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Gallente',
    shipClass: 'Cruiser',
    description: 'Heavy drone-carrier cruiser capable of deploying a full squadron of 5 medium or heavy combat drones.',
    materialEfficiency: 8,
    timeEfficiency: 16,
    runsRemaining: 9999,
    maxRunsPerCopy: 20,
    isOriginal: true,
    marketSeedPrice: 490000,
    baseBuildCost: { metal: 72000, crystal: 48000, deuterium: 18000 },
    baseBuildTimeSeconds: 185,
    inventionOutputId: 'bp_ishtar_t2',
    inventionChance: 48,
    requiredDatacores: [
      { name: 'Nanite Engineering', amount: 3 },
      { name: 'Gallente Starship Engineering', amount: 3 },
    ],
    outputItem: {
      name: 'Vexor Cruiser',
      category: 'Combat Drone Cruiser',
      statSummary: 'Armor: 26,000 HP • DPS: 510 • Drone Bandwidth: 75 Mbit/s',
      shieldHp: 12000,
      armorHp: 26000,
      hullHp: 16000,
      dps: 510,
    },
  },
  {
    id: 'bp_ishtar_t2',
    name: 'Ishtar Heavy Assault Drone Cruiser BPC',
    type: 'ship',
    techLevel: 'T2',
    faction: 'Gallente',
    shipClass: 'Heavy Assault Cruiser',
    description: 'Apex Tech II drone carrier deploying heavy Ogre II drones with tremendous tracking and resistance profile.',
    materialEfficiency: 3,
    timeEfficiency: 6,
    runsRemaining: 5,
    maxRunsPerCopy: 5,
    isOriginal: false,
    baseBuildCost: { metal: 230000, crystal: 140000, deuterium: 65000, trinium: 14000 },
    baseBuildTimeSeconds: 410,
    outputItem: {
      name: 'Ishtar Heavy Assault Cruiser',
      category: 'Heavy Assault Cruiser',
      statSummary: 'Armor: 58,000 HP • DPS: 920 • Sentry/Heavy Drone Bandwidth: 125 Mbit/s',
      shieldHp: 28000,
      armorHp: 58000,
      hullHp: 26000,
      dps: 920,
    },
  },

  // ==========================================
  // BATTLECRUISERS & COMMAND SHIPS
  // ==========================================
  {
    id: 'bp_drake',
    name: 'Drake Heavy Battlecruiser BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Caldari',
    shipClass: 'Battlecruiser',
    description: 'Heavy missile platform featuring an impenetrable kinetic/thermal passive shield defense.',
    materialEfficiency: 8,
    timeEfficiency: 14,
    runsRemaining: 9999,
    maxRunsPerCopy: 20,
    isOriginal: true,
    marketSeedPrice: 650000,
    baseBuildCost: { metal: 95000, crystal: 52000, deuterium: 22000 },
    mineralsCost: { tritanium: 75000, pyerite: 25000, mexallon: 7800, isogen: 1800, nocxium: 450 },
    baseBuildTimeSeconds: 240,
    inventionOutputId: 'bp_nighthawk_t2',
    inventionChance: 45,
    requiredDatacores: [
      { name: 'Rocket Science', amount: 4 },
      { name: 'Caldari Starship Engineering', amount: 4 },
    ],
    outputItem: {
      name: 'Drake Battlecruiser',
      category: 'Combat Battlecruiser',
      statSummary: 'Shield: 35,000 HP • DPS: 620 • 7x Heavy Missile Launchers',
      shieldHp: 35000,
      armorHp: 16000,
      hullHp: 20000,
      dps: 620,
    },
  },
  {
    id: 'bp_nighthawk_t2',
    name: 'Nighthawk Command Ship BPC',
    type: 'ship',
    techLevel: 'T2',
    faction: 'Caldari',
    shipClass: 'Command Ship',
    description: 'Advanced fleet command vessel boosting entire armada shield resistance and fleet warp coordination.',
    materialEfficiency: 3,
    timeEfficiency: 6,
    runsRemaining: 5,
    maxRunsPerCopy: 5,
    isOriginal: false,
    baseBuildCost: { metal: 280000, crystal: 160000, deuterium: 75000, trinium: 15000 },
    baseBuildTimeSeconds: 480,
    outputItem: {
      name: 'Nighthawk Command Ship',
      category: 'Fleet Command Ship',
      statSummary: 'Shield: 85,000 HP • DPS: 890 • Fleet Warfare Link (+20% Fleet Shield)',
      shieldHp: 85000,
      armorHp: 32000,
      hullHp: 42000,
      dps: 890,
    },
  },
  {
    id: 'bp_hurricane',
    name: 'Hurricane Battlecruiser BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Minmatar',
    shipClass: 'Battlecruiser',
    description: 'High-damage Minmatar battlecruiser mounting 6 heavy artillery autocannons with swift tactical agility.',
    materialEfficiency: 9,
    timeEfficiency: 18,
    runsRemaining: 9999,
    maxRunsPerCopy: 20,
    isOriginal: true,
    marketSeedPrice: 640000,
    baseBuildCost: { metal: 92000, crystal: 50000, deuterium: 21000 },
    baseBuildTimeSeconds: 235,
    inventionOutputId: 'bp_sleipnir_t2',
    inventionChance: 44,
    requiredDatacores: [
      { name: 'Mechanical Engineering', amount: 4 },
      { name: 'Minmatar Starship Engineering', amount: 4 },
    ],
    outputItem: {
      name: 'Hurricane Battlecruiser',
      category: 'Combat Battlecruiser',
      statSummary: 'Armor: 38,000 HP • DPS: 680 • 6x Medium Autocannons + 2x Missile Silos',
      shieldHp: 24000,
      armorHp: 38000,
      hullHp: 22000,
      dps: 680,
    },
  },
  {
    id: 'bp_sleipnir_t2',
    name: 'Sleipnir Fleet Command Ship BPC',
    type: 'ship',
    techLevel: 'T2',
    faction: 'Minmatar',
    shipClass: 'Command Ship',
    description: 'Armored combat command flagship projecting Armored Warfare Links and ferocious close-range DPS.',
    materialEfficiency: 2,
    timeEfficiency: 4,
    runsRemaining: 5,
    maxRunsPerCopy: 5,
    isOriginal: false,
    baseBuildCost: { metal: 290000, crystal: 165000, deuterium: 78000, trinium: 16000 },
    baseBuildTimeSeconds: 490,
    outputItem: {
      name: 'Sleipnir Command Ship',
      category: 'Fleet Command Ship',
      statSummary: 'Shield: 78,000 HP • DPS: 980 • Armored Warfare Specialist (+25% Fleet Resist)',
      shieldHp: 78000,
      armorHp: 52000,
      hullHp: 44000,
      dps: 980,
    },
  },

  // ==========================================
  // BATTLESHIPS & MARAUDERS
  // ==========================================
  {
    id: 'bp_raven',
    name: 'Raven Heavy Battleship BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Caldari',
    shipClass: 'Battleship',
    description: 'Long-range battleship armed with cruise missile silos to bombard planetary and orbital targets.',
    materialEfficiency: 6,
    timeEfficiency: 10,
    runsRemaining: 9999,
    maxRunsPerCopy: 15,
    isOriginal: true,
    marketSeedPrice: 1800000,
    baseBuildCost: { metal: 240000, crystal: 145000, deuterium: 65000 },
    mineralsCost: { tritanium: 180000, pyerite: 65000, mexallon: 22000, isogen: 5500, nocxium: 1200, zydrine: 350 },
    baseBuildTimeSeconds: 420,
    inventionOutputId: 'bp_golem_t2',
    inventionChance: 35,
    requiredDatacores: [
      { name: 'Cruise Missile Science', amount: 6 },
      { name: 'Caldari Starship Engineering', amount: 6 },
    ],
    outputItem: {
      name: 'Raven Battleship',
      category: 'Battleship',
      statSummary: 'Shield: 78,000 HP • DPS: 1,150 • 6x Torpedo Launchers',
      shieldHp: 78000,
      armorHp: 38000,
      hullHp: 48000,
      dps: 1150,
    },
  },
  {
    id: 'bp_golem_t2',
    name: 'Golem Marauder Dread-Class BPC',
    type: 'ship',
    techLevel: 'T2',
    faction: 'Caldari',
    shipClass: 'Marauder',
    description: 'Tech II Marauder equipped with a Bastion Siege Module, granting invincible self-repairs and double damage.',
    materialEfficiency: 2,
    timeEfficiency: 4,
    runsRemaining: 3,
    maxRunsPerCopy: 3,
    isOriginal: false,
    baseBuildCost: { metal: 750000, crystal: 450000, deuterium: 220000, trinium: 45000 },
    baseBuildTimeSeconds: 900,
    outputItem: {
      name: 'Golem Marauder',
      category: 'Marauder Siege Ship',
      statSummary: 'Shield: 220,000 HP • DPS: 2,400 • Bastion Module (Immunity & +100% Rep)',
      shieldHp: 220000,
      armorHp: 85000,
      hullHp: 95000,
      dps: 2400,
    },
  },
  {
    id: 'bp_tempest',
    name: 'Tempest Fleet Battleship BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Minmatar',
    shipClass: 'Battleship',
    description: 'Formidable projectile dread-scale battleship mounting colossal 1400mm artillery cannons for catastrophic alpha damage.',
    materialEfficiency: 8,
    timeEfficiency: 14,
    runsRemaining: 9999,
    maxRunsPerCopy: 15,
    isOriginal: true,
    marketSeedPrice: 1750000,
    baseBuildCost: { metal: 235000, crystal: 140000, deuterium: 62000 },
    baseBuildTimeSeconds: 410,
    inventionOutputId: 'bp_vargur_t2',
    inventionChance: 36,
    requiredDatacores: [
      { name: 'Mechanical Engineering', amount: 6 },
      { name: 'Minmatar Starship Engineering', amount: 6 },
    ],
    outputItem: {
      name: 'Tempest Battleship',
      category: 'Battleship',
      statSummary: 'Armor: 85,000 HP • DPS: 1,220 • 6x 1400mm Howitzer Cannons',
      shieldHp: 48000,
      armorHp: 85000,
      hullHp: 52000,
      dps: 1220,
    },
  },
  {
    id: 'bp_vargur_t2',
    name: 'Vargur Marauder Heavy BPC',
    type: 'ship',
    techLevel: 'T2',
    faction: 'Minmatar',
    shipClass: 'Marauder',
    description: 'Supreme Tech II siege marauder utilizing 800mm repeating autocannons capable of vaporizing enemy wings.',
    materialEfficiency: 2,
    timeEfficiency: 4,
    runsRemaining: 3,
    maxRunsPerCopy: 3,
    isOriginal: false,
    baseBuildCost: { metal: 780000, crystal: 440000, deuterium: 230000, trinium: 48000 },
    baseBuildTimeSeconds: 920,
    outputItem: {
      name: 'Vargur Marauder',
      category: 'Marauder Siege Ship',
      statSummary: 'Shield: 240,000 HP • DPS: 2,850 • Bastion Siege Autocannons',
      shieldHp: 240000,
      armorHp: 110000,
      hullHp: 98000,
      dps: 2850,
    },
  },
  {
    id: 'bp_megathron',
    name: 'Megathron Heavy Battleship BPO',
    type: 'ship',
    techLevel: 'T1',
    faction: 'Gallente',
    shipClass: 'Battleship',
    description: 'Heavy Federation gunship mounting 7 massive neutron blaster cannons with crushing close-range damage output.',
    materialEfficiency: 9,
    timeEfficiency: 16,
    runsRemaining: 9999,
    maxRunsPerCopy: 15,
    isOriginal: true,
    marketSeedPrice: 1850000,
    baseBuildCost: { metal: 250000, crystal: 150000, deuterium: 68000 },
    baseBuildTimeSeconds: 430,
    inventionOutputId: 'bp_kronos_t2',
    inventionChance: 35,
    requiredDatacores: [
      { name: 'High Energy Physics', amount: 6 },
      { name: 'Gallente Starship Engineering', amount: 6 },
    ],
    outputItem: {
      name: 'Megathron Battleship',
      category: 'Battleship',
      statSummary: 'Armor: 98,000 HP • DPS: 1,380 • 7x Heavy Neutron Blasters',
      shieldHp: 42000,
      armorHp: 98000,
      hullHp: 58000,
      dps: 1380,
    },
  },
  {
    id: 'bp_kronos_t2',
    name: 'Kronos Marauder Dread-Class BPC',
    type: 'ship',
    techLevel: 'T2',
    faction: 'Gallente',
    shipClass: 'Marauder',
    description: 'Tech II Federation flagship armed with quad heavy neutron blasters and impenetrable dual armor repair systems.',
    materialEfficiency: 2,
    timeEfficiency: 4,
    runsRemaining: 3,
    maxRunsPerCopy: 3,
    isOriginal: false,
    baseBuildCost: { metal: 820000, crystal: 470000, deuterium: 240000, trinium: 50000 },
    baseBuildTimeSeconds: 940,
    outputItem: {
      name: 'Kronos Marauder',
      category: 'Marauder Siege Ship',
      statSummary: 'Armor: 310,000 HP • DPS: 3,100 • Bastion Blaster Devastation',
      shieldHp: 65000,
      armorHp: 310000,
      hullHp: 120000,
      dps: 3100,
    },
  },

  // ==========================================
  // TECH III STRATEGIC CRUISERS & SUBSYSTEMS
  // ==========================================
  {
    id: 'bp_tengu_t3',
    name: 'Tengu Strategic Cruiser BPC',
    type: 'ship',
    techLevel: 'T3',
    faction: 'Caldari',
    shipClass: 'Strategic Cruiser',
    description: 'Modular Tech III Strategic Cruiser configurable with interchangeable offensive, propulsion, defensive, and core subsystems.',
    materialEfficiency: 4,
    timeEfficiency: 8,
    runsRemaining: 8,
    maxRunsPerCopy: 8,
    isOriginal: false,
    baseBuildCost: { metal: 480000, crystal: 310000, deuterium: 140000, naquadah: 120000 },
    baseBuildTimeSeconds: 600,
    relicsRequired: [{ name: 'Intact Ancient Relic', amount: 3 }],
    outputItem: {
      name: 'Tengu Strategic Cruiser',
      category: 'Tech III Strategic Cruiser',
      statSummary: 'Custom Modular Hulls • DPS: 1,450 • Subspace Cloak & Interdiction Nullifier',
      shieldHp: 95000,
      armorHp: 34000,
      hullHp: 38000,
      dps: 1450,
    },
  },
  {
    id: 'bp_tengu_sub_offensive',
    name: 'Tengu Offensive: Accelerated Ejection Bay BPC',
    type: 'subsystem',
    techLevel: 'T3',
    faction: 'Caldari',
    subsystemSlot: 'offensive',
    description: 'Tech III subsystem augmenting missile launcher rate-of-fire (+25%) and kinetic damage bonus (+50%).',
    materialEfficiency: 5,
    timeEfficiency: 10,
    runsRemaining: 15,
    maxRunsPerCopy: 15,
    isOriginal: false,
    baseBuildCost: { metal: 95000, crystal: 65000, deuterium: 32000 },
    baseBuildTimeSeconds: 150,
    outputItem: {
      name: 'Accelerated Ejection Bay Subsystem',
      category: 'T3 Offensive Subsystem',
      statSummary: '+25% Missile Fire Rate • +50% Kinetic Missile Velocity • 6 High Slots',
    },
  },
  {
    id: 'bp_tengu_sub_defensive',
    name: 'Tengu Defensive: Covert Reconfiguration BPC',
    type: 'subsystem',
    techLevel: 'T3',
    faction: 'Caldari',
    subsystemSlot: 'defensive',
    description: 'Enables mounting Covert Ops Cloaking Device II and grants complete bubble interdiction nullification.',
    materialEfficiency: 5,
    timeEfficiency: 10,
    runsRemaining: 15,
    maxRunsPerCopy: 15,
    isOriginal: false,
    baseBuildCost: { metal: 90000, crystal: 68000, deuterium: 34000 },
    baseBuildTimeSeconds: 150,
    outputItem: {
      name: 'Covert Reconfiguration Subsystem',
      category: 'T3 Defensive Subsystem',
      statSummary: 'Warp Cloaked Enabled • Interdiction Bubble Nullifier • +15% Shield Resist',
    },
  },
  {
    id: 'bp_loki_t3',
    name: 'Loki Strategic Cruiser BPC',
    type: 'ship',
    techLevel: 'T3',
    faction: 'Minmatar',
    shipClass: 'Strategic Cruiser',
    description: 'Minmatar Tech III Strategic Cruiser versatile in skirmish warfare, long-range stasis web projection, and artillery ambush.',
    materialEfficiency: 4,
    timeEfficiency: 8,
    runsRemaining: 8,
    maxRunsPerCopy: 8,
    isOriginal: false,
    baseBuildCost: { metal: 490000, crystal: 300000, deuterium: 145000, naquadah: 125000 },
    baseBuildTimeSeconds: 610,
    relicsRequired: [{ name: 'Intact Ancient Relic', amount: 3 }],
    outputItem: {
      name: 'Loki Strategic Cruiser',
      category: 'Tech III Strategic Cruiser',
      statSummary: 'Stasis Web Range: +60% • DPS: 1,520 • 650mm Artillery / Heavy Missiles',
      shieldHp: 75000,
      armorHp: 78000,
      hullHp: 42000,
      dps: 1520,
    },
  },

  // ==========================================
  // FACTION & PIRATE WARSHIPS
  // ==========================================
  {
    id: 'bp_gila',
    name: 'Gila Guristas Faction Cruiser BPC',
    type: 'ship',
    techLevel: 'Faction',
    faction: 'Pirate',
    shipClass: 'Cruiser',
    description: 'Feared Guristas pirate cruiser with terrifying 500% medium drone damage and impenetrable thermal/kinetic shield resistances.',
    materialEfficiency: 5,
    timeEfficiency: 10,
    runsRemaining: 5,
    maxRunsPerCopy: 5,
    isOriginal: false,
    marketSeedPrice: 1200000,
    baseBuildCost: { metal: 185000, crystal: 110000, deuterium: 52000, trinium: 15000 },
    baseBuildTimeSeconds: 320,
    outputItem: {
      name: 'Gila Faction Cruiser',
      category: 'Pirate Faction Cruiser',
      statSummary: 'Shield: 48,000 HP • DPS: 950 • +500% Drone HP/Damage • Rapid Missiles',
      shieldHp: 48000,
      armorHp: 16000,
      hullHp: 20000,
      dps: 950,
    },
  },
  {
    id: 'bp_machariel',
    name: 'Machariel Angel Cartel Battleship BPC',
    type: 'ship',
    techLevel: 'Faction',
    faction: 'Pirate',
    shipClass: 'Battleship',
    description: 'Angel Cartel flagship revered as the fastest battleship in New Eden, delivering staggering 1400mm autocannon alpha volleys.',
    materialEfficiency: 5,
    timeEfficiency: 10,
    runsRemaining: 3,
    maxRunsPerCopy: 3,
    isOriginal: false,
    marketSeedPrice: 3800000,
    baseBuildCost: { metal: 580000, crystal: 360000, deuterium: 175000, trinium: 40000 },
    baseBuildTimeSeconds: 650,
    outputItem: {
      name: 'Machariel Battleship',
      category: 'Pirate Faction Battleship',
      statSummary: 'Armor: 145,000 HP • DPS: 1,850 • Warp: 4.2 AU/s • 800mm Autocannons',
      shieldHp: 95000,
      armorHp: 145000,
      hullHp: 88000,
      dps: 1850,
    },
  },
  {
    id: 'bp_rattlesnake',
    name: 'Rattlesnake Guristas Battleship BPC',
    type: 'ship',
    techLevel: 'Faction',
    faction: 'Pirate',
    shipClass: 'Battleship',
    description: 'Colossal pirate battleship combining +375% Heavy/Sentry Drone damage with cruise missile battery devastation.',
    materialEfficiency: 5,
    timeEfficiency: 10,
    runsRemaining: 3,
    maxRunsPerCopy: 3,
    isOriginal: false,
    marketSeedPrice: 4200000,
    baseBuildCost: { metal: 620000, crystal: 390000, deuterium: 190000, trinium: 45000 },
    baseBuildTimeSeconds: 680,
    outputItem: {
      name: 'Rattlesnake Battleship',
      category: 'Pirate Faction Battleship',
      statSummary: 'Shield: 195,000 HP • DPS: 2,150 • Geckos & Cruise Missiles',
      shieldHp: 195000,
      armorHp: 75000,
      hullHp: 95000,
      dps: 2150,
    },
  },

  // ==========================================
  // CAPITAL SHIPS: DREADNOUGHTS & CARRIERS
  // ==========================================
  {
    id: 'bp_revelation',
    name: 'Revelation Dreadnought Heavy BPO',
    type: 'ship',
    techLevel: 'Capital',
    faction: 'Amarr',
    shipClass: 'Dreadnought',
    description: 'Colossal capital siege dreadnought armed with apocalyptic Capital Energy Beam Turrets to annihilate starbases.',
    materialEfficiency: 4,
    timeEfficiency: 8,
    runsRemaining: 9999,
    maxRunsPerCopy: 5,
    isOriginal: true,
    marketSeedPrice: 8500000,
    baseBuildCost: { metal: 1800000, crystal: 950000, deuterium: 450000, trinium: 120000 },
    capitalComponentsRequired: [
      { name: 'Capital Armor Plates', amount: 20 },
      { name: 'Capital Core Temperature Regulator', amount: 15 },
      { name: 'Capital Jump Drive', amount: 10 },
    ],
    baseBuildTimeSeconds: 1800,
    outputItem: {
      name: 'Revelation Dreadnought',
      category: 'Capital Dreadnought',
      statSummary: 'Armor: 650,000 HP • DPS: 8,500 • Capital Siege Beam Cannon',
      shieldHp: 180000,
      armorHp: 650000,
      hullHp: 420000,
      dps: 8500,
    },
  },
  {
    id: 'bp_naglfar',
    name: 'Naglfar Capital Dreadnought BPO',
    type: 'ship',
    techLevel: 'Capital',
    faction: 'Minmatar',
    shipClass: 'Dreadnought',
    description: 'Towering vertical capital dreadnought armed with dual Capital Autocannons, using no capacitor to fire.',
    materialEfficiency: 4,
    timeEfficiency: 8,
    runsRemaining: 9999,
    maxRunsPerCopy: 5,
    isOriginal: true,
    marketSeedPrice: 8400000,
    baseBuildCost: { metal: 1850000, crystal: 920000, deuterium: 460000, trinium: 115000 },
    capitalComponentsRequired: [
      { name: 'Capital Shield Emitter', amount: 15 },
      { name: 'Capital Propulsion Engine', amount: 20 },
      { name: 'Capital Jump Drive', amount: 10 },
    ],
    baseBuildTimeSeconds: 1800,
    outputItem: {
      name: 'Naglfar Dreadnought',
      category: 'Capital Dreadnought',
      statSummary: 'Shield: 580,000 HP • DPS: 9,200 • Capital Siege Autocannon Volley',
      shieldHp: 580000,
      armorHp: 450000,
      hullHp: 440000,
      dps: 9200,
    },
  },
  {
    id: 'bp_chimera',
    name: 'Chimera Capital Shield Carrier BPO',
    type: 'ship',
    techLevel: 'Capital',
    faction: 'Caldari',
    shipClass: 'Carrier',
    description: 'Capital fleet carrier housing squadrons of advanced combat fighters and long-range bomber wings.',
    materialEfficiency: 5,
    timeEfficiency: 10,
    runsRemaining: 9999,
    maxRunsPerCopy: 5,
    isOriginal: true,
    marketSeedPrice: 7800000,
    baseBuildCost: { metal: 1650000, crystal: 880000, deuterium: 410000, trinium: 95000 },
    baseBuildTimeSeconds: 1600,
    outputItem: {
      name: 'Chimera Carrier',
      category: 'Capital Carrier',
      statSummary: 'Shield: 720,000 HP • DPS: 6,400 • 3x Fighter Squadrons + Networked Sensor Array',
      shieldHp: 720000,
      armorHp: 280000,
      hullHp: 390000,
      dps: 6400,
    },
  },

  // ==========================================
  // SUPERCAPITALS: TITANS & SUPERCARRIERS
  // ==========================================
  {
    id: 'bp_avatar_titan',
    name: 'Avatar Colossal Titan BPO',
    type: 'ship',
    techLevel: 'Capital',
    faction: 'Amarr',
    shipClass: 'Titan',
    description: 'The golden apex titan of the Amarr Empire. Measures over 13 kilometers in length and mounts the Judgement Doomsday weapon.',
    materialEfficiency: 2,
    timeEfficiency: 4,
    runsRemaining: 9999,
    maxRunsPerCopy: 2,
    isOriginal: true,
    marketSeedPrice: 45000000,
    baseBuildCost: { metal: 9500000, crystal: 5200000, deuterium: 2800000, naquadah: 1500000, trinium: 850000 },
    capitalComponentsRequired: [
      { name: 'Capital Armor Plates', amount: 150 },
      { name: 'Capital Doomsday Mount', amount: 1 },
      { name: 'Capital Core Temperature Regulator', amount: 80 },
      { name: 'Capital Jump Drive', amount: 45 },
    ],
    baseBuildTimeSeconds: 7200,
    outputItem: {
      name: 'Avatar Titan',
      category: 'Apex Supercapital Titan',
      statSummary: 'Armor: 4,500,000 HP • DPS: 38,000 • Judgement Doomsday (5,000,000 EM Damage)',
      shieldHp: 1800000,
      armorHp: 4500000,
      hullHp: 3200000,
      dps: 38000,
      doomsdayName: 'Judgement Doomsday Cannon',
    },
  },
  {
    id: 'bp_leviathan_titan',
    name: 'Leviathan Citadel Titan BPO',
    type: 'ship',
    techLevel: 'Capital',
    faction: 'Caldari',
    shipClass: 'Titan',
    description: 'Imposing Caldari Titan designed as a mobile fortress city, firing the Oblivion Torpedo Doomsday device.',
    materialEfficiency: 2,
    timeEfficiency: 4,
    runsRemaining: 9999,
    maxRunsPerCopy: 2,
    isOriginal: true,
    marketSeedPrice: 46000000,
    baseBuildCost: { metal: 9800000, crystal: 5400000, deuterium: 2900000, naquadah: 1600000, trinium: 880000 },
    capitalComponentsRequired: [
      { name: 'Capital Shield Emitter', amount: 150 },
      { name: 'Capital Doomsday Mount', amount: 1 },
      { name: 'Capital Capacitor Battery', amount: 80 },
      { name: 'Capital Jump Drive', amount: 45 },
    ],
    baseBuildTimeSeconds: 7200,
    outputItem: {
      name: 'Leviathan Titan',
      category: 'Apex Supercapital Titan',
      statSummary: 'Shield: 5,200,000 HP • DPS: 36,500 • Oblivion Doomsday (5,000,000 Kinetic Damage)',
      shieldHp: 5200000,
      armorHp: 2100000,
      hullHp: 3100000,
      dps: 36500,
      doomsdayName: 'Oblivion Doomsday Torpedo',
    },
  },

  // ==========================================
  // CAPITAL COMPONENTS
  // ==========================================
  {
    id: 'bp_cap_armor_plates',
    name: 'Capital Armor Plates BPO',
    type: 'capital_component',
    techLevel: 'T1',
    shipClass: 'Component',
    description: 'Multi-layer composite neutronium plating modules required for capital ship and titan hulls.',
    materialEfficiency: 10,
    timeEfficiency: 20,
    runsRemaining: 9999,
    maxRunsPerCopy: 100,
    isOriginal: true,
    marketSeedPrice: 450000,
    baseBuildCost: { metal: 65000, crystal: 25000, deuterium: 12000 },
    baseBuildTimeSeconds: 90,
    outputItem: {
      name: 'Capital Armor Plates',
      category: 'Capital Component',
      statSummary: 'Sub-assembly for Revelation, Avatar, and Dreadnoughts',
    },
  },
  {
    id: 'bp_cap_shield_emitter',
    name: 'Capital Shield Emitter BPO',
    type: 'capital_component',
    techLevel: 'T1',
    shipClass: 'Component',
    description: 'Gigawatt field projection coils generating deflective force bubbles for capital carriers and titans.',
    materialEfficiency: 10,
    timeEfficiency: 20,
    runsRemaining: 9999,
    maxRunsPerCopy: 100,
    isOriginal: true,
    marketSeedPrice: 480000,
    baseBuildCost: { metal: 55000, crystal: 38000, deuterium: 16000 },
    baseBuildTimeSeconds: 95,
    outputItem: {
      name: 'Capital Shield Emitter',
      category: 'Capital Component',
      statSummary: 'Sub-assembly for Chimera, Leviathan, and Phoenix',
    },
  },
  {
    id: 'bp_cap_doomsday_mount',
    name: 'Capital Doomsday Mount BPO',
    type: 'capital_component',
    techLevel: 'T1',
    shipClass: 'Component',
    description: 'Reinforced superheavy spinal housing capable of channeling terawatts of energy for titan doomsday weapons.',
    materialEfficiency: 8,
    timeEfficiency: 16,
    runsRemaining: 9999,
    maxRunsPerCopy: 20,
    isOriginal: true,
    marketSeedPrice: 2500000,
    baseBuildCost: { metal: 320000, crystal: 210000, deuterium: 110000, naquadah: 80000 },
    baseBuildTimeSeconds: 360,
    outputItem: {
      name: 'Capital Doomsday Mount',
      category: 'Capital Component',
      statSummary: 'Essential core component for Avatar and Leviathan Titans',
    },
  },

  // ==========================================
  // MODULES & HARDWARE
  // ==========================================
  {
    id: 'bp_shield_booster',
    name: 'Large Multi-Spectrum Shield Booster BPO',
    type: 'module',
    techLevel: 'T1',
    description: 'High-yield active shield regenerator restoring heavy shield capacity every combat cycle.',
    materialEfficiency: 9,
    timeEfficiency: 18,
    runsRemaining: 9999,
    maxRunsPerCopy: 50,
    isOriginal: true,
    marketSeedPrice: 120000,
    baseBuildCost: { metal: 8500, crystal: 14000, deuterium: 4500 },
    baseBuildTimeSeconds: 45,
    inventionChance: 60,
    requiredDatacores: [
      { name: 'Electromagnetic Physics', amount: 1 },
      { name: 'Nanite Engineering', amount: 1 },
    ],
    outputItem: {
      name: 'Large Shield Booster I',
      category: 'Shield Hardware',
      statSummary: '+1,250 Shield HP per turn • 45 MW Grid Draw',
    },
  },
  {
    id: 'bp_howitzer',
    name: '1400mm Heavy Howitzer Artillery BPO',
    type: 'module',
    techLevel: 'T1',
    description: 'Massive caliber projectile cannon capable of vaporizing enemy cruiser armor at extreme standoff ranges.',
    materialEfficiency: 7,
    timeEfficiency: 14,
    runsRemaining: 9999,
    maxRunsPerCopy: 50,
    isOriginal: true,
    marketSeedPrice: 220000,
    baseBuildCost: { metal: 18000, crystal: 8000, deuterium: 2500 },
    baseBuildTimeSeconds: 50,
    outputItem: {
      name: '1400mm Howitzer Cannon',
      category: 'Heavy Projectile Turret',
      statSummary: 'Damage: 4,800 Alpha Strike • Kinetic/Explosive Breach',
    },
  },
  {
    id: 'bp_siege_module',
    name: 'Siege Module I BPO',
    type: 'module',
    techLevel: 'T1',
    description: 'Dreadnought siege hardware locking the vessel in place for +700% weapon damage and extreme local armor/shield boosting.',
    materialEfficiency: 8,
    timeEfficiency: 16,
    runsRemaining: 9999,
    maxRunsPerCopy: 30,
    isOriginal: true,
    marketSeedPrice: 850000,
    baseBuildCost: { metal: 85000, crystal: 45000, deuterium: 28000 },
    baseBuildTimeSeconds: 120,
    outputItem: {
      name: 'Siege Module I',
      category: 'Capital Siege Hardware',
      statSummary: '+700% Dreadnought Gun Damage • +100% Capital Rep Duration',
    },
  },
  {
    id: 'bp_bastion_module',
    name: 'Bastion Module I BPO',
    type: 'module',
    techLevel: 'T1',
    description: 'Marauder siege transform module granting complete Electronic Warfare immunity and double tank efficiency.',
    materialEfficiency: 9,
    timeEfficiency: 18,
    runsRemaining: 9999,
    maxRunsPerCopy: 30,
    isOriginal: true,
    marketSeedPrice: 650000,
    baseBuildCost: { metal: 68000, crystal: 38000, deuterium: 22000 },
    baseBuildTimeSeconds: 90,
    outputItem: {
      name: 'Bastion Module I',
      category: 'Marauder Siege Hardware',
      statSummary: '100% EWAR Immunity • +100% Shield Booster & Armor Repairer Yield',
    },
  },

  // ==========================================
  // DRONES & AMMUNITION
  // ==========================================
  {
    id: 'bp_valkyrie_drone',
    name: 'Valkyrie Heavy Combat Drone BPO',
    type: 'drone',
    techLevel: 'T1',
    description: 'Autonomous fighter-scale drone designed to swarm enemy capital ships and tear through deflector shields.',
    materialEfficiency: 8,
    timeEfficiency: 16,
    runsRemaining: 9999,
    maxRunsPerCopy: 100,
    isOriginal: true,
    marketSeedPrice: 85000,
    baseBuildCost: { metal: 6000, crystal: 5000, deuterium: 1800 },
    baseBuildTimeSeconds: 30,
    outputItem: {
      name: 'Valkyrie Drone Flight',
      category: 'Combat Drone',
      statSummary: 'Drone DPS: 85 each • Tracking Speed: 0.18 rad/s',
    },
  },
  {
    id: 'bp_gecko_drone',
    name: 'Gecko Faction Heavy Drone BPC',
    type: 'drone',
    techLevel: 'Faction',
    faction: 'Pirate',
    description: 'Legendary omni-damage heavy drone crafted by the Guristas, dealing kinetic, thermal, explosive, and EM damage.',
    materialEfficiency: 5,
    timeEfficiency: 10,
    runsRemaining: 5,
    maxRunsPerCopy: 5,
    isOriginal: false,
    marketSeedPrice: 450000,
    baseBuildCost: { metal: 28000, crystal: 22000, deuterium: 9500 },
    baseBuildTimeSeconds: 60,
    outputItem: {
      name: 'Gecko Heavy Drone',
      category: 'Pirate Faction Drone',
      statSummary: 'Drone DPS: 220 • Omni-Damage • 12,000 HP Drone Shield',
    },
  },
  {
    id: 'bp_torpedoes',
    name: 'Antimatter Torpedoes Batch BPO',
    type: 'ammunition',
    techLevel: 'T1',
    description: 'Subspace-guided ordnance tipped with enriched antimatter charges for siege torpedo launchers.',
    materialEfficiency: 10,
    timeEfficiency: 20,
    runsRemaining: 9999,
    maxRunsPerCopy: 200,
    isOriginal: true,
    marketSeedPrice: 45000,
    baseBuildCost: { metal: 4000, crystal: 3000, deuterium: 3000 },
    baseBuildTimeSeconds: 20,
    outputItem: {
      name: '100x Antimatter Torpedoes',
      category: 'Heavy Ammunition',
      statSummary: 'Explosive Damage: +25% against Station & Flagship hulls',
    },
  },

  // ==========================================
  // UPWELL CITADELS & STRUCTURES
  // ==========================================
  {
    id: 'bp_astrahus',
    name: 'Astrahus Medium Citadel BPO',
    type: 'structure',
    techLevel: 'T1',
    faction: 'Upwell',
    shipClass: 'Citadel',
    description: 'Medium Upwell space station providing sub-capital docking, defensive point defense batteries, and clonal bays.',
    materialEfficiency: 8,
    timeEfficiency: 16,
    runsRemaining: 9999,
    maxRunsPerCopy: 10,
    isOriginal: true,
    marketSeedPrice: 3200000,
    baseBuildCost: { metal: 680000, crystal: 380000, deuterium: 180000 },
    baseBuildTimeSeconds: 900,
    outputItem: {
      name: 'Astrahus Citadel',
      category: 'Upwell Citadel',
      statSummary: 'Structure HP: 4,800,000 • Subcapital Docking • Standup Missile Launchers',
    },
  },
  {
    id: 'bp_keepstar',
    name: 'Keepstar Apex Citadel BPO',
    type: 'structure',
    techLevel: 'Capital',
    faction: 'Upwell',
    shipClass: 'Citadel',
    description: 'The ultimate space fortress. Capable of tethering and docking entire fleets of Supercarriers and Titans, with an Arcing Vorton Projector.',
    materialEfficiency: 3,
    timeEfficiency: 6,
    runsRemaining: 9999,
    maxRunsPerCopy: 2,
    isOriginal: true,
    marketSeedPrice: 65000000,
    baseBuildCost: { metal: 18000000, crystal: 12000000, deuterium: 6500000, naquadah: 3500000, trinium: 1500000 },
    baseBuildTimeSeconds: 14400,
    outputItem: {
      name: 'Keepstar Apex Citadel',
      category: 'Supercapital Citadel',
      statSummary: 'Structure HP: 48,000,000 • Titan Docking • Standup Arcing Vorton Projector (Instant Fleet Wipe)',
    },
  },
];

// -------------------------------------------------------------
// EVE ONLINE INDUSTRY MATHEMATICAL CALCULATORS
// -------------------------------------------------------------

export function calculateManufacturingCost(
  bp: EveBlueprint,
  runs: number,
  facility: IndustryFacility
): { metal: number; crystal: number; deuterium: number; naquadah: number; trinium: number; installationFee: number } {
  // ME discount: 0% at ME 0, up to 10% reduction at ME 10
  const meDiscount = Math.max(0, Math.min(0.1, bp.materialEfficiency * 0.01));
  const facilityMatMult = facility.materialMultiplier;

  const mult = (1 - meDiscount) * facilityMatMult * runs;

  const metal = Math.max(1, Math.round(bp.baseBuildCost.metal * mult));
  const crystal = Math.max(1, Math.round(bp.baseBuildCost.crystal * mult));
  const deuterium = Math.max(0, Math.round(bp.baseBuildCost.deuterium * mult));
  const naquadah = bp.baseBuildCost.naquadah ? Math.round(bp.baseBuildCost.naquadah * mult) : 0;
  const trinium = bp.baseBuildCost.trinium ? Math.round(bp.baseBuildCost.trinium * mult) : 0;

  // Base job installation fee (System Cost Index ~ 3.5%)
  const estimatedJobValue = metal * 1 + crystal * 2 + deuterium * 4;
  const installationFee = Math.max(1500, Math.round(estimatedJobValue * 0.035 * facility.costMultiplier));

  return { metal, crystal, deuterium, naquadah, trinium, installationFee };
}

export function calculateManufacturingTime(
  bp: EveBlueprint,
  runs: number,
  facility: IndustryFacility
): number {
  // TE discount: 0% at TE 0, up to 20% reduction at TE 20
  const teDiscount = Math.max(0, Math.min(0.2, bp.timeEfficiency * 0.01));
  const facilityTimeMult = facility.timeMultiplier;

  const durationPerRun = bp.baseBuildTimeSeconds * (1 - teDiscount) * facilityTimeMult;
  return Math.max(5, Math.round(durationPerRun * runs));
}

export function calculateMEResearchCostAndTime(currentME: number): {
  metalCost: number;
  crystalCost: number;
  timeSeconds: number;
  installationFee: number;
} {
  const nextLevel = currentME + 1;
  const mult = Math.pow(1.45, nextLevel);
  const metalCost = Math.round(25000 * mult);
  const crystalCost = Math.round(18000 * mult);
  const timeSeconds = Math.round(45 * mult);
  const installationFee = Math.round(12000 * mult);

  return { metalCost, crystalCost, timeSeconds, installationFee };
}

export function calculateTEResearchCostAndTime(currentTE: number): {
  metalCost: number;
  crystalCost: number;
  timeSeconds: number;
  installationFee: number;
} {
  const nextLevel = currentTE + 2;
  const mult = Math.pow(1.35, nextLevel / 2);
  const metalCost = Math.round(20000 * mult);
  const crystalCost = Math.round(15000 * mult);
  const timeSeconds = Math.round(35 * mult);
  const installationFee = Math.round(9500 * mult);

  return { metalCost, crystalCost, timeSeconds, installationFee };
}

export function calculateCopyCostAndTime(
  bp: EveBlueprint,
  runsPerCopy: number,
  copyCount: number
): { metalCost: number; crystalCost: number; timeSeconds: number; installationFee: number } {
  const baseTime = bp.baseBuildTimeSeconds * 0.4;
  const timeSeconds = Math.max(10, Math.round(baseTime * (runsPerCopy / bp.maxRunsPerCopy) * copyCount));
  const metalCost = Math.round(8000 * copyCount);
  const crystalCost = Math.round(6000 * copyCount);
  const installationFee = Math.round(5000 * copyCount);

  return { metalCost, crystalCost, timeSeconds, installationFee };
}

export function calculateInventionProbability(
  baseChance: number = 50,
  decryptor?: DecryptorItem,
  skillBonusPercent: number = 10
): number {
  const decBonus = decryptor ? decryptor.probabilityBonus : 0;
  const modified = baseChance * (1 + decBonus * 0.01) + skillBonusPercent;
  return Math.max(10, Math.min(95, Math.round(modified)));
}

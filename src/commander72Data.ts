// ============================================================================
// 72 OGAME-LIKE COMMANDERS ROSTER WITH STATS, SUBSTATS, DETAILS & PASSIVES
// ============================================================================

export type CommanderRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
export type CommanderRole =
  | 'Fleet Admiral'
  | 'High Geologist'
  | 'Quantum Technocrat'
  | 'Stargate Archon'
  | 'High Inquisitor'
  | 'Dreadnought Tactician';

export interface CommanderSubStats {
  critChance: number;          // % e.g. 14.5
  critMultiplier: number;      // x e.g. 1.8
  rapidFireBonus: number;      // %
  shieldRegenRate: number;     // % per combat round
  fuelConsumptionReduction: number; // %
  storageCapacityBonus: number;// %
  expeditionRerollLuck: number;// %
  stealthPenetration: number;  // %
}

export interface CommanderStats {
  fleetAttack: number;         // Primary: % boost to fleet weapon power
  fleetShield: number;         // Primary: % boost to fleet shield harmonics
  fleetHull: number;           // Primary: % boost to armor / hull integrity
  productionMetal: number;     // % boost to metal mine output
  productionCrystal: number;   // % boost to crystal mine output
  productionDeuterium: number; // % boost to deuterium synth
  researchSpeed: number;       // % boost to scientific research rate
  shipyardSpeed: number;       // % boost to orbital construction rate
  espionagePower: number;      // % boost to probe spy level & counter-intel
  expeditionBonus: number;     // % bonus to rare loot & fleet encounters
}

export interface CommanderData {
  id: string;
  name: string;
  codename: string;
  avatar: string;
  rarity: CommanderRarity;
  role: CommanderRole;
  faction: string;
  title: string;
  lore: string;
  signatureSkill: string;
  signatureSkillDescription: string;
  passiveAura: string;
  stats: CommanderStats;
  subStats: CommanderSubStats;
  baseCostDarkMatter: number;
}

export interface PlayerCommanderInstance {
  instanceId: string;
  commanderId: string;
  level: number;
  stars: number; // 1 to 5 stars
  experience: number;
  nextLevelExp: number;
  assignedSlot?: 'flagship' | 'mining_director' | 'chief_scientist' | 'defense_marshal' | null;
  awakened: boolean;
  hiredAt: string;
}

// Generate the 72 Commander definitions
const ROLES: CommanderRole[] = [
  'Fleet Admiral',
  'High Geologist',
  'Quantum Technocrat',
  'Stargate Archon',
  'High Inquisitor',
  'Dreadnought Tactician',
];

const FACTIONS = ["Tau'ri Sovereign", 'Goa\'uld Imperium', 'Asgard High Council', 'Ancient Tollan', 'Wraith Hive', 'Ori Crusade'];

const RARITIES: CommanderRarity[] = [
  'Mythic', 'Mythic', 'Mythic', 'Mythic', 'Mythic', 'Mythic', // 6 Mythic
  'Legendary', 'Legendary', 'Legendary', 'Legendary', 'Legendary', 'Legendary', 'Legendary', 'Legendary', 'Legendary', 'Legendary', 'Legendary', 'Legendary', // 12 Legendary
  'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', 'Epic', // 18 Epic
  'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', 'Rare', // 18 Rare
  'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', 'Common', // 18 Common
];

const NAMES_AND_LORE: { name: string; codename: string; avatar: string; title: string; skill: string; desc: string; aura: string }[] = [
  // 1-6 Mythics
  { name: 'Supreme Commander Thor', codename: 'ASGARD-01', avatar: '👽', title: 'Grand Fleet Supreme Admiral', skill: 'Bifrost Disintegrator Wave', desc: 'Overcharges all Asgard ion cannons by 85% and disintegrates 30% of incoming kinetic ordinance.', aura: '+45% Fleet Armor & +50% Research Speed' },
  { name: 'Archon Samantha Carter', codename: 'TAURI-ALPHA', avatar: '👩‍✈️', title: 'Astrophysics Genius & Fleet Marshal', skill: 'Subspace Singularity Burst', desc: 'Detonates a localized gravity well, immobilizing enemy retreat and reducing rapid fire by 60%.', aura: '+40% Shield Harmonics & +60% Energy Production' },
  { name: 'System Lord Ba\'al', codename: 'GOAULD-PRIME', avatar: '👑', title: 'Cloned Hegemon of the Core Systems', skill: 'Shadow Clone Swarm', desc: 'Projects 8 decoy fleet signatures that absorb 40% of first-round capital ship fire.', aura: '+50% Metal Extraction & +35% Covert Counter-Intel' },
  { name: 'Janus the Time Weaver', codename: 'ANCIENT-TEMPORAL', avatar: '🧙‍♂️', title: 'Architect of Atlantis Timeships', skill: 'Temporal Jump Horizon', desc: 'Compresses hyperspace transit times to zero for immediate fleet arrival or strategic evacuation.', aura: '+65% Research Velocity & +40% Expedition Discovery' },
  { name: 'Anubis Void Walker', codename: 'ASCENDED-TERROR', avatar: '💀', title: 'Half-Ascended Dark Lord', skill: 'Eyes of the Gods Cannon', desc: 'Unleashes superweapon thermal beams wiping out 25% of hostile defense structures instantly.', aura: '+55% Fleet Attack & -30% Fleet Losses' },
  { name: 'Hermiod Asgard Synthesizer', codename: 'ASGARD-BETA', avatar: '🦾', title: 'Subspace Drive Master', skill: 'Neutronium Core Overdrive', desc: 'Boosts entire battle armada velocity by 120% and guarantees critical strike on heavy cruisers.', aura: '+40% Shipyard Construction & +35% Deuterium Yield' },

  // 7-18 Legendaries
  { name: 'Major General Jack O\'Neill', codename: 'STRIKE-LEAD', avatar: '🎖️', title: 'Homeworld Defense General', skill: 'Zat\'nik\'tel Barrage', desc: 'Paralyzes targeted enemy cruisers for two combat ticks with zero energy recoil.', aura: '+32% Fleet Weapon Fire & +25% Morale' },
  { name: 'Teal\'c of Chulak', codename: 'FIRST-PRIME', avatar: '🛡️', title: 'First Prime of the Free Jaffa', skill: 'Staff Cannon Volley', desc: 'Unleashes precision plasma salvos bypassing planetary shield barriers.', aura: '+35% Defense Structure Armor & +20% Hull Reinforcement' },
  { name: 'Lord Yu Huang Shang Ti', codename: 'DYNASTY-LORD', avatar: '🐉', title: 'Jade Sovereign of Systems', skill: 'Celestial Bastion Protocol', desc: 'Fortifies planetary orbital defense installations with impenetrable jade deflector forcefields.', aura: '+40% Crystal Production & +25% Shield Resilience' },
  { name: 'Dr. Daniel Jackson', codename: 'LINGUIST-01', avatar: '📜', title: 'Curator of Ancient Glyphs', skill: 'Ascended Translation Surge', desc: 'Decodes alien stellar relics granting massive Dark Matter drops on deep space expeditions.', aura: '+50% Expedition Loot Rate & +25% Research Speed' },
  { name: 'High Councillor Freyr', codename: 'HIGH-COUNCIL', avatar: '🛸', title: 'Othala Fleet Overseer', skill: 'Subspace Phalanx Lock', desc: 'Detects stealth cloak maneuvers and reveals concealed fleet formations.', aura: '+30% Counter-Espionage & +25% Deuterium Synthesis' },
  { name: 'Apophis the Serpent God', codename: 'SNAKE-LORD', avatar: '🐍', title: 'Dread Monarch of Chulak', skill: 'Solar Flare Supercharger', desc: 'Harnesses stellar solar storms to burn through hostile fleet shield matrices.', aura: '+35% Fleet Attack & +30% Metal Output' },
  { name: 'Tollan Chancellor Narim', codename: 'ION-CANON-ARCH', avatar: '⚖️', title: 'Master of Phase Technology', skill: 'Phase Shift Defense Barrier', desc: 'Shifts allied warships into a non-colliding dimensional plane to evade torpedoes.', aura: '+30% Fleet Defense & -20% Ship Construction Costs' },
  { name: 'Queen Morrigan the Raven', codename: 'CORVUS-LEADER', avatar: '🦹‍♀️', title: 'Mistress of Galactic Espionage', skill: 'Infiltration Spy Lattice', desc: 'Steals 15% of scanned enemy planet production directly into your vaults upon spy scans.', aura: '+45% Espionage Probe Accuracy & +20% Covert Sabotage' },
  { name: 'Kronos Titan Marshal', codename: 'TITAN-WAR', avatar: '⚔️', title: 'Conqueror of the Pelops Ring', skill: 'Ha\'tak Ramming Doctrine', desc: 'Directs heavy dreadnoughts into ferocious close-range boarding maneuvers.', aura: '+38% Dreadnought Firepower & +25% Metal Mining' },
  { name: 'Bra\'tac of Chulak', codename: 'ELDER-WARRIOR', avatar: '🗡️', title: 'Master of Jaffa Legions', skill: 'Guerilla Subspace Ambush', desc: 'Deploys bomber wings from asteroids, ignoring enemy anti-air flak batteries.', aura: '+30% Bomber & Heavy Fighter Strike Power' },
  { name: 'Nirrti Genetic Weaver', codename: 'DNA-MUTATOR', avatar: '🧬', title: 'Architect of Super-Soldiers', skill: 'Phased Cloaking Cloak', desc: 'Veils attack armadas from planetary sensor phalanxes until 30 seconds before impact.', aura: '+25% Subspace Speed & +30% Crystal Extraction' },
  { name: 'Dr. Rodney McKay', codename: 'CITADEL-TECH', avatar: '💻', title: 'Quantum Bridge Pioneer', skill: 'ZPM Power Tap Cascade', desc: 'Overdrives planetary fusion reactors supplying infinite power for 1 hour.', aura: '+50% Solar & Fusion Energy Output & +30% Tech Speed' },

  // 19-36 Epics
  { name: 'Major Samantha Manson', codename: 'RECON-01', avatar: '🔭', title: 'Deep Space Surveyor', skill: 'Anomalous Pulsar Beacon', desc: 'Triangulates rich derelict debris fields in uncharted star sectors.', aura: '+22% Expedition Finds & +15% Deuterium' },
  { name: 'Commander Cameron Mitchell', codename: 'VALKYRIE-LEAD', avatar: '🚀', title: 'F-302 Squadron Leader', skill: 'Slingshot Interceptor Sweep', desc: 'Executes rapid dogfight sweeps destroying light fighter screens.', aura: '+24% Interceptor & Fighter Attack' },
  { name: 'Lord Sokar of Netu', codename: 'HELL-FORGER', avatar: '🔥', title: 'Smelter of Core Magma', skill: 'Molten Geothermal Flare', desc: 'Taps planetary molten mantles to supercharge metal blast furnaces.', aura: '+32% Metal Mining Production' },
  { name: 'SGC Chief Walter Harriman', codename: 'CHEVRON-CHIEF', avatar: '📻', title: 'Master of Chevron Sequences', skill: 'Iris Lockdown Shield', desc: 'Prevents counter-attacks through the gate network during active invasions.', aura: '+25% Planetary Shielding' },
  { name: 'Sylar Systems Engineer', codename: 'TECH-WRENCH', avatar: '🔧', title: 'Subspace Relay Technician', skill: 'Instant Overclock Routine', desc: 'Halves current research remaining duration on next tier upgrade.', aura: '+20% Research Laboratory Efficiency' },
  { name: 'Skaara of Abydos', codename: 'DESERT-HERO', avatar: '🏹', title: 'Defender of the Pyramids', skill: 'Staff Sniper Matrix', desc: 'Precision sniper salvos that cripple heavy defense turrets.', aura: '+18% Defense Unit Power' },
  { name: 'Jacob Carter / Selmak', codename: 'TOKRAN-EMISSARY', avatar: '🤝', title: 'Tok\'ra Covert Operative', skill: 'Sub-Surface Crystal Tunneling', desc: 'Caches 20% of empire resources in subterranean crystal caverns safe from pillaging.', aura: '+28% Vault Safe Storage' },
  { name: 'Ares the Warmonger', codename: 'WAR-LORD', avatar: '🛡️', title: 'Commander of the Iron Fleet', skill: 'Heavy Armor Plating', desc: 'Enhances battleship hull durability by 25%.', aura: '+22% Fleet Armor & +15% Attack' },
  { name: 'Lord Camulus of Scotland', codename: 'HIGHLAND-LORD', avatar: '🏰', title: 'Siege Lord of Outposts', skill: 'Citadel Ion Bulwark', desc: 'Empowers planetary ion cannons with chain-lightning discharge.', aura: '+26% Defense Ion Turrets' },
  { name: 'Amaterasu Sun Regent', codename: 'SOLAR-QUEEN', avatar: '☀️', title: 'Empress of the Golden Stars', skill: 'Solar Corona Harvest', desc: 'Channels coronal mass ejections directly into crystal solar furnaces.', aura: '+28% Crystal Synthesis' },
  { name: 'Hathor the Siren', codename: 'MESMER-QUEEN', avatar: '🌹', title: 'Mistress of Mind Control', skill: 'Subspace Pheromone Wave', desc: 'Confuses hostile targeting computers, resulting in friendly fire amongst attackers.', aura: '+20% Evasion on Frigates' },
  { name: 'Tanith Tok\'ra Infiltrator', codename: 'TRAITOR-SPY', avatar: '🎭', title: 'Architect of Betrayals', skill: 'Sabotage Plasma Fuel Lines', desc: 'Reduces enemy fleet speed by 40% when pursuing your retreating ships.', aura: '+22% Espionage Covert Rating' },
  { name: 'Heru\'ur the Falcon', codename: 'HORUS-COMMAND', avatar: '🦅', title: 'Lord of the Horus Guard', skill: 'Death Glider Air Supremacy', desc: 'Boosts attack power of small craft against orbital defense platforms.', aura: '+25% Light Warship Firepower' },
  { name: 'Balaram Resource Vizier', codename: 'VIZIER-MINER', avatar: '💎', title: 'Master of the Diamond Mines', skill: 'Sub-Crustal Sonic Fracturing', desc: 'Extracts ultra-dense crystal clusters from subterranean crust layers.', aura: '+30% Crystal Mine Output' },
  { name: 'Major Paul Davis', codename: 'PENTAGON-LIAISON', avatar: '👔', title: 'Strategic Command Liaison', skill: 'Emergency Defense Budget', desc: 'Instantly procures 100,000 Naquadah during under-attack alerts.', aura: '+15% Income & -10% Upkeep' },
  { name: 'Major Lou Ferretti', codename: 'STRIKE-VETERAN', avatar: '🪖', title: 'Tactical Vanguard Specialist', skill: 'Rapid Breach Entry', desc: 'Inflicts heavy casualties on planetary bunkers in first wave.', aura: '+20% Ground Invasion Force' },
  { name: 'Alebran Tollan Engineer', codename: 'PHASE-BUILDER', avatar: '📐', title: 'Megastructure Fabricator', skill: 'Molecular Assembly Beam', desc: 'Decreases construction times of orbital defense satellites by 25%.', aura: '+22% Shipyard Assembly Speed' },
  { name: 'Supreme Jaffa Rya\'c', codename: 'FREEDOM-BLADE', avatar: '🗡️', title: 'Vanguard of Chulak Outposts', skill: 'Liberation Charge', desc: 'Inspires rebel uprisings on bombarded enemy colonies.', aura: '+18% Fleet Combat Morale' },

  // 37-54 Rares
  { name: 'Sergeant Walter Siler', codename: 'MAINT-CHIEF', avatar: '🧰', title: 'Base Chief Mechanic', skill: 'Field Wrench Overhaul', desc: 'Repairs 20% of damaged defenses immediately following a combat engagement.', aura: '+15% Defense Recovery Rate' },
  { name: 'Lieutenant Jennifer Hailey', codename: 'ACADEMY-ACE', avatar: '👩‍🎓', title: 'Cadet Prodigy', skill: 'Algorithmic Targeting Matrix', desc: 'Enhances cruiser weapon accuracy by 15%.', aura: '+16% Cruiser Weapon Power' },
  { name: 'Colonel Harry Maybourne', codename: 'ROGUE-NID', avatar: '🕵️', title: 'Shadow Syndicate Broker', skill: 'Black Market Armaments', desc: 'Decreases procurement costs in the Armory by 18%.', aura: '+15% Dark Matter & Credits Gain' },
  { name: 'Kianna Cyr of Langara', codename: 'NAQUADRIA-SCIENTIST', avatar: '🧪', title: 'Deep Core Physicist', skill: 'Naquadria Core Overcharge', desc: 'Boosts deuterium synthesizer yield by 22% for 2 hours.', aura: '+18% Deuterium Synthesis' },
  { name: 'Jolen of the Tok\'ra', codename: 'TUNNELER-01', avatar: '⛏️', title: 'Subterranean Vault Architect', skill: 'Crystalline Expansion', desc: 'Expands bunker storage capacity across all colony worlds.', aura: '+20% Warehouse Capacity' },
  { name: 'Captain Voronkova', codename: 'KOROLEV-XO', avatar: '👩‍✈️', title: 'Korolev First Officer', skill: 'Torpedo Spread Alpha', desc: 'Launches heavy torpedoes that pierce secondary energy shields.', aura: '+15% Fleet Strike Power' },
  { name: 'Lord Zipacna', codename: 'SLY-WARLORD', avatar: '🦎', title: 'Commander of the Pit', skill: 'Ambush from Nebula Dust', desc: 'Hides fleet signature inside planetary dust nebulae.', aura: '+14% Ambush Critical Rate' },
  { name: 'Ka\'lel Jaffa Councilwoman', codename: 'COUNCIL-JAFFA', avatar: '⚖️', title: 'Diplomatic Legate', skill: 'Alliance Harmony Pact', desc: 'Lowers treaty ratification costs and speeds fleet coordination.', aura: '+12% Fleet Movement Speed' },
  { name: 'Colonel Lionel Pendergast', codename: 'PROMETHEUS-CO', avatar: '🚢', title: 'Prometheus Commander', skill: 'Shields to Maximum', desc: 'Absorbs additional 15% weapon damage during orbital bombardment.', aura: '+18% Battlecruiser Shielding' },
  { name: 'Martouf of the Tok\'ra', codename: 'TOKRAN-SCOUT', avatar: '🏹', title: 'Subspace Courier', skill: 'Discreet Infiltration', desc: 'Reduces spy probe loss chance during deep scans to zero.', aura: '+18% Espionage Probe Stealth' },
  { name: 'Dr. Janet Fraiser', codename: 'CHIEF-SURGEON', avatar: '🩺', title: 'SGC Chief Medical Officer', skill: 'Combat Triage Protocol', desc: 'Reduces crew and unit casualties during planetary defense operations.', aura: '+25% Troop Survival Rate' },
  { name: 'Zarin Tok\'ra Liaison', codename: 'UNDERCOVER-OP', avatar: '🕶️', title: 'Ba\'al Outpost Infiltrator', skill: 'Sabotage Hyperdrive Relay', desc: 'Delays hostile fleet reinforcement jumps by 45 seconds.', aura: '+14% Counter-Intelligence' },
  { name: 'Lord Moloc', codename: 'SACRIFICE-LORD', avatar: '🐂', title: 'Tyrant of the Smelters', skill: 'Forced Labor Overdrive', desc: 'Accelerates metal mine construction speed by 20%.', aura: '+20% Metal Mine Speed' },
  { name: 'Ramius of Pangar', codename: 'TREASURE-KEEPER', avatar: '💰', title: 'Keeper of Imperial Tithes', skill: 'Interest Compounding', desc: 'Generates +5% additional banking interest on banked Naquadah.', aura: '+15% Bank Vault Interest' },
  { name: 'Rak\'nor of Chulak', codename: 'FREEDOM-PILOT', avatar: '✈️', title: 'Al\'kesh Bomber Ace', skill: 'Plasma Bombing Run', desc: 'Inflicts heavy collateral damage on surface solar plants.', aura: '+16% Bomber Weapon Power' },
  { name: 'Major Castleman', codename: 'DEFENSE-GRID-XO', avatar: '🛰️', title: 'Orbital Perimeter Officer', skill: 'Missile Silo Synchronization', desc: 'Increases Interplanetary Missile launch velocity by 25%.', aura: '+20% Missile Silo Speed' },
  { name: 'Dr. Elizabeth Weir', codename: 'ENVOY-CIVIL', avatar: '🕊️', title: 'Diplomatic Director', skill: 'Ceasefire Mandate', desc: 'Slows hostile war escalation timers across contested sectors.', aura: '+15% Trade & Diplomatic Rep' },
  { name: 'Vala Mal Doran', codename: 'ROGUE-THIEF', avatar: '💎', title: 'Intergalactic Treasure Hunter', skill: 'Lucky Heist Surge', desc: 'Steals 10% bonus loot upon conquering pirate or boss installations.', aura: '+22% Extra Loot on Victory' },

  // 55-72 Commons
  { name: 'Sergeant Craig Monroe', codename: 'GATE-GUARD-01', avatar: '💂', title: 'SGC Security Guard', skill: 'Sidearm Stance', desc: 'Small boost to checkpoint security and base garrison defense.', aura: '+8% Garrison Defense' },
  { name: 'Lieutenant James Robbins', codename: 'AIR-CREW-12', avatar: '👨‍✈️', title: 'F-302 Wingman', skill: 'Wingman Cover', desc: 'Provides defensive cover to lead fighters during skirmishes.', aura: '+8% Fighter Hull' },
  { name: 'Technician Chen Wei', codename: 'CONSOLE-TECH', avatar: '🖥️', title: 'Sensor Monitoring Tech', skill: 'Radar Calibration', desc: 'Slightly improves early detection time for incoming fleets.', aura: '+10% Sensor Phalanx Range' },
  { name: 'Dr. Robert Rothman', codename: 'FOSSIL-HUNTER', avatar: '🔍', title: 'Geological Field Scout', skill: 'Core Sample Analysis', desc: 'Identifies enriched mineral veins on rocky worlds.', aura: '+10% Metal Mining Yield' },
  { name: 'Ensign Kevin Marks', codename: 'HELM-OFFICER', avatar: '🧭', title: 'Daedalus Helmsman', skill: 'Standard Evasive Drift', desc: 'Reduces torpedo hit chance against auxiliary support craft.', aura: '+8% Subspace Speed' },
  { name: 'Corporal Barnes', codename: 'RIFLEMAN-07', avatar: '🔫', title: 'Surface Rifleman', skill: 'Suppressing Fire', desc: 'Suppresses light enemy ground troops in initial deployment.', aura: '+8% Light Infantry Fire' },
  { name: 'Surveyor Peter Cavanaugh', codename: 'PIPELINE-ENG', avatar: '🛢️', title: 'Gas Extraction Tech', skill: 'Deuterium Valve Tuning', desc: 'Tightens atmospheric scoop valves to minimize gas leakage.', aura: '+10% Deuterium Synth' },
  { name: 'Lieutenant Dave Norram', codename: 'SCOUT-FLIGHT', avatar: '🛩️', title: 'Recon Pilot', skill: 'Subspace Flare Scan', desc: 'Scans adjacent solar systems for abandoned satellite probes.', aura: '+8% Espionage Range' },
  { name: 'Specialist Aaron Pierce', codename: 'COMM-RELAY', avatar: '📡', title: 'Radio Telemetry Operator', skill: 'Relay Ping', desc: 'Clears atmospheric noise during fleet communications.', aura: '+6% Fleet Coordination' },
  { name: 'Mining Overseer Kahlil', codename: 'QUARRY-BOSS', avatar: '⛏️', title: 'Quarry Supervisor', skill: 'Drill Bit Sharpening', desc: 'Increases drill longevity in heavy titanium quarries.', aura: '+12% Metal Extraction' },
  { name: 'Cadet Matthew Boyd', codename: 'CADET-PILOT', avatar: '🚀', title: 'Academy Transport Pilot', skill: 'Cargo Balancing', desc: 'Optimizes cargo holds allowing small transports to carry 12% more.', aura: '+12% Cargo Capacity' },
  { name: 'Jaffa Guard Tariq', codename: 'TEMPLE-GUARD', avatar: '🛡️', title: 'Chulak Outpost Sentry', skill: 'Staff Stance', desc: 'Stationed guard providing reliable perimeter vigilance.', aura: '+8% Defense Structure Power' },
  { name: 'Laboratory Assistant Lee', codename: 'LAB-ASSIST-3', avatar: '🧪', title: 'Nanite Lab Tech', skill: 'Sample Centrifuge', desc: 'Assists senior researchers in routine plasma testing.', aura: '+8% Research Speed' },
  { name: 'Quartermaster Higgins', codename: 'DEPOT-CHIEF', avatar: '📦', title: 'Munitions Depot Officer', skill: 'Bulk Ammo Stockpile', desc: 'Lowers rearmament costs for defense missile launchers.', aura: '+10% Missile Reload Speed' },
  { name: 'Junior Pilot Sarah Connor', codename: 'DRONE-OPERATOR', avatar: '🎯', title: 'Defense Drone Controller', skill: 'Drone Swarm Hover', desc: 'Operates automated point-defense interceptor drones.', aura: '+10% Point Defense Accuracy' },
  { name: 'Field Medic Kelly', codename: 'CORPS-MEDIC', avatar: '🩹', title: 'Frontline Medic', skill: 'Quick Bandage', desc: 'Tends to wounded security personnel on outpost walls.', aura: '+10% Unit Recovery' },
  { name: 'Logistics Clerk Gomez', codename: 'SUPPLY-CLERK', avatar: '📋', title: 'Fleet Provisioner', skill: 'Ration Manifesting', desc: 'Streamlines supply lines reducing fleet upkeep slightly.', aura: '-8% Fleet Deuterium Upkeep' },
  { name: 'Astrogator Thorne', codename: 'CHART-MASTER', avatar: '🗺️', title: 'Stellar Cartographer', skill: 'Hyperlane Shortcuts', desc: 'Charts low-gravity corridors for faster sub-light cruising.', aura: '+10% Sub-light Speed' },
];

export const ALL_72_COMMANDERS: CommanderData[] = NAMES_AND_LORE.map((item, index) => {
  const rarity = RARITIES[index];
  const role = ROLES[index % ROLES.length];
  const faction = FACTIONS[index % FACTIONS.length];

  // Stat scaling according to rarity
  let mult = 1;
  let baseCost = 250;
  if (rarity === 'Mythic') {
    mult = 3.5;
    baseCost = 2500;
  } else if (rarity === 'Legendary') {
    mult = 2.4;
    baseCost = 1200;
  } else if (rarity === 'Epic') {
    mult = 1.6;
    baseCost = 600;
  } else if (rarity === 'Rare') {
    mult = 1.2;
    baseCost = 350;
  } else {
    mult = 0.8;
    baseCost = 150;
  }

  // Base stats influenced by role
  const isAdmiral = role === 'Fleet Admiral' || role === 'Dreadnought Tactician';
  const isGeologist = role === 'High Geologist';
  const isTech = role === 'Quantum Technocrat';
  const isArchon = role === 'Stargate Archon';
  const isInquisitor = role === 'High Inquisitor';

  return {
    id: `cmdr_${index + 1}`,
    name: item.name,
    codename: item.codename,
    avatar: item.avatar,
    rarity,
    role,
    faction,
    title: item.title,
    lore: `Designated operative in galactic sector ${100 + index}. Proven combat and administrative record under sovereign high command.`,
    signatureSkill: item.skill,
    signatureSkillDescription: item.desc,
    passiveAura: item.aura,
    stats: {
      fleetAttack: Math.round((isAdmiral ? 18 : 6) * mult),
      fleetShield: Math.round((isAdmiral ? 16 : 5) * mult),
      fleetHull: Math.round((isAdmiral ? 15 : 5) * mult),
      productionMetal: Math.round((isGeologist ? 24 : 5) * mult),
      productionCrystal: Math.round((isGeologist ? 20 : 4) * mult),
      productionDeuterium: Math.round((isGeologist ? 18 : 4) * mult),
      researchSpeed: Math.round((isTech ? 25 : 5) * mult),
      shipyardSpeed: Math.round((isTech ? 20 : 5) * mult),
      espionagePower: Math.round((isInquisitor ? 22 : 4) * mult),
      expeditionBonus: Math.round((isArchon ? 25 : 5) * mult),
    },
    subStats: {
      critChance: Number(((isAdmiral ? 12 : 4) * (mult * 0.7)).toFixed(1)),
      critMultiplier: Number((1.2 + (isAdmiral ? 0.6 : 0.2) * (mult * 0.5)).toFixed(2)),
      rapidFireBonus: Math.round((isAdmiral ? 15 : 3) * mult),
      shieldRegenRate: Number(((isAdmiral ? 8 : 2) * mult).toFixed(1)),
      fuelConsumptionReduction: Math.round((isArchon ? 18 : 4) * mult),
      storageCapacityBonus: Math.round((isGeologist ? 25 : 6) * mult),
      expeditionRerollLuck: Math.round((isArchon ? 20 : 4) * mult),
      stealthPenetration: Math.round((isInquisitor ? 22 : 5) * mult),
    },
    baseCostDarkMatter: baseCost,
  };
});

// Storage keys
export const STORAGE_KEY_PLAYER_COMMANDERS = 'uc_player_commanders_v1';
export const STORAGE_KEY_COMMANDER_GACHA_PITY = 'uc_cmdr_gacha_pity_v1';
export const STORAGE_KEY_COMMANDER_ASSIGNMENTS = 'uc_cmdr_assigned_slots_v1';

export interface CommanderSlotAssignments {
  flagship: string | null;          // instanceId
  mining_director: string | null;   // instanceId
  chief_scientist: string | null;   // instanceId
  defense_marshal: string | null;   // instanceId
}

export const INITIAL_SLOT_ASSIGNMENTS: CommanderSlotAssignments = {
  flagship: null,
  mining_director: null,
  chief_scientist: null,
  defense_marshal: null,
};

// Initial Seed: player begins with 2 starter commanders
export const INITIAL_PLAYER_COMMANDERS: PlayerCommanderInstance[] = [
  {
    instanceId: 'inst_start_1',
    commanderId: 'cmdr_7', // Jack O'Neill (Legendary)
    level: 1,
    stars: 1,
    experience: 0,
    nextLevelExp: 1000,
    assignedSlot: 'flagship',
    awakened: false,
    hiredAt: new Date().toISOString(),
  },
  {
    instanceId: 'inst_start_2',
    commanderId: 'cmdr_64', // Mining Overseer Kahlil (Common)
    level: 2,
    stars: 1,
    experience: 350,
    nextLevelExp: 1500,
    assignedSlot: 'mining_director',
    awakened: false,
    hiredAt: new Date().toISOString(),
  },
];

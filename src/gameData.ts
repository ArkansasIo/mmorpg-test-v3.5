import type { AnyRecord, Government, Race } from './types';

export const RACES: Race[] = [
  { id: 'tauri', name: 'Tauri', bonusLabel: 'Balanced Expansion', description: 'Adaptable frontier civilization.', bankName: 'Imperial Reserve' },
  { id: 'goauld', name: 'Goa\'uld', bonusLabel: 'Command Authority', description: 'Ancient strategic power.', bankName: 'System Treasury' },
  { id: 'asgard', name: 'Asgard', bonusLabel: 'Research Mastery', description: 'Advanced scientific civilization.', bankName: 'Knowledge Vault' },
  { id: 'ori', name: 'Ori', bonusLabel: 'Ascendant Faith', description: 'A disciplined ascendant empire.', bankName: 'Celestial Vault' },
];

export const GOVERNMENTS: Government[] = [
  { id: 'junta', name: 'Military Junta', icon: '⚔️', description: 'A command-led government.', economyModifier: 1, militaryModifier: 1.15, researchModifier: 0.95 },
  { id: 'republic', name: 'Trade Republic', icon: '🏛️', description: 'A commercial representative government.', economyModifier: 1.15, militaryModifier: 0.95, researchModifier: 1 },
  { id: 'technocracy', name: 'Technocracy', icon: '🔬', description: 'Research drives every institution.', economyModifier: 0.95, militaryModifier: 0.95, researchModifier: 1.2 },
];

export const INITIAL_PROFILE: AnyRecord = {
  id: 'local-player',
  username: 'Commander',
  displayName: 'Commander',
  race: 'tauri',
  governmentId: 'junta',
  empireName: 'Terran Dominion',
  capitalName: 'Homeworld',
  leaderTitle: 'High Commander',
  credits: 500000,
  level: 1,
  glory: 1250,
  reputation: 850,
  defconLevel: 0,
  score: 15400,
  rank: 1,
};

export const INITIAL_RESOURCES: AnyRecord = {
  naquadah: 25000,
  bankedNaquadah: 5000,
  crystal: 30000,
  metal: 50000,
  deuterium: 15000,
  trinium: 2500,
  food: 42000,
  maxFood: 100000,
  water: 58000,
  maxWater: 120000,
  energy: 500,
  darkMatter: 2500,
  credits: 500000,
  attackTurns: 50,
  maxTurns: 100,
  untrainedUnits: 1600,
  attackUnits: 250,
  defenseUnits: 300,
  spies: 25,
  antiSpies: 30,
  miners: 120,
  lifers: 80,
  superUnits: 5,
  totalPopulation: 14000000,
  gateTokens: 25,
  dimensionalTokens: 12,
  raidTokens: 6,
};
export const INITIAL_TECHNOLOGIES: AnyRecord[] = [];
export const INITIAL_PLAYER_WEAPONS: AnyRecord[] = [];
export const INITIAL_PLANETS: AnyRecord[] = [{ id: 'homeworld', name: 'Homeworld', userId: 'local-player', population: 1000, level: 1 }];
export const INITIAL_MOTHERSHIP_MODULES: AnyRecord[] = [];
export const INITIAL_ALLIANCES: AnyRecord[] = [];
export const INITIAL_MARKET_ORDERS: AnyRecord[] = [];
export const INITIAL_MESSAGES: AnyRecord[] = [];
export const INITIAL_RANKINGS: AnyRecord[] = [];
export const MERCENARY_CONTRACTS: AnyRecord[] = [];
export const TARGET_REALMS: AnyRecord[] = [];
export const WEAPON_TYPES: AnyRecord[] = [];

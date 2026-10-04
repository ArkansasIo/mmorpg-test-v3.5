import { CommanderProfileSlot, CareerStats } from './types';

export interface CommanderAvatarOption {
  id: string;
  name: string;
  category: 'tauri' | 'asgard' | 'goauld' | 'replicator' | 'cybernetic' | 'ancient';
  icon: string;
  description: string;
  unlocked: boolean;
}

export const COMMANDER_AVATARS: CommanderAvatarOption[] = [
  { id: 'avatar-1', name: "Tau'ri Fleet Admiral", category: 'tauri', icon: '👨‍✈️', description: 'Supreme military strategist from Earth.', unlocked: true },
  { id: 'avatar-2', name: "Tau'ri Spec-Ops Major", category: 'tauri', icon: '🪖', description: 'Stargate frontline infiltration specialist.', unlocked: true },
  { id: 'avatar-3', name: 'Asgard High Sage', category: 'asgard', icon: '👽', description: 'Ancient intellectual wielding neutronium shields.', unlocked: true },
  { id: 'avatar-4', name: 'Asgard Thor Hologram', category: 'asgard', icon: '🛸', description: 'Subspace holographic commander projection.', unlocked: true },
  { id: 'avatar-5', name: "Goa'uld Supreme System Lord", category: 'goauld', icon: '👑', description: 'Golden armored feudal tyrant of the stars.', unlocked: true },
  { id: 'avatar-6', name: "Goa'uld Anubis Inquisitor", category: 'goauld', icon: '🐺', description: 'Jackal-masked warrior cloaked in black energy.', unlocked: true },
  { id: 'avatar-7', name: 'Replicator Human-Form Nexus', category: 'replicator', icon: '🤖', description: 'Autonomous nanite entity driven by logic.', unlocked: true },
  { id: 'avatar-8', name: 'Replicator Swarm Queen', category: 'replicator', icon: '🕷️', description: 'Hive architect converting metal into legion.', unlocked: true },
  { id: 'avatar-9', name: 'Cybernetic Dreadnought AI', category: 'cybernetic', icon: '🧠', description: 'Organic-synthetic neural matrix calculating paths.', unlocked: true },
  { id: 'avatar-10', name: 'Dark Matter Void Stalker', category: 'cybernetic', icon: '🥷', description: 'Covert assassin moving through hyperspace folds.', unlocked: false },
  { id: 'avatar-11', name: 'Ascended Ancient Being', category: 'ancient', icon: '✨', description: 'Pure energy consciousness existing beyond time.', unlocked: true },
  { id: 'avatar-12', name: 'Stellar Empress', category: 'tauri', icon: '👸', description: 'Imperial sovereign of 40 unified star systems.', unlocked: true },
];

export const COMMANDER_TITLES: string[] = [
  'Fleet Commander',
  'Grand Admiral',
  'System Lord',
  'Void Vanguard',
  'Subspace Pioneer',
  'Master of Hyperspace',
  'Stargate Sovereign',
  'Grand Architect of Megastructures',
  'Ascended Ancient',
  'Dark Matter Alchemist',
  'Galactic Overlord',
  'Planetary Conqueror',
];

export const INITIAL_PROFILE_SLOTS: CommanderProfileSlot[] = [
  {
    id: 'slot-1',
    slotNumber: 1,
    commanderName: 'Commander Tanang',
    title: 'Fleet Commander',
    race: 'tauri',
    governmentId: 'junta',
    level: 18,
    avatarUrl: '👨‍✈️',
    isActive: true,
    lastPlayed: 'Active Now',
    planetsCount: 3,
    fleetScore: 145000,
    darkMatter: 2500,
  },
  {
    id: 'slot-2',
    slotNumber: 2,
    commanderName: 'Lord Ba\'al Reborn',
    title: 'System Lord',
    race: 'goauld',
    governmentId: 'theocracy',
    level: 12,
    avatarUrl: '👑',
    isActive: false,
    lastPlayed: '2 days ago',
    planetsCount: 2,
    fleetScore: 82000,
    darkMatter: 750,
  },
  {
    id: 'slot-3',
    slotNumber: 3,
    commanderName: 'Replicator Unit Zero',
    title: 'Void Vanguard',
    race: 'replicator',
    governmentId: 'technocracy',
    level: 9,
    avatarUrl: '🤖',
    isActive: false,
    lastPlayed: '5 days ago',
    planetsCount: 1,
    fleetScore: 41000,
    darkMatter: 300,
  },
];

export const INITIAL_CAREER_STATS: CareerStats = {
  totalBattles: 148,
  victories: 124,
  defeats: 24,
  winRate: 83.7,
  totalLootNaquadah: 4850000,
  planetsColonized: 3,
  moonsDiscovered: 2,
  stargatesDialed: 89,
  expeditionsCompleted: 47,
  debrisRecycled: 1820000,
  darkMatterEarned: 8400,
  ascensionsCount: 1,
};

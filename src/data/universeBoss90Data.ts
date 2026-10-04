import type { AnyRecord } from '../types';

export type UniverseWorld = AnyRecord;
export type GalaxyAndArcBoss = AnyRecord;
export type Class90Entry = AnyRecord;
export const GALAXY_AND_ARC_BOSSES: AnyRecord[] = [];
export function loadCustomWorlds(): AnyRecord[] { return []; }
export function saveCustomWorld(_world: AnyRecord): AnyRecord[] { return [_world]; }
export function getComplete90ClassesMatrix(): AnyRecord[] { return []; }

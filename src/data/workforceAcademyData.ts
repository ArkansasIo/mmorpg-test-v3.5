import type { AnyRecord } from '../types';
export type WorkforceAcademyState = AnyRecord;
export const DEFAULT_WORKFORCE_ACADEMY_STATE: WorkforceAcademyState = { units: [], facilities: [], totalPower: 0 };
export function calculateWorkforceTotals(..._args: any[]): AnyRecord { return { totalUnits: 0, totalPower: 0, totalMiningYield: 0, totalCreditsTax: 0 }; }
export function createDefaultUnitExperience(): AnyRecord { return { level: 1, experience: 0 }; }

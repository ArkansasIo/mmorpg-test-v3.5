import type { AnyRecord } from '../types';
export const DEFAULT_MASTER_UPGRADES_STATE: AnyRecord = { bankLevel: 1, storageLevel: 1 };
export const DEFAULT_BANK_VAULT_STATE: AnyRecord = { level: 1, balance: 0 };
export const IMPERIAL_UPGRADES_CATALOG: AnyRecord[] = [];
function getLvl(lvl: any): number {
  if (typeof lvl === 'object' && lvl !== null) return Number(lvl.level || lvl.bankLevel || 1);
  return Number(lvl) || 1;
}
export function calculateBankCapacity(level: any = 1, ..._args: any[]): number { return 10000 * Math.max(1, getLvl(level)); }
export function calculateBankInterestRate(level: any = 1, ..._args: any[]): number { return Math.min(0.1, 0.01 + Math.max(0, getLvl(level) - 1) * 0.005); }
export function calculateMaxStorageCapacity(level: any = 1, ..._args: any[]): number { return 10000 * Math.max(1, getLvl(level)); }
export function calculateStorageUpgradeCost(level: any = 1, ..._args: any[]): number { const l = getLvl(level); return Math.max(100, l * l * 100); }
export function calculateMaxLoanAvailable(level: any = 1, ..._args: any[]): number { return 5000 * Math.max(1, getLvl(level)); }
export function calculatePlunderProtectionPercent(level: any = 1, ..._args: any[]): number { return Math.min(90, 10 + Math.max(0, getLvl(level) - 1) * 5); }
export function calculateUpgradeCost(upgrade: AnyRecord = {}, level: any = 1, ..._args: any[]): AnyRecord { const l = getLvl(level); const base = Number(upgrade?.baseCost || 100); return { metal: base * l, crystal: base * l, deuterium: base * l, naquadah: base * l }; }

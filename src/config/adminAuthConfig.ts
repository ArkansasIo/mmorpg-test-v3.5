import type { AdminAuthSession, AdminCredentialAccount, AnyRecord } from '../types';

export type AdminUrlLoginMode = 'direct' | 'secure' | 'root' | 'magic' | 'params' | 'create' | string;
const defaultAccount: AdminCredentialAccount = { id: 'local-admin', username: '', email: '', loginCode: '', passcode: '', securityPin: '', role: 'super_admin' };
export const CANONICAL_ADMIN_ACCOUNTS: AdminCredentialAccount[] = [defaultAccount];
export const ADMIN_PERMISSIONS_REGISTRY: AnyRecord[] = [];

export function getAdminAuthSession(): AdminAuthSession | null {
  try { const raw = localStorage.getItem('uc_admin_session'); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function setAdminAuthSession(session: AdminAuthSession): void { localStorage.setItem('uc_admin_session', JSON.stringify(session)); }
export function clearAdminAuthSession(): void { localStorage.removeItem('uc_admin_session'); }
export function getAllAdminAccounts(): AdminCredentialAccount[] { return CANONICAL_ADMIN_ACCOUNTS; }
export function getAllRootAdminAccounts(): AdminCredentialAccount[] { return CANONICAL_ADMIN_ACCOUNTS; }
export function validateAdminCredentials(loginCode: string, passcode: string, securityPin: string): AdminCredentialAccount | null {
  return CANONICAL_ADMIN_ACCOUNTS.find((account) => account.loginCode === loginCode && account.passcode === passcode && account.securityPin === securityPin) || null;
}
export function createRootAdminAccount(input: Partial<AdminCredentialAccount> = {}): AdminCredentialAccount {
  const account = { ...defaultAccount, ...input, id: `admin-${Date.now()}`, username: input.username || `root-${Date.now()}` } as AdminCredentialAccount;
  CANONICAL_ADMIN_ACCOUNTS.push(account);
  return account;
}
export function generateAdminUrlLogin(account: AdminCredentialAccount = defaultAccount, options: AnyRecord = {}): string {
  const params = new URLSearchParams({ admin: account.username || 'admin', mode: options.mode || 'direct', tab: options.tab || 'crown' });
  if (options.includePin) params.set('pin', account.securityPin || '');
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
export function processUrlAdminLogin(_search = '', _hash = ''): AnyRecord {
  return { success: false, message: 'URL admin login is disabled in the local fallback.', session: null, account: null };
}
export function addAdminAuditLog(_entry: AnyRecord): void { /* server-side audit logging is authoritative */ }

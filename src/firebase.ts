import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, type Auth } from 'firebase/auth';
import type { AnyRecord } from './types';

const firebaseConfig = { apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key', authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost', projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'local-demo' };
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export async function loginWithGoogle(): Promise<AnyRecord> { return signInWithPopup(auth, new GoogleAuthProvider()); }
export async function logoutUser(): Promise<void> { await signOut(auth); }
export async function saveUserDataToFirestore(..._args: any[]): Promise<void> { /* persistence is unavailable in the local UI fallback */ }
export async function loadUserDataFromFirestore(..._args: any[]): Promise<AnyRecord | null> { return null; }

// Lazy-loaded Firebase module
// Firebase is only loaded when actually needed, reducing initial bundle size

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let firestoreDb: Firestore | null = null;
let authInstance: Auth | null = null;

async function loadConfig() {
  try {
    const config = await import('../firebase-applet-config.json');
    return config.default || config;
  } catch (e) {
    console.warn('Firebase config not loaded - Firebase features disabled');
    return null;
  }
}

export async function getFirebaseDb(): Promise<Firestore | null> {
  if (firestoreDb) return firestoreDb;
  
  const config = await loadConfig();
  if (!config) return null;
  
  try {
    if (!firebaseApp) {
      firebaseApp = initializeApp(config);
    }
    firestoreDb = getFirestore(firebaseApp, config.firestoreDatabaseId);
    return firestoreDb;
  } catch (e) {
    console.warn('Firebase initialization failed:', e);
    return null;
  }
}

export async function getFirebaseAuth(): Promise<Auth | null> {
  if (authInstance) return authInstance;
  
  const config = await loadConfig();
  if (!config) return null;
  
  try {
    if (!firebaseApp) {
      firebaseApp = initializeApp(config);
    }
    authInstance = getAuth(firebaseApp);
    return authInstance;
  } catch (e) {
    console.warn('Firebase Auth initialization failed:', e);
    return null;
  }
}

// Quick check if Firebase is available
export async function checkFirebaseConnection(): Promise<boolean> {
  const db = await getFirebaseDb();
  if (!db) return false;
  
  try {
    const { doc, getDocFromServer } = await import('firebase/firestore');
    await getDocFromServer(doc(db, 'health', 'connection-test'));
    return true;
  } catch (e) {
    return false;
  }
}
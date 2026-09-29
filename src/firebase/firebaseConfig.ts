import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';

const sanitizeEnv = (val?: unknown): string => {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

const apiKey = sanitizeEnv(import.meta.env.VITE_FIREBASE_API_KEY);
const authDomain = sanitizeEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
const projectId = sanitizeEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID);
const storageBucket = sanitizeEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
const messagingSenderId = sanitizeEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
const appId = sanitizeEnv(import.meta.env.VITE_FIREBASE_APP_ID);

export const isFirebaseConfigured: boolean = Boolean(
  apiKey &&
  projectId &&
  apiKey.length > 5
);

export interface FirebaseDiagnostics {
  isConfigured: boolean;
  projectId: string;
  authDomain: string;
  isAuthInitialized: boolean;
  initError: string | null;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let initError: string | null = null;

if (isFirebaseConfigured) {
  try {
    const config = {
      apiKey,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
      messagingSenderId: messagingSenderId || undefined,
      appId: appId || undefined,
    };
    app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    auth = getAuth(app);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Firebase Auth initialization error:', errorMsg);
    initError = errorMsg;
    app = null;
    auth = null;
  }
} else {
  if (!apiKey && !projectId) {
    initError = 'VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are missing in environment variables.';
  } else if (!apiKey) {
    initError = 'VITE_FIREBASE_API_KEY is missing in environment variables.';
  } else if (!projectId) {
    initError = 'VITE_FIREBASE_PROJECT_ID is missing in environment variables.';
  }
}

export const getFirebaseDiagnostics = (): FirebaseDiagnostics => ({
  isConfigured: isFirebaseConfigured,
  projectId: projectId || 'Not configured in .env',
  authDomain: authDomain || (projectId ? `${projectId}.firebaseapp.com` : 'Not configured'),
  isAuthInitialized: Boolean(auth),
  initError,
});

// Explicitly no Firestore functionality yet per user requirement 14
const db = null;

export { app, auth, db, initError };

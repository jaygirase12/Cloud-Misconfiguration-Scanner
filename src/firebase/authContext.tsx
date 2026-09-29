import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  auth,
  isFirebaseConfigured,
  initError,
  getFirebaseDiagnostics,
  FirebaseDiagnostics,
} from './firebaseConfig';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isFirebaseActive: boolean;
  diagnostics: FirebaseDiagnostics;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginAsDemoAuditor: (customName?: string) => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_DEMO_USER_KEY = 'cloudguard_demo_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<FirebaseDiagnostics>(getFirebaseDiagnostics());

  const clearError = () => setAuthError(null);

  useEffect(() => {
    setDiagnostics(getFirebaseDiagnostics());

    // When Firebase Auth is initialized and active
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(
        auth,
        (fbUser: FirebaseUser | null) => {
          if (fbUser) {
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Cloud Auditor',
              isDemo: false,
            });
            // Clear any lingering demo session
            localStorage.removeItem(LOCAL_DEMO_USER_KEY);
          } else {
            // Only use demo mode if user previously explicitly clicked demo login
            const cachedDemo = localStorage.getItem(LOCAL_DEMO_USER_KEY);
            if (cachedDemo) {
              try {
                const parsed = JSON.parse(cachedDemo);
                if (parsed && parsed.isDemo === true) {
                  setUser(parsed);
                } else {
                  setUser(null);
                }
              } catch {
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.error('Firebase onAuthStateChanged error:', error);
          setAuthError(`Firebase Auth listener error: ${error.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Firebase Auth is not configured or failed to initialize
      if (initError) {
        setAuthError(`Firebase initialization error: ${initError}`);
      }
      // Check if user previously explicitly chose demo mode
      const cachedDemo = localStorage.getItem(LOCAL_DEMO_USER_KEY);
      if (cachedDemo) {
        try {
          const parsed = JSON.parse(cachedDemo);
          if (parsed && parsed.isDemo === true) {
            setUser(parsed);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !pass) {
      const err = 'Email and password must not be empty.';
      setAuthError(err);
      throw new Error(err);
    }

    if (!isFirebaseConfigured) {
      const err =
        'Firebase configuration is missing in .env (VITE_FIREBASE_API_KEY / VITE_FIREBASE_PROJECT_ID). Real login cannot proceed.';
      setAuthError(err);
      throw new Error(err);
    }

    if (!auth) {
      const err = `Firebase Auth is unavailable (${initError || 'Failed to initialize'}). Real login cannot proceed.`;
      setAuthError(err);
      throw new Error(err);
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || cleanEmail.split('@')[0],
        isDemo: false,
      });
      localStorage.removeItem(LOCAL_DEMO_USER_KEY);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed with Firebase Auth';
      setAuthError(msg);
      throw err;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    setAuthError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !pass) {
      const err = 'Name, email, and password are all required.';
      setAuthError(err);
      throw new Error(err);
    }

    if (!isFirebaseConfigured) {
      const err =
        'Firebase configuration is missing in .env (VITE_FIREBASE_API_KEY / VITE_FIREBASE_PROJECT_ID). Real user registration cannot proceed.';
      setAuthError(err);
      throw new Error(err);
    }

    if (!auth) {
      const err = `Firebase Auth failed to initialize: ${initError || 'Auth instance is null'}. Real registration cannot proceed.`;
      setAuthError(err);
      throw new Error(err);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cleanName) {
        try {
          await updateProfile(cred.user, { displayName: cleanName });
        } catch (profileErr) {
          console.warn('Could not update displayName:', profileErr);
        }
      }
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cleanName || cred.user.displayName || cleanEmail.split('@')[0],
        isDemo: false,
      });
      localStorage.removeItem(LOCAL_DEMO_USER_KEY);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed with Firebase Auth';
      setAuthError(msg);
      throw err;
    }
  };

  // Only used if explicitly triggered by the user clicking Demo Mode
  const loginAsDemoAuditor = (customName?: string) => {
    const demoUser: AppUser = {
      uid: 'auditor-guest-student',
      email: 'auditor.demo@cloudguard.local',
      displayName: customName || 'Security Auditor (Explicit Demo)',
      isDemo: true,
    };
    localStorage.setItem(LOCAL_DEMO_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setAuthError(null);
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_DEMO_USER_KEY);
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Firebase signOut error:', err);
      }
    }
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      const err = 'Please enter your account email.';
      setAuthError(err);
      throw new Error(err);
    }

    if (!isFirebaseConfigured || !auth) {
      const err = `Firebase Auth is unavailable (${initError || 'Missing configuration'}). Password reset email cannot be sent.`;
      setAuthError(err);
      throw new Error(err);
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      setAuthError(msg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive: isFirebaseConfigured && Boolean(auth),
        diagnostics,
        loginWithEmail,
        registerWithEmail,
        loginAsDemoAuditor,
        logout,
        resetPassword,
        authError,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

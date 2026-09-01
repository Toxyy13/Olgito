import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
  type User,
  type ConfirmationResult,
} from '@react-native-firebase/auth';
import { auth } from '../firebase/config';
import { watchUser, createClientUser, getUserOnce, savePushToken } from '../firebase/users';
import { registerForPushNotificationsAsync } from '../notifications/push';
import type { AppUser } from '../types';

interface AuthContextValue {
  firebaseUser: User | null;
  appUser: AppUser | null;
  initializing: boolean;
  confirmation: ConfirmationResult | null;
  sendCode: (e164Phone: string) => Promise<void>;
  confirmCode: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setAppUser(null);
        setInitializing(false);
        return;
      }
      const existing = await getUserOnce(user.uid);
      if (!existing && user.phoneNumber) {
        // Prva prijava ovim brojem telefona — kreira se nalog klijenta na čekanju.
        await createClientUser(user.uid, user.phoneNumber);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubscribe = watchUser(firebaseUser.uid, setAppUser);
    return unsubscribe;
  }, [firebaseUser]);

  useEffect(() => {
    if (!appUser || appUser.accountStatus !== 'approved') return;
    registerForPushNotificationsAsync().then((token) => {
      if (token && token !== appUser.expoPushToken) {
        savePushToken(appUser.uid, token);
      }
    });
  }, [appUser?.uid, appUser?.accountStatus]);

  const sendCode = useCallback(async (e164Phone: string) => {
    const result = await signInWithPhoneNumber(auth, e164Phone);
    setConfirmation(result);
  }, []);

  const confirmCode = useCallback(
    async (code: string) => {
      if (!confirmation) throw new Error('Nema aktivnog zahteva za potvrdu koda.');
      await confirmation.confirm(code);
      setConfirmation(null);
    },
    [confirmation]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, initializing, confirmation, sendCode, confirmCode, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth mora biti pozvan unutar AuthProvider-a');
  return ctx;
}

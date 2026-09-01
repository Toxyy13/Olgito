import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiRegister, apiLogin, apiGetMe } from '../api/auth';
import { getToken, setToken as persistToken, poll } from '../api/client';
import { savePushToken } from '../api/users';
import { registerForPushNotificationsAsync } from '../notifications/push';
import type { AppUser } from '../types';

interface AuthContextValue {
  appUser: AppUser | null;
  initializing: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAppUser: (user: AppUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Token se čuva u SecureStore, pa korisnik ostaje prijavljen posle gašenja
  // aplikacije sve dok se ručno ne odjavi.
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const { user } = await apiGetMe();
        setAppUser(user);
      } catch {
        await persistToken(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  // Osvežava nalog periodično (npr. da klijent vidi kad ga Olgica odobri/blokira
  // bez potrebe da se ponovo prijavljuje — nema realtime servera, pa se pollinguje).
  useEffect(() => {
    if (initializing || !appUser) return;
    return poll(() => apiGetMe().then((r) => r.user), setAppUser, 10000);
  }, [initializing, !!appUser]);

  useEffect(() => {
    // Registrujemo token i za naloge koji čekaju odobrenje, ne samo odobrene —
    // inače nemamo gde da pošaljemo push kad Olgica odobri nalog.
    if (!appUser) return;
    registerForPushNotificationsAsync().then((token) => {
      if (token && token !== appUser.expoPushToken) {
        savePushToken(appUser.uid, token);
      }
    });
  }, [appUser?.uid, appUser?.accountStatus]);

  const register = useCallback(async (email: string, password: string) => {
    const { token, user } = await apiRegister(email, password);
    await persistToken(token);
    setAppUser(user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await apiLogin(email, password);
    await persistToken(token);
    setAppUser(user);
  }, []);

  const logout = useCallback(async () => {
    await persistToken(null);
    setAppUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ appUser, initializing, register, login, logout, setAppUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth mora biti pozvan unutar AuthProvider-a');
  return ctx;
}

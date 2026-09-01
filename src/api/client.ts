import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Adresa sopstvenog servera — vidi README.md za podešavanje (.env / EXPO_PUBLIC_API_URL).
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

const TOKEN_KEY = 'olgito_auth_token';

// Na webu (samo za brzi pregled u browseru) SecureStore nema pun web shim,
// pa se koristi localStorage; na telefonu ide preko pravog SecureStore-a.
export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') return window.localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? 'Nešto nije u redu. Pokušaj ponovo.');
  }
  return body as T;
}

// "watch" funkcije oponašaju Firestore-ov onSnapshot interfejs (callback + unsubscribe),
// ali interno rade periodično osvežavanje (nema realtime servera).
export function poll<T>(fetcher: () => Promise<T>, cb: (data: T) => void, intervalMs = 8000): () => void {
  let cancelled = false;
  const tick = async () => {
    try {
      const data = await fetcher();
      if (!cancelled) cb(data);
    } catch {
      // tiha greška — sledeći tik pokušava ponovo
    }
  };
  tick();
  const id = setInterval(tick, intervalMs);
  return () => {
    cancelled = true;
    clearInterval(id);
  };
}

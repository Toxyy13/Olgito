import { apiFetch } from './client';
import type { AppUser } from '../types';

export async function apiRegister(email: string, password: string): Promise<{ token: string; user: AppUser }> {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function apiLogin(email: string, password: string): Promise<{ token: string; user: AppUser }> {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function apiGetMe(): Promise<{ user: AppUser }> {
  return apiFetch('/auth/me');
}

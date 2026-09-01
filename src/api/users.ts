import { apiFetch, poll } from './client';
import type { AppUser } from '../types';

export async function completeProfile(
  _uid: string,
  data: { fullName: string; age: number; phone: string; photoURL: string | null }
): Promise<AppUser> {
  const res = await apiFetch<{ user: AppUser }>('/users/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.user;
}

export async function savePushToken(_uid: string, token: string): Promise<void> {
  await apiFetch('/users/me/push-token', { method: 'POST', body: JSON.stringify({ token }) });
}

export function watchPendingClients(cb: (users: AppUser[]) => void) {
  return poll(() => apiFetch<{ users: AppUser[] }>('/users/pending').then((r) => r.users), cb);
}

export function watchAllClients(cb: (users: AppUser[]) => void) {
  return poll(() => apiFetch<{ users: AppUser[] }>('/users/clients').then((r) => r.users), cb);
}

export function watchRejectedClients(cb: (users: AppUser[]) => void) {
  return poll(() => apiFetch<{ users: AppUser[] }>('/users/rejected').then((r) => r.users), cb);
}

export async function approveClient(uid: string): Promise<void> {
  await apiFetch(`/users/${uid}/approve`, { method: 'POST' });
}

export async function rejectClient(uid: string): Promise<void> {
  await apiFetch(`/users/${uid}/reject`, { method: 'POST' });
}

export async function blockClient(uid: string): Promise<void> {
  await apiFetch(`/users/${uid}/block`, { method: 'POST' });
}

export async function unblockClient(uid: string): Promise<void> {
  await apiFetch(`/users/${uid}/unblock`, { method: 'POST' });
}

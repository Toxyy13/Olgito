import { apiFetch, poll } from './client';
import type { UrgentRequest } from '../types';

export async function createUrgentRequest(data: {
  clientId: string;
  clientName: string;
  clientPhone: string;
  note: string;
}): Promise<void> {
  await apiFetch('/urgent-requests', { method: 'POST', body: JSON.stringify({ note: data.note }) });
}

export function watchOpenUrgentRequests(cb: (requests: UrgentRequest[]) => void) {
  return poll(() => apiFetch<{ requests: UrgentRequest[] }>('/urgent-requests').then((r) => r.requests), cb);
}

export async function resolveUrgentRequest(id: string): Promise<void> {
  await apiFetch(`/urgent-requests/${id}/resolve`, { method: 'POST' });
}

import { apiFetch, poll } from './client';
import type { UrgentRequest, UrgentRequestMessage } from '../types';

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

export function watchMyUrgentRequests(cb: (requests: UrgentRequest[]) => void) {
  return poll(() => apiFetch<{ requests: UrgentRequest[] }>('/urgent-requests/mine').then((r) => r.requests), cb);
}

export async function resolveUrgentRequest(id: string): Promise<void> {
  await apiFetch(`/urgent-requests/${id}/resolve`, { method: 'POST' });
}

export function watchUrgentRequestMessages(requestId: string, cb: (messages: UrgentRequestMessage[]) => void) {
  return poll(
    () => apiFetch<{ messages: UrgentRequestMessage[] }>(`/urgent-requests/${requestId}/messages`).then((r) => r.messages),
    cb,
    4000
  );
}

export async function sendUrgentRequestMessage(requestId: string, text: string): Promise<void> {
  await apiFetch(`/urgent-requests/${requestId}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
}

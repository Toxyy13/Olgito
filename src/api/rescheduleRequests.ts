import { apiFetch, poll } from './client';
import type { RescheduleRequest } from '../types';

export async function createRescheduleRequest(data: {
  appointmentId: string;
  clientId: string;
  message: string;
}): Promise<void> {
  await apiFetch('/reschedule-requests', { method: 'POST', body: JSON.stringify(data) });
}

export function watchRescheduleRequestsForClient(_clientId: string, cb: (requests: RescheduleRequest[]) => void) {
  return poll(() => apiFetch<{ requests: RescheduleRequest[] }>('/reschedule-requests/mine').then((r) => r.requests), cb);
}

export async function respondRescheduleRequest(id: string, accepted: boolean): Promise<void> {
  await apiFetch(`/reschedule-requests/${id}/respond`, { method: 'POST', body: JSON.stringify({ accepted }) });
}

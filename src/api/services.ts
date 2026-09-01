import { apiFetch, poll } from './client';
import type { ServiceType } from '../types';

export function watchActiveServices(cb: (services: ServiceType[]) => void) {
  return poll(() => apiFetch<{ services: ServiceType[] }>('/services').then((r) => r.services), cb);
}

export function watchAllServices(cb: (services: ServiceType[]) => void) {
  return watchActiveServices(cb); // server već vraća sve za admina (na osnovu tokena)
}

export async function addService(name: string, price: number): Promise<void> {
  await apiFetch('/services', { method: 'POST', body: JSON.stringify({ name, price }) });
}

export async function updateService(id: string, data: Partial<ServiceType>): Promise<void> {
  await apiFetch(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function updateServicePrice(id: string, price: number): Promise<void> {
  await apiFetch(`/services/${id}`, { method: 'PATCH', body: JSON.stringify({ price }) });
}

export async function deleteService(id: string): Promise<void> {
  await apiFetch(`/services/${id}`, { method: 'DELETE' });
}

// Server sam po prvom pokretanju ne dodaje default usluge (da ne nameće cene) —
// ova funkcija ostaje no-op radi kompatibilnosti sa postojećim ekranom podešavanja.
export async function seedDefaultServicesIfEmpty(): Promise<void> {}

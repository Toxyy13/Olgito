import { apiFetch, poll } from './client';
import type { Appointment, Role } from '../types';

export interface NewAppointmentInput {
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceIds: string[];
  serviceNames: string[];
  peopleCount: number;
  date: string;
  startTime: string;
  note?: string;
}

export async function createAppointment(input: NewAppointmentInput): Promise<void> {
  await apiFetch('/appointments', {
    method: 'POST',
    body: JSON.stringify({
      serviceIds: input.serviceIds,
      serviceNames: input.serviceNames,
      peopleCount: input.peopleCount,
      date: input.date,
      startTime: input.startTime,
      note: input.note,
    }),
  });
}

export async function cancelAppointment(appointment: Appointment, _cancelledBy: Role): Promise<void> {
  await apiFetch(`/appointments/${appointment.id}/cancel`, { method: 'POST' });
}

export async function confirmAppointment(appointmentId: string): Promise<void> {
  await apiFetch(`/appointments/${appointmentId}/confirm`, { method: 'POST' });
}

export function watchAppointmentsForDate(dateISO: string, cb: (appointments: Appointment[]) => void) {
  return poll(
    () => apiFetch<{ appointments: Appointment[] }>(`/appointments?date=${dateISO}`).then((r) => r.appointments),
    cb,
    5000
  );
}

export function watchAppointmentsForClient(_clientId: string, cb: (appointments: Appointment[]) => void) {
  return poll(() => apiFetch<{ appointments: Appointment[] }>('/appointments/mine').then((r) => r.appointments), cb);
}

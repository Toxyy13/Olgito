import { apiFetch, poll } from './client';
import type { WeeklyDefaultHours, WorkingHoursOverride, BlockedSlot, DayHours, Weekday } from '../types';

export function watchWeeklyDefault(cb: (hours: WeeklyDefaultHours) => void) {
  return poll(() => apiFetch<{ weekly: WeeklyDefaultHours }>('/working-hours/weekly').then((r) => r.weekly), cb);
}

export async function getWeeklyDefaultOnce(): Promise<WeeklyDefaultHours> {
  const res = await apiFetch<{ weekly: WeeklyDefaultHours }>('/working-hours/weekly');
  return res.weekly;
}

export async function setDayHours(day: Weekday, dayHours: DayHours): Promise<void> {
  await apiFetch(`/working-hours/weekly/${day}`, { method: 'PUT', body: JSON.stringify(dayHours) });
}

export async function getOverride(dateISO: string): Promise<WorkingHoursOverride | null> {
  const res = await apiFetch<{ override: WorkingHoursOverride | null }>(`/working-hours/overrides/${dateISO}`);
  return res.override;
}

export async function setOverride(override: WorkingHoursOverride): Promise<void> {
  await apiFetch(`/working-hours/overrides/${override.date}`, {
    method: 'PUT',
    body: JSON.stringify({ closed: override.closed, start: override.start, end: override.end }),
  });
}

export async function clearOverride(dateISO: string): Promise<void> {
  await apiFetch(`/working-hours/overrides/${dateISO}`, { method: 'DELETE' });
}

export async function getEffectiveDayHours(dateISO: string): Promise<DayHours> {
  const res = await apiFetch<{ hours: DayHours }>(`/working-hours/effective?date=${dateISO}`);
  return res.hours;
}

// Datumi u opsegu kad Olgica ne radi ceo dan (izuzeci + nedeljni raspored) —
// za bojenje celog prikazanog meseca u kalendaru odjednom.
export async function getClosedDatesForRange(fromISO: string, toISO: string): Promise<string[]> {
  const res = await apiFetch<{ closedDates: string[] }>(`/working-hours/closed-dates?from=${fromISO}&to=${toISO}`);
  return res.closedDates;
}

export async function getBlockedSlotsForDate(dateISO: string): Promise<BlockedSlot[]> {
  const res = await apiFetch<{ blockedSlots: BlockedSlot[] }>(`/working-hours/blocked-slots?date=${dateISO}`);
  return res.blockedSlots;
}

export function watchBlockedSlotsForDate(dateISO: string, cb: (slots: BlockedSlot[]) => void) {
  return poll(() => getBlockedSlotsForDate(dateISO), cb);
}

export async function addBlockedSlot(slot: Omit<BlockedSlot, 'id'>): Promise<void> {
  await apiFetch('/working-hours/blocked-slots', { method: 'POST', body: JSON.stringify(slot) });
}

export async function removeBlockedSlot(id: string): Promise<void> {
  await apiFetch(`/working-hours/blocked-slots/${id}`, { method: 'DELETE' });
}

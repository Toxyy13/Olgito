import { SLOT_MINUTES } from '../types';

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export interface TimeRange {
  startTime: string;
  endTime: string;
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return timeToMinutes(a.startTime) < timeToMinutes(b.endTime) && timeToMinutes(b.startTime) < timeToMinutes(a.endTime);
}

// Sve moguće 30-minutne polazne tačke u okviru radnog vremena.
export function generateSlotStarts(dayStart: string, dayEnd: string): string[] {
  const start = timeToMinutes(dayStart);
  const end = timeToMinutes(dayEnd);
  const starts: string[] = [];
  for (let t = start; t + SLOT_MINUTES <= end; t += SLOT_MINUTES) {
    starts.push(minutesToTime(t));
  }
  return starts;
}

// Slobodni termini za dati broj osoba (svaka osoba = dodatnih 30 min).
export function computeAvailableStartTimes(
  dayStart: string,
  dayEnd: string,
  busyRanges: TimeRange[],
  peopleCount: number
): string[] {
  const durationMinutes = peopleCount * SLOT_MINUTES;
  const dayEndMinutes = timeToMinutes(dayEnd);
  const candidates = generateSlotStarts(dayStart, dayEnd);

  return candidates.filter((start) => {
    const startMin = timeToMinutes(start);
    const endMin = startMin + durationMinutes;
    if (endMin > dayEndMinutes) return false;
    const candidateRange: TimeRange = { startTime: start, endTime: minutesToTime(endMin) };
    return !busyRanges.some((busy) => rangesOverlap(candidateRange, busy));
  });
}

export function addMinutesToTime(hhmm: string, minutesToAdd: number): string {
  return minutesToTime(timeToMinutes(hhmm) + minutesToAdd);
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function weekdayKey(dateISO: string): 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' {
  const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const [y, m, d] = dateISO.split('-').map(Number);
  return keys[new Date(y, m - 1, d).getDay()];
}

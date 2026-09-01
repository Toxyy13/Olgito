import { apiFetch, poll } from './client';
import type { TimeRange } from '../utils/time';

export interface AvailabilityRange extends TimeRange {
  appointmentId: string;
}

export async function getBusyRangesOnce(dateISO: string): Promise<AvailabilityRange[]> {
  const res = await apiFetch<{ busyRanges: AvailabilityRange[] }>(`/appointments/availability?date=${dateISO}`);
  return res.busyRanges;
}

export function watchBusyRanges(dateISO: string, cb: (ranges: AvailabilityRange[]) => void) {
  return poll(() => getBusyRangesOnce(dateISO), cb, 5000);
}

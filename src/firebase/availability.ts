import { collection, doc, onSnapshot, getDoc } from '@react-native-firebase/firestore';
import { db } from './config';
import type { TimeRange } from '../utils/time';

// Javno vidljivo (klijentima) — samo zauzeti opsezi, bez imena/identiteta.
export interface AvailabilityRange extends TimeRange {
  appointmentId: string;
}

const availabilityCol = () => collection(db, 'availability');

export function availabilityDocRef(dateISO: string) {
  return doc(availabilityCol(), dateISO);
}

export async function getBusyRangesOnce(dateISO: string): Promise<AvailabilityRange[]> {
  const snap = await getDoc(availabilityDocRef(dateISO));
  return snap.exists() ? ((snap.data() as any).busyRanges ?? []) : [];
}

export function watchBusyRanges(dateISO: string, cb: (ranges: AvailabilityRange[]) => void) {
  return onSnapshot(availabilityDocRef(dateISO), (snap) => {
    cb(snap.exists() ? ((snap.data() as any).busyRanges ?? []) : []);
  });
}

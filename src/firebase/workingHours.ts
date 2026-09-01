import { collection, doc, getDoc, onSnapshot, setDoc, query, where, getDocs, addDoc, deleteDoc } from '@react-native-firebase/firestore';
import { db } from './config';
import type { WeeklyDefaultHours, WorkingHoursOverride, BlockedSlot, DayHours, Weekday } from '../types';
import { weekdayKey } from '../utils/time';

const DEFAULT_DOC_ID = 'weeklyDefault';

export const DEFAULT_WEEKLY_HOURS: WeeklyDefaultHours = {
  mon: { closed: false, start: '09:00', end: '17:00' },
  tue: { closed: false, start: '09:00', end: '17:00' },
  wed: { closed: false, start: '09:00', end: '17:00' },
  thu: { closed: false, start: '09:00', end: '17:00' },
  fri: { closed: false, start: '09:00', end: '17:00' },
  sat: { closed: false, start: '09:00', end: '14:00' },
  sun: { closed: true, start: '09:00', end: '14:00' },
};

export function watchWeeklyDefault(cb: (hours: WeeklyDefaultHours) => void) {
  return onSnapshot(doc(collection(db, 'workingHours'), DEFAULT_DOC_ID), (snap) => {
    cb(snap.exists() ? (snap.data() as WeeklyDefaultHours) : DEFAULT_WEEKLY_HOURS);
  });
}

export async function getWeeklyDefaultOnce(): Promise<WeeklyDefaultHours> {
  const snap = await getDoc(doc(collection(db, 'workingHours'), DEFAULT_DOC_ID));
  return snap.exists() ? (snap.data() as WeeklyDefaultHours) : DEFAULT_WEEKLY_HOURS;
}

export async function setWeeklyDefault(hours: WeeklyDefaultHours): Promise<void> {
  await setDoc(doc(collection(db, 'workingHours'), DEFAULT_DOC_ID), hours);
}

export async function setDayHours(day: Weekday, dayHours: DayHours): Promise<void> {
  const current = await getWeeklyDefaultOnce();
  await setWeeklyDefault({ ...current, [day]: dayHours });
}

const overridesCol = () => collection(db, 'workingHoursOverrides');

export async function getOverride(dateISO: string): Promise<WorkingHoursOverride | null> {
  const snap = await getDoc(doc(overridesCol(), dateISO));
  return snap.exists() ? (snap.data() as WorkingHoursOverride) : null;
}

export async function setOverride(override: WorkingHoursOverride): Promise<void> {
  await setDoc(doc(overridesCol(), override.date), override);
}

export async function clearOverride(dateISO: string): Promise<void> {
  await deleteDoc(doc(overridesCol(), dateISO));
}

// Efektivno radno vreme za dati datum: override ako postoji, inače nedeljni default.
export async function getEffectiveDayHours(dateISO: string): Promise<DayHours> {
  const override = await getOverride(dateISO);
  if (override) return { closed: override.closed, start: override.start ?? '09:00', end: override.end ?? '17:00' };
  const weekly = await getWeeklyDefaultOnce();
  return weekly[weekdayKey(dateISO)];
}

const blockedCol = () => collection(db, 'blockedSlots');

export async function getBlockedSlotsForDate(dateISO: string): Promise<BlockedSlot[]> {
  const q = query(blockedCol(), where('date', '==', dateISO));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export function watchBlockedSlotsForDate(dateISO: string, cb: (slots: BlockedSlot[]) => void) {
  const q = query(blockedCol(), where('date', '==', dateISO));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

export async function addBlockedSlot(slot: Omit<BlockedSlot, 'id'>): Promise<void> {
  await addDoc(blockedCol(), slot);
}

export async function removeBlockedSlot(id: string): Promise<void> {
  await deleteDoc(doc(blockedCol(), id));
}

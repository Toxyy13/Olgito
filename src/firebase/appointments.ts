import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
  updateDoc,
} from '@react-native-firebase/firestore';
import { db } from './config';
import { availabilityDocRef } from './availability';
import type { Appointment, AppointmentStatus, Role } from '../types';
import { addMinutesToTime, rangesOverlap, type TimeRange } from '../utils/time';
import { SLOT_MINUTES } from '../types';

const appointmentsCol = () => collection(db, 'appointments');

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

// Transakciono: proverava da slot nije upravo zauzet i istovremeno kreira
// termin + ažurira javni "availability" dokument — sprečava duplo zakazivanje.
export async function createAppointment(input: NewAppointmentInput): Promise<void> {
  const endTime = addMinutesToTime(input.startTime, input.peopleCount * SLOT_MINUTES);
  const candidateRange: TimeRange = { startTime: input.startTime, endTime };
  const availabilityRef = availabilityDocRef(input.date);
  const appointmentRef = doc(appointmentsCol());

  await runTransaction(db, async (tx) => {
    const availSnap = await tx.get(availabilityRef);
    const busyRanges: Array<TimeRange & { appointmentId: string }> = availSnap.exists()
      ? (availSnap.data() as any).busyRanges ?? []
      : [];

    if (busyRanges.some((r) => rangesOverlap(r, candidateRange))) {
      throw new Error('SLOT_TAKEN');
    }

    const [y, m, d] = input.date.split('-').map(Number);
    const [h, min] = input.startTime.split(':').map(Number);
    const startAtMillis = new Date(y, m - 1, d, h, min).getTime();

    tx.set(appointmentRef, {
      clientId: input.clientId,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      serviceIds: input.serviceIds,
      serviceNames: input.serviceNames,
      peopleCount: input.peopleCount,
      date: input.date,
      startTime: input.startTime,
      endTime,
      startAtMillis,
      status: 'zakazano' as AppointmentStatus,
      note: input.note ?? '',
      reminderSentAt: null,
      createdAt: Date.now(),
      cancelledBy: null,
    });

    tx.set(
      availabilityRef,
      { busyRanges: [...busyRanges, { ...candidateRange, appointmentId: appointmentRef.id }] },
      { merge: true }
    );
  });
}

export async function cancelAppointment(appointment: Appointment, cancelledBy: Role): Promise<void> {
  const availabilityRef = availabilityDocRef(appointment.date);
  const appointmentRef = doc(appointmentsCol(), appointment.id);

  await runTransaction(db, async (tx) => {
    const availSnap = await tx.get(availabilityRef);
    const busyRanges: Array<TimeRange & { appointmentId: string }> = availSnap.exists()
      ? (availSnap.data() as any).busyRanges ?? []
      : [];

    tx.update(appointmentRef, { status: 'otkazano' as AppointmentStatus, cancelledBy });
    tx.set(
      availabilityRef,
      { busyRanges: busyRanges.filter((r) => r.appointmentId !== appointment.id) },
      { merge: true }
    );
  });
}

export async function confirmAppointment(appointmentId: string): Promise<void> {
  await updateDoc(doc(appointmentsCol(), appointmentId), { status: 'potvrdjeno' as AppointmentStatus });
}

export function watchAppointmentsForDate(dateISO: string, cb: (appointments: Appointment[]) => void) {
  const q = query(appointmentsCol(), where('date', '==', dateISO), orderBy('startTime', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

export function watchAppointmentsForClient(clientId: string, cb: (appointments: Appointment[]) => void) {
  const q = query(appointmentsCol(), where('clientId', '==', clientId), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

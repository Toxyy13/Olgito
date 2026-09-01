import { collection, doc, addDoc, updateDoc, onSnapshot, query, where } from '@react-native-firebase/firestore';
import { db } from './config';
import type { RescheduleRequest } from '../types';

const col = () => collection(db, 'rescheduleRequests');

export async function createRescheduleRequest(data: {
  appointmentId: string;
  clientId: string;
  message: string;
}): Promise<void> {
  await addDoc(col(), { ...data, status: 'pending', createdAt: Date.now() });
}

export function watchRescheduleRequestsForClient(clientId: string, cb: (requests: RescheduleRequest[]) => void) {
  const q = query(col(), where('clientId', '==', clientId), where('status', '==', 'pending'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

export async function respondRescheduleRequest(id: string, accepted: boolean): Promise<void> {
  await updateDoc(doc(col(), id), { status: accepted ? 'accepted' : 'declined' });
}

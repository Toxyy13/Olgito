import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy } from '@react-native-firebase/firestore';
import { db } from './config';
import type { UrgentRequest } from '../types';

const col = () => collection(db, 'urgentRequests');

export async function createUrgentRequest(data: {
  clientId: string;
  clientName: string;
  clientPhone: string;
  note: string;
}): Promise<void> {
  await addDoc(col(), { ...data, status: 'open', createdAt: Date.now() });
}

export function watchOpenUrgentRequests(cb: (requests: UrgentRequest[]) => void) {
  const q = query(col(), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

export async function resolveUrgentRequest(id: string): Promise<void> {
  await updateDoc(doc(col(), id), { status: 'resolved' });
}

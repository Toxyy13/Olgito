import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc, query, where, deleteDoc } from '@react-native-firebase/firestore';
import { db } from './config';
import type { AppUser } from '../types';

const usersCol = () => collection(db, 'users');

export function watchUser(uid: string, cb: (user: AppUser | null) => void) {
  return onSnapshot(doc(usersCol(), uid), (snap) => {
    cb(snap.exists() ? ({ uid: snap.id, ...(snap.data() as any) } as AppUser) : null);
  });
}

export async function getUserOnce(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(usersCol(), uid));
  return snap.exists() ? ({ uid: snap.id, ...(snap.data() as any) } as AppUser) : null;
}

// Kreira novog klijenta pri prvoj prijavi telefonom. Nalog čeka odobrenje Olgice.
export async function createClientUser(uid: string, phone: string): Promise<void> {
  await setDoc(doc(usersCol(), uid), {
    role: 'client',
    phone,
    fullName: '',
    age: null,
    photoURL: null,
    profileComplete: false,
    accountStatus: 'pending',
    createdAt: Date.now(),
  });
}

export async function completeProfile(
  uid: string,
  data: { fullName: string; age: number; photoURL: string | null }
): Promise<void> {
  await updateDoc(doc(usersCol(), uid), {
    fullName: data.fullName,
    age: data.age,
    photoURL: data.photoURL,
    profileComplete: true,
  });
}

export async function savePushToken(uid: string, token: string): Promise<void> {
  await updateDoc(doc(usersCol(), uid), { expoPushToken: token });
}

export function watchPendingClients(cb: (users: AppUser[]) => void) {
  const q = query(usersCol(), where('role', '==', 'client'), where('accountStatus', '==', 'pending'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
  });
}

export function watchAllClients(cb: (users: AppUser[]) => void) {
  const q = query(usersCol(), where('role', '==', 'client'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
  });
}

export async function approveClient(uid: string): Promise<void> {
  await updateDoc(doc(usersCol(), uid), { accountStatus: 'approved' });
}

export async function rejectClient(uid: string): Promise<void> {
  await deleteDoc(doc(usersCol(), uid));
}

export async function blockClient(uid: string): Promise<void> {
  await updateDoc(doc(usersCol(), uid), { accountStatus: 'blocked' });
}

export async function unblockClient(uid: string): Promise<void> {
  await updateDoc(doc(usersCol(), uid), { accountStatus: 'approved' });
}

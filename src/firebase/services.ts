import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, where, getDocs } from '@react-native-firebase/firestore';
import { db } from './config';
import type { ServiceType } from '../types';

const servicesCol = () => collection(db, 'services');

export function watchActiveServices(cb: (services: ServiceType[]) => void) {
  return onSnapshot(query(servicesCol(), where('active', '==', true)), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

export function watchAllServices(cb: (services: ServiceType[]) => void) {
  return onSnapshot(servicesCol(), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

export async function addService(name: string, price: number): Promise<void> {
  await addDoc(servicesCol(), { name, price, active: true });
}

export async function updateServicePrice(id: string, price: number): Promise<void> {
  await updateDoc(doc(servicesCol(), id), { price });
}

export async function updateService(id: string, data: Partial<ServiceType>): Promise<void> {
  await updateDoc(doc(servicesCol(), id), data);
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(servicesCol(), id));
}

export async function seedDefaultServicesIfEmpty(): Promise<void> {
  const snap = await getDocs(servicesCol());
  if (!snap.empty) return;
  const defaults: Array<[string, number]> = [
    ['Šišanje', 800],
    ['Brijanje', 500],
    ['Pranje kose', 300],
    ['Šišanje + brijanje', 1200],
  ];
  await Promise.all(defaults.map(([name, price]) => addService(name, price)));
}

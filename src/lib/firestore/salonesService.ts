import {
  collection, doc, setDoc, getDocs, updateDoc,
  onSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Salon } from '@/types';

const COL = 'salones';

export async function guardarSalon(salon: Salon) {
  await setDoc(doc(db, COL, salon.id), salon);
}

export async function actualizarSalon(id: string, datos: Partial<Salon>) {
  await updateDoc(doc(db, COL, id), datos as Record<string, unknown>);
}

export async function obtenerSalones(): Promise<Salon[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => d.data() as Salon);
}

export function escucharSalones(cb: (salones: Salon[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL), (snap) => {
    cb(snap.docs.map((d) => d.data() as Salon));
  });
}

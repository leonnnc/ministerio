import {
  collection, doc, setDoc, getDocs, deleteDoc,
  onSnapshot, type Unsubscribe, updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Personal } from '@/types';

const COL = 'personal';

export async function guardarPersonal(p: Personal) {
  await setDoc(doc(db, COL, p.id), p);
}

export async function actualizarPersonal(id: string, datos: Partial<Personal>) {
  await updateDoc(doc(db, COL, id), datos as Record<string, unknown>);
}

export async function eliminarPersonal(id: string) {
  await deleteDoc(doc(db, COL, id));
}

export async function obtenerPersonal(): Promise<Personal[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => d.data() as Personal);
}

export function escucharPersonal(cb: (personal: Personal[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL), (snap) => {
    cb(snap.docs.map((d) => d.data() as Personal));
  });
}

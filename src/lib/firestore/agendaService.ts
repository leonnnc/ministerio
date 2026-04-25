import {
  collection, doc, setDoc, getDocs, deleteDoc,
  onSnapshot, updateDoc, query, where, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AsignacionServicio } from '@/stores/agendaStore';

const COL = 'agenda';

export async function guardarAsignacion(a: AsignacionServicio) {
  await setDoc(doc(db, COL, a.id), a);
}

export async function actualizarAsignacion(id: string, datos: Partial<AsignacionServicio>) {
  await updateDoc(doc(db, COL, id), datos as Record<string, unknown>);
}

export async function eliminarAsignacion(id: string) {
  await deleteDoc(doc(db, COL, id));
}

export async function obtenerAsignaciones(): Promise<AsignacionServicio[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => d.data() as AsignacionServicio);
}

export function escucharAgenda(cb: (asignaciones: AsignacionServicio[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL), (snap) => {
    cb(snap.docs.map((d) => d.data() as AsignacionServicio));
  });
}

export async function obtenerPorFecha(fecha: string): Promise<AsignacionServicio[]> {
  const q = query(collection(db, COL), where('fecha', '==', fecha));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as AsignacionServicio);
}

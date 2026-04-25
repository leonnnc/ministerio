import {
  collection, doc, setDoc, getDocs, updateDoc,
  onSnapshot, query, where, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RegistroAsistencia } from '@/types';

const COL = 'asistencia';

export async function guardarRegistro(r: RegistroAsistencia) {
  await setDoc(doc(db, COL, r.id), r);
}

export async function actualizarRegistro(id: string, datos: Partial<RegistroAsistencia>) {
  await updateDoc(doc(db, COL, id), datos as Record<string, unknown>);
}

export async function obtenerAsistencia(): Promise<RegistroAsistencia[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => d.data() as RegistroAsistencia);
}

export function escucharAsistencia(cb: (registros: RegistroAsistencia[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL), (snap) => {
    cb(snap.docs.map((d) => d.data() as RegistroAsistencia));
  });
}

export async function obtenerAsistenciaPorFecha(fecha: string): Promise<RegistroAsistencia[]> {
  const q = query(collection(db, COL), where('fecha', '==', fecha));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as RegistroAsistencia);
}

export async function obtenerAsistenciaPorAlumno(alumnoId: string): Promise<RegistroAsistencia[]> {
  const q = query(collection(db, COL), where('alumnoId', '==', alumnoId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as RegistroAsistencia);
}

import {
  collection, doc, setDoc, getDocs, query, where, onSnapshot,
  deleteDoc, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Alumno, Apoderado } from '@/types';

const COL_ALUMNOS    = 'alumnos';
const COL_APODERADOS = 'apoderados';

export async function guardarAlumno(alumno: Alumno, apoderado: Apoderado) {
  await setDoc(doc(db, COL_APODERADOS, apoderado.id), apoderado);
  await setDoc(doc(db, COL_ALUMNOS, alumno.id), alumno);
}

export async function obtenerAlumnos(): Promise<Alumno[]> {
  const snap = await getDocs(collection(db, COL_ALUMNOS));
  return snap.docs.map((d) => d.data() as Alumno);
}

export async function obtenerApoderados(): Promise<Apoderado[]> {
  const snap = await getDocs(collection(db, COL_APODERADOS));
  return snap.docs.map((d) => d.data() as Apoderado);
}

export function escucharAlumnos(cb: (alumnos: Alumno[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL_ALUMNOS), (snap) => {
    cb(snap.docs.map((d) => d.data() as Alumno));
  });
}

export function escucharApoderados(cb: (apoderados: Apoderado[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL_APODERADOS), (snap) => {
    cb(snap.docs.map((d) => d.data() as Apoderado));
  });
}

export async function obtenerAlumnosPorSalon(salonId: string): Promise<Alumno[]> {
  const q = query(collection(db, COL_ALUMNOS), where('salonId', '==', salonId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Alumno);
}

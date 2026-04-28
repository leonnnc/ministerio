import {
  collection, doc, setDoc, getDocs, query, where, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Alumno, Apoderado } from '@/types';

const COL_ALUMNOS    = 'alumnos';
const COL_APODERADOS = 'apoderados';

// Elimina campos undefined para que Firestore no los rechace
function limpiarUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function guardarAlumno(alumno: Alumno, apoderado: Apoderado) {
  await setDoc(doc(db, COL_APODERADOS, apoderado.id), limpiarUndefined(apoderado));
  await setDoc(doc(db, COL_ALUMNOS, alumno.id), limpiarUndefined(alumno));
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

// Busca un alumno por codigoQR o id directamente en Firestore
export async function buscarAlumnoPorCodigo(
  codigo: string
): Promise<{ alumno: Alumno; apoderado: Apoderado } | null> {
  // Buscar por codigoQR
  let snap = await getDocs(
    query(collection(db, COL_ALUMNOS), where('codigoQR', '==', codigo))
  );

  // Si no encontró, buscar por id (documento con ese nombre)
  if (snap.empty) {
    snap = await getDocs(
      query(collection(db, COL_ALUMNOS), where('id', '==', codigo))
    );
  }

  if (snap.empty) return null;

  const alumno = snap.docs[0].data() as Alumno;

  // Buscar apoderado por id
  const apSnap = await getDocs(
    query(collection(db, COL_APODERADOS), where('id', '==', alumno.apoderadoId))
  );
  if (apSnap.empty) return null;

  const apoderado = apSnap.docs[0].data() as Apoderado;
  return { alumno, apoderado };
}

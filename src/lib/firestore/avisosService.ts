import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, updateDoc, type Unsubscribe, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Aviso {
  id: string;
  titulo: string;
  contenido: string;
  tipo: 'info' | 'urgente' | 'evento' | 'recordatorio';
  dirigidoA: 'todos' | 'personal' | 'padres';
  creadoPor: string;       // ID del personal
  creadoPorNombre: string;
  fechaCreacion: string;   // ISO timestamp
  activo: boolean;
}

const COL = 'avisos';

export async function guardarAviso(aviso: Aviso) {
  await setDoc(doc(db, COL, aviso.id), aviso);
}

export async function actualizarAviso(id: string, datos: Partial<Aviso>) {
  await updateDoc(doc(db, COL, id), datos as Record<string, unknown>);
}

export async function eliminarAviso(id: string) {
  await deleteDoc(doc(db, COL, id));
}

export function escucharAvisos(cb: (avisos: Aviso[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL), (snap) => {
    cb(snap.docs.map((d) => d.data() as Aviso));
  });
}

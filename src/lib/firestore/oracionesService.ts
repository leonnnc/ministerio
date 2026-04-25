import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, updateDoc, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SolicitudOracion {
  id: string;
  titulo: string;
  descripcion: string;
  solicitadoPor: string;       // nombre del apoderado o personal
  alumnoId?: string;           // opcional, si es por un niño
  alumnoNombre?: string;
  fechaCreacion: string;       // ISO timestamp
  respondida: boolean;
  respuesta?: string;
}

const COL = 'oraciones';

export async function guardarOracion(o: SolicitudOracion) {
  await setDoc(doc(db, COL, o.id), o);
}

export async function actualizarOracion(id: string, datos: Partial<SolicitudOracion>) {
  await updateDoc(doc(db, COL, id), datos as Record<string, unknown>);
}

export async function eliminarOracion(id: string) {
  await deleteDoc(doc(db, COL, id));
}

export function escucharOraciones(cb: (oraciones: SolicitudOracion[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL), (snap) => {
    cb(snap.docs.map((d) => d.data() as SolicitudOracion));
  });
}

import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, updateDoc, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;           // ISO "YYYY-MM-DD"
  horaInicio?: string;     // "HH:MM"
  horaFin?: string;        // "HH:MM"
  lugar?: string;
  tipo: 'campamento' | 'actividad' | 'culto_especial' | 'reunion' | 'otro';
  dirigidoA: 'todos' | 'cuna' | 'primer_nivel' | 'segundo_nivel' | 'tercer_nivel';
  creadoPor: string;
  creadoPorNombre: string;
  fechaCreacion: string;
}

const COL = 'eventos';

export async function guardarEvento(evento: Evento) {
  await setDoc(doc(db, COL, evento.id), evento);
}

export async function actualizarEvento(id: string, datos: Partial<Evento>) {
  await updateDoc(doc(db, COL, id), datos as Record<string, unknown>);
}

export async function eliminarEvento(id: string) {
  await deleteDoc(doc(db, COL, id));
}

export function escucharEventos(cb: (eventos: Evento[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL), (snap) => {
    cb(snap.docs.map((d) => d.data() as Evento));
  });
}

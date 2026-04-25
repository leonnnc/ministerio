import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FotoGaleria {
  id: string;
  url: string;              // base64 o URL
  titulo?: string;
  eventoId?: string;        // opcional, vinculada a un evento
  eventoNombre?: string;
  subidaPor: string;
  subidaPorNombre: string;
  fechaSubida: string;      // ISO timestamp
}

const COL = 'galeria';

export async function guardarFoto(f: FotoGaleria) {
  await setDoc(doc(db, COL, f.id), f);
}

export async function eliminarFoto(id: string) {
  await deleteDoc(doc(db, COL, id));
}

export function escucharGaleria(cb: (fotos: FotoGaleria[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL), (snap) => {
    cb(snap.docs.map((d) => d.data() as FotoGaleria));
  });
}

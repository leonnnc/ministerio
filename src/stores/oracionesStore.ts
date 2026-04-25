import { create } from 'zustand';
import {
  guardarOracion, actualizarOracion, eliminarOracion,
  type SolicitudOracion,
} from '@/lib/firestore/oracionesService';

interface OracionesState {
  oraciones: SolicitudOracion[];
  agregarOracion: (o: SolicitudOracion) => Promise<void>;
  actualizarOracion: (id: string, datos: Partial<SolicitudOracion>) => Promise<void>;
  eliminarOracion: (id: string) => Promise<void>;
}

export const useOracionesStore = create<OracionesState>()((set) => ({
  oraciones: [],
  agregarOracion: async (o) => {
    await guardarOracion(o);
    set((s) => ({ oraciones: [...s.oraciones, o] }));
  },
  actualizarOracion: async (id, datos) => {
    await actualizarOracion(id, datos);
    set((s) => ({ oraciones: s.oraciones.map((o) => o.id === id ? { ...o, ...datos } : o) }));
  },
  eliminarOracion: async (id) => {
    await eliminarOracion(id);
    set((s) => ({ oraciones: s.oraciones.filter((o) => o.id !== id) }));
  },
}));

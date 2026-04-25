import { create } from 'zustand';
import {
  guardarAviso,
  actualizarAviso,
  eliminarAviso,
  type Aviso,
} from '@/lib/firestore/avisosService';

interface AvisosState {
  avisos: Aviso[];
  agregarAviso: (a: Aviso) => Promise<void>;
  actualizarAviso: (id: string, datos: Partial<Aviso>) => Promise<void>;
  eliminarAviso: (id: string) => Promise<void>;
}

export const useAvisosStore = create<AvisosState>()((set) => ({
  avisos: [],

  agregarAviso: async (a) => {
    await guardarAviso(a);
    set((state) => ({ avisos: [...state.avisos, a] }));
  },

  actualizarAviso: async (id, datos) => {
    await actualizarAviso(id, datos);
    set((state) => ({
      avisos: state.avisos.map((a) => a.id === id ? { ...a, ...datos } : a),
    }));
  },

  eliminarAviso: async (id) => {
    await eliminarAviso(id);
    set((state) => ({ avisos: state.avisos.filter((a) => a.id !== id) }));
  },
}));

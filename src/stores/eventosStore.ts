import { create } from 'zustand';
import {
  guardarEvento,
  actualizarEvento,
  eliminarEvento,
  type Evento,
} from '@/lib/firestore/eventosService';

interface EventosState {
  eventos: Evento[];
  agregarEvento: (e: Evento) => Promise<void>;
  actualizarEvento: (id: string, datos: Partial<Evento>) => Promise<void>;
  eliminarEvento: (id: string) => Promise<void>;
}

export const useEventosStore = create<EventosState>()((set) => ({
  eventos: [],

  agregarEvento: async (e) => {
    await guardarEvento(e);
    set((state) => ({ eventos: [...state.eventos, e] }));
  },

  actualizarEvento: async (id, datos) => {
    await actualizarEvento(id, datos);
    set((state) => ({
      eventos: state.eventos.map((e) => e.id === id ? { ...e, ...datos } : e),
    }));
  },

  eliminarEvento: async (id) => {
    await eliminarEvento(id);
    set((state) => ({ eventos: state.eventos.filter((e) => e.id !== id) }));
  },
}));

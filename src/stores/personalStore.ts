import { create } from 'zustand';
import type { Personal } from '@/types';
import {
  guardarPersonal,
  actualizarPersonal as actualizarPersonalFS,
  eliminarPersonal as eliminarPersonalFS,
} from '@/lib/firestore/personalService';
import { useAlumnosStore } from '@/stores/alumnosStore';

interface PersonalState {
  personal: Personal[];
  agregarPersonal: (p: Personal) => Promise<void>;
  actualizarPersonal: (id: string, datos: Partial<Personal>) => Promise<void>;
  eliminarPersonal: (id: string) => Promise<boolean>;
}

export const usePersonalStore = create<PersonalState>()((set, get) => ({
  personal: [],

  agregarPersonal: async (p) => {
    await guardarPersonal(p);
    set((state) => ({ personal: [...state.personal, p] }));
  },

  actualizarPersonal: async (id, datos) => {
    await actualizarPersonalFS(id, datos);
    set((state) => ({
      personal: state.personal.map((p) => p.id === id ? { ...p, ...datos } : p),
    }));
  },

  eliminarPersonal: async (id) => {
    const miembro = get().personal.find((p) => p.id === id);
    if (!miembro) return false;

    if (miembro.rol === 'Maestro' && miembro.salonesIds.length > 0) {
      const { alumnos } = useAlumnosStore.getState();
      const tieneAlumnos = miembro.salonesIds.some((salonId) =>
        alumnos.some((a) => a.salonId === salonId)
      );
      if (tieneAlumnos) return false;
    }

    await eliminarPersonalFS(id);
    set((state) => ({ personal: state.personal.filter((p) => p.id !== id) }));
    return true;
  },
}));

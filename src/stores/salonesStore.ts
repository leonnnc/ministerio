import { create } from 'zustand';
import type { Salon } from '@/types';
import type { GrupoEdad } from '@/types';
import { CONFIGURACION_SALONES } from '@/lib/asignacionSalon';
import {
  guardarSalon,
  actualizarSalon,
  obtenerSalones,
} from '@/lib/firestore/salonesService';

interface SalonesState {
  salones: Salon[];
  inicializarSalones: () => Promise<void>;
  asignarMaestro: (salonId: string, maestroId: string) => Promise<void>;
  asignarAuxiliar: (salonId: string, auxiliarId: string) => Promise<void>;
}

export const useSalonesStore = create<SalonesState>()((set, get) => ({
  salones: [],

  inicializarSalones: async () => {
    // Verificar si ya existen en Firestore
    const existentes = await obtenerSalones();
    if (existentes.length > 0) {
      set({ salones: existentes });
      return;
    }

    // Crear los 4 salones base
    const salones: Salon[] = (
      Object.entries(CONFIGURACION_SALONES) as [
        GrupoEdad,
        { edadMinima: number; edadMaxima: number; nombre: string },
      ][]
    ).map(([grupoEdad, config]) => ({
      id: crypto.randomUUID(),
      nombre: config.nombre,
      grupoEdad,
      edadMinima: config.edadMinima,
      edadMaxima: config.edadMaxima,
      auxiliaresIds: [],
    }));

    // Guardar en Firestore
    await Promise.all(salones.map((s) => guardarSalon(s)));
    set({ salones });
  },

  asignarMaestro: async (salonId, maestroId) => {
    await actualizarSalon(salonId, { maestroId });
    set((state) => ({
      salones: state.salones.map((s) =>
        s.id === salonId ? { ...s, maestroId } : s
      ),
    }));
  },

  asignarAuxiliar: async (salonId, auxiliarId) => {
    const salon = get().salones.find((s) => s.id === salonId);
    if (!salon || salon.auxiliaresIds.includes(auxiliarId)) return;
    const nuevosAuxiliares = [...salon.auxiliaresIds, auxiliarId];
    await actualizarSalon(salonId, { auxiliaresIds: nuevosAuxiliares });
    set((state) => ({
      salones: state.salones.map((s) =>
        s.id === salonId ? { ...s, auxiliaresIds: nuevosAuxiliares } : s
      ),
    }));
  },
}));

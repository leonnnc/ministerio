import { create } from 'zustand';
import type { Alumno, Apoderado } from '@/types';
import { guardarAlumno } from '@/lib/firestore/alumnosService';

interface AlumnosState {
  alumnos: Alumno[];
  apoderados: Apoderado[];
  agregarAlumno: (alumno: Alumno, apoderado: Apoderado) => Promise<void>;
  obtenerAlumnoPorId: (id: string) => Alumno | undefined;
  obtenerAlumnosPorSalon: (salonId: string) => Alumno[];
}

export const useAlumnosStore = create<AlumnosState>()((set, get) => ({
  alumnos: [],
  apoderados: [],

  agregarAlumno: async (alumno, apoderado) => {
    // Guardar en Firestore (la escucha en tiempo real actualiza el estado)
    await guardarAlumno(alumno, apoderado);
    // También actualizar localmente para respuesta inmediata
    set((state) => ({
      alumnos: [...state.alumnos, alumno],
      apoderados: [...state.apoderados, apoderado],
    }));
  },

  obtenerAlumnoPorId: (id) => get().alumnos.find((a) => a.id === id),

  obtenerAlumnosPorSalon: (salonId) => get().alumnos.filter((a) => a.salonId === salonId),
}));

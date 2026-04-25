import { create } from 'zustand';
import {
  guardarRegistro,
  actualizarRegistro,
  obtenerAsistenciaPorAlumno,
} from '@/lib/firestore/asistenciaService';
import type { RegistroAsistencia } from '@/types';

interface AsistenciaState {
  registros: RegistroAsistencia[];
  // Check-in: registrar ingreso del niño
  registrarIngreso: (
    alumnoId: string,
    fecha: string,
    servicioId: string,
    personalId: string
  ) => Promise<RegistroAsistencia>;
  // Check-out: registrar salida del niño
  registrarSalida: (
    registroId: string,
    personalId: string
  ) => Promise<void>;
  // Obtener registro activo de un niño en una fecha/servicio
  obtenerRegistroActivo: (alumnoId: string, fecha: string, servicioId: string) => RegistroAsistencia | undefined;
  // Historial de un alumno
  cargarHistorialAlumno: (alumnoId: string) => Promise<void>;
}

export const useAsistenciaStore = create<AsistenciaState>()((set, get) => ({
  registros: [],

  registrarIngreso: async (alumnoId, fecha, servicioId, personalId) => {
    const nuevo: RegistroAsistencia = {
      id: crypto.randomUUID(),
      alumnoId,
      fecha,
      servicioId,
      horaIngreso: new Date().toISOString(),
      registradoPorIngreso: personalId,
      estado: 'presente',
    };
    await guardarRegistro(nuevo);
    set((state) => ({ registros: [...state.registros, nuevo] }));
    return nuevo;
  },

  registrarSalida: async (registroId, personalId) => {
    const ahora = new Date().toISOString();
    await actualizarRegistro(registroId, {
      horaSalida: ahora,
      registradoPorSalida: personalId,
      estado: 'entregado',
    });
    set((state) => ({
      registros: state.registros.map((r) =>
        r.id === registroId
          ? { ...r, horaSalida: ahora, registradoPorSalida: personalId, estado: 'entregado' }
          : r
      ),
    }));
  },

  obtenerRegistroActivo: (alumnoId, fecha, servicioId) =>
    get().registros.find(
      (r) => r.alumnoId === alumnoId && r.fecha === fecha && r.servicioId === servicioId
    ),

  cargarHistorialAlumno: async (alumnoId) => {
    const historial = await obtenerAsistenciaPorAlumno(alumnoId);
    set((state) => {
      const otros = state.registros.filter((r) => r.alumnoId !== alumnoId);
      return { registros: [...otros, ...historial] };
    });
  },
}));

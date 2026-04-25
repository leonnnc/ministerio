import { create } from 'zustand';
import {
  guardarAsignacion,
  actualizarAsignacion as actualizarAsignacionFS,
  eliminarAsignacion as eliminarAsignacionFS,
} from '@/lib/firestore/agendaService';

export const SERVICIOS_DOMINGO = [
  { id: '8am',   hora: '8:00 AM',  label: 'Primer Servicio',   rango: '8:00 AM – 10:50 AM'  },
  { id: '11am',  hora: '11:00 AM', label: 'Segundo Servicio',  rango: '11:00 AM – 12:50 PM' },
  { id: '1pm',   hora: '1:00 PM',  label: 'Tercer Servicio',   rango: '1:00 PM – 2:50 PM'   },
  { id: '730pm', hora: '7:30 PM',  label: 'Servicio Nocturno', rango: '7:30 PM – 9:00 PM'   },
] as const;

export type ServicioId = typeof SERVICIOS_DOMINGO[number]['id'];

// Programación interna de cada servicio dominical
export interface ItemProgramacion {
  hora: string;
  actividad: string;
  icono: string;
}

export const PROGRAMACION_SERVICIO: Record<ServicioId, ItemProgramacion[]> = {
  '8am': [
    { hora: '8:00 AM',  actividad: 'Recepción de niños',     icono: '🚪' },
    { hora: '8:15 AM',  actividad: 'Alabanza y adoración',   icono: '🎵' },
    { hora: '8:45 AM',  actividad: 'Mensaje bíblico',        icono: '📖' },
    { hora: '9:15 AM',  actividad: 'Actividad creativa',     icono: '🎨' },
    { hora: '9:50 AM',  actividad: 'Refrigerio',             icono: '🍎' },
    { hora: '10:20 AM', actividad: 'Oración y cierre',       icono: '🙏' },
    { hora: '10:50 AM', actividad: 'Entrega de niños',       icono: '👨‍👩‍👧' },
  ],
  '11am': [
    { hora: '11:00 AM', actividad: 'Recepción de niños',     icono: '🚪' },
    { hora: '11:15 AM', actividad: 'Alabanza y adoración',   icono: '🎵' },
    { hora: '11:45 AM', actividad: 'Mensaje bíblico',        icono: '📖' },
    { hora: '12:15 PM', actividad: 'Actividad creativa',     icono: '🎨' },
    { hora: '12:30 PM', actividad: 'Refrigerio',             icono: '🍎' },
    { hora: '12:40 PM', actividad: 'Oración y cierre',       icono: '🙏' },
    { hora: '12:50 PM', actividad: 'Entrega de niños',       icono: '👨‍👩‍👧' },
  ],
  '1pm': [
    { hora: '1:00 PM',  actividad: 'Recepción de niños',     icono: '🚪' },
    { hora: '1:15 PM',  actividad: 'Alabanza y adoración',   icono: '🎵' },
    { hora: '1:45 PM',  actividad: 'Mensaje bíblico',        icono: '📖' },
    { hora: '2:15 PM',  actividad: 'Actividad creativa',     icono: '🎨' },
    { hora: '2:30 PM',  actividad: 'Refrigerio',             icono: '🍎' },
    { hora: '2:40 PM',  actividad: 'Oración y cierre',       icono: '🙏' },
    { hora: '2:50 PM',  actividad: 'Entrega de niños',       icono: '👨‍👩‍👧' },
  ],
  '730pm': [
    { hora: '7:30 PM',  actividad: 'Recepción de niños',     icono: '🚪' },
    { hora: '7:45 PM',  actividad: 'Alabanza y adoración',   icono: '🎵' },
    { hora: '8:10 PM',  actividad: 'Mensaje bíblico',        icono: '📖' },
    { hora: '8:40 PM',  actividad: 'Actividad creativa',     icono: '🎨' },
    { hora: '8:50 PM',  actividad: 'Refrigerio',             icono: '🍎' },
    { hora: '8:55 PM',  actividad: 'Oración y cierre',       icono: '🙏' },
    { hora: '9:00 PM',  actividad: 'Entrega de niños',       icono: '👨‍👩‍👧' },
  ],
};

export interface AsignacionServicio {
  id: string;
  fecha: string;
  servicioId: ServicioId;
  salonId: string;
  maestroId: string;
  auxiliaresIds: string[];
  alumnosIds: string[];
  notas?: string;
}

interface AgendaState {
  asignaciones: AsignacionServicio[];
  agregarAsignacion: (a: AsignacionServicio) => Promise<void>;
  actualizarAsignacion: (id: string, datos: Partial<AsignacionServicio>) => Promise<void>;
  eliminarAsignacion: (id: string) => Promise<void>;
  obtenerPorFechaYServicio: (fecha: string, servicioId: ServicioId) => AsignacionServicio[];
  obtenerPorMaestro: (maestroId: string) => AsignacionServicio[];
}

export const useAgendaStore = create<AgendaState>()((set, get) => ({
  asignaciones: [],

  agregarAsignacion: async (a) => {
    await guardarAsignacion(a);
    set((state) => ({ asignaciones: [...state.asignaciones, a] }));
  },

  actualizarAsignacion: async (id, datos) => {
    await actualizarAsignacionFS(id, datos);
    set((state) => ({
      asignaciones: state.asignaciones.map((a) => a.id === id ? { ...a, ...datos } : a),
    }));
  },

  eliminarAsignacion: async (id) => {
    await eliminarAsignacionFS(id);
    set((state) => ({
      asignaciones: state.asignaciones.filter((a) => a.id !== id),
    }));
  },

  obtenerPorFechaYServicio: (fecha, servicioId) =>
    get().asignaciones.filter((a) => a.fecha === fecha && a.servicioId === servicioId),

  obtenerPorMaestro: (maestroId) =>
    get().asignaciones.filter((a) => a.maestroId === maestroId),
}));

export function proximosDomingos(cantidad = 8): string[] {
  const domingos: string[] = [];
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diasHastaDomingo = diaSemana === 0 ? 0 : 7 - diaSemana;
  const primero = new Date(hoy);
  primero.setDate(hoy.getDate() + diasHastaDomingo);
  for (let i = 0; i < cantidad; i++) {
    const d = new Date(primero);
    d.setDate(primero.getDate() + i * 7);
    domingos.push(d.toISOString().split('T')[0]);
  }
  return domingos;
}

export function formatearFechaDomingo(fechaISO: string): string {
  const [year, month, day] = fechaISO.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

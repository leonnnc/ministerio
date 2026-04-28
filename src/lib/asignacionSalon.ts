import type { GrupoEdad } from '@/types';

// Configuración de grupos (para asignación de grupo)
export const CONFIGURACION_SALONES: Record<
  GrupoEdad,
  { edadMinima: number; edadMaxima: number; nombre: string }
> = {
  Cuna:         { edadMinima: 0,  edadMaxima: 2,  nombre: 'Grupo de Niños — Cuna' },
  PrimerNivel:  { edadMinima: 3,  edadMaxima: 5,  nombre: 'Grupo de Niños — Primer Nivel' },
  SegundoNivel: { edadMinima: 6,  edadMaxima: 9,  nombre: 'Grupo de Niños — Segundo Nivel' },
  TercerNivel:  { edadMinima: 10, edadMaxima: 13, nombre: 'Grupo de Niños — Tercer Nivel' },
};

// Configuración de salones individuales por edad (0-13 años)
export interface ConfigSalonEdad {
  edad: number;
  nombre: string;
  grupoEdad: GrupoEdad;
  edadMinima: number;
  edadMaxima: number;
}

export const SALONES_POR_EDAD: ConfigSalonEdad[] = [
  // Cuna: un solo salón para 0-2 años
  { edad: 0, nombre: 'Cuna (0 – 2 años)',        grupoEdad: 'Cuna',         edadMinima: 0, edadMaxima: 2 },
  // Primer Nivel: un salón por año
  { edad: 3, nombre: 'Primer Nivel — 3 años',    grupoEdad: 'PrimerNivel',  edadMinima: 3, edadMaxima: 3 },
  { edad: 4, nombre: 'Primer Nivel — 4 años',    grupoEdad: 'PrimerNivel',  edadMinima: 4, edadMaxima: 4 },
  { edad: 5, nombre: 'Primer Nivel — 5 años',    grupoEdad: 'PrimerNivel',  edadMinima: 5, edadMaxima: 5 },
  // Segundo Nivel: un salón por año
  { edad: 6, nombre: 'Segundo Nivel — 6 años',   grupoEdad: 'SegundoNivel', edadMinima: 6, edadMaxima: 6 },
  { edad: 7, nombre: 'Segundo Nivel — 7 años',   grupoEdad: 'SegundoNivel', edadMinima: 7, edadMaxima: 7 },
  { edad: 8, nombre: 'Segundo Nivel — 8 años',   grupoEdad: 'SegundoNivel', edadMinima: 8, edadMaxima: 8 },
  { edad: 9, nombre: 'Segundo Nivel — 9 años',   grupoEdad: 'SegundoNivel', edadMinima: 9, edadMaxima: 9 },
  // Tercer Nivel: un salón por año
  { edad: 10, nombre: 'Tercer Nivel — 10 años',  grupoEdad: 'TercerNivel',  edadMinima: 10, edadMaxima: 10 },
  { edad: 11, nombre: 'Tercer Nivel — 11 años',  grupoEdad: 'TercerNivel',  edadMinima: 11, edadMaxima: 11 },
  { edad: 12, nombre: 'Tercer Nivel — 12 años',  grupoEdad: 'TercerNivel',  edadMinima: 12, edadMaxima: 12 },
  { edad: 13, nombre: 'Tercer Nivel — 13 años',  grupoEdad: 'TercerNivel',  edadMinima: 13, edadMaxima: 13 },
];

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  if (
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())
  ) edad--;
  return edad;
}

/**
 * Retorna la edad exacta del niño para asignar su salón.
 * @throws Error si la fecha es futura
 * @returns edad en años (0-13) o null si está fuera de rango
 */
export function calcularEdadParaSalon(fechaNacimiento: string): number | null {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  if (nacimiento > hoy) throw new Error('La fecha de nacimiento no puede ser una fecha futura');
  const edad = calcularEdad(fechaNacimiento);
  if (edad < 0 || edad > 13) return null;
  return edad;
}

/**
 * Retorna el GrupoEdad según la edad (para compatibilidad con código existente)
 */
export function asignarSalon(fechaNacimiento: string): GrupoEdad | null {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  if (nacimiento > hoy) throw new Error('La fecha de nacimiento no puede ser una fecha futura');
  const edad = calcularEdad(fechaNacimiento);
  for (const [grupo, config] of Object.entries(CONFIGURACION_SALONES) as [GrupoEdad, { edadMinima: number; edadMaxima: number; nombre: string }][]) {
    if (edad >= config.edadMinima && edad <= config.edadMaxima) return grupo;
  }
  return null;
}

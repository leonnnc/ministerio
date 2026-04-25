import type { GrupoEdad } from '@/types';

export const CONFIGURACION_SALONES: Record<
  GrupoEdad,
  { edadMinima: number; edadMaxima: number; nombre: string }
> = {
  Cuna:         { edadMinima: 0,  edadMaxima: 2,  nombre: 'Grupo de Niños — Cuna' },
  PrimerNivel:  { edadMinima: 3,  edadMaxima: 5,  nombre: 'Grupo de Niños — Primer Nivel' },
  SegundoNivel: { edadMinima: 6,  edadMaxima: 9,  nombre: 'Grupo de Niños — Segundo Nivel' },
  TercerNivel:  { edadMinima: 10, edadMaxima: 13, nombre: 'Grupo de Niños — Tercer Nivel' },
};

/**
 * Calcula la edad en años cumplidos a partir de una fecha de nacimiento ISO 8601.
 */
function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();

  if (
    mesActual < mesNacimiento ||
    (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())
  ) {
    edad--;
  }

  return edad;
}

/**
 * Asigna el grupo de edad (salón) correspondiente a un alumno según su fecha de nacimiento.
 *
 * @param fechaNacimiento - Fecha en formato ISO 8601 "YYYY-MM-DD"
 * @returns El GrupoEdad correspondiente, o null si está fuera del rango 0–13 años
 * @throws Error si la fecha de nacimiento es una fecha futura
 */
export function asignarSalon(fechaNacimiento: string): GrupoEdad | null {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  if (nacimiento > hoy) {
    throw new Error('La fecha de nacimiento no puede ser una fecha futura');
  }

  const edad = calcularEdad(fechaNacimiento);

  for (const [grupo, config] of Object.entries(CONFIGURACION_SALONES) as [
    GrupoEdad,
    { edadMinima: number; edadMaxima: number; nombre: string },
  ][]) {
    if (edad >= config.edadMinima && edad <= config.edadMaxima) {
      return grupo;
    }
  }

  return null;
}

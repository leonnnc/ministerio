import type { Alumno, Apoderado, Salon } from '@/types';

export interface DatosTarjeta {
  nombreAlumno: string;
  fechaNacimiento: string;
  grupoSalon: string;
  nombreApoderado: string;
  telefonoApoderado: string;
  fotografiaUrl?: string;
}

export function generarDatosTarjeta(
  alumno: Alumno,
  apoderado: Apoderado,
  salon: Salon
): DatosTarjeta {
  const datos: DatosTarjeta = {
    nombreAlumno: alumno.nombreCompleto,
    fechaNacimiento: alumno.fechaNacimiento,
    grupoSalon: salon.nombre,
    nombreApoderado: apoderado.nombreCompleto,
    telefonoApoderado: apoderado.telefono,
  };

  if (alumno.fotografiaUrl !== undefined) {
    datos.fotografiaUrl = alumno.fotografiaUrl;
  }

  return datos;
}

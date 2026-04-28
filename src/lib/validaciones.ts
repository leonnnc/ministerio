import { z } from 'zod';

function normalizarFecha(valor: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  const partesSlash = valor.split('/');
  if (partesSlash.length === 3) {
    const [d, m, y] = partesSlash;
    if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return valor;
}

export const SchemaAlumno = z.object({
  nombreCompleto: z.string().min(2, 'Mínimo 2 caracteres'),
  fechaNacimiento: z.string()
    .min(1, 'Selecciona la fecha de nacimiento')
    .transform(normalizarFecha)
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), 'Formato de fecha inválido'),
  sexo: z.enum(['masculino', 'femenino'], {
    errorMap: () => ({ message: 'Selecciona el sexo del niño' }),
  }),
  fotografiaUrl: z.string().optional(),

  // Médico — todos opcionales, string vacío permitido
  alergias: z.string().optional(),
  condicionesMedicas: z.string().optional(),
  medicamentos: z.string().optional(),
  restriccionesAlimentarias: z.string().optional(),
  tipoSangre: z.string().optional(),
  seguroMedico: z.string().optional(),
  hospitalPreferencia: z.string().optional(),
  tieneDiscapacidad: z.boolean().optional(),
  detalleDiscapacidad: z.string().optional(),

  // Espiritual
  esBautizado: z.boolean().optional(),
  haAceptadoCristo: z.boolean().optional(),
  primeraVez: z.boolean().optional(),
  asistenciaRegular: z.boolean().optional(),
  comoSeEntero: z.string().optional(),

  // Escolar
  colegio: z.string().optional(),
  grado: z.string().optional(),
});

export const SchemaApoderado = z.object({
  nombreCompleto: z.string().min(2, 'Mínimo 2 caracteres'),
  relacion: z.enum(['padre', 'madre', 'tutor'], {
    errorMap: () => ({ message: 'Selecciona la relación con el niño' }),
  }),
  telefono: z.string().min(7, 'Teléfono inválido'),
  telefonoEmergencia: z.string().optional(),
  nombreEmergencia: z.string().optional(),
  email: z.string().email('Correo electrónico inválido'),
  direccion: z.string().optional(),
  distrito: z.string().optional(),
  departamento: z.string().optional(),
  esMiembroIglesia: z.boolean().optional(),
  servicioHabitual: z.string().optional(),
  whatsapp: z.string().optional(),
  personasAutorizadas: z.string().optional(),
});

export const SchemaInscripcion = z.object({
  alumno: SchemaAlumno,
  apoderado: SchemaApoderado,
});

export type AlumnoFormData = z.infer<typeof SchemaAlumno>;
export type ApoderadoFormData = z.infer<typeof SchemaApoderado>;
export type InscripcionFormData = z.infer<typeof SchemaInscripcion>;

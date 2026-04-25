import { z } from 'zod';

function normalizarFecha(valor: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  const partes = valor.split('/');
  if (partes.length === 3 && partes[2].length === 4) {
    return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
  }
  return valor;
}

export const SchemaAlumno = z.object({
  nombreCompleto: z.string().min(1, 'El nombre es requerido').min(2, 'Mínimo 2 caracteres'),
  fechaNacimiento: z.string()
    .min(1, 'Selecciona la fecha de nacimiento')
    .transform(normalizarFecha)
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), 'Formato de fecha inválido'),
  sexo: z.string().refine((v) => v === 'masculino' || v === 'femenino', {
    message: 'Selecciona el sexo del niño',
  }) as z.ZodType<'masculino' | 'femenino'>,
  fotografiaUrl: z.string().optional(),

  // Médico
  alergias: z.string().optional(),
  condicionesMedicas: z.string().optional(),
  medicamentos: z.string().optional(),
  restriccionesAlimentarias: z.string().optional(),
  tipoSangre: z.enum(['A+','A-','B+','B-','AB+','AB-','O+','O-','desconocido']).optional(),
  seguroMedico: z.enum(['SIS','EsSalud','privado','ninguno']).optional(),
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
  nombreCompleto: z.string().min(1, 'El nombre es requerido').min(2, 'Mínimo 2 caracteres'),
  relacion: z.string().refine((v) => ['padre','madre','tutor'].includes(v), {
    message: 'Selecciona la relación con el niño',
  }) as z.ZodType<'padre' | 'madre' | 'tutor'>,
  telefono: z.string().min(1, 'El teléfono es requerido').min(7, 'Teléfono inválido'),
  telefonoEmergencia: z.string().optional(),
  nombreEmergencia: z.string().optional(),
  email: z.string().min(1, 'El correo es requerido').email('Correo electrónico inválido'),
  direccion: z.string().optional(),
  distrito: z.string().optional(),
  departamento: z.string().optional(),
  esMiembroIglesia: z.boolean().optional(),
  servicioHabitual: z.enum(['8am','11am','1pm','730pm']).optional(),
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

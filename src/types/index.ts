// Grupos de edad disponibles
export type GrupoEdad = 'Cuna' | 'PrimerNivel' | 'SegundoNivel' | 'TercerNivel';

// Roles del ministerio (orden jerárquico descendente)
export type Rol = 'Director_General' | 'Lider_General' | 'Coordinadora' | 'Maestro' | 'Auxiliar';

// Relación del apoderado con el alumno
export type RelacionApoderado = 'padre' | 'madre' | 'tutor';

// Sexo del alumno
export type Sexo = 'masculino' | 'femenino';

// Tipo de sangre
export type TipoSangre = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'desconocido';

// Seguro médico
export type SeguroMedico = 'SIS' | 'EsSalud' | 'privado' | 'ninguno';

// Servicio habitual
export type ServicioHabitual = '8am' | '11am' | '1pm' | '730pm';

export interface Alumno {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: string;        // ISO 8601: "YYYY-MM-DD"
  sexo: Sexo;
  fotografiaUrl?: string;
  salonId: string;
  apoderadoId: string;
  fechaRegistro: string;
  codigoQR?: string;              // Código único para check-in/out

  // Información médica
  alergias?: string;
  condicionesMedicas?: string;
  medicamentos?: string;
  restriccionesAlimentarias?: string;
  tipoSangre?: TipoSangre;
  seguroMedico?: SeguroMedico;
  hospitalPreferencia?: string;
  tieneDiscapacidad?: boolean;
  detalleDiscapacidad?: string;

  // Información espiritual
  esBautizado?: boolean;
  haAceptadoCristo?: boolean;
  primeraVez?: boolean;
  asistenciaRegular?: boolean;
  comoSeEntero?: string;

  // Información escolar
  colegio?: string;
  grado?: string;
}

export interface Apoderado {
  id: string;
  nombreCompleto: string;
  relacion: RelacionApoderado;
  telefono: string;
  telefonoEmergencia?: string;    // Segundo contacto
  nombreEmergencia?: string;      // Nombre del segundo contacto
  email: string;
  direccion?: string;
  distrito?: string;
  departamento?: string;
  esMiembroIglesia?: boolean;
  servicioHabitual?: ServicioHabitual;
  whatsapp?: string;

  // Personas autorizadas para recoger al niño
  personasAutorizadas?: string;   // Nombres separados por coma
}

export interface Salon {
  id: string;
  nombre: string;
  grupoEdad: GrupoEdad;
  edadMinima: number;
  edadMaxima: number;
  maestroId?: string;
  auxiliaresIds: string[];
}

export interface Personal {
  id: string;
  nombreCompleto: string;
  rol: Rol;
  telefono: string;
  email: string;
  salonesIds: string[];
  maestroAsignadoId?: string;
  fechaNacimiento?: string;       // ISO 8601: "YYYY-MM-DD" (para cumpleaños)
}

// Registro de ingreso/salida de niños
export interface RegistroAsistencia {
  id: string;
  alumnoId: string;
  fecha: string;                  // ISO "YYYY-MM-DD"
  servicioId: string;             // '8am' | '11am' | '1pm' | '730pm'
  horaIngreso?: string;           // ISO timestamp
  horaSalida?: string;            // ISO timestamp
  registradoPorIngreso?: string;  // ID del personal que registró ingreso
  registradoPorSalida?: string;   // ID del personal que registró salida
  estado: 'pendiente' | 'presente' | 'entregado';
}

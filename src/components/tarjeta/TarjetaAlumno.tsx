import type { Alumno, Apoderado, Salon } from '@/types';

interface TarjetaAlumnoProps {
  alumno: Alumno;
  apoderado: Apoderado;
  salon: Salon;
  modo: 'preview' | 'pdf';
}

function formatearFecha(fechaISO: string): string {
  const [year, month, day] = fechaISO.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const COLORES_GRUPO: Record<string, string> = {
  Cuna: 'bg-pink-100 text-pink-800',
  Preescolar: 'bg-blue-100 text-blue-800',
  PrimariaBaja: 'bg-green-100 text-green-800',
  PrimariaAlta: 'bg-orange-100 text-orange-800',
};

export default function TarjetaAlumno({ alumno, apoderado, salon, modo }: TarjetaAlumnoProps) {
  const inicial = alumno.nombreCompleto.charAt(0).toUpperCase();
  const colorGrupo = COLORES_GRUPO[salon.grupoEdad] ?? 'bg-primary-100 text-primary-800';

  return (
    <div
      className={`w-80 rounded-2xl overflow-hidden shadow-lg border border-primary-200 bg-white ${
        modo === 'preview' ? 'mx-auto' : ''
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 px-4 py-3 text-center">
        <p className="text-white font-bold text-sm tracking-wide">Ministerio de Niños ✝️</p>
      </div>

      {/* Foto / Avatar */}
      <div className="flex justify-center mt-5">
        {alumno.fotografiaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alumno.fotografiaUrl}
            alt={`Foto de ${alumno.nombreCompleto}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary-300 shadow"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary-100 border-4 border-primary-300 shadow flex items-center justify-center">
            <span className="text-primary-700 text-4xl font-bold">{inicial}</span>
          </div>
        )}
      </div>

      {/* Nombre */}
      <div className="px-4 pt-3 text-center">
        <h2 className="text-primary-900 font-extrabold text-xl leading-tight">
          {alumno.nombreCompleto}
        </h2>
      </div>

      {/* Badge de grupo */}
      <div className="flex justify-center mt-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorGrupo}`}>
          {salon.nombre}
        </span>
      </div>

      {/* Fecha de nacimiento */}
      <div className="px-5 mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-primary-500">🎂</span>
          <span>{formatearFecha(alumno.fechaNacimiento)}</span>
        </div>
      </div>

      {/* Separador */}
      <div className="mx-5 my-3 border-t border-primary-100" />

      {/* Sección apoderado */}
      <div className="px-5 pb-5">
        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
          Apoderado
        </p>
        <p className="text-sm font-medium text-gray-800">{apoderado.nombreCompleto}</p>
        <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
          <span className="text-accent-500">📞</span>
          <span>{apoderado.telefono}</span>
        </div>
      </div>
    </div>
  );
}

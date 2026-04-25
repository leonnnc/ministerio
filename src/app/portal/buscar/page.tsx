'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { useAsistenciaStore } from '@/stores/asistenciaStore';
import type { Alumno, Apoderado, Salon } from '@/types';

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (
    hoy.getMonth() < nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())
  ) edad--;
  return edad;
}

function formatearFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function TarjetaDetalle({
  alumno,
  apoderado,
  salon,
  totalAsistencias,
  onCerrar,
}: {
  alumno: Alumno;
  apoderado?: Apoderado;
  salon?: Salon;
  totalAsistencias: number;
  onCerrar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCerrar} />
      <div className="relative z-10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-white">

        {/* Header */}
        <div className="px-6 py-5 text-center" style={{ background: '#F5C518' }}>
          {alumno.fotografiaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={alumno.fotografiaUrl} alt={alumno.nombreCompleto}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md mx-auto mb-3" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md mx-auto mb-3"
              style={{ background: '#FFF9C4', color: '#4a2c00' }}>
              {alumno.nombreCompleto.charAt(0)}
            </div>
          )}
          <h2 className="text-xl font-extrabold" style={{ color: '#4a2c00' }}>{alumno.nombreCompleto}</h2>
          <p className="text-sm mt-1" style={{ color: '#78350f' }}>
            {calcularEdad(alumno.fechaNacimiento)} años · {alumno.sexo === 'masculino' ? '👦' : '👧'} {alumno.sexo}
          </p>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">

          {/* Salón */}
          <div className="rounded-xl p-3 space-y-1.5 text-sm" style={{ background: '#FFFDE7' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#D97706' }}>Información</p>
            <div className="flex justify-between">
              <span className="text-gray-500">Salón:</span>
              <span className="font-semibold" style={{ color: '#4a2c00' }}>{salon?.nombre ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nacimiento:</span>
              <span className="font-semibold" style={{ color: '#4a2c00' }}>{formatearFecha(alumno.fechaNacimiento)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Asistencias:</span>
              <span className="font-bold" style={{ color: '#16a34a' }}>{totalAsistencias}</span>
            </div>
            {alumno.codigoQR && (
              <div className="flex justify-between">
                <span className="text-gray-500">Código QR:</span>
                <span className="font-mono text-xs" style={{ color: '#4a2c00' }}>{alumno.codigoQR}</span>
              </div>
            )}
          </div>

          {/* Médico */}
          {(alumno.alergias || alumno.tipoSangre || alumno.condicionesMedicas || alumno.medicamentos) && (
            <div className="rounded-xl p-3 space-y-1.5 text-sm border border-red-100" style={{ background: '#FFF5F5' }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-2 text-red-600">⚕️ Información médica</p>
              {alumno.alergias && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Alergias:</span>
                  <span className="font-semibold text-red-600 text-right max-w-[60%]">{alumno.alergias}</span>
                </div>
              )}
              {alumno.tipoSangre && alumno.tipoSangre !== 'desconocido' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Sangre:</span>
                  <span className="font-bold text-red-600">{alumno.tipoSangre}</span>
                </div>
              )}
              {alumno.condicionesMedicas && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Condiciones:</span>
                  <span className="font-semibold text-right max-w-[60%]" style={{ color: '#4a2c00' }}>{alumno.condicionesMedicas}</span>
                </div>
              )}
              {alumno.medicamentos && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Medicamentos:</span>
                  <span className="font-semibold text-right max-w-[60%]" style={{ color: '#4a2c00' }}>{alumno.medicamentos}</span>
                </div>
              )}
            </div>
          )}

          {/* Apoderado */}
          {apoderado && (
            <div className="rounded-xl p-3 space-y-1.5 text-sm border border-yellow-100" style={{ background: '#FFF9C4' }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#D97706' }}>👨‍👩‍👧 Apoderado</p>
              <p className="font-semibold" style={{ color: '#4a2c00' }}>{apoderado.nombreCompleto}</p>
              <p className="text-gray-600">📞 {apoderado.telefono}</p>
              {apoderado.telefonoEmergencia && (
                <p className="text-gray-600">🚨 {apoderado.telefonoEmergencia}
                  {apoderado.nombreEmergencia && <span className="text-gray-400"> ({apoderado.nombreEmergencia})</span>}
                </p>
              )}
              {apoderado.whatsapp && (
                <a
                  href={`https://wa.me/${apoderado.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg mt-1"
                  style={{ background: '#25D366', color: '#fff' }}
                >
                  📱 WhatsApp
                </a>
              )}
              {apoderado.personasAutorizadas && (
                <div className="mt-1">
                  <p className="text-xs text-gray-500">Personas autorizadas:</p>
                  <p className="text-xs font-medium" style={{ color: '#4a2c00' }}>{apoderado.personasAutorizadas}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-2">
          <button onClick={onCerrar}
            className="w-full py-2.5 rounded-xl font-semibold text-sm border-2 border-yellow-300 text-gray-600 hover:bg-yellow-50 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuscarPage() {
  const router = useRouter();
  const { usuarioActual, estaAutenticado } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const apoderados = useAlumnosStore((s) => s.apoderados);
  const salones = useSalonesStore((s) => s.salones);
  const registros = useAsistenciaStore((s) => s.registros);

  const [busqueda, setBusqueda] = useState('');
  const [salonFiltro, setSalonFiltro] = useState('todos');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);

  useEffect(() => {
    if (!estaAutenticado) router.replace('/login');
  }, [estaAutenticado, router]);

  if (!usuarioActual) return null;

  const esMaestro = usuarioActual.rol === 'Maestro';
  const misSalones = esMaestro
    ? salones.filter((s) => s.maestroId === usuarioActual.id)
    : salones;

  const alumnosFiltrados = alumnos
    .filter((a) => misSalones.map((s) => s.id).includes(a.salonId))
    .filter((a) => salonFiltro === 'todos' || a.salonId === salonFiltro)
    .filter((a) =>
      busqueda.trim() === '' ||
      a.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase())
    );

  const alumnoDetalle = alumnoSeleccionado;
  const apoderadoDetalle = alumnoDetalle
    ? apoderados.find((ap) => ap.id === alumnoDetalle.apoderadoId)
    : undefined;
  const salonDetalle = alumnoDetalle
    ? salones.find((s) => s.id === alumnoDetalle.salonId)
    : undefined;
  const asistenciasDetalle = alumnoDetalle
    ? registros.filter((r) => r.alumnoId === alumnoDetalle.id).length
    : 0;

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>

      {/* Header */}
      <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>🔍 Buscar Niños(as)</h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>
          Consulta información de los niños inscritos
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            placeholder="🔍 Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            autoFocus
            className="flex-1 rounded-xl border-2 border-yellow-200 px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 bg-white"
          />
          <select
            value={salonFiltro}
            onChange={(e) => setSalonFiltro(e.target.value)}
            className="rounded-xl border-2 border-yellow-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-yellow-400"
          >
            <option value="todos">Todos los salones</option>
            {misSalones.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        {/* Contador */}
        <p className="text-xs text-center" style={{ color: '#92400e' }}>
          {alumnosFiltrados.length} niño{alumnosFiltrados.length !== 1 ? 's' : ''} encontrado{alumnosFiltrados.length !== 1 ? 's' : ''}
        </p>

        {/* Lista */}
        <div className="space-y-3">
          {alumnosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-400 text-sm">
                {busqueda ? `No se encontraron resultados para "${busqueda}"` : 'No hay niños en este salón'}
              </p>
            </div>
          ) : (
            alumnosFiltrados.map((alumno) => {
              const salon = salones.find((s) => s.id === alumno.salonId);
              const apoderado = apoderados.find((ap) => ap.id === alumno.apoderadoId);
              const asistencias = registros.filter((r) => r.alumnoId === alumno.id).length;
              const edad = calcularEdad(alumno.fechaNacimiento);

              return (
                <Link
                  key={alumno.id}
                  href={`/portal/alumno/${alumno.id}`}
                  className="w-full rounded-2xl border-2 bg-white shadow-sm hover:shadow-md hover:border-yellow-300 transition-all text-left block"
                  style={{ borderColor: '#FDE68A' }}
                >
                  <div className="flex items-center gap-3 p-4">
                    {alumno.fotografiaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={alumno.fotografiaUrl} alt={alumno.nombreCompleto}
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-300 flex-none" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-none border-2 border-yellow-300"
                        style={{ background: '#FFF9C4', color: '#4a2c00' }}>
                        {alumno.nombreCompleto.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: '#4a2c00' }}>
                        {alumno.nombreCompleto}
                      </p>
                      <p className="text-xs text-gray-500">
                        {salon?.nombre ?? '—'} · {edad} años
                      </p>
                      {apoderado && (
                        <p className="text-xs text-gray-400 truncate">
                          {apoderado.nombreCompleto} · {apoderado.telefono}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-none">
                      {alumno.alergias && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                          ⚠️ Alergias
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: '#FFF9C4', color: '#92400e' }}>
                        {asistencias} asist.
                      </span>
                      <span className="text-gray-300 text-xs">Ver →</span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {alumnoDetalle && (
        <TarjetaDetalle
          alumno={alumnoDetalle}
          apoderado={apoderadoDetalle}
          salon={salonDetalle}
          totalAsistencias={asistenciasDetalle}
          onCerrar={() => setAlumnoSeleccionado(null)}
        />
      )}
    </div>
  );
}

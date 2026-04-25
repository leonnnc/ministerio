'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';

function formatearFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export default function PrimerasVisitasPage() {
  const router = useRouter();
  const { estaAutenticado } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const apoderados = useAlumnosStore((s) => s.apoderados);
  const salones = useSalonesStore((s) => s.salones);

  useEffect(() => {
    if (!estaAutenticado) router.replace('/login');
  }, [estaAutenticado, router]);

  // Niños marcados como primera vez, ordenados por fecha de registro más reciente
  const primerasVisitas = alumnos
    .filter((a) => a.primeraVez === true)
    .sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro));

  // Registrados este mes
  const hoy = new Date();
  const esteMes = primerasVisitas.filter((a) => {
    const d = new Date(a.fechaRegistro);
    return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
  });

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      {/* Header */}
      <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>
          ⭐ Primeras Visitas
        </h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>
          Niños que asistieron por primera vez al ministerio
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Resumen */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 text-center border-2 border-yellow-200 bg-white">
            <p className="text-3xl font-extrabold" style={{ color: '#F5C518' }}>{primerasVisitas.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total primeras visitas</p>
          </div>
          <div className="rounded-2xl p-4 text-center border-2 border-yellow-200 bg-white">
            <p className="text-3xl font-extrabold" style={{ color: '#16a34a' }}>{esteMes.length}</p>
            <p className="text-xs text-gray-500 mt-1">Este mes</p>
          </div>
        </div>

        {/* Lista */}
        {primerasVisitas.length === 0 ? (
          <div className="rounded-2xl border-2 border-yellow-200 bg-white p-12 text-center">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-gray-400 text-sm">No hay registros de primeras visitas aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {primerasVisitas.map((alumno) => {
              const apoderado = apoderados.find((a) => a.id === alumno.apoderadoId);
              const salon = salones.find((s) => s.id === alumno.salonId);
              const esNuevo = esteMes.some((a) => a.id === alumno.id);

              return (
                <Link key={alumno.id} href={`/portal/alumno/${alumno.id}`}
                  className="block rounded-2xl border-2 bg-white p-4 hover:shadow-md transition-shadow"
                  style={{ borderColor: esNuevo ? '#86efac' : '#FDE68A' }}>
                  <div className="flex items-center gap-3">
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>
                          {alumno.nombreCompleto}
                        </p>
                        {esNuevo && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: '#dcfce7', color: '#15803d' }}>
                            Nuevo este mes
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {salon?.nombre ?? '—'} · {calcularEdad(alumno.fechaNacimiento)} años
                      </p>
                      {apoderado && (
                        <p className="text-xs text-gray-400 truncate">
                          {apoderado.nombreCompleto} · {apoderado.telefono}
                        </p>
                      )}
                    </div>

                    <div className="flex-none text-right">
                      <p className="text-xs text-gray-400">Registrado</p>
                      <p className="text-xs font-semibold" style={{ color: '#D97706' }}>
                        {formatearFecha(alumno.fechaRegistro.split('T')[0])}
                      </p>
                    </div>
                  </div>

                  {/* Cómo se enteró */}
                  {alumno.comoSeEntero && (
                    <div className="mt-2 pt-2 border-t border-yellow-100">
                      <p className="text-xs text-gray-400">
                        Cómo se enteró: <span className="font-semibold text-gray-600">{alumno.comoSeEntero}</span>
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

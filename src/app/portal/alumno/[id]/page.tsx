'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { useAsistenciaStore } from '@/stores/asistenciaStore';
import { usePersonalStore } from '@/stores/personalStore';
import { SERVICIOS_DOMINGO } from '@/stores/agendaStore';

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function formatearFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatHora(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export default function PerfilAlumnoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { estaAutenticado, _hasHydrated } = useAuthStore();
  const alumno = useAlumnosStore((s) => s.obtenerAlumnoPorId(id));
  const apoderados = useAlumnosStore((s) => s.apoderados);
  const salones = useSalonesStore((s) => s.salones);
  const registros = useAsistenciaStore((s) => s.registros);
  const personal = usePersonalStore((s) => s.personal);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!estaAutenticado) router.replace('/login');
  }, [_hasHydrated, estaAutenticado, router]);

  if (!alumno) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#FFFDE7' }}>
        <p className="text-gray-500">Alumno no encontrado</p>
        <Link href="/portal/buscar" className="text-sm underline" style={{ color: '#D97706' }}>
          Volver a búsqueda
        </Link>
      </div>
    );
  }

  const apoderado = apoderados.find((a) => a.id === alumno.apoderadoId);
  const salon = salones.find((s) => s.id === alumno.salonId);
  const maestro = salon?.maestroId ? personal.find((p) => p.id === salon.maestroId) : null;
  const historial = registros
    .filter((r) => r.alumnoId === alumno.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const totalAsistencias = historial.length;
  const porcentaje = totalAsistencias === 0 ? 0 :
    Math.round((historial.filter((r) => r.estado !== 'pendiente').length / totalAsistencias) * 100);

  // Agrupar por fecha
  const porFecha = historial.reduce<Record<string, typeof historial>>((acc, r) => {
    if (!acc[r.fecha]) acc[r.fecha] = [];
    acc[r.fecha].push(r);
    return acc;
  }, {});

  const servicioLabel = (id: string) =>
    SERVICIOS_DOMINGO.find((s) => s.id === id)?.hora ?? id;

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      {/* Header */}
      <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
        <Link href="/portal/buscar" className="absolute left-4 top-6 text-sm font-semibold"
          style={{ color: '#78350f' }}>
          ← Volver
        </Link>
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
        <h1 className="text-xl font-extrabold" style={{ color: '#4a2c00' }}>{alumno.nombreCompleto}</h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>
          {calcularEdad(alumno.fechaNacimiento)} años · {alumno.sexo === 'masculino' ? '👦' : '👧'} · {salon?.nombre ?? '—'}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Asistencias', valor: totalAsistencias, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Porcentaje', valor: `${porcentaje}%`, color: '#D97706', bg: '#FEF3C7' },
            { label: 'Edad', valor: calcularEdad(alumno.fechaNacimiento), color: '#7c3aed', bg: '#ede9fe' },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl p-3 text-center border border-yellow-100"
              style={{ background: c.bg }}>
              <p className="text-2xl font-extrabold" style={{ color: c.color }}>{c.valor}</p>
              <p className="text-xs text-gray-600 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Datos personales */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-4 py-3" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>📋 Datos personales</p>
          </div>
          <div className="px-4 py-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nacimiento:</span>
              <span className="font-semibold" style={{ color: '#4a2c00' }}>{formatearFecha(alumno.fechaNacimiento)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sexo:</span>
              <span className="font-semibold capitalize" style={{ color: '#4a2c00' }}>{alumno.sexo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Salón:</span>
              <span className="font-semibold" style={{ color: '#4a2c00' }}>{salon?.nombre ?? '—'}</span>
            </div>
            {maestro && (
              <div className="flex justify-between">
                <span className="text-gray-500">Maestro/a:</span>
                <span className="font-semibold" style={{ color: '#4a2c00' }}>{maestro.nombreCompleto}</span>
              </div>
            )}
            {alumno.colegio && (
              <div className="flex justify-between">
                <span className="text-gray-500">Colegio:</span>
                <span className="font-semibold" style={{ color: '#4a2c00' }}>{alumno.colegio}</span>
              </div>
            )}
            {alumno.grado && (
              <div className="flex justify-between">
                <span className="text-gray-500">Grado:</span>
                <span className="font-semibold" style={{ color: '#4a2c00' }}>{alumno.grado}</span>
              </div>
            )}
            {alumno.codigoQR && (
              <div className="flex justify-between">
                <span className="text-gray-500">Código QR:</span>
                <span className="font-mono text-xs" style={{ color: '#4a2c00' }}>{alumno.codigoQR}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info médica */}
        {(alumno.alergias || alumno.tipoSangre || alumno.condicionesMedicas || alumno.medicamentos || alumno.tieneDiscapacidad) && (
          <div className="rounded-2xl border-2 border-red-100 bg-white overflow-hidden">
            <div className="px-4 py-3" style={{ background: '#FFF5F5' }}>
              <p className="font-bold text-sm text-red-600">⚕️ Información médica</p>
            </div>
            <div className="px-4 py-4 space-y-2 text-sm">
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
              {alumno.tieneDiscapacidad && alumno.detalleDiscapacidad && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Necesidad especial:</span>
                  <span className="font-semibold text-right max-w-[60%]" style={{ color: '#4a2c00' }}>{alumno.detalleDiscapacidad}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apoderado */}
        {apoderado && (
          <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
            <div className="px-4 py-3" style={{ background: '#FFF9C4' }}>
              <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>👨‍👩‍👧 Apoderado</p>
            </div>
            <div className="px-4 py-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nombre:</span>
                <span className="font-semibold" style={{ color: '#4a2c00' }}>{apoderado.nombreCompleto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Relación:</span>
                <span className="font-semibold capitalize" style={{ color: '#4a2c00' }}>{apoderado.relacion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Teléfono:</span>
                <a href={`tel:${apoderado.telefono}`} className="font-semibold" style={{ color: '#D97706' }}>
                  {apoderado.telefono}
                </a>
              </div>
              {apoderado.telefonoEmergencia && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Emergencia:</span>
                  <a href={`tel:${apoderado.telefonoEmergencia}`} className="font-semibold text-red-600">
                    {apoderado.telefonoEmergencia}
                  </a>
                </div>
              )}
              {apoderado.personasAutorizadas && (
                <div>
                  <p className="text-gray-500 mb-1">Personas autorizadas:</p>
                  <p className="font-semibold text-xs" style={{ color: '#4a2c00' }}>{apoderado.personasAutorizadas}</p>
                </div>
              )}
              {apoderado.whatsapp && (
                <a href={`https://wa.me/${apoderado.whatsapp.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: '#25D366' }}>
                  📱 Enviar WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        {/* Historial de asistencia */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <div className="px-4 py-3" style={{ background: '#FFF9C4' }}>
            <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>
              📊 Historial de asistencia ({totalAsistencias})
            </p>
          </div>
          {historial.length === 0 ? (
            <p className="px-4 py-6 text-center text-gray-400 text-sm">Sin registros de asistencia</p>
          ) : (
            <div className="divide-y divide-yellow-50 max-h-72 overflow-y-auto">
              {Object.entries(porFecha).map(([fecha, regs]) => (
                <div key={fecha} className="px-4 py-3">
                  <p className="text-xs font-bold mb-1" style={{ color: '#D97706' }}>
                    {formatearFecha(fecha)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {regs.map((r) => (
                      <span key={r.id} className="text-xs px-2 py-0.5 rounded-full border"
                        style={{
                          background: r.estado === 'entregado' ? '#dbeafe' : '#dcfce7',
                          borderColor: r.estado === 'entregado' ? '#93c5fd' : '#86efac',
                          color: r.estado === 'entregado' ? '#1d4ed8' : '#15803d',
                        }}>
                        {servicioLabel(r.servicioId)} · {r.estado === 'entregado' ? `${formatHora(r.horaIngreso)} – ${formatHora(r.horaSalida)}` : formatHora(r.horaIngreso)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

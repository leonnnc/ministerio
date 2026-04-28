'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { usePersonalStore } from '@/stores/personalStore';
import { Badge } from '@/components/ui';
import { useAgendaStore, SERVICIOS_DOMINGO, PROGRAMACION_SERVICIO, proximosDomingos, formatearFechaDomingo } from '@/stores/agendaStore';
import type { Rol } from '@/types';

const rolLabel: Record<Rol, string> = {
  Director_General: 'Director General',
  Lider_General: 'Líder General',
  Coordinadora: 'Coordinadora',
  Maestro: 'Maestro/a',
  Auxiliar: 'Auxiliar',
};

const rolColor: Record<Rol, 'primary' | 'success' | 'info' | 'secondary' | 'warning'> = {
  Director_General: 'primary',
  Lider_General: 'secondary',
  Coordinadora: 'warning',
  Maestro: 'success',
  Auxiliar: 'info',
};

export default function PortalPage() {
  const router = useRouter();
  const { usuarioActual, estaAutenticado, _hasHydrated } = useAuthStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);
  const apoderados = useAlumnosStore((s) => s.apoderados);
  const salones = useSalonesStore((s) => s.salones);
  const inicializarSalones = useSalonesStore((s) => s.inicializarSalones);
  const { obtenerPorFechaYServicio } = useAgendaStore();
  const proximoDomingo = proximosDomingos(1)[0] ?? '';
  const personal = usePersonalStore((s) => s.personal);

  useEffect(() => {
    inicializarSalones();
  }, [inicializarSalones]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!estaAutenticado) router.replace('/login');
  }, [_hasHydrated, estaAutenticado, router]);

  if (!usuarioActual) return null;

  const esAdmin = usuarioActual.rol === 'Director_General' || usuarioActual.rol === 'Lider_General';
  const esCoordinadora = usuarioActual.rol === 'Coordinadora';
  const esMaestro = usuarioActual.rol === 'Maestro';
  const esAuxiliar = usuarioActual.rol === 'Auxiliar';

  // Salones que le corresponden según rol
  const misSalones = esAdmin
    ? salones
    : salones.filter((s) => {
        if (esMaestro) return s.maestroId === usuarioActual.id;
        if (esCoordinadora) return usuarioActual.salonesIds.includes(s.id);
        if (esAuxiliar) return s.auxiliaresIds.includes(usuarioActual.id);
        return false;
      });

  // Colores según rol
  const esRolFormal = esAdmin || esMaestro;
  const headerBg = esRolFormal ? '#F5C518' : '#FFD600';
  const fondoPagina = '#FFFDE7';
  const accentColor = '#92400e';
  const salonHeaderBg = esRolFormal ? '#F5C518' : '#FFD600';
  const salonHeaderTexto = '#4a2c00';

  return (
    <div className="min-h-screen" style={{ background: fondoPagina }}>

      {/* ── BIENVENIDA CENTRADA ── */}
      <div className="w-full py-12 px-6 text-center" style={{ background: headerBg }}>
        <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: '#78350f' }}>
          ¡Bienvenido/a al portal!
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#4a2c00' }}>
          {usuarioActual.nombreCompleto}
        </h1>
        <div className="flex justify-center mt-3">
          <Badge label={rolLabel[usuarioActual.rol]} variant={rolColor[usuarioActual.rol]} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── ACCESOS RÁPIDOS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/portal/checkin',         emoji: '✅', label: 'Check-in',        sub: 'Recibir / Entregar',  color: '#16a34a' },
            { href: '/portal/asistencia',       emoji: '📊', label: 'Asistencia',      sub: 'Historial',           color: '#D97706' },
            { href: '/portal/agenda',           emoji: '📅', label: 'Agenda',          sub: 'Domingos',            color: '#7c3aed' },
            { href: '/portal/buscar',           emoji: '🔍', label: 'Buscar',          sub: 'Niños(as)',           color: '#0369a1' },
            { href: '/portal/estadisticas',     emoji: '📈', label: 'Estadísticas',    sub: 'Resumen',             color: '#dc2626' },
            { href: '/portal/cumpleanos',       emoji: '🎂', label: 'Cumpleaños',      sub: 'Del mes',             color: '#d97706' },
            { href: '/portal/primeras-visitas', emoji: '⭐', label: 'Primeras visitas', sub: 'Seguimiento',        color: '#059669' },
            { href: '/portal/avisos',           emoji: '📢', label: 'Avisos',          sub: 'Comunicados',         color: '#7c3aed' },
            { href: '/portal/eventos',          emoji: '🗓️', label: 'Eventos',         sub: 'Especiales',          color: '#0369a1' },
            { href: '/portal/comunicacion',     emoji: '📱', label: 'Comunicación',    sub: 'WhatsApp masivo',     color: '#16a34a' },
            { href: '/portal/reporte',          emoji: '📋', label: 'Reportes',        sub: 'Exportar Excel',      color: '#dc2626' },
            { href: '/portal/etiquetas',        emoji: '🏷️', label: 'Etiquetas',       sub: 'Imprimir seguridad',  color: '#4a2c00' },
            { href: '/portal/galeria',          emoji: '📸', label: 'Galería',         sub: 'Fotos del ministerio', color: '#d97706' },
            { href: '/portal/oraciones',        emoji: '🙏', label: 'Oraciones',       sub: 'Solicitudes',         color: '#7c3aed' },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className="rounded-2xl border-2 border-yellow-200 bg-white p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-1">{item.emoji}</div>
              <p className="font-bold text-sm" style={{ color: item.color }}>{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </a>
          ))}
        </div>

        {/* ── AGENDA TIPO CALENDARIO ── */}        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: accentColor }}>
              📅 Agenda Dominical
            </h2>
            <Link href="/portal/agenda"
              className="text-sm font-semibold px-3 py-1.5 rounded-xl border-2 transition-colors hover:bg-yellow-50"
              style={{ borderColor: '#F5C518', color: '#92400e' }}>
              Gestionar →
            </Link>
          </div>

          {/* Calendario: horas a la izquierda, domingos en columnas */}
          <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden shadow-sm">
            {/* Header: columna vacía + domingos */}
            <div className="grid border-b border-yellow-100"
              style={{ gridTemplateColumns: '80px repeat(4, 1fr)' }}>
              <div className="px-2 py-3 bg-yellow-50 border-r border-yellow-100" />
              {proximosDomingos(4).map((fecha) => {
                const partes = fecha.split('-');
                const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
                const esHoy = fecha === proximoDomingo;
                return (
                  <div key={fecha}
                    className="px-2 py-3 text-center border-r border-yellow-100 last:border-r-0"
                    style={{ background: esHoy ? '#FFF9C4' : '#FFFDE7' }}>
                    <p className="text-xs font-semibold uppercase" style={{ color: '#92400e' }}>Dom</p>
                    <p className="text-lg font-extrabold" style={{ color: esHoy ? '#D97706' : '#4a2c00' }}>
                      {d.getDate()}
                    </p>
                    <p className="text-xs" style={{ color: '#78350f' }}>
                      {d.toLocaleDateString('es-CL', { month: 'short' })}
                    </p>
                    {esHoy && (
                      <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full" style={{ background: '#D97706' }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Filas: una por servicio */}
            {SERVICIOS_DOMINGO.map((servicio, idx) => (
              <div key={servicio.id}
                className="grid border-b border-yellow-50 last:border-b-0"
                style={{ gridTemplateColumns: '80px repeat(4, 1fr)' }}>

                {/* Hora a la izquierda */}
                <div className="px-2 py-4 flex flex-col items-center justify-center border-r border-yellow-100"
                  style={{ background: idx % 2 === 0 ? '#FFFDE7' : '#FFF9C4' }}>
                  <p className="text-xs font-extrabold text-center leading-tight" style={{ color: '#D97706' }}>
                    {servicio.hora.split(' ')[0]}
                  </p>
                  <p className="text-xs text-center" style={{ color: '#92400e' }}>
                    {servicio.hora.split(' ')[1]}
                  </p>
                </div>

                {/* Celdas por domingo */}
                {proximosDomingos(4).map((fecha) => {
                  let asigs = obtenerPorFechaYServicio(fecha, servicio.id);
                  if (esMaestro) asigs = asigs.filter((a) => a.maestroId === usuarioActual.id);
                  const esHoy = fecha === proximoDomingo;

                  return (
                    <div key={fecha}
                      className="px-2 py-3 border-r border-yellow-50 last:border-r-0 min-h-[64px]"
                      style={{ background: esHoy ? '#FFFBEA' : '#fff' }}>
                      {asigs.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-xs text-gray-300">—</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {asigs.map((asig) => {
                            const maestroNombre = personal.find((p) => p.id === asig.maestroId)?.nombreCompleto ?? '—';
                            const salonNombre = salones.find((s) => s.id === asig.salonId)?.nombre ?? '—';
                            return (
                              <div key={asig.id}
                                className="rounded-lg px-2 py-1 text-xs border"
                                style={{ background: '#FFF9C4', borderColor: '#FDE68A' }}>
                                <p className="font-bold truncate" style={{ color: '#4a2c00' }}>
                                  {salonNombre.replace('Grupo ', '')}
                                </p>
                                <p className="truncate" style={{ color: '#78350f' }}>
                                  {maestroNombre.split(' ')[0]}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-2" style={{ color: '#D97706' }}>
            Mostrando los próximos 4 domingos · <Link href="/portal/agenda" className="underline">Ver agenda completa</Link>
          </p>
        </div>

        {/* Admin: acceso rápido al panel completo */}
        {esAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: '/admin', emoji: '⚙️', label: 'Panel Admin', sub: 'Gestión completa' },
              { href: '/admin/personal', emoji: '👥', label: 'Personal', sub: `${personal.length} miembros` },
              { href: '/admin/alumnos', emoji: '🎒', label: 'Alumnos', sub: `${alumnos.length} inscritos` },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="rounded-2xl border-2 p-5 text-center hover:shadow-md transition-shadow bg-white"
                style={{ borderColor: '#D97706' }}>
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="font-bold" style={{ color: '#78350f' }}>{item.label}</p>
                <p className="text-xs mt-1 text-gray-500">{item.sub}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Mis salones */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: accentColor }}>
            {esAdmin ? 'Todos los Salones' : 'Mi Salón'}
          </h2>

          {misSalones.length === 0 ? (
            <div className="rounded-2xl border-2 p-8 text-center bg-white" style={{ borderColor: '#D97706' }}>
              <p className="text-lg text-gray-600">
                {esMaestro || esAuxiliar
                  ? 'Aún no tienes un salón asignado. Contacta al administrador.'
                  : 'No hay salones configurados aún.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {misSalones.map((salon) => {
                const alumnosSalon = alumnos.filter((a) => a.salonId === salon.id);
                const maestro = personal.find((p) => p.id === salon.maestroId);
                const auxiliaresSalon = salon.auxiliaresIds
                  .map((id) => personal.find((p) => p.id === id))
                  .filter(Boolean);

                return (
                  <div key={salon.id} className="rounded-2xl border-2 bg-white shadow-sm overflow-hidden" style={{ borderColor: '#D97706' }}>
                    <div className="px-5 py-4" style={{ background: salonHeaderBg }}>
                      <h3 className="text-lg font-bold" style={{ color: salonHeaderTexto }}>{salon.nombre}</h3>
                      <p className="text-sm" style={{ color: '#78350f' }}>
                        {salon.edadMinima} – {salon.edadMaxima} años
                      </p>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div>
                          <span className="font-semibold text-gray-600">Maestro: </span>
                          <span className="text-gray-800">{maestro?.nombreCompleto ?? 'Sin asignar'}</span>
                        </div>
                        {auxiliaresSalon.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-600">Auxiliares: </span>
                            <span className="text-gray-800">{auxiliaresSalon.map((a) => a?.nombreCompleto).join(', ')}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-sm mb-2" style={{ color: accentColor }}>
                          Niños inscritos ({alumnosSalon.length})
                        </p>
                        {alumnosSalon.length === 0 ? (
                          <p className="text-sm text-gray-400">Sin alumnos inscritos aún</p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {alumnosSalon.map((alumno) => {
                              const apoderado = apoderados.find((ap) => ap.id === alumno.apoderadoId);
                              return (
                                <div key={alumno.id} className="flex items-center gap-3 rounded-xl p-2 border border-amber-100 bg-amber-50">
                                  {alumno.fotografiaUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={alumno.fotografiaUrl} alt={alumno.nombreCompleto}
                                      className="w-9 h-9 rounded-full object-cover border-2 border-amber-300 flex-none" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full flex-none flex items-center justify-center font-bold text-sm border-2 border-amber-300"
                                      style={{ background: '#FCD34D', color: '#4a2c00' }}>
                                      {alumno.nombreCompleto.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate text-gray-800">{alumno.nombreCompleto}</p>
                                    {apoderado && (
                                      <p className="text-xs truncate text-gray-500">
                                        {apoderado.nombreCompleto} · {apoderado.telefono}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Programación por servicio */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: accentColor }}>Programación de Servicios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SERVICIOS_DOMINGO.map((s) => (
              <div key={s.id} className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden shadow-sm">
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#FFF9C4' }}>
                  <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold"
                    style={{ background: '#F5C518', color: '#4a2c00' }}>
                    <span>{s.hora.split(' ')[0]}</span>
                    <span className="opacity-80">{s.hora.split(' ')[1]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#4a2c00' }}>{s.hora}</p>
                    <p className="text-xs" style={{ color: '#78350f' }}>{s.label} · {s.rango}</p>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-1.5">
                  {PROGRAMACION_SERVICIO[s.id].map((item) => (
                    <div key={item.hora} className="flex items-center gap-2 text-xs">
                      <span className="text-sm">{item.icono}</span>
                      <span className="font-semibold w-16 flex-none" style={{ color: '#D97706' }}>{item.hora}</span>
                      <span className="text-gray-700">{item.actividad}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

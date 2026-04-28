'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  useAgendaStore,
  SERVICIOS_DOMINGO,
  PROGRAMACION_SERVICIO,
  proximosDomingos,
  formatearFechaDomingo,
  type ServicioId,
  type AsignacionServicio,
} from '@/stores/agendaStore';
import { usePersonalStore } from '@/stores/personalStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import ModalAsignacion from '@/components/agenda/ModalAsignacion';

const SERVICIO_COLORES: Record<ServicioId, { bg: string; border: string; badge: string; texto: string }> = {
  '8am':   { bg: '#FFF9C4', border: '#FDE68A', badge: '#F59E0B', texto: '#4a2c00' },
  '11am':  { bg: '#FFF3E0', border: '#FDBA74', badge: '#EA580C', texto: '#4a2c00' },
  '1pm':   { bg: '#FFFDE7', border: '#FCD34D', badge: '#D97706', texto: '#4a2c00' },
  '730pm': { bg: '#FEF3C7', border: '#F59E0B', badge: '#B45309', texto: '#fff'    },
};

export default function AgendaPage() {
  const router = useRouter();
  const { usuarioActual, estaAutenticado, _hasHydrated } = useAuthStore();
  const { obtenerPorFechaYServicio, eliminarAsignacion } = useAgendaStore();
  const personal = usePersonalStore((s) => s.personal);
  const salones = useSalonesStore((s) => s.salones);
  const inicializarSalones = useSalonesStore((s) => s.inicializarSalones);
  const alumnos = useAlumnosStore((s) => s.alumnos);

  const domingos = proximosDomingos(8);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(domingos[0] ?? '');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [asignacionEditando, setAsignacionEditando] = useState<AsignacionServicio | null>(null);
  const [servicioModal, setServicioModal] = useState<ServicioId | null>(null);

  useEffect(() => { inicializarSalones(); }, [inicializarSalones]);
  useEffect(() => { if (!_hasHydrated) return;
    if (!estaAutenticado) router.replace('/login'); }, [_hasHydrated, estaAutenticado, router]);

  if (!usuarioActual) return null;

  const puedeEditar =
    usuarioActual.rol === 'Director_General' ||
    usuarioActual.rol === 'Lider_General' ||
    usuarioActual.rol === 'Coordinadora';

  const esMaestro = usuarioActual.rol === 'Maestro';

  const getNombre = (id: string) => personal.find((p) => p.id === id)?.nombreCompleto ?? '—';
  const getSalon = (id: string) => salones.find((s) => s.id === id)?.nombre ?? '—';

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>

      {/* Header */}
      <div className="px-6 py-8 text-center" style={{ background: '#F5C518' }}>
        <p className="text-4xl mb-2">📅</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#4a2c00' }}>
          Agenda Dominical
        </h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>
          Programación de servicios — Ministerio de Niños
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Selector de domingos — estilo tabs */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#92400e' }}>
            Selecciona el domingo
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {domingos.map((fecha) => {
              const activo = fechaSeleccionada === fecha;
              const partes = formatearFechaDomingo(fecha).split(', ');
              const dia = partes[1] ?? fecha;
              return (
                <button
                  key={fecha}
                  onClick={() => setFechaSeleccionada(fecha)}
                  className="flex-none flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[80px]"
                  style={{
                    background: activo ? '#F5C518' : '#fff',
                    borderColor: activo ? '#D97706' : '#FDE68A',
                    color: activo ? '#4a2c00' : '#92400e',
                    boxShadow: activo ? '0 4px 12px rgba(245,197,24,0.4)' : 'none',
                  }}
                >
                  <span className="text-xs font-semibold opacity-70">Dom</span>
                  <span className="text-sm font-extrabold">{dia}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Título del día seleccionado */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: '#FDE68A' }} />
          <h2 className="text-base font-bold capitalize px-3" style={{ color: '#E65100' }}>
            {formatearFechaDomingo(fechaSeleccionada)}
          </h2>
          <div className="flex-1 h-px" style={{ background: '#FDE68A' }} />
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SERVICIOS_DOMINGO.map((servicio) => {
            const colores = SERVICIO_COLORES[servicio.id];
            let asigs = obtenerPorFechaYServicio(fechaSeleccionada, servicio.id);
            if (esMaestro) asigs = asigs.filter((a) => a.maestroId === usuarioActual.id);

            return (
              <div
                key={servicio.id}
                className="rounded-3xl border-2 overflow-hidden shadow-sm"
                style={{ borderColor: colores.border, background: colores.bg }}
              >
                {/* Header del servicio */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-sm"
                      style={{ background: colores.badge }}>
                      <span className="text-white text-xs font-bold leading-none">
                        {servicio.hora.split(' ')[0]}
                      </span>
                      <span className="text-white text-xs opacity-80">
                        {servicio.hora.split(' ')[1]}
                      </span>
                    </div>
                    <div>
                      <p className="font-extrabold text-base" style={{ color: '#4a2c00' }}>
                        {servicio.hora}
                      </p>
                      <p className="text-xs font-medium" style={{ color: '#78350f' }}>
                        {servicio.label} · {servicio.rango}
                      </p>
                    </div>
                  </div>
                  {puedeEditar && (
                    <button
                      onClick={() => {
                        setAsignacionEditando(null);
                        setServicioModal(servicio.id);
                        setModalAbierto(true);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-colors hover:scale-110"
                      style={{ borderColor: colores.badge, color: colores.badge, background: '#fff' }}
                      title="Agregar asignación"
                    >
                      +
                    </button>
                  )}
                </div>

                {/* Programación interna del servicio */}
                <div className="px-4 pb-2">
                  <details className="group">
                    <summary className="cursor-pointer text-xs font-semibold py-2 flex items-center gap-1 select-none"
                      style={{ color: colores.badge }}>
                      <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                      Programación del servicio
                    </summary>
                    <div className="mt-2 rounded-xl border p-3 space-y-1.5"
                      style={{ borderColor: colores.border, background: '#fff' }}>
                      {PROGRAMACION_SERVICIO[servicio.id].map((item) => (
                        <div key={item.hora} className="flex items-center gap-2 text-xs">
                          <span className="text-base">{item.icono}</span>
                          <span className="font-bold w-16 flex-none" style={{ color: colores.badge }}>
                            {item.hora}
                          </span>
                          <span className="text-gray-700">{item.actividad}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>

                {/* Asignaciones */}
                <div className="px-4 pb-4 space-y-3">
                  {asigs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed py-5 text-center"
                      style={{ borderColor: colores.border }}>
                      <p className="text-xs" style={{ color: '#D97706' }}>
                        {esMaestro ? 'Sin asignación en este servicio' : 'Sin asignaciones'}
                      </p>
                    </div>
                  ) : (
                    asigs.map((asig) => {
                      const alumnosSalon = alumnos.filter((a) => asig.alumnosIds.includes(a.id));
                      const auxs = asig.auxiliaresIds.map((id) => personal.find((p) => p.id === id)).filter(Boolean);

                      return (
                        <div key={asig.id} className="rounded-2xl bg-white border p-4 shadow-sm"
                          style={{ borderColor: colores.border }}>

                          {/* Salón + acciones */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold px-2 py-1 rounded-lg"
                              style={{ background: colores.badge, color: '#fff' }}>
                              🏫 {getSalon(asig.salonId)}
                            </span>
                            {puedeEditar && (
                              <div className="flex gap-1">
                                <button onClick={() => { setAsignacionEditando(asig); setServicioModal(asig.servicioId); setModalAbierto(true); }}
                                  className="text-xs px-2 py-1 rounded-lg border transition-colors hover:bg-yellow-50"
                                  style={{ borderColor: '#FDE68A', color: '#92400e' }}>
                                  ✏️
                                </button>
                                <button onClick={() => eliminarAsignacion(asig.id)}
                                  className="text-xs px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-400">
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Maestro */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-none text-white"
                              style={{ background: colores.badge }}>
                              {getNombre(asig.maestroId).charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: '#4a2c00' }}>
                                {getNombre(asig.maestroId)}
                              </p>
                              <p className="text-xs text-gray-400">Maestro/a</p>
                            </div>
                          </div>

                          {/* Auxiliares */}
                          {auxs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {auxs.map((a) => a && (
                                <span key={a.id} className="text-xs px-2 py-0.5 rounded-full border"
                                  style={{ borderColor: colores.border, color: '#78350f', background: colores.bg }}>
                                  🤝 {a.nombreCompleto.split(' ')[0]}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Niños */}
                          {alumnosSalon.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">
                                👦 {alumnosSalon.length} niño{alumnosSalon.length !== 1 ? 's' : ''}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {alumnosSalon.map((al) => (
                                  <span key={al.id} className="text-xs px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200"
                                    style={{ color: '#4a2c00' }}>
                                    {al.nombreCompleto.split(' ')[0]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {asig.notas && (
                            <p className="mt-2 text-xs italic text-gray-400">📝 {asig.notas}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modalAbierto && servicioModal && (
        <ModalAsignacion
          fecha={fechaSeleccionada}
          servicioId={servicioModal}
          asignacionEditando={asignacionEditando}
          onCerrar={() => { setModalAbierto(false); setAsignacionEditando(null); }}
        />
      )}
    </div>
  );
}

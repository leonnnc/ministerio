'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useOracionesStore } from '@/stores/oracionesStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import type { SolicitudOracion } from '@/lib/firestore/oracionesService';

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function OracionesPage() {
  const router = useRouter();
  const { usuarioActual, estaAutenticado } = useAuthStore();
  const { oraciones, agregarOracion, actualizarOracion, eliminarOracion } = useOracionesStore();
  const alumnos = useAlumnosStore((s) => s.alumnos);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [respuestaId, setRespuestaId] = useState<string | null>(null);
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'respondidas'>('todas');
  const [form, setForm] = useState({
    titulo: '', descripcion: '', solicitadoPor: '', alumnoId: '',
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!estaAutenticado) router.replace('/login');
  }, [estaAutenticado, router]);

  if (!usuarioActual) return null;

  const puedeResponder = ['Director_General', 'Lider_General', 'Coordinadora'].includes(usuarioActual.rol);

  const oracionesFiltradas = oraciones
    .filter((o) => {
      if (filtro === 'pendientes') return !o.respondida;
      if (filtro === 'respondidas') return o.respondida;
      return true;
    })
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));

  const pendientes = oraciones.filter((o) => !o.respondida).length;

  async function handleGuardar() {
    if (!form.titulo.trim() || !form.descripcion.trim() || !form.solicitadoPor.trim()) return;
    setGuardando(true);
    const alumno = alumnos.find((a) => a.id === form.alumnoId);
    const nueva: SolicitudOracion = {
      id: crypto.randomUUID(),
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      solicitadoPor: form.solicitadoPor.trim(),
      alumnoId: form.alumnoId || undefined,
      alumnoNombre: alumno?.nombreCompleto,
      fechaCreacion: new Date().toISOString(),
      respondida: false,
    };
    await agregarOracion(nueva);
    setForm({ titulo: '', descripcion: '', solicitadoPor: '', alumnoId: '' });
    setModalAbierto(false);
    setGuardando(false);
  }

  async function handleResponder(id: string) {
    if (!respuestaTexto.trim()) return;
    await actualizarOracion(id, { respondida: true, respuesta: respuestaTexto.trim() });
    setRespuestaId(null);
    setRespuestaTexto('');
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      {/* Header */}
      <div className="px-6 py-6 text-center relative" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>🙏 Solicitudes de Oración</h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>Peticiones de oración de las familias</p>
        <button onClick={() => setModalAbierto(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full font-bold text-xl shadow-md flex items-center justify-center"
          style={{ background: '#4a2c00', color: '#F5C518' }}>
          +
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', valor: oraciones.length, color: '#4a2c00', bg: '#FFF9C4' },
            { label: 'Pendientes', valor: pendientes, color: '#D97706', bg: '#FEF3C7' },
            { label: 'Respondidas', valor: oraciones.length - pendientes, color: '#16a34a', bg: '#dcfce7' },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl p-3 text-center border border-yellow-100"
              style={{ background: c.bg }}>
              <p className="text-2xl font-extrabold" style={{ color: c.color }}>{c.valor}</p>
              <p className="text-xs text-gray-600 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {(['todas', 'pendientes', 'respondidas'] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className="flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all capitalize"
              style={{
                background: filtro === f ? '#F5C518' : '#fff',
                borderColor: filtro === f ? '#D97706' : '#FDE68A',
                color: '#4a2c00',
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Lista */}
        {oracionesFiltradas.length === 0 ? (
          <div className="rounded-2xl border-2 border-yellow-200 bg-white p-12 text-center">
            <p className="text-4xl mb-3">🙏</p>
            <p className="text-gray-400 text-sm">No hay solicitudes de oración</p>
            <button onClick={() => setModalAbierto(true)}
              className="mt-4 text-sm font-bold px-4 py-2 rounded-xl"
              style={{ background: '#F5C518', color: '#4a2c00' }}>
              Agregar solicitud
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {oracionesFiltradas.map((oracion) => (
              <div key={oracion.id}
                className="rounded-2xl border-2 bg-white overflow-hidden shadow-sm"
                style={{ borderColor: oracion.respondida ? '#86efac' : '#FDE68A' }}>
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ background: oracion.respondida ? '#dcfce7' : '#FFF9C4' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{oracion.respondida ? '✅' : '🙏'}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: oracion.respondida ? '#16a34a' : '#D97706',
                        color: '#fff',
                      }}>
                      {oracion.respondida ? 'Respondida' : 'Pendiente'}
                    </span>
                    {oracion.alumnoNombre && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-200"
                        style={{ color: '#78350f', background: '#fff' }}>
                        👦 {oracion.alumnoNombre.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  {puedeResponder && (
                    <button onClick={() => eliminarOracion(oracion.id)}
                      className="text-xs px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-400">
                      🗑️
                    </button>
                  )}
                </div>

                <div className="px-4 py-4">
                  <h3 className="font-bold text-base mb-1" style={{ color: '#4a2c00' }}>{oracion.titulo}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{oracion.descripcion}</p>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Por {oracion.solicitadoPor}</span>
                    <span>·</span>
                    <span>{formatFecha(oracion.fechaCreacion)}</span>
                  </div>

                  {/* Respuesta */}
                  {oracion.respondida && oracion.respuesta && (
                    <div className="mt-3 rounded-xl p-3 border border-green-200" style={{ background: '#f0fdf4' }}>
                      <p className="text-xs font-bold text-green-700 mb-1">✝️ Respuesta pastoral:</p>
                      <p className="text-sm text-green-800">{oracion.respuesta}</p>
                    </div>
                  )}

                  {/* Formulario de respuesta */}
                  {puedeResponder && !oracion.respondida && (
                    <div className="mt-3">
                      {respuestaId === oracion.id ? (
                        <div className="space-y-2">
                          <textarea value={respuestaTexto} onChange={(e) => setRespuestaTexto(e.target.value)}
                            placeholder="Escribe una respuesta o nota pastoral..."
                            rows={2}
                            className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => { setRespuestaId(null); setRespuestaTexto(''); }}
                              className="flex-1 py-1.5 rounded-xl text-xs font-semibold border-2 border-yellow-200 text-gray-500">
                              Cancelar
                            </button>
                            <button onClick={() => handleResponder(oracion.id)}
                              className="flex-1 py-1.5 rounded-xl text-xs font-bold"
                              style={{ background: '#16a34a', color: '#fff' }}>
                              Marcar respondida
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setRespuestaId(oracion.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border-2 transition-colors hover:bg-green-50"
                          style={{ borderColor: '#86efac', color: '#16a34a' }}>
                          ✅ Marcar como respondida
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nueva solicitud */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
          <div className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl">
            <div className="px-6 py-5" style={{ background: '#F5C518' }}>
              <div className="w-10 h-1 rounded-full bg-black/20 mx-auto mb-4 sm:hidden" />
              <h2 className="text-lg font-extrabold text-center" style={{ color: '#4a2c00' }}>
                🙏 Nueva Solicitud de Oración
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Motivo de oración *</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Sanidad, provisión, familia..."
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Descripción *</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Cuéntanos más sobre la petición..."
                  rows={3}
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Solicitado por *</label>
                <input value={form.solicitadoPor} onChange={(e) => setForm({ ...form, solicitadoPor: e.target.value })}
                  placeholder="Nombre del apoderado o familiar"
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Niño relacionado (opcional)</label>
                <select value={form.alumnoId} onChange={(e) => setForm({ ...form, alumnoId: e.target.value })}
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                  <option value="">Sin niño específico</option>
                  {alumnos.map((a) => <option key={a.id} value={a.id}>{a.nombreCompleto}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalAbierto(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-yellow-300 text-gray-600 hover:bg-yellow-50">
                  Cancelar
                </button>
                <button onClick={handleGuardar}
                  disabled={guardando || !form.titulo.trim() || !form.descripcion.trim() || !form.solicitadoPor.trim()}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                  style={{ background: '#F5C518', color: '#4a2c00' }}>
                  {guardando ? 'Guardando...' : 'Registrar solicitud'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

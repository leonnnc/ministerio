'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useEventosStore } from '@/stores/eventosStore';
import type { Evento } from '@/lib/firestore/eventosService';

const TIPO_CONFIG: Record<Evento['tipo'], { label: string; emoji: string; color: string; bg: string }> = {
  campamento:     { label: 'Campamento',      emoji: '⛺', color: '#16a34a', bg: '#dcfce7' },
  actividad:      { label: 'Actividad',       emoji: '🎨', color: '#D97706', bg: '#FEF3C7' },
  culto_especial: { label: 'Culto Especial',  emoji: '✝️', color: '#7c3aed', bg: '#ede9fe' },
  reunion:        { label: 'Reunión',         emoji: '👥', color: '#0369a1', bg: '#e0f2fe' },
  otro:           { label: 'Otro',            emoji: '📌', color: '#4a2c00', bg: '#FFF9C4' },
};

const DIRIGIDO_LABEL: Record<Evento['dirigidoA'], string> = {
  todos:          'Todos los grupos',
  cuna:           'Cuna',
  primer_nivel:   'Primer Nivel',
  segundo_nivel:  'Segundo Nivel',
  tercer_nivel:   'Tercer Nivel',
};

function formatFecha(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function esFuturo(fecha: string) {
  return new Date(fecha) >= new Date(new Date().toDateString());
}

export default function EventosPage() {
  const router = useRouter();
  const { usuarioActual, estaAutenticado } = useAuthStore();
  const { eventos, agregarEvento, eliminarEvento } = useEventosStore();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [verPasados, setVerPasados] = useState(false);
  const [form, setForm] = useState({
    titulo: '', descripcion: '', fecha: '',
    horaInicio: '', horaFin: '', lugar: '',
    tipo: 'actividad' as Evento['tipo'],
    dirigidoA: 'todos' as Evento['dirigidoA'],
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!estaAutenticado) router.replace('/login');
  }, [estaAutenticado, router]);

  if (!usuarioActual) return null;

  const puedeCrear = ['Director_General', 'Lider_General', 'Coordinadora'].includes(usuarioActual.rol);

  const eventosFiltrados = eventos
    .filter((e) => verPasados ? !esFuturo(e.fecha) : esFuturo(e.fecha))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const proximosCount = eventos.filter((e) => esFuturo(e.fecha)).length;

  async function handleGuardar() {
    if (!form.titulo.trim() || !form.fecha) return;
    setGuardando(true);
    const nuevo: Evento = {
      id: crypto.randomUUID(),
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      fecha: form.fecha,
      horaInicio: form.horaInicio || undefined,
      horaFin: form.horaFin || undefined,
      lugar: form.lugar.trim() || undefined,
      tipo: form.tipo,
      dirigidoA: form.dirigidoA,
      creadoPor: usuarioActual!.id,
      creadoPorNombre: usuarioActual!.nombreCompleto,
      fechaCreacion: new Date().toISOString(),
    };
    await agregarEvento(nuevo);
    setForm({ titulo: '', descripcion: '', fecha: '', horaInicio: '', horaFin: '', lugar: '', tipo: 'actividad', dirigidoA: 'todos' });
    setModalAbierto(false);
    setGuardando(false);
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      {/* Header */}
      <div className="px-6 py-6 text-center relative" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>🗓️ Eventos Especiales</h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>Actividades y eventos del ministerio</p>
        {puedeCrear && (
          <button onClick={() => setModalAbierto(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full font-bold text-xl shadow-md flex items-center justify-center"
            style={{ background: '#4a2c00', color: '#F5C518' }}>
            +
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Toggle próximos / pasados */}
        <div className="flex gap-2">
          <button onClick={() => setVerPasados(false)}
            className="flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all"
            style={{
              background: !verPasados ? '#F5C518' : '#fff',
              borderColor: !verPasados ? '#D97706' : '#FDE68A',
              color: '#4a2c00',
            }}>
            Próximos ({proximosCount})
          </button>
          <button onClick={() => setVerPasados(true)}
            className="flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all"
            style={{
              background: verPasados ? '#F5C518' : '#fff',
              borderColor: verPasados ? '#D97706' : '#FDE68A',
              color: '#4a2c00',
            }}>
            Pasados ({eventos.length - proximosCount})
          </button>
        </div>

        {/* Lista */}
        {eventosFiltrados.length === 0 ? (
          <div className="rounded-2xl border-2 border-yellow-200 bg-white p-12 text-center">
            <p className="text-4xl mb-3">🗓️</p>
            <p className="text-gray-400 text-sm">
              {verPasados ? 'No hay eventos pasados' : 'No hay eventos próximos programados'}
            </p>
            {puedeCrear && !verPasados && (
              <button onClick={() => setModalAbierto(true)}
                className="mt-4 text-sm font-bold px-4 py-2 rounded-xl"
                style={{ background: '#F5C518', color: '#4a2c00' }}>
                Crear primer evento
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {eventosFiltrados.map((evento) => {
              const cfg = TIPO_CONFIG[evento.tipo];
              return (
                <div key={evento.id}
                  className="rounded-2xl border-2 bg-white overflow-hidden shadow-sm"
                  style={{ borderColor: '#FDE68A' }}>
                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{ background: cfg.bg }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cfg.emoji}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.color, color: '#fff' }}>
                        {cfg.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-200"
                        style={{ color: '#78350f', background: '#fff' }}>
                        {DIRIGIDO_LABEL[evento.dirigidoA]}
                      </span>
                    </div>
                    {puedeCrear && (
                      <button onClick={() => eliminarEvento(evento.id)}
                        className="text-xs px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-400">
                        🗑️
                      </button>
                    )}
                  </div>
                  <div className="px-4 py-4">
                    <h3 className="font-bold text-base mb-1" style={{ color: '#4a2c00' }}>{evento.titulo}</h3>
                    <p className="text-xs font-semibold mb-2 capitalize" style={{ color: '#D97706' }}>
                      📅 {formatFecha(evento.fecha)}
                      {evento.horaInicio && ` · ${evento.horaInicio}${evento.horaFin ? ` – ${evento.horaFin}` : ''}`}
                    </p>
                    {evento.lugar && (
                      <p className="text-xs text-gray-500 mb-2">📍 {evento.lugar}</p>
                    )}
                    {evento.descripcion && (
                      <p className="text-sm text-gray-600 leading-relaxed">{evento.descripcion}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Por {evento.creadoPorNombre}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal crear evento */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
          <div className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl max-h-[95dvh] flex flex-col">
            <div className="px-6 py-5 flex-none" style={{ background: '#F5C518' }}>
              <div className="w-10 h-1 rounded-full bg-black/20 mx-auto mb-4 sm:hidden" />
              <h2 className="text-lg font-extrabold text-center" style={{ color: '#4a2c00' }}>
                🗓️ Nuevo Evento
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Título *</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Campamento de verano 2026"
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Evento['tipo'] })}
                    className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                    {Object.entries(TIPO_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.emoji} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Dirigido a</label>
                  <select value={form.dirigidoA} onChange={(e) => setForm({ ...form, dirigidoA: e.target.value as Evento['dirigidoA'] })}
                    className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                    {Object.entries(DIRIGIDO_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Fecha *</label>
                <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Hora inicio</label>
                  <input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                    className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Hora fin</label>
                  <input type="time" value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                    className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Lugar</label>
                <input value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                  placeholder="Ej: Salón principal, Parque..."
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Detalles del evento..."
                  rows={3}
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-yellow-100 flex gap-3 flex-none">
              <button onClick={() => setModalAbierto(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-yellow-300 text-gray-600 hover:bg-yellow-50">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando || !form.titulo.trim() || !form.fecha}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                style={{ background: '#F5C518', color: '#4a2c00' }}>
                {guardando ? 'Guardando...' : 'Crear evento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

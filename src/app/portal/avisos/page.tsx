'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAvisosStore } from '@/stores/avisosStore';
import type { Aviso } from '@/lib/firestore/avisosService';

const TIPO_CONFIG = {
  info:         { label: 'Información',  emoji: 'ℹ️',  bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  urgente:      { label: 'Urgente',      emoji: '🚨',  bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
  evento:       { label: 'Evento',       emoji: '🎉',  bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
  recordatorio: { label: 'Recordatorio', emoji: '📌',  bg: '#FEF3C7', color: '#D97706', border: '#FCD34D' },
};

const DIRIGIDO_LABEL = {
  todos:    'Todos',
  personal: 'Solo personal',
  padres:   'Solo padres',
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AvisosPage() {
  const router = useRouter();
  const { usuarioActual, estaAutenticado, _hasHydrated } = useAuthStore();
  const { avisos, agregarAviso, eliminarAviso, actualizarAviso } = useAvisosStore();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | Aviso['tipo']>('todos');
  const [form, setForm] = useState({
    titulo: '', contenido: '',
    tipo: 'info' as Aviso['tipo'],
    dirigidoA: 'todos' as Aviso['dirigidoA'],
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!estaAutenticado) router.replace('/login');
  }, [_hasHydrated, estaAutenticado, router]);

  if (!usuarioActual) return null;

  const puedeCrear = ['Director_General', 'Lider_General', 'Coordinadora'].includes(usuarioActual.rol);

  const avisosFiltrados = avisos
    .filter((a) => filtro === 'todos' || a.tipo === filtro)
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));

  async function handleGuardar() {
    if (!form.titulo.trim() || !form.contenido.trim()) return;
    setGuardando(true);
    const nuevo: Aviso = {
      id: crypto.randomUUID(),
      titulo: form.titulo.trim(),
      contenido: form.contenido.trim(),
      tipo: form.tipo,
      dirigidoA: form.dirigidoA,
      creadoPor: usuarioActual!.id,
      creadoPorNombre: usuarioActual!.nombreCompleto,
      fechaCreacion: new Date().toISOString(),
      activo: true,
    };
    await agregarAviso(nuevo);
    setForm({ titulo: '', contenido: '', tipo: 'info', dirigidoA: 'todos' });
    setModalAbierto(false);
    setGuardando(false);
  }

  async function handleToggle(aviso: Aviso) {
    await actualizarAviso(aviso.id, { activo: !aviso.activo });
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      {/* Header */}
      <div className="px-6 py-6 text-center relative" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>📢 Avisos</h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>Comunicados para el equipo y familias</p>
        {puedeCrear && (
          <button onClick={() => setModalAbierto(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full font-bold text-xl shadow-md flex items-center justify-center"
            style={{ background: '#4a2c00', color: '#F5C518' }}>
            +
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['todos', 'info', 'urgente', 'evento', 'recordatorio'] as const).map((t) => (
            <button key={t} onClick={() => setFiltro(t)}
              className="flex-none px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all whitespace-nowrap"
              style={{
                background: filtro === t ? '#F5C518' : '#fff',
                borderColor: filtro === t ? '#D97706' : '#FDE68A',
                color: '#4a2c00',
              }}>
              {t === 'todos' ? 'Todos' : TIPO_CONFIG[t].emoji + ' ' + TIPO_CONFIG[t].label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {avisosFiltrados.length === 0 ? (
          <div className="rounded-2xl border-2 border-yellow-200 bg-white p-12 text-center">
            <p className="text-4xl mb-3">📢</p>
            <p className="text-gray-400 text-sm">No hay avisos publicados aún</p>
            {puedeCrear && (
              <button onClick={() => setModalAbierto(true)}
                className="mt-4 text-sm font-bold px-4 py-2 rounded-xl"
                style={{ background: '#F5C518', color: '#4a2c00' }}>
                Crear primer aviso
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {avisosFiltrados.map((aviso) => {
              const cfg = TIPO_CONFIG[aviso.tipo];
              return (
                <div key={aviso.id}
                  className="rounded-2xl border-2 bg-white overflow-hidden shadow-sm"
                  style={{ borderColor: cfg.border, opacity: aviso.activo ? 1 : 0.6 }}>
                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{ background: cfg.bg }}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cfg.emoji}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.color, color: '#fff' }}>
                        {cfg.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border"
                        style={{ borderColor: cfg.border, color: cfg.color, background: '#fff' }}>
                        {DIRIGIDO_LABEL[aviso.dirigidoA]}
                      </span>
                    </div>
                    {puedeCrear && (
                      <div className="flex gap-1">
                        <button onClick={() => handleToggle(aviso)}
                          className="text-xs px-2 py-1 rounded-lg border transition-colors hover:bg-white/50"
                          style={{ borderColor: cfg.border, color: cfg.color }}>
                          {aviso.activo ? 'Ocultar' : 'Mostrar'}
                        </button>
                        <button onClick={() => eliminarAviso(aviso.id)}
                          className="text-xs px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-400">
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-4">
                    <h3 className="font-bold text-base mb-1" style={{ color: '#4a2c00' }}>{aviso.titulo}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{aviso.contenido}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <span>Por {aviso.creadoPorNombre}</span>
                      <span>·</span>
                      <span>{formatFecha(aviso.fechaCreacion)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal crear aviso */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
          <div className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl">
            <div className="px-6 py-5" style={{ background: '#F5C518' }}>
              <div className="w-10 h-1 rounded-full bg-black/20 mx-auto mb-4 sm:hidden" />
              <h2 className="text-lg font-extrabold text-center" style={{ color: '#4a2c00' }}>
                📢 Nuevo Aviso
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Título *</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Reunión de maestros este sábado"
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Contenido *</label>
                <textarea value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                  placeholder="Escribe el mensaje completo aquí..."
                  rows={4}
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Aviso['tipo'] })}
                    className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                    {Object.entries(TIPO_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.emoji} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Dirigido a</label>
                  <select value={form.dirigidoA} onChange={(e) => setForm({ ...form, dirigidoA: e.target.value as Aviso['dirigidoA'] })}
                    className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                    <option value="todos">Todos</option>
                    <option value="personal">Solo personal</option>
                    <option value="padres">Solo padres</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalAbierto(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-yellow-300 text-gray-600 hover:bg-yellow-50">
                  Cancelar
                </button>
                <button onClick={handleGuardar} disabled={guardando || !form.titulo.trim() || !form.contenido.trim()}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                  style={{ background: '#F5C518', color: '#4a2c00' }}>
                  {guardando ? 'Publicando...' : 'Publicar aviso'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

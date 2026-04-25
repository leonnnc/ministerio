'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useGaleriaStore } from '@/stores/galeriaStore';
import { useEventosStore } from '@/stores/eventosStore';
import type { FotoGaleria } from '@/lib/firestore/galeriaService';

const MAX_FOTO_BYTES = 5 * 1024 * 1024;

function convertirABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(archivo);
  });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function GaleriaPage() {
  const router = useRouter();
  const { usuarioActual, estaAutenticado } = useAuthStore();
  const { fotos, agregarFoto, eliminarFoto } = useGaleriaStore();
  const { eventos } = useEventosStore();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [fotoAmpliada, setFotoAmpliada] = useState<FotoGaleria | null>(null);
  const [filtroEvento, setFiltroEvento] = useState('todos');
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ titulo: '', eventoId: '' });
  const [preview, setPreview] = useState<string | null>(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);

  useEffect(() => {
    if (!estaAutenticado) router.replace('/login');
  }, [estaAutenticado, router]);

  if (!usuarioActual) return null;

  const fotosFiltradas = fotos
    .filter((f) => filtroEvento === 'todos' || f.eventoId === filtroEvento)
    .sort((a, b) => b.fechaSubida.localeCompare(a.fechaSubida));

  async function handleSeleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    setError('');
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > MAX_FOTO_BYTES) {
      setError('La imagen no debe superar los 5MB');
      return;
    }
    setArchivoSeleccionado(archivo);
    const base64 = await convertirABase64(archivo);
    setPreview(base64);
  }

  async function handleSubir() {
    if (!preview || !archivoSeleccionado) return;
    setSubiendo(true);
    setError('');
    try {
      const evento = eventos.find((e) => e.id === form.eventoId);
      const nueva: FotoGaleria = {
        id: crypto.randomUUID(),
        url: preview,
        titulo: form.titulo.trim() || undefined,
        eventoId: form.eventoId || undefined,
        eventoNombre: evento?.titulo,
        subidaPor: usuarioActual!.id,
        subidaPorNombre: usuarioActual!.nombreCompleto,
        fechaSubida: new Date().toISOString(),
      };
      await agregarFoto(nueva);
      setPreview(null);
      setArchivoSeleccionado(null);
      setForm({ titulo: '', eventoId: '' });
      setModalAbierto(false);
    } catch {
      setError('Error al subir la foto. Intenta nuevamente.');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFFDE7' }}>
      {/* Header */}
      <div className="px-6 py-6 text-center relative" style={{ background: '#F5C518' }}>
        <h1 className="text-2xl font-extrabold" style={{ color: '#4a2c00' }}>📸 Galería</h1>
        <p className="text-sm mt-1" style={{ color: '#78350f' }}>Fotos de reuniones y eventos del ministerio</p>
        <button onClick={() => setModalAbierto(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full font-bold text-xl shadow-md flex items-center justify-center"
          style={{ background: '#4a2c00', color: '#F5C518' }}>
          +
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Filtro por evento */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFiltroEvento('todos')}
            className="flex-none px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all whitespace-nowrap"
            style={{
              background: filtroEvento === 'todos' ? '#F5C518' : '#fff',
              borderColor: filtroEvento === 'todos' ? '#D97706' : '#FDE68A',
              color: '#4a2c00',
            }}>
            Todas ({fotos.length})
          </button>
          {eventos.map((e) => {
            const count = fotos.filter((f) => f.eventoId === e.id).length;
            if (count === 0) return null;
            return (
              <button key={e.id} onClick={() => setFiltroEvento(e.id)}
                className="flex-none px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all whitespace-nowrap"
                style={{
                  background: filtroEvento === e.id ? '#F5C518' : '#fff',
                  borderColor: filtroEvento === e.id ? '#D97706' : '#FDE68A',
                  color: '#4a2c00',
                }}>
                {e.titulo} ({count})
              </button>
            );
          })}
        </div>

        {/* Grid de fotos */}
        {fotosFiltradas.length === 0 ? (
          <div className="rounded-2xl border-2 border-yellow-200 bg-white p-12 text-center">
            <p className="text-4xl mb-3">📸</p>
            <p className="text-gray-400 text-sm">No hay fotos en la galería aún</p>
            <button onClick={() => setModalAbierto(true)}
              className="mt-4 text-sm font-bold px-4 py-2 rounded-xl"
              style={{ background: '#F5C518', color: '#4a2c00' }}>
              Subir primera foto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {fotosFiltradas.map((foto) => (
              <div key={foto.id} className="relative group rounded-2xl overflow-hidden border-2 border-yellow-200 bg-white shadow-sm cursor-pointer"
                onClick={() => setFotoAmpliada(foto)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto.url} alt={foto.titulo ?? 'Foto'}
                  className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end">
                  <div className="w-full px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {foto.titulo && (
                      <p className="text-white text-xs font-bold truncate">{foto.titulo}</p>
                    )}
                    <p className="text-white/70 text-xs">{formatFecha(foto.fechaSubida)}</p>
                  </div>
                </div>
                {/* Botón eliminar */}
                <button
                  onClick={(e) => { e.stopPropagation(); eliminarFoto(foto.id); }}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal subir foto */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setModalAbierto(false); setPreview(null); }} />
          <div className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl">
            <div className="px-6 py-5" style={{ background: '#F5C518' }}>
              <div className="w-10 h-1 rounded-full bg-black/20 mx-auto mb-4 sm:hidden" />
              <h2 className="text-lg font-extrabold text-center" style={{ color: '#4a2c00' }}>📸 Subir foto</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Selector de foto */}
              {!preview ? (
                <label className="flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed border-yellow-300 cursor-pointer hover:bg-yellow-50 transition-colors">
                  <span className="text-4xl">📷</span>
                  <p className="text-sm font-semibold" style={{ color: '#92400e' }}>Toca para seleccionar una foto</p>
                  <p className="text-xs text-gray-400">JPG, PNG o WebP · máx. 5MB</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleSeleccionarFoto} />
                </label>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-2xl border-2 border-yellow-200" />
                  <button onClick={() => { setPreview(null); setArchivoSeleccionado(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    ✕
                  </button>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Título (opcional)</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Reunión dominical 25 de mayo"
                  className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>

              {eventos.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Vincular a evento (opcional)</label>
                  <select value={form.eventoId} onChange={(e) => setForm({ ...form, eventoId: e.target.value })}
                    className="w-full rounded-xl border-2 border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                    <option value="">Sin evento</option>
                    {eventos.map((e) => <option key={e.id} value={e.id}>{e.titulo}</option>)}
                  </select>
                </div>
              )}

              {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => { setModalAbierto(false); setPreview(null); }}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 border-yellow-300 text-gray-600 hover:bg-yellow-50">
                  Cancelar
                </button>
                <button onClick={handleSubir} disabled={subiendo || !preview}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                  style={{ background: '#F5C518', color: '#4a2c00' }}>
                  {subiendo ? 'Subiendo...' : 'Subir foto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal foto ampliada */}
      {fotoAmpliada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setFotoAmpliada(null)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoAmpliada.url} alt={fotoAmpliada.titulo ?? 'Foto'}
              className="w-full rounded-2xl shadow-2xl" />
            <div className="mt-3 text-center">
              {fotoAmpliada.titulo && <p className="text-white font-bold">{fotoAmpliada.titulo}</p>}
              {fotoAmpliada.eventoNombre && <p className="text-white/70 text-sm">{fotoAmpliada.eventoNombre}</p>}
              <p className="text-white/50 text-xs mt-1">
                {fotoAmpliada.subidaPorNombre} · {formatFecha(fotoAmpliada.fechaSubida)}
              </p>
            </div>
            <button onClick={() => setFotoAmpliada(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
